# Events Page (`/events`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `/events` page that recreates the June 2026 flyer on the web — three full-viewport color panels (Arquitectura / Romeu Bairos / Under the Cover), each opening a right-edge slide-in drawer reusing the site's native-`<dialog>` pattern.

**Architecture:** One new page (`src/pages/events.astro`) renders three `100svh` color `<section>` panels plus a fixed black right strip (ILHÉU / JUNE · JUNHO). A new reusable presentational component (`src/components/EventDrawer.astro`) generalizes the slide-in drawer from `ConcertBanner.astro`; the page imports it three times. A single generic wiring script on the page opens/closes all drawers (panel button → `dialog#id`). Small edits add Inter heavy weights (BaseLayout) and an "Events" nav link (Nav).

**Tech Stack:** Astro v5 (static), Tailwind v4, native `<dialog>`, `astro:assets` `<Image>`, `node --test` source-assertion tests.

**Verification model:** No DOM test runner exists. "Tests" = `node --test` source-assertion tests (repo convention, see `tests/layout-assets.test.mjs`) + `npm run build` (compile/type/asset check) + a real browser visual check via chrome-devtools.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/assets/images/events/arquitectura-dos-acores.jpg` | Drawer hero — staircase photo (Arquitectura) |
| `src/assets/images/events/under-the-cover-lisboa.jpg` | Drawer hero — storefront photo (Under the Cover) |
| `public/images/events-flyer.jpg` | Static OG/share image (the 3-band flyer) |
| `src/components/EventDrawer.astro` | **New.** Reusable right-edge `<dialog>` drawer (markup + scoped slide-in CSS). Presentational; body via `<slot/>`. |
| `src/pages/events.astro` | **New.** The page: 3 panels + black strip + 3 `EventDrawer`s + generic open/close script + page-scoped scroll-snap CSS. |
| `src/components/Nav.astro` | **Modify.** Add `{ label: 'Events', href: '/events' }` to `navItems`. |
| `src/layouts/BaseLayout.astro` | **Modify.** Extend Google Fonts link with Inter 700;800;900. |
| `tests/events-page.test.mjs` | **New.** Source-assertion tests for the component, page, and nav link. |

**Palette (Tailwind arbitrary values), sampled from the flyer:** magenta `#EC008C`, yellow `#FFD400`, blue `#2E4FA2`, strip near-black `#0B0B0B`, drawer cream `#F6F1E8`, drawer navy `#1B3A5C`.

**Reused constants (from `ConcertBanner.astro`):** Stripe `https://buy.stripe.com/aFacN7boegr7biI2MbfMA04`; Maps (Pico do Refúgio) `https://maps.app.goo.gl/MYcWGFnWGxhdWFUz5`.

---

## Task 1: Add image assets

**Files:**
- Create: `src/assets/images/events/arquitectura-dos-acores.jpg`
- Create: `src/assets/images/events/under-the-cover-lisboa.jpg`
- Create: `public/images/events-flyer.jpg`

- [ ] **Step 1: Create the events asset directory and copy the three source images**

```bash
mkdir -p src/assets/images/events
cp ~/Downloads/PHOTO-2026-06-11-19-44-33.jpg src/assets/images/events/arquitectura-dos-acores.jpg
cp ~/Downloads/PHOTO-2026-06-11-19-44-48.jpg src/assets/images/events/under-the-cover-lisboa.jpg
cp ~/Downloads/PHOTO-2026-06-11-19-42-25.jpg public/images/events-flyer.jpg
```

- [ ] **Step 2: Verify the files exist and are non-empty JPEGs**

Run:
```bash
ls -l src/assets/images/events/ public/images/events-flyer.jpg && file src/assets/images/events/*.jpg public/images/events-flyer.jpg
```
Expected: three entries listed; `file` reports `JPEG image data` for each.

- [ ] **Step 3: Commit**

```bash
git add src/assets/images/events public/images/events-flyer.jpg
git commit -m "feat(events): add event photos + flyer share image"
```

---

## Task 2: Add Inter heavy weights + "Events" nav link

**Files:**
- Modify: `src/layouts/BaseLayout.astro:37-40`
- Modify: `src/components/Nav.astro:8-11`
- Test: `tests/events-page.test.mjs`

- [ ] **Step 1: Write the failing test (nav link present)**

Create `tests/events-page.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `nav links to the events page` and `base layout loads heavy Inter weights` fail (link + weights not present yet).

- [ ] **Step 3: Add the nav link**

In `src/components/Nav.astro`, change the `navItems` array (lines 8-11) from:

```js
const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];
```

to:

```js
const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'About', href: '/about' },
];
```

- [ ] **Step 4: Extend the Google Fonts link with heavy Inter weights**

In `src/layouts/BaseLayout.astro`, replace the stylesheet `href` (line 39) from:

```
https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap
```

to:

```
https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700;800;900&display=swap
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS for both new tests (existing tests still pass).

- [ ] **Step 6: Build to confirm no regressions**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/Nav.astro src/layouts/BaseLayout.astro tests/events-page.test.mjs
git commit -m "feat(events): add Events nav link + heavy Inter weights"
```

---

## Task 3: Create the reusable `EventDrawer` component

**Files:**
- Create: `src/components/EventDrawer.astro`
- Test: `tests/events-page.test.mjs`

The drawer is presentational: the page passes content; the body (description/bio) comes via `<slot/>`. CTA is either **paid** (`stripeUrl` + `price`) or **free** (`free` + optional `mapsUrl`). Scoped CSS holds the slide-in (Astro emits it once even across three instances).

- [ ] **Step 1: Write the failing test (component structure)**

Append to `tests/events-page.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `EventDrawer supports paid and free CTAs` fails (file does not exist).

- [ ] **Step 3: Create `src/components/EventDrawer.astro`**

```astro
---
/*
  EventDrawer — reusable right-edge drawer for a single event.

  Generalizes the native-<dialog> slide-in from ConcertBanner.astro:
  ESC-to-close, focus trap, top-layer stacking and ::backdrop for free,
  plus a transform-based slide-in. Open/close is wired generically on the
  page (panel button [data-drawer-open] -> dialog#id; close via the
  [data-drawer-close] button, backdrop click, or ESC).

  Presentational only: the body (description/bio) is passed via <slot/>.
  CTA is paid (price + stripeUrl) or free (free + optional mapsUrl).
*/
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  image: ImageMetadata;
  imageAlt: string;
  when: string;
  whenNote?: string;
  where: string;
  mapsUrl?: string;
  price?: string;
  priceNote?: string;
  stripeUrl?: string;
  free?: boolean;
  accent?: string;
}

const {
  id,
  eyebrow,
  title,
  image,
  imageAlt,
  when,
  whenNote,
  where,
  mapsUrl,
  price,
  priceNote,
  stripeUrl,
  free = false,
  accent = '#1B3A5C',
} = Astro.props;
---

<dialog id={id} class="event-drawer" aria-label={`${title} — details`}>
  <div class="flex flex-col h-full">
    <!-- Scrollable: hero image + details -->
    <div class="flex-1 overflow-y-auto">
      <div class="relative">
        <Image
          src={image}
          alt={imageAlt}
          class="block w-full h-auto"
          widths={[420, 840]}
          sizes="(max-width: 460px) 92vw, 420px"
        />
        <button
          type="button"
          data-drawer-close
          aria-label="Close"
          class="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/45 backdrop-blur-sm text-white/90 hover:text-white hover:bg-black/60 transition-colors"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="px-6 sm:px-7 py-7" style={`color: ${accent};`}>
        <p class="font-inter text-[10px] uppercase tracking-[0.3em] opacity-50 mb-3">{eyebrow}</p>
        <h2 class="font-minion italic text-3xl sm:text-4xl leading-[1.05] mb-4">{title}</h2>

        <div class="font-minion text-base sm:text-lg italic leading-relaxed opacity-80 mb-7">
          <slot />
        </div>

        <dl class="border-y border-current/10 divide-y divide-current/10">
          <div class="flex items-baseline justify-between gap-5 py-3.5">
            <dt class="font-inter text-[10px] uppercase tracking-[0.25em] opacity-45 shrink-0 pt-1">When</dt>
            <dd class="text-right">
              <span class="font-minion italic text-lg leading-tight block">{when}</span>
              {whenNote && <span class="font-inter text-[11px] uppercase tracking-[0.18em] opacity-55">{whenNote}</span>}
            </dd>
          </div>
          <div class="flex items-baseline justify-between gap-5 py-3.5">
            <dt class="font-inter text-[10px] uppercase tracking-[0.25em] opacity-45 shrink-0 pt-1">Where</dt>
            <dd class="text-right">
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-minion italic text-lg leading-tight inline-flex items-center gap-1.5 underline underline-offset-4 decoration-current/25 hover:decoration-current transition-colors"
                >
                  {where}
                  <span class="text-xs not-italic opacity-60" aria-hidden="true">&#8599;</span>
                </a>
              ) : (
                <span class="font-minion italic text-lg leading-tight block">{where}</span>
              )}
            </dd>
          </div>
          <div class="flex items-baseline justify-between gap-5 py-3.5">
            <dt class="font-inter text-[10px] uppercase tracking-[0.25em] opacity-45 shrink-0 pt-1">Entry</dt>
            <dd class="text-right">
              <span class="font-minion italic text-lg leading-tight block">{free ? 'Free entry' : price}</span>
              {priceNote && <span class="font-inter text-[11px] uppercase tracking-[0.18em] opacity-55">{priceNote}</span>}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Pinned footer: CTA -->
    <div class="shrink-0 border-t px-6 sm:px-7 py-4" style={`border-color: ${accent}1a; background-color:#F6F1E8;`}>
      {!free && stripeUrl ? (
        <>
          <a
            href={stripeUrl}
            class="block w-full text-center text-white font-inter text-xs uppercase tracking-[0.22em] py-4 hover:opacity-90 transition-opacity duration-300"
            style={`background-color: ${accent};`}
          >
            Buy tickets &mdash; {price} &rarr;
          </a>
          <p class="font-inter text-[10px] uppercase tracking-[0.2em] text-center mt-3" style={`color: ${accent}; opacity: 0.5;`}>
            Secure checkout via Stripe &middot; Also available on the door
          </p>
        </>
      ) : (
        <>
          <p class="font-inter text-xs uppercase tracking-[0.22em] text-center py-2" style={`color: ${accent};`}>
            Free entry &middot; All welcome
          </p>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="block w-full text-center font-inter text-[11px] uppercase tracking-[0.22em] py-3 mt-1 border hover:opacity-80 transition-opacity duration-300"
              style={`color: ${accent}; border-color: ${accent}33;`}
            >
              Get directions &#8599;
            </a>
          )}
        </>
      )}
    </div>
  </div>
</dialog>

<style>
  .event-drawer {
    position: fixed;
    inset: 0 0 0 auto;
    margin: 0;
    height: 100dvh;
    max-height: 100dvh;
    width: min(420px, 92vw);
    max-width: 92vw;
    border: 0;
    padding: 0;
    background-color: #f6f1e8;
    color: #1b3a5c;
    overflow: hidden;
    transform: translateX(100%);
    transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: -20px 0 60px -15px rgba(8, 18, 38, 0.4);
  }
  .event-drawer.is-open {
    transform: translateX(0);
  }
  .event-drawer::backdrop {
    background: rgba(8, 18, 38, 0.5);
    opacity: 0;
    transition: opacity 360ms ease;
  }
  .event-drawer.is-open::backdrop {
    opacity: 1;
    backdrop-filter: blur(2px);
  }
  @media (prefers-reduced-motion: reduce) {
    .event-drawer,
    .event-drawer::backdrop {
      transition: none;
    }
  }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — `EventDrawer supports paid and free CTAs and the slide-in pattern`.

- [ ] **Step 5: Build to confirm the component compiles**

Run: `npm run build`
Expected: build completes with no errors (component is unused so far; this just confirms it parses).

- [ ] **Step 6: Commit**

```bash
git add src/components/EventDrawer.astro tests/events-page.test.mjs
git commit -m "feat(events): reusable EventDrawer (paid/free CTA, slide-in)"
```

---

## Task 4: Create the `/events` page

**Files:**
- Create: `src/pages/events.astro`
- Test: `tests/events-page.test.mjs`

Three `100svh` panels (magenta / yellow / blue) each as a full-bleed overlay `<button>` that opens its drawer; a fixed black right strip; three `EventDrawer`s; one generic wiring script; page-scoped scroll-snap.

- [ ] **Step 1: Write the failing test (page wiring + content)**

Append to `tests/events-page.test.mjs`:

```js
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
  assert.match(page, /free\b/);

  // generic open/close wiring present
  assert.match(page, /data-drawer-open/);
  assert.match(page, /showModal\(\)/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `events page wires three drawers` fails (page does not exist).

- [ ] **Step 3: Create `src/pages/events.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import EventDrawer from '../components/EventDrawer.astro';
import imgArquitectura from '../assets/images/events/arquitectura-dos-acores.jpg';
import imgUnderCover from '../assets/images/events/under-the-cover-lisboa.jpg';
import flyerRomeu from '../assets/images/concert/romeu-bairos-flyer.jpg';

const stripeUrl = 'https://buy.stripe.com/aFacN7boegr7biI2MbfMA04';
const mapsPico = 'https://maps.app.goo.gl/MYcWGFnWGxhdWFUz5';
const mapsUnderCover = 'https://www.google.com/maps/search/?api=1&query=Under+the+Cover+livraria+Lisboa';

const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
---

<BaseLayout
  title="Events — June 2026 · Ilhéu Magazine"
  description="Three Ilhéu events in June 2026: Azores Architecture Today (18 Jun), Romeu Bairos in concert (20 Jun), and the Issue B launch at Under the Cover, Lisbon (27 Jun)."
  navVariant="dark"
  fullBleed={true}
  ogImage="/images/events-flyer.jpg"
>
  <!-- Black right strip — ILHÉU / JUNE · JUNHO (overlays all panels) -->
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-y-0 right-0 z-[40] w-9 sm:w-14 bg-[#0B0B0B] flex flex-col items-center justify-between pt-20 sm:pt-24 pb-6"
  >
    <span class="font-inter font-black uppercase tracking-[0.15em] text-white text-base sm:text-2xl" style="writing-mode:vertical-rl;">Ilhéu</span>
    <span class="font-inter font-bold uppercase tracking-[0.3em] text-white/90 text-[10px] sm:text-xs" style="writing-mode:vertical-rl;">June · Junho</span>
  </div>

  <!-- ── Panel 1 · Arquitectura (magenta) ───────────────── -->
  <section class="event-panel relative min-h-[100svh] flex items-center bg-[#EC008C] overflow-hidden">
    <button
      type="button"
      data-drawer-open="drawer-arquitectura"
      aria-haspopup="dialog"
      aria-controls="drawer-arquitectura"
      aria-label="Arquitectura dos Açores hoje — 18 June, 18h30, Pico do Refúgio. Open details."
      class="absolute inset-0 w-full h-full cursor-pointer focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-black/40 outline-none"
    ></button>
    <span aria-hidden="true" class="pointer-events-none absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 origin-center font-inter font-bold uppercase tracking-[0.2em] text-xs sm:text-base text-[#FFD400]" style="writing-mode:vertical-rl; transform:rotate(180deg);">Conversa · Conversation</span>
    <div class="pointer-events-none relative z-[1] w-full max-w-5xl mx-auto px-12 sm:px-24 pr-14 sm:pr-28">
      <p class="font-inter font-extrabold uppercase text-xl sm:text-3xl tracking-tight text-black mb-3">18 jun — 18h30</p>
      <h2 class="font-inter font-black uppercase leading-[0.9] text-black text-4xl sm:text-6xl lg:text-7xl mb-4">Arquitectura dos Açores hoje</h2>
      <p class="font-inter font-bold text-lg sm:text-2xl text-black/80 mb-5">Azores Architecture Today</p>
      <p class="font-inter font-bold uppercase tracking-wide text-sm sm:text-lg text-black">Pico do Refúgio</p>
    </div>
    <span aria-hidden="true" class="pointer-events-none absolute bottom-6 right-12 sm:right-20 inline-flex items-center gap-2 font-inter text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-black/70">Details <span class="text-base leading-none">+</span></span>
  </section>

  <!-- ── Panel 2 · Romeu Bairos (yellow) ────────────────── -->
  <section class="event-panel relative min-h-[100svh] flex items-center bg-[#FFD400] overflow-hidden">
    <button
      type="button"
      data-drawer-open="drawer-romeu"
      aria-haspopup="dialog"
      aria-controls="drawer-romeu"
      aria-label="Romeu Bairos in concert — 20 June, 16h, Pico do Refúgio. Tickets €10. Open details."
      class="absolute inset-0 w-full h-full cursor-pointer focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-black/40 outline-none"
    ></button>
    <span aria-hidden="true" class="pointer-events-none absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 origin-center font-inter font-bold uppercase tracking-[0.2em] text-xs sm:text-base text-[#EC008C]" style="writing-mode:vertical-rl; transform:rotate(180deg);">Concerto · Concert</span>
    <div class="pointer-events-none relative z-[1] w-full max-w-5xl mx-auto px-12 sm:px-24 pr-14 sm:pr-28">
      <p class="font-inter font-extrabold uppercase text-xl sm:text-3xl tracking-tight text-black mb-3">20 jun — 16h</p>
      <h2 class="font-inter font-black uppercase leading-[0.9] text-black text-5xl sm:text-7xl lg:text-8xl mb-4">Romeu Bairos</h2>
      <p class="font-inter font-bold uppercase tracking-wide text-sm sm:text-lg text-black">Pico do Refúgio</p>
    </div>
    <span aria-hidden="true" class="pointer-events-none absolute bottom-6 right-12 sm:right-20 inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black text-white font-inter font-bold text-sm sm:text-base">€10</span>
  </section>

  <!-- ── Panel 3 · Under the Cover (blue) ───────────────── -->
  <section class="event-panel relative min-h-[100svh] flex items-center bg-[#2E4FA2] overflow-hidden">
    <button
      type="button"
      data-drawer-open="drawer-undercover"
      aria-haspopup="dialog"
      aria-controls="drawer-undercover"
      aria-label="Under the Cover, Lisboa — Issue B magazine launch, 27 June, 16h. Open details."
      class="absolute inset-0 w-full h-full cursor-pointer focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-white/50 outline-none"
    ></button>
    <div class="pointer-events-none relative z-[1] w-full max-w-5xl mx-auto px-12 sm:px-24 pr-14 sm:pr-28">
      <p class="font-inter font-extrabold uppercase text-xl sm:text-3xl tracking-tight text-black mb-3">27 jun — 16h</p>
      <p class="font-inter font-bold uppercase tracking-[0.18em] text-sm sm:text-lg text-white mb-6">Lançamento · Magazine Launch</p>
      <h2 class="font-inter font-black uppercase leading-[0.9] text-black text-4xl sm:text-6xl lg:text-7xl">Under the cover, Lisboa</h2>
    </div>
    <span aria-hidden="true" class="pointer-events-none absolute bottom-6 right-12 sm:right-20 inline-flex items-center gap-2 font-inter text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-white/80">Details <span class="text-base leading-none">+</span></span>
  </section>

  <!-- ── Drawers ────────────────────────────────────────── -->
  <EventDrawer
    id="drawer-arquitectura"
    accent="#B00068"
    eyebrow="Conversa · Pico do Refúgio"
    title="Arquitectura dos Açores hoje"
    image={imgArquitectura}
    imageAlt="A sculptural concrete staircase — Azorean architecture"
    when="Wednesday 18 June"
    whenNote="18h30"
    where="Pico do Refúgio"
    mapsUrl={mapsPico}
    free={true}
  >
    <p>{lorem}</p>
  </EventDrawer>

  <EventDrawer
    id="drawer-romeu"
    accent="#1B3A5C"
    eyebrow="Live · Pico do Refúgio"
    title="An evening with Romeu Bairos"
    image={flyerRomeu}
    imageAlt="Romeu Bairos live at Pico do Refúgio — Saturday 20 June, 16h, €10"
    when="Saturday 20 June"
    whenNote="Doors 16h"
    where="Pico do Refúgio"
    mapsUrl={mapsPico}
    price="€10"
    priceNote="Kids up to 12 free"
    stripeUrl={stripeUrl}
  >
    <p>One of Portugal&rsquo;s most interesting young musicians plays the viola da terra at Pico do Refúgio. He gave an outstanding interview on whether there is such a thing as Azorean Blues in our latest issue. (There is.) Your ticket includes a free drink and Furnas-style corn-on-the-cob.</p>
  </EventDrawer>

  <EventDrawer
    id="drawer-undercover"
    accent="#234191"
    eyebrow="Magazine Launch · Lisbon"
    title="Under the Cover, Lisboa"
    image={imgUnderCover}
    imageAlt="The Under the Cover bookshop storefront in Lisbon"
    when="Friday 27 June"
    whenNote="16h"
    where="Under the Cover, Lisboa"
    mapsUrl={mapsUnderCover}
    free={true}
  >
    <p>{lorem}</p>
  </EventDrawer>

  <!-- Generic open/close wiring for every EventDrawer on the page -->
  <script>
    document.querySelectorAll('[data-drawer-open]').forEach((btn) => {
      const id = btn.getAttribute('data-drawer-open');
      const drawer = id ? document.getElementById(id) : null;
      if (!(drawer instanceof HTMLDialogElement)) return;
      btn.addEventListener('click', () => {
        drawer.showModal();
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => drawer.classList.add('is-open'));
      });
    });

    document.querySelectorAll('dialog.event-drawer').forEach((drawer) => {
      if (!(drawer instanceof HTMLDialogElement)) return;
      const close = () => {
        drawer.classList.remove('is-open');
        const finish = () => {
          drawer.close();
          document.body.style.overflow = '';
          drawer.removeEventListener('transitionend', finish);
        };
        drawer.addEventListener('transitionend', finish);
        setTimeout(finish, 420); // fallback for reduced motion
      };
      drawer.querySelector('[data-drawer-close]')?.addEventListener('click', close);
      drawer.addEventListener('click', (e) => { if (e.target === drawer) close(); });
      drawer.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    });
  </script>

  <style is:global>
    /* Snap one panel at a time on /events only (page-scoped global). */
    html { scroll-snap-type: y proximity; }
    .event-panel { scroll-snap-align: start; }
    @media (prefers-reduced-motion: reduce) {
      html { scroll-snap-type: none; }
    }
  </style>
</BaseLayout>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all `events-page` tests pass; existing tests pass.

- [ ] **Step 5: Build to confirm the page compiles + assets resolve**

Run: `npm run build`
Expected: build completes with no errors; `dist/events/index.html` is emitted.

- [ ] **Step 6: Commit**

```bash
git add src/pages/events.astro tests/events-page.test.mjs
git commit -m "feat(events): /events page — three flyer panels + drawers"
```

---

## Task 5: Visual verification + polish

**Files:** (polish edits, as needed) `src/pages/events.astro`, `src/components/EventDrawer.astro`

- [ ] **Step 1: Start the dev server**

Run (background): `npm run dev`
Expected: server on `http://localhost:4321`.

- [ ] **Step 2: Visually verify the page at desktop and mobile widths**

Using chrome-devtools MCP: navigate to `http://localhost:4321/events`. Take screenshots at 1440×900 and 390×844. Then click each panel and screenshot the open drawer.

Check against the flyer and the spec:
- Three full-viewport bands, correct colors (magenta/yellow/blue), heavy caps titles.
- Rotated labels on panels 1 & 2 (yellow / magenta); white horizontal label on panel 3; `€10` badge on panel 2.
- Black right strip with ILHÉU / JUNE · JUNHO; **does not collide with the mobile menu button** (adjust strip `pt-*` / `w-*` or nav if it does).
- Black strip does not overlap the site footer awkwardly (if it does, wrap the three panels in a `relative` container and make the strip `absolute inset-y-0 right-0` so it ends where the footer begins).
- Clicking each panel slides its drawer in from the right; cream/navy Minion styling; correct hero image.
- Romeu drawer shows the €10 Buy (Stripe) CTA; the other two show "Free entry" + Get directions.
- Close via ×, backdrop click, and ESC all work; background scroll locks while open.
- Nav shows Home / **Events** / About; logo + links legible (white) over magenta.

- [ ] **Step 3: Apply any polish fixes**

Make focused edits for issues found (title sizing/wrapping, strip collision, label rotation direction, contrast). Keep changes minimal.

- [ ] **Step 4: Re-run tests + build**

Run: `npm test && npm run build`
Expected: all pass; build clean.

- [ ] **Step 5: Commit (only if Step 3 changed files)**

```bash
git add -A
git commit -m "fix(events): visual polish from browser check"
```

---

## Self-Review

**1. Spec coverage:**
- Three viewport panels recreating the flyer → Task 4 (panels). ✓
- Faithful style (heavy caps, saturated bands, rotated labels, black strip) → Task 2 (fonts) + Task 4 (markup). ✓
- Click → right-edge drawer reusing the concert pattern → Task 3 (`EventDrawer`) + Task 4 (wiring). ✓
- Arquitectura: free entry + Lorem + staircase image → Task 1 + Task 4. ✓
- Under the Cover: free entry + Lorem + storefront image → Task 1 + Task 4. ✓
- Romeu: reuse concert content + €10 Stripe buy → Task 4 (drawer props/body). ✓
- "Events" in nav → Task 2. ✓
- Drawers keep site cream/navy Minion styling → Task 3. ✓

**2. Placeholder scan:** Lorem Ipsum is an intentional, spec-approved content placeholder (real copy supplied later), not a plan gap. No `TODO`/`TBD`/"implement later" steps; every code step has complete code.

**3. Type consistency:** Drawer ids match across page buttons, drawer elements, and tests (`drawer-arquitectura`, `drawer-romeu`, `drawer-undercover`). The `[data-drawer-open]` / `[data-drawer-close]` / `dialog.event-drawer` / `.is-open` contract is defined in Task 3 and used identically in Task 4. `EventDrawer` prop names used in Task 4 match the `Props` interface in Task 3.

**Known nuances flagged for the visual pass (Task 5):** mobile strip vs. menu-button collision; long-title wrapping; vertical-text rotation direction; OG flyer is portrait (some platforms crop).
