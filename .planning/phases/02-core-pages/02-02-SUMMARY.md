---
phase: 02-core-pages
plan: "02"
subsystem: ui
tags: [astro, tailwind, content-collections, homepage, magazine, hero]

# Dependency graph
requires:
  - phase: 02-core-pages
    plan: "01"
    provides: BaseLayout.astro with Nav/Footer integration, Cardo/Inter font stack, @tailwindcss/typography
  - phase: 01-foundation
    provides: Astro content collections for editions, articles, and contributors with Zod schemas
provides:
  - Homepage (src/pages/index.astro) with three-section layout: current edition hero, featured article highlight, edition archive preview
  - getCollection pattern for querying editions and articles at build time
  - Link structure to /editions, /articles, and /contributors route namespaces
affects: [02-03, 02-04, 02-05, 03-commerce, 04-editorial]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "astro:content getCollection with filter predicate for featured articles per edition"
    - "getEntry to resolve contributor reference from article frontmatter"
    - "Cover image rendered via astro:assets Image component guarded with conditional; coloured accent div fallback when no image"
    - "Accent colour applied as inline style attribute from edition data"
    - "Desktop 2-column grid (text left, cover right) collapses to stacked single column on mobile"

key-files:
  created: []
  modified:
    - src/pages/index.astro
    - content/editions/edition-2/articles/ana-costa-photography.md

key-decisions:
  - "Buy Edition button hidden entirely when purchase_url is absent — honest UX, no placeholder disabled button"
  - "Cover image fallback uses accent-coloured div with theme text — visually intentional, not a broken image state"
  - "ana-costa-photography.md set to featured: false — plan specifies joao-medeiros-essay as the intended featured article; both were marked featured: true in placeholder data"

patterns-established:
  - "Homepage data pattern: getCollection('editions') + find(status=current) + filter(status=archive)"
  - "Featured article pattern: getCollection('articles', id.startsWith(editionId + '/') && featured === true)[0]"
  - "Author resolution: getEntry(article.data.author) for contributor display name and link"

requirements-completed: [EDIT-01, EDIT-02]

# Metrics
duration: 2min
completed: 2026-03-03
---

# Phase 2 Plan 02: Homepage Summary

**Magazine-worthy homepage with current edition hero (accent colour, theme as dominant h1), featured article editorial highlight, and archive preview grid — driven by Astro content collections at build time**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-03T16:33:46Z
- **Completed:** 2026-03-03T16:35:20Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Rewrote index.astro replacing the "Coming Soon" skeleton with a full three-section magazine homepage
- Current edition hero displays Edition 2 "Across the Archipelago" with the accent colour (#1B3A5C) applied to the h1, edition subtitle, and cover placeholder
- Featured article section shows "The Middle of Everything" by João Medeiros with excerpt and author link
- Archive preview grid shows Edition 1 "São Miguel / Island of Origins" with a "View all editions" link to /editions
- All sections are conditional — hidden entirely when data is absent (no empty boxes, no broken states)

## Task Commits

Each task was committed atomically:

1. **Task 1: Build homepage with current edition hero, featured article, and archive preview** - `25a504b` (feat)

## Files Created/Modified

- `src/pages/index.astro` - Replaced Coming Soon skeleton with three-section homepage: edition hero, featured article, archive preview
- `content/editions/edition-2/articles/ana-costa-photography.md` - Set featured: false (joao-medeiros-essay is the intended featured article per plan spec)

## Decisions Made

- Buy Edition button is hidden entirely when `purchase_url` is absent — per the plan's "honest, not gimmick" principle. No disabled/greyed button shown.
- Cover image uses `astro:assets` Image component guarded with conditional; when no image file exists, an accent-coloured div with the theme text is shown as an intentional editorial placeholder, not a broken image state.
- Both `ana-costa-photography.md` and `joao-medeiros-essay.md` had `featured: true` in placeholder data. Fixed ana-costa to `featured: false` since the plan specifies João Medeiros' "The Middle of Everything" as the featured article.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate featured: true in placeholder article data**
- **Found during:** Task 1 (homepage build)
- **Issue:** `ana-costa-photography.md` and `joao-medeiros-essay.md` both had `featured: true`; the collection returned `ana-costa` first (alphabetically), showing "After the Silence" instead of the plan-specified "The Middle of Everything"
- **Fix:** Set `ana-costa-photography.md` to `featured: false` so the intended featured article appears
- **Files modified:** content/editions/edition-2/articles/ana-costa-photography.md
- **Verification:** Build rebuilt, dist/index.html contains "The Middle of Everything" — grep confirmed
- **Committed in:** 25a504b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - data correctness bug)
**Impact on plan:** Fix was necessary for correctness — the plan explicitly names the expected featured article. No scope creep.

## Issues Encountered

None — build passed cleanly after the featured article data fix.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Homepage is complete and builds cleanly; all three sections render from content collection data
- The link to `/editions` is in place — Plan 02-03 (Editions page) will fulfil it
- The link to `/articles/${featuredArticle.id}` is in place — Plan 02-04 (Articles pages) will fulfil it
- The link to `/contributors/${author.id}` is in place — Phase 5 (Contributors) will fulfil it
- When Edition 2 cover image is added to the content, the `astro:assets` Image component will render it automatically

---
*Phase: 02-core-pages*
*Completed: 2026-03-03*
