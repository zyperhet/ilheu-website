import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readProjectFile = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('nav links to the events page', async () => {
  const nav = await readProjectFile('src/components/Nav.astro');
  assert.match(nav, /href:\s*'\/events'/);
  assert.match(nav, /label:\s*'Events'/);
});

test('base layout loads heavy Inter weights for flyer-style titles', async () => {
  const layout = await readProjectFile('src/layouts/BaseLayout.astro');
  // Inter must include 700/800/900 in the Google Fonts request
  assert.match(layout, /Inter:wght@[^"&]*;700;800;900/);
});

test('EventDrawer supports paid and free CTAs and the slide-in pattern', async () => {
  const drawer = await readProjectFile('src/components/EventDrawer.astro');
  // right-edge slide-in like the existing concert drawer
  assert.match(drawer, /translateX\(100%\)/);
  assert.match(drawer, /\.is-open/);
  // a generic close hook + slotted body
  assert.match(drawer, /data-drawer-close/);
  assert.match(drawer, /<slot/);
  // both CTA branches exist
  assert.match(drawer, /stripeUrl/);
  assert.match(drawer, /Free entry/);
});

test('events page wires three drawers, images, and CTAs', async () => {
  const page = await readProjectFile('src/pages/events.astro');

  // three drawers, opened from three panels
  for (const id of ['drawer-arquitectura', 'drawer-romeu', 'drawer-undercover']) {
    assert.match(page, new RegExp(`data-drawer-open="${id}"`));
    assert.match(page, new RegExp(`id="${id}"`));
  }

  // images wired
  assert.match(page, /arquitectura-dos-acores\.jpg/);
  assert.match(page, /under-the-cover-lisboa\.jpg/);
  assert.match(page, /romeu-bairos-flyer\.jpg/);

  // paid Romeu CTA + free entry for the other two
  assert.match(page, /buy\.stripe\.com\/aFacN7boegr7biI2MbfMA04/);
  assert.match(page, /free=\{true\}/);

  // generic open/close wiring present
  assert.match(page, /data-drawer-open/);
  assert.match(page, /showModal\(\)/);
});
