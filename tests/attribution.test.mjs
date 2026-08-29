import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  MAX_REFERENCE_LENGTH,
  buildReference,
  pageSlug,
  readAttribution,
  scrub,
} from '../src/lib/attribution.ts';

const readProjectFile = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), 'utf8');

// Stripe silently drops the whole client_reference_id if any character falls
// outside this set, so this is the invariant the rest of the tests defend.
const STRIPE_SAFE = /^[A-Za-z0-9_-]+$/;

test('reference is Stripe-safe for hostile campaign values', () => {
  const nasty = [
    'Sommer Aktion!',
    'Açores & Ilhéu',
    'de_lit',
    '100%-off',
    'a/b?c=d#e',
    '<script>alert(1)</script>',
    '   ',
    '—–…',
    '日本語',
    'x'.repeat(500),
    'trailing---',
    '../../etc/passwd',
  ];

  for (const value of nasty) {
    const reference = buildReference(
      { utm_source: value, utm_campaign: value, utm_content: value },
      `/${value}`,
      'k3n9x2',
    );
    assert.match(reference, STRIPE_SAFE, `unsafe reference from ${JSON.stringify(value)}`);
    assert.ok(
      reference.length <= MAX_REFERENCE_LENGTH,
      `reference too long (${reference.length}) from ${JSON.stringify(value)}`,
    );
    assert.equal(reference.split('_').length, 5, 'reference must stay splittable into 5 fields');
  }
});

test('reference stays well inside the length ceiling at maximum field widths', () => {
  const reference = buildReference(
    {
      utm_source: 'x'.repeat(99),
      utm_campaign: 'y'.repeat(99),
      utm_content: 'z'.repeat(99),
    },
    `/${'p'.repeat(99)}`,
    'abcdef',
  );
  assert.ok(reference.length <= MAX_REFERENCE_LENGTH);
  assert.equal(reference, `${'x'.repeat(12)}_${'y'.repeat(24)}_${'z'.repeat(16)}_${'p'.repeat(24)}_abcdef`);
});

test('campaign parameters survive into the reference', () => {
  assert.equal(
    buildReference(
      { utm_source: 'meta', utm_campaign: 'de_lit', utm_content: 'v1' },
      '/',
      'k3n9x2',
    ),
    'meta_de-lit_v1_home_k3n9x2',
  );
});

test('untagged traffic is recorded as direct rather than dropped', () => {
  assert.equal(buildReference(null, '/shop', 'k3n9x2'), 'direct_none_none_shop_k3n9x2');
});

test('a bare fbclid is attributed to meta', () => {
  assert.equal(
    buildReference({ fbclid: 'IwAR_abc123' }, '/', 'k3n9x2'),
    'meta_none_none_home_k3n9x2',
  );
});

test('truncation never leaves a dangling separator', () => {
  // 'aaaaaaaaaaaa-bbb' cut at 12 would end on the dash.
  assert.equal(scrub('aaaaaaaaaaaa bbb', 13), 'aaaaaaaaaaaa');
  assert.equal(scrub('!!!', 8), 'none');
  assert.equal(scrub(undefined, 8), 'none');
  assert.equal(scrub(null, 8), 'none');
});

test('page slug collapses paths and defaults the homepage', () => {
  assert.equal(pageSlug('/'), 'home');
  assert.equal(pageSlug(''), 'home');
  assert.equal(pageSlug('/shop'), 'shop');
  assert.equal(pageSlug('/shop/'), 'shop');
  assert.equal(pageSlug('/conversations/slimani'), 'conversations-slimani');
});

test('attribution is read from the query string, or null when absent', () => {
  assert.deepEqual(readAttribution('?utm_source=meta&utm_campaign=de_lit'), {
    utm_source: 'meta',
    utm_campaign: 'de_lit',
  });
  assert.equal(readAttribution(''), null);
  assert.equal(readAttribution('?ref=newsletter'), null);
  // Empty values must not create a phantom campaign.
  assert.equal(readAttribution('?utm_source='), null);
  assert.deepEqual(readAttribution('?fbclid=IwAR_x'), { fbclid: 'IwAR_x' });
});

test('the shipped component uses the tested module rather than its own copy', async () => {
  const component = await readProjectFile('src/components/Attribution.astro');
  assert.match(component, /from '\.\.\/lib\/attribution'/);
  assert.doesNotMatch(component, /function scrub\(/, 'scrub must not be reimplemented in the component');
});

test('the Meta Pixel emits nothing unless an ID is configured', async () => {
  const config = await readProjectFile('src/config/tracking.ts');
  assert.match(config, /export const META_PIXEL_ID = ''/);
  const pixel = await readProjectFile('src/components/MetaPixel.astro');
  assert.match(pixel, /\{META_PIXEL_ID && \(/);
});
