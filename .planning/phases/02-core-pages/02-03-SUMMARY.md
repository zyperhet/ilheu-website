---
phase: 02-core-pages
plan: "03"
subsystem: ui
tags: [astro, content-collections, edition-pages, components, tailwind]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Astro project with content collections, Tailwind v4, placeholder content
  - plan: 02-01
    provides: BaseLayout, Nav, Footer, font stack (Cardo/Inter)
provides:
  - EditionCard component with cover thumbnail (numbered fallback) and theme
  - ArticleTeaser component with TOC-style row layout
  - ContributorCard component with portrait/initial fallback
  - /editions archive page listing all editions sorted newest-first
  - /editions/[editionId] individual edition page with theme hero, buy CTA, articles, contributors
affects: [02-02, 02-04, 02-05, 02-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "getStaticPaths + getCollection generates one page per edition at build time"
    - "id.startsWith(edition.id + '/') filters articles by edition (trailing slash prevents prefix collision)"
    - "getEntries resolves contributor reference arrays from edition frontmatter"
    - "getEntry resolves single contributor reference from article.data.author"
    - "All optional image fields guarded with conditional before passing to Image component"
    - "Contributor portrait fallback: initial circle div (w-12 h-12 rounded-full bg-gray-200) with first letter"
    - "Buy CTA hidden entirely when purchase_url absent — honest UX, no disabled state"

key-files:
  created:
    - src/components/EditionCard.astro
    - src/components/ArticleTeaser.astro
    - src/components/ContributorCard.astro
    - src/pages/editions/index.astro
    - src/pages/editions/[editionId].astro

key-decisions:
  - "EditionCard numbered fallback: uses accent_colour as background when available, gray-100 otherwise — edition number displayed as large text"
  - "ArticleTeaser uses line-clamp-3 for excerpt truncation — clean TOC feel without excessive height"
  - "ContributorCard compact (w-12 h-12 portrait, flex inline layout) — personal but space-efficient for horizontal wrapping"
  - "Edition hero: theme text leads (dominant, large Cardo), cover image supporting (shrink-0 right side) — theme is the editorial statement, cover illustrates"
  - "Articles sorted by published_date ascending on edition page — editorial reading order"

requirements-completed: [EDIT-03, EDIT-04]

# Metrics
duration: 3min
completed: 2026-03-03
---

# Phase 2 Plan 03: Edition Archive and Individual Edition Pages Summary

**Edition archive at /editions (sorted newest-first grid) and individual edition pages at /editions/[id] with theme hero, article table-of-contents, contributor portraits, and buy CTA — backed by three reusable components (EditionCard, ArticleTeaser, ContributorCard)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-03T16:33:53Z
- **Completed:** 2026-03-03T16:36:32Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created EditionCard.astro with conditional cover image (Image component) and numbered placeholder fallback using accent_colour
- Created ArticleTeaser.astro with TOC-style layout: Cardo title (linked), author name, 3-line truncated excerpt
- Created ContributorCard.astro with portrait image or initial circle fallback, name, and role in compact inline layout
- Built /editions archive page that fetches all editions, sorts by edition_number descending, renders responsive 2-col grid of EditionCards
- Built /editions/[editionId] page with getStaticPaths generating edition-1 and edition-2 pages
  - Theme hero: large Cardo theme text (dominant), edition title, buy CTA near top (hidden when no purchase_url), cover image alongside (guarded for optional)
  - Articles section: fetched by id.startsWith(edition.id + '/'), each author resolved via getEntry, rendered using ArticleTeaser
  - Contributors section: resolved via getEntries, rendered using ContributorCard in flex wrap
  - Back navigation to /editions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create reusable components** - `6513953` (feat)
2. **Task 2: Build edition archive and individual edition pages** - `747c079` (feat)

## Files Created/Modified

- `src/components/EditionCard.astro` - Cover thumbnail with numbered fallback, edition number/title/theme, links to /editions/[id]
- `src/components/ArticleTeaser.astro` - Editorial TOC row: Cardo title link, author, 3-line excerpt, border-separated
- `src/components/ContributorCard.astro` - 48px portrait or initial circle, name and role inline
- `src/pages/editions/index.astro` - Archive page: getCollection sorted desc, 2-col responsive grid of EditionCards
- `src/pages/editions/[editionId].astro` - Individual edition: getStaticPaths, article filtering by ID prefix, contributor resolution, theme hero, article TOC, contributor cards

## Decisions Made

- Edition numbered fallback uses the edition's accent_colour as background — editorial and distinctive when no cover image is available
- Buy CTA is fully hidden (not disabled) when purchase_url is absent — per user's "honest, not gimmick" preference
- Articles on edition page sorted by published_date ascending — editorial reading order, not reverse-chronological
- Theme hero uses flex-col on mobile (text above, cover below) and flex-row on md+ (text leads left, cover right) — matches user's specified desktop side-by-side, mobile stacked layout
- ContributorCard uses compact 48px portrait size with inline flex — allows multiple contributors to wrap horizontally in limited space

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — build passed cleanly on first attempt after each task.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- EditionCard is ready for homepage archive preview section (02-02) — same component, reusable
- ArticleTeaser and ContributorCard are built; they are edition-page-specific and complement the article reading page (02-04)
- Edition pages are live at /editions and /editions/edition-1, /editions/edition-2 — functional archive and detail pages

---
*Phase: 02-core-pages*
*Completed: 2026-03-03*

## Self-Check: PASSED

- FOUND: src/components/EditionCard.astro
- FOUND: src/components/ArticleTeaser.astro
- FOUND: src/components/ContributorCard.astro
- FOUND: src/pages/editions/index.astro
- FOUND: src/pages/editions/[editionId].astro
- FOUND: dist/editions/index.html
- FOUND: dist/editions/edition-1/index.html
- FOUND: dist/editions/edition-2/index.html
- FOUND commit: 6513953 (Task 1)
- FOUND commit: 747c079 (Task 2)
