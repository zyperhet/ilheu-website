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

test('Furnas perks component has animated drink + corn icons', async () => {
  const perks = await readProjectFile('src/components/FurnasPerks.astro');
  assert.match(perks, /drink/i);
  assert.match(perks, /corn/i);
  assert.match(perks, /steam/i); // Furnas = steaming hot springs
  assert.match(perks, /@keyframes/);
  assert.match(perks, /prefers-reduced-motion/);
});

test('events auto-mark past + cancelled states', async () => {
  const [page, drawer] = await Promise.all([
    readProjectFile('src/pages/events.astro'),
    readProjectFile('src/components/EventDrawer.astro'),
  ]);
  // each panel carries an end time for client-side "past" detection
  const ends = page.match(/data-event-end=/g) || [];
  assert.ok(ends.length >= 3, `expected >=3 data-event-end, got ${ends.length}`);
  // client toggles a "past" state from the end time
  assert.match(page, /is-past/);
  assert.match(page, /Date\.parse/);
  // visible ENDED stamp + cancelled / rescheduling messaging on the page
  assert.match(page, /Ended/);
  assert.match(page, /Cancelled/);
  assert.match(page, /[Rr]eschedul/);
  // drawer renders ended + cancelled footer states
  assert.match(drawer, /is-cancelled/);
  assert.match(drawer, /This event has ended/i);
});

test('Romeu ticket perks + kids-free appear on events page and homepage banner', async () => {
  const [page, banner, drawer] = await Promise.all([
    readProjectFile('src/pages/events.astro'),
    readProjectFile('src/components/ConcertBanner.astro'),
    readProjectFile('src/components/EventDrawer.astro'),
  ]);
  // shared perks component used in both contexts
  assert.match(page, /FurnasPerks/);
  assert.match(banner, /FurnasPerks/);
  // kids-free is explicit next to the price
  assert.match(drawer, /kidsFree/);
  assert.match(page, /kidsFree=\{true\}/);
  assert.match(banner, /Kids free/i);
  assert.match(page, /Kids free/i); // yellow panel badge label
});
