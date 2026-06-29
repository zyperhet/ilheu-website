# Homepage Redesign (Issue B) — Design Spec

- **Date:** 2026-06-29
- **Branch:** `feat/homepage-redesign`
- **Source:** `~/Downloads/layout site_ilheu_B.pdf` (single tall mockup; rendered slices in scratchpad).
- **Status:** Structure approved by user; spec for implementation.

## Goal

Rebuild the **top** of the homepage (`src/pages/index.astro`) to match the PDF mockup — a cleaner, more typographic opening — while **keeping the existing lower sections**. The new top is: a cover-spread hero, a full-bleed blue/green "B" quote, and a Five-Conversations card row.

## Decisions (locked)

1. **Replace `/`** — rebuild `index.astro` on this branch (old version stays on `main`).
2. **PDF top + keep lower sections** — new hero/quote/conversations replace the current hero/editorial-letter/conversation sections; everything from the picture essay down is kept.
3. **Nav stays Home / Events / About** (PDF predates Events).
4. **Relocate the RTP "On television" clip** — keep the play-button + centered modal (don't lose it); move its trigger to a small line near the hero (under the intro) instead of inside the removed editorial letter.

## Palette (from the PDF — sample exact hexes in-browser during build)

- Cream ground: `~#F4F0E8`
- Brand blue (brighter than the site navy): `~#1A66C4`
- Green (emerald): `~#15A06B`
- Red accent (kickers): `~#E5342B`
- Near-black: `#111` for the conversations heading, card titles, tick rules.

Note: this introduces a brighter blue + green than the rest of the site (navy `#1B3A5C`). The kept lower sections stay navy; flag the top↔lower palette transition for visual review.

## Type (use the shipped type system)

- Headlines / card titles: heavy condensed grotesque → **Saira Condensed** (heavy weight) for the condensed card titles; **Saira 800** (`font-display`) for "Five Conversations on Blue".
- Kickers/labels (`CONVERSATION`, `ART`, "Issue B · Spring 2026", "CONVERSATIONS FROM THE ATLANTIC"): **Saira Condensed** (`.kicker`/`font-kicker`).
- Quote + contributor pill names + intro paragraph voice: mix of **PT Serif** (the *Bluets* quote, serif italic) and **Saira** (the bold blue intro paragraph). The intro paragraph in the PDF is a bold blue sans → `font-display`/Saira bold.

## Section specs (the new top)

### 1. Nav (existing `Nav.astro`, light variant)
Blue ILHÉu logo image left; `Home / Events / About` right (blue). Over cream. No change needed beyond the page using the light nav.

### 2. Hero
- Kicker row: `Issue B` `Spring 2026` in **red**, Saira Condensed, left-aligned.
- **Cover spread**: two covers side by side with a thin **blue spine** between them, small white `B` near the spine's lower end:
  - Left = `00-covers/back-cover-girl-by-pool-blue-green-hair.jpg` (red "CONVERSATIONS FROM THE ATLANTIC" overlay top-left — already on the artwork or added as overlay; verify the asset, add overlay only if not baked in).
  - Right = `00-covers/front-cover-dacosta-memory-v-green-triangle.jpg` (the "Pure Blue ILHÉu" front cover).
- Below the spread: left column = intro paragraph in **bold blue** Saira — "Ilhéu is a magazine of conversations, design, art and writing, produced and published on the Azorean island of São Miguel. The people who make Ilhéu run on the sun, the wind and the rain of the Atlantic, and we do this work for everyone who loves beautiful stories, images and words."; right column = solid-blue **"Buy Issue B"** button (white text, sharp corners) → `purchaseUrl`.
- Under the intro (relocated): a small **RTP** trigger line ("On television · What is Ilhéu? · RTP1 · ▶") opening the existing centered modal.

### 3. The "B" quote (full-bleed)
- Two-colour split: **left ~half blue, right ~half green**, full viewport width.
- A **giant "B"** letterform (blue) sitting on the green right half (Anton/condensed; the counter shows green through).
- On the blue left half, lower area: the **Maggie Nelson *Bluets*** quote in pale serif italic — "And so I fell in love with a colour – in this case, the colour blue – as if falling under a spell, a spell I fought to stay under and get out from under, in turns." → credit "**Maggie Nelson,** *Bluets*" in **green** serif.

### 4. Five Conversations on Blue
- A row of **5 thin vertical tick rules** (hanging, black) aligned to the 5 columns below — appears both above the heading and above the cards (decorative measure marks).
- Heading "**Five Conversations on Blue**" — black, Saira 800.
- Intro paragraph (Saira, dark): "Five investigations into the least pure of all the colours — from the Paris blues of the painter António Dacosta to the architectural ruin of a six-million-euro swimming pool, from Leïla Slimani on writer's block to Romeu Bairos on the viola da terra, all the way down to the underwater stillness of the Azorean marine park."
- **5 conversation cards** (row on desktop, stack/scroll on mobile). Each card, top→bottom:
  - hanging tick rule
  - `CONVERSATION` (kicker, black)
  - number in a thin-stroke **circle** (1–5)
  - category kicker: `ART` / `WRITING` / `MUSIC` / `ARCHITECTURE` / `ENVIRONMENT`
  - title (heavy condensed, black, uppercase except #2): `ANTÓNIO DACOSTA AND HIS PARIS BLUES` / `What's the point trying to understand a soul?` / `AZOREAN BLUES` / `THE POOL AT THE EDGE OF THE WORLD` / `BLUE AZORES`
  - **oval pill** (thin black stroke) with two names: top = first participant (regular), bottom = second (bold). 1: Urbano Resendes / **Arlete Alves da Silva**; 2: Maria Brandão / **Leïla Slimani**; 3: Diogo Lima / **Romeu Bairos**; 4: Ilhéu Atelier / **José António Barbosa**; 5: Adriano Quintela / **Bernardo Brito e Abreu**.
  - whole card links to its `/conversations/*` page (dacosta, slimani, azorean-blues, pool, blue-azores).

## Kept lower sections (unchanged, in order)
Picture Essay → Playlists (A/B record sleeves) → Map → Comic Strip → Prose → Previously: Azores → final Buy CTA. Plus the `ConcertBanner` at the very top (already self-retired after 20 Jun) and the RTP `<dialog>` markup (trigger relocated to the hero).

## Removed sections
Current tactile single-cover hero, "magazine in motion" video, "Pure Blue ILHÉU" title slate, and the long Editor's Letter (its epigraph becomes the "B" quote section).

## Responsive
- Hero cover spread: side-by-side on desktop; stack on mobile (or keep side-by-side scaled — verify legibility).
- "B" quote: split layout on desktop; on mobile, stack (blue block with quote, then green block with B) or keep split scaled.
- Conversation cards: 5-up row on desktop; horizontal scroll or 2-then-stack on mobile.

## Out of scope / verify during build
- Exact hexes (sample in-browser).
- Whether the cover artworks have their text overlays baked in (add overlays only if missing).
- Final mobile layout for the cover spread and the 5 cards.
