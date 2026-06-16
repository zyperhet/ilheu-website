# Events Page (`/events`) — Design Spec

- **Date:** 2026-06-16
- **Branch:** `feat/events-page`
- **Status:** Design approved; implementation pending.
- **Source flyer:** three-band June 2026 events flyer (Arquitectura / Romeu Bairos / Under the Cover).

## Goal

A standalone `/events` page that recreates the printed flyer on the web: three
full-viewport color panels (one per event) that the visitor scrolls through.
Clicking a panel opens a right-edge slide-in drawer with that event's details —
reusing the native-`<dialog>` drawer pattern already shipped in
`ConcertBanner.astro` for the Romeu Bairos concert.

## Decisions (locked)

1. **Panel style: faithful to the flyer.** Heavy grotesque caps, saturated
   magenta/yellow/blue bands, rotated labels, and the black right strip with
   `ILHÉU` / `JUNE · JUNHO`.
2. **Navigation: add "Events" to the site nav** → Home / Events / About.
3. **Fonts:** extend the Google Fonts link to include Inter 700/800/900 for the
   heavy titles. `ILHÉU` on the strip rendered as heavy Inter caps (not the logo
   image).
4. **Colors** (sampled from flyer, refined during build): magenta `~#EC008C`,
   yellow `~#FFD400`, blue `~#2E4FA2`, strip near-black `#0B0B0B`.
5. **No refactor of `ConcertBanner.astro`** (the live homepage bar). The Romeu
   drawer copy is lightly duplicated in the new shared drawer rather than risk
   touching the working homepage — accepted trade-off.
6. **No "past event" auto-hiding** on this page (all three events are upcoming).
   The homepage banner keeps its own self-retiring logic.

## Layout

Three stacked `<section>` panels, each `100svh`, in a scroll-snap container.
A single fixed black right strip overlays all three (vertical `ILHÉU` top,
`JUNE · JUNHO` bottom). Panel content is padded on the right to clear the strip.

- Each panel is a full-bleed `<button>` (`aria-haspopup="dialog"`,
  `aria-controls="<drawer-id>"`).
- Label accent colors cross-reference the palette, like the flyer:
  - Panel 1 (magenta): **yellow** rotated label `CONVERSA · CONVERSATION`.
  - Panel 2 (yellow): **magenta** rotated label `CONCERTO · CONCERT`.
  - Panel 3 (blue): **white** horizontal label `LANÇAMENTO · MAGAZINE LAUNCH`.
- Panel 2 carries the black `€10` badge (bottom-right), like the flyer.
- Strip narrows on small screens; panels remain legible on mobile.
- Nav overlays panel 1; use `navVariant="dark"` (white logo + links) for contrast
  on magenta.

## Components & files

- **New:** `src/pages/events.astro` — the page (panels + 3 drawers + wiring script).
- **New:** `src/components/EventDrawer.astro` — reusable right-edge `<dialog>`
  drawer generalized from `ConcertBanner.astro`. Props (approx.):
  `id`, `accent`, `eyebrow`, `title`, `image`, `imageAlt`,
  `details` (when / where / price rows), free-vs-paid CTA
  (`stripeUrl` + label, or `free` note + `mapsUrl`). Body via `<slot/>`.
- **Edit:** `src/components/Nav.astro` — add `{ label: 'Events', href: '/events' }`
  to `navItems` (appears in both desktop nav and mobile overlay automatically).
- **New assets:** `src/assets/images/events/`
  - `arquitectura-dos-acores.jpg` (staircase photo — PHOTO-2026-06-11-19-44-33)
  - `under-the-cover-lisboa.jpg` (storefront photo — PHOTO-2026-06-11-19-44-48)
  - `events-flyer.jpg` (three-band flyer — PHOTO-2026-06-11-19-42-25) for the
    page's social/OG share image.

## Content per event

| # | Event | Type label | Date | Location | Drawer image | Body | CTA |
|---|---|---|---|---|---|---|---|
| 1 | Arquitectura dos Açores hoje (Azores Architecture Today) | CONVERSA · CONVERSATION | 18 jun — 18h30 | Pico do Refúgio | staircase photo | Lorem Ipsum (real text later) | Free entry + Get directions ↗ |
| 2 | Romeu Bairos | CONCERTO · CONCERT | 20 jun — 16h | Pico do Refúgio | concert flyer | existing bio + When/Where/Tickets + "free drink & corn" | Buy tickets — €10 → (existing Stripe link) |
| 3 | Under the Cover, Lisboa | LANÇAMENTO · MAGAZINE LAUNCH | 27 jun — 16h | Lisbon (Under the Cover bookshop) | storefront photo | Lorem Ipsum | Free entry + Get directions ↗ |

Reused constants from `ConcertBanner.astro`:
- Stripe (Romeu): `https://buy.stripe.com/aFacN7boegr7biI2MbfMA04`
- Maps (Pico do Refúgio): `https://maps.app.goo.gl/MYcWGFnWGxhdWFUz5`

## Drawer behavior (from existing pattern)

- Native `<dialog>` + `showModal()` → ESC, focus-trap, top-layer, `::backdrop`.
- Slide-in via `transform: translateX(100%) → 0` on `.is-open` (added next frame).
- Close on: close button, backdrop click, ESC (`cancel` event, animated).
- `prefers-reduced-motion`: transitions disabled.
- One generic script handles all three drawers (open buttons matched to drawers).

## Out of scope / placeholders

- Real descriptions for Arquitectura and Under the Cover (Lorem Ipsum until the
  user supplies copy).
- Exact Lisbon map pin for Under the Cover (Maps search link until provided).
- Past-event handling, ticketing for the free events, i18n of labels.
