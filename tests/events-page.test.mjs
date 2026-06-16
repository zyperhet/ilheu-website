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
