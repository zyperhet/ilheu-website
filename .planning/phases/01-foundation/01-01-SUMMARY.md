---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [astro, tailwindcss, mdx, vite, typescript, static-site]

# Dependency graph
requires: []
provides:
  - "Astro v5 project scaffolded with static output targeting dist/"
  - "Tailwind v4 integrated via @tailwindcss/vite plugin"
  - "MDX integration via @astrojs/mdx"
  - "TypeScript config with strictNullChecks via astro/tsconfigs/strict"
  - "Node.js 22 pinned in .nvmrc"
  - "BaseLayout.astro HTML shell importing Tailwind CSS"
  - "Skeleton index page with Tailwind classes as smoke test"
  - "src/content.config.ts placeholder for plan 02"
affects: [01-02, 01-03, all subsequent phases]

# Tech tracking
tech-stack:
  added:
    - "astro@5.18.0 — static site generator"
    - "@astrojs/mdx@4.3.13 — MDX integration"
    - "tailwindcss@4.2.1 — Tailwind CSS v4"
    - "@tailwindcss/vite@4.2.1 — Vite plugin for Tailwind v4"
  patterns:
    - "Tailwind v4: use @import 'tailwindcss' in global.css (not v3 @tailwind directives)"
    - "Tailwind v4: import global.css in BaseLayout.astro frontmatter to activate styles"
    - "Static output: output: 'static' in astro.config.mjs, no adapter needed for Cloudflare Pages"

key-files:
  created:
    - "astro.config.mjs — Astro config with static output, Tailwind v4 plugin, MDX integration"
    - "tsconfig.json — TypeScript strict config"
    - ".nvmrc — Node.js 22 pin"
    - "package.json — project manifest with all dependencies"
    - "src/styles/global.css — Tailwind v4 CSS entry point"
    - "src/layouts/BaseLayout.astro — HTML shell with Tailwind import"
    - "src/pages/index.astro — skeleton coming-soon page"
    - "src/content.config.ts — placeholder for content collections"
    - "public/favicon.svg — minimal SVG favicon"
    - ".gitignore — excludes node_modules, dist, .astro"
  modified: []

key-decisions:
  - "No Cloudflare adapter installed: static sites use output: 'static' with no adapter; @astrojs/cloudflare is SSR-only"
  - "Tailwind v4 via Vite plugin (@tailwindcss/vite): no separate CSS config file needed, activated via CSS @import"
  - "Node.js 22 pinned in .nvmrc; local machine runs Node 20 (EBADENGINE warning only, not a blocker for v5 or build)"

patterns-established:
  - "Layout pattern: BaseLayout.astro imports global.css in frontmatter to activate Tailwind globally"
  - "CSS pattern: Tailwind v4 uses @import 'tailwindcss' not @tailwind base/components/utilities"

requirements-completed: [TECH-02]

# Metrics
duration: 4min
completed: 2026-03-03
---

# Phase 1 Plan 01: Astro v5 Scaffold Summary

**Astro v5 project with Tailwind v4 (Vite plugin), MDX, TypeScript strict mode, and Node.js 22 pin building cleanly to static dist/**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-03T13:53:20Z
- **Completed:** 2026-03-03T13:57:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Astro v5 project scaffolded with static output, Tailwind v4, and MDX — builds to `dist/` with zero errors
- BaseLayout.astro establishes the HTML shell pattern with Tailwind v4 activated via CSS `@import`
- Node.js 22 pinned in `.nvmrc`; `src/content.config.ts` placeholder ready for plan 02 content schema

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Astro project and install dependencies** - `a1fe86b` (chore)
2. **Task 2: Create base layout and skeleton index page, verify build** - `015f062` (feat)

**Auto-fix (Rule 2):** `45976c8` — .gitignore for node_modules, dist, .astro/

## Files Created/Modified

- `package.json` — project manifest with astro, @astrojs/mdx, tailwindcss, @tailwindcss/vite
- `package-lock.json` — lockfile for reproducible installs
- `astro.config.mjs` — Astro config: static output, Tailwind v4 Vite plugin, MDX integration
- `tsconfig.json` — TypeScript config extending astro/tsconfigs/strict with strictNullChecks
- `.nvmrc` — Node.js 22 version pin
- `src/styles/global.css` — Tailwind v4 entry point with `@import "tailwindcss"`
- `src/layouts/BaseLayout.astro` — HTML shell importing global.css in frontmatter
- `src/pages/index.astro` — skeleton coming-soon page with Tailwind smoke-test classes
- `src/content.config.ts` — empty collections placeholder for plan 02
- `public/favicon.svg` — minimal SVG emoji favicon
- `.gitignore` — excludes node_modules, dist, .astro, .env files

## Decisions Made

- **No Cloudflare adapter:** `output: 'static'` with no adapter is correct for Cloudflare Pages static hosting; `@astrojs/cloudflare` is SSR-only and would conflict.
- **Tailwind v4 via Vite plugin only:** `@tailwindcss/vite` handles all Tailwind v4 integration — no separate config file (`tailwind.config.js`) needed.
- **Node 20 EBADENGINE warning:** Local machine runs Node 20.19.0 but project requires >=22; npm warns but installs and builds successfully. Cloudflare Pages will use Node 22 via `.nvmrc`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added .gitignore**
- **Found during:** Post-Task 2 (after build verification)
- **Issue:** No .gitignore existed — node_modules/, dist/, and .astro/ would be staged by any `git add .`
- **Fix:** Created `.gitignore` excluding node_modules, dist, .astro, .env files, and editor files
- **Files modified:** `.gitignore` (created)
- **Verification:** `git status` no longer shows node_modules or dist as untracked
- **Committed in:** `45976c8`

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Necessary correctness fix to prevent accidental large binary commits. No scope creep.

## Issues Encountered

- `npm warn EBADENGINE` during install: local Node is 20.19.0, package.json requires >=22. This is a warning only — all packages install and build correctly. Cloudflare Pages will resolve this via `.nvmrc`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Astro v5 project builds cleanly; `src/content.config.ts` placeholder is ready for plan 02 to define Zod-backed collections
- `.nvmrc` with Node 22 ensures consistent version between local (after nvm use) and Cloudflare Pages
- Concern: Local Node is v20, not v22 — developer should run `nvm install 22 && nvm use 22` for full parity

---
*Phase: 01-foundation*
*Completed: 2026-03-03*
