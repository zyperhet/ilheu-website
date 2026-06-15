import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readProjectFile = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('homepage uses the five supplied conversation compositions without duplicate hero titles', async () => {
  const homepage = await readProjectFile('src/pages/index.astro');

  for (const asset of [
    'conversation-01-antonio-dacosta.webp',
    'conversation-02-leila-slimani.webp',
    'conversation-03-azorean-blues.webp',
    'conversation-04-pool-edge-of-the-world.webp',
    'conversation-05-blue-azores.webp',
  ]) {
    assert.match(homepage, new RegExp(asset.replaceAll('.', '\\.')));
  }

  const conversationSectionStart = homepage.indexOf('{conversations.map');
  const conversationSectionEnd = homepage.indexOf(
    'ALSO IN THIS ISSUE — INTRO',
    conversationSectionStart,
  );
  const conversationSection = homepage.slice(
    conversationSectionStart,
    conversationSectionEnd,
  );

  assert.doesNotMatch(conversationSection, /<h3/);
  assert.doesNotMatch(conversationSection, /videoSrc/);
});

test('navigation and large homepage logo use the requested supplied assets', async () => {
  const [navigation, homepage] = await Promise.all([
    readProjectFile('src/components/Nav.astro'),
    readProjectFile('src/pages/index.astro'),
  ]);

  assert.match(navigation, /\/images\/ilheu-logo-solo\.webp/);
  assert.match(homepage, /\/images\/ilheu-logo-pure-blue\.webp/);
});
