import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readProjectFile = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('/home-2 redesign hero uses the Issue B cover spread and links to all five conversations', async () => {
  const homepage = await readProjectFile('src/pages/home-2.astro');

  // New hero: the cover-spread asset (edge-trimmed variant)
  assert.match(homepage, /cover-spread-b(?:-trimmed)?\.jpg/);

  // Five Conversations card row links to each conversation page
  for (const href of [
    '/conversations/dacosta',
    '/conversations/slimani',
    '/conversations/azorean-blues',
    '/conversations/pool',
    '/conversations/blue-azores',
  ]) {
    assert.match(homepage, new RegExp(href.replaceAll('/', '\\/')));
  }

  assert.match(homepage, /Five Conversations on Blue/);
});

test('navigation logo uses the supplied solo asset', async () => {
  const navigation = await readProjectFile('src/components/Nav.astro');
  assert.match(navigation, /\/images\/ilheu-logo-solo\.webp/);
});
