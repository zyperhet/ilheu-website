---
phase: 02-core-pages
plan: "04"
subsystem: ui
tags: [astro, tailwind, tailwindcss-typography, prose, markdown, content-collections]

# Dependency graph
requires:
  - phase: 02-core-pages
    plan: "01"
    provides: BaseLayout.astro, @tailwindcss/typography plugin, Cardo/Inter font stack, prose class support
provides:
  - src/components/Prose.astro — typography wrapper for Markdown content (prose + prose-lg + Cardo headings)
  - src/pages/articles/[...slug].astro — dynamic article page with full/teaser conditional rendering
  - Article reading experience at /articles/[editionId]/articles/[slug]
affects: [03-commerce, 04-editorial, 05-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rest parameter [...slug] required for article IDs containing slashes (edition-1/articles/slug)"
    - "render(article) — Astro v5 API, not article.render()"
    - "getEntry(article.data.author) to resolve contributor reference from article frontmatter"
    - "Derive editionId from article.id.split('/')[0] — avoids need to store edition reference in article frontmatter"
    - "isTeaser = ['teaser', 'excerpt'].includes(article.data.type) — type detection pattern"

key-files:
  created:
    - src/components/Prose.astro
    - src/pages/articles/[...slug].astro
  modified: []

key-decisions:
  - "Teaser boundary: clean border-t with explicit text — no opacity tricks, no fade-out; honest CTA per user requirement"
  - "Metadata line: author (linked to /contributors/id) + edition (linked to /editions/id) + published date — no tags, no reading time"
  - "65ch column via max-w-[65ch] mx-auto — focused reading, generous whitespace"
  - "Back navigation above header linking to parent edition"
  - "Hero image renders full-width above entire article header when cover_image is present"

patterns-established:
  - "Prose.astro: all rendered Markdown content wrapped in Prose component to receive typography styles"
  - "Article type detection: teaser | excerpt = teaser, all others = full — determines whether print CTA renders"
  - "Edition context derived from article.id — no separate lookup needed; split('/')[0] gives edition slug"

requirements-completed: [CONT-01, CONT-02]

# Metrics
duration: 3min
completed: 2026-03-03
---

# Phase 2 Plan 04: Article Reading Page Summary

**Dynamic article pages at /articles/[edition]/articles/[slug] with Prose typography wrapper — full articles render with headings and prose styling, teaser articles display content then an honest "Read in print" CTA with buy link**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-03T16:33:46Z
- **Completed:** 2026-03-03T16:36:30Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Created `Prose.astro` component wrapping rendered Markdown in tailwindcss/typography classes with Cardo headings, clean blockquotes, and no border-radius on images
- Created `[...slug].astro` using rest parameter to handle article IDs with slashes (edition-1/articles/slug)
- Full articles (type: "full") render complete Markdown with headings, paragraphs, and prose styling in a 65ch centered column
- Teaser articles (type: "teaser" | "excerpt") render content followed by a clean border-t "Read the full piece in print" boundary with edition buy CTA or fallback text link
- Metadata line displays author name (linked to contributor page), edition title (linked to edition page), and formatted published date — no tags, no reading time
- Full-width hero image renders above article header when article has cover_image
- Back navigation above article header links to parent edition page
- All 6 sample articles generate at their expected URLs with correct content

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Prose component and article page with full/teaser rendering** - `048d743` (feat)

## Files Created/Modified

- `src/components/Prose.astro` - Typography wrapper with `prose prose-lg max-w-none` classes, Cardo headings, clean links and blockquotes
- `src/pages/articles/[...slug].astro` - Dynamic article page using `[...slug]` rest param, getStaticPaths for all 6 articles, conditional hero image, metadata line, Prose-wrapped Content, conditional teaser boundary with buy CTA

## Decisions Made

- Used `max-w-[65ch]` arbitrary Tailwind value for the 65-character column width — clean, readable, exactly as specified
- Teaser boundary: `border-t border-gray-300` with plain text and a standard button — no CSS tricks, honest as per user requirement
- Edition title used as link text in metadata (not "Edition 1") — more editorial, matches the magazine's naming convention
- Back navigation appears above the article header rather than below — readers see where they came from before diving in

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — build passed cleanly on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Article reading experience is complete — visitors can read any article at its URL
- Prose component is available for any future page needing styled Markdown output
- Teaser boundary pattern is established — commerce phase (03) can wire real purchase_url values
- Article pages link to contributor pages (/contributors/[id]) and edition pages (/editions/[id]) — those routes need to exist (handled in plans 02-02 and 02-03)

---
*Phase: 02-core-pages*
*Completed: 2026-03-03*

## Self-Check: PASSED

- FOUND: src/components/Prose.astro
- FOUND: src/pages/articles/[...slug].astro
- FOUND: .planning/phases/02-core-pages/02-04-SUMMARY.md
- FOUND commit: 048d743 (Task 1)
