# Phase 2: Core Pages - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full editorial experience: edition pages, article reading, homepage, navigation, and about page. Visitors can read articles, explore editions, understand the magazine, and navigate the site — without third-party integrations (commerce, flipbook, translation are Phase 3).

Requirements: EDIT-01, EDIT-02, EDIT-03, EDIT-04, NAV-01, CONT-01, CONT-02, TECH-03, TECH-05

</domain>

<decisions>
## Implementation Decisions

### Navigation structure
- 4 items: Editions, Articles, Shop, About
- Centered magazine logo/name above the nav items — editorial/print magazine feel
- Static navigation — scrolls with the page, not sticky
- Mobile nav behavior: Claude's discretion (hamburger, inline, or other)

### Homepage hierarchy
- Edition cover + theme as the dominant hero element — immediately says "this is a magazine"
- Prominent "Buy Edition" button in the hero section, next to/below the cover
- Below hero: featured article highlight (one article gets editorial pick treatment — matches EDIT-02)
- Below featured article: edition archive preview (past editions with covers/themes)
- Single scroll with previews + "View all" links to dedicated pages — focused, scales as archive grows

### Article reading experience
- Narrow, centered text column (~65ch) — focused reading with generous whitespace
- Full-width hero image above the title when article has a cover_image
- Teaser/excerpt articles: render the excerpt content, then a clear "Read in print" boundary with buy CTA — honest, not a fade-out gimmick
- Minimal article metadata: author name (linking to contributor), published date, and edition link
- No tags, no reading time displayed

### Edition page layout
- Theme text hero with cover image alongside — the theme statement ("Across the Archipelago") leads, cover image supports
- Articles presented as editorial list (table of contents style) — title, author, excerpt per row, vertical
- Contributors shown as small portraits with names and roles — personal, visual
- Prominent buy CTA near the top of the edition page, near theme/cover area
- Fallback needed for contributors without portrait images (portraits are optional in schema)

### About page
- Mission, team bios, and contact info (TECH-05)
- Layout and content structure: Claude's discretion

### Edition archive page
- Lists all editions with cover thumbnails and themes (EDIT-03)
- Layout and presentation: Claude's discretion

### Claude's Discretion
- Mobile navigation implementation (hamburger vs inline vs other)
- About page layout and structure
- Edition archive page layout
- Footer content and design
- Typography choices (Cardo/Inter noted from existing site — can be applied or revisited)
- Responsive breakpoints and layout adaptations beyond 375px minimum
- Article page "back to edition" navigation
- Loading states and transitions

</decisions>

<specifics>
## Specific Ideas

- Centered logo above nav mirrors print magazine mastheads — the editorial identity should feel like opening a magazine
- The existing site (ilheumagazine.com) uses Cardo heading / Inter body fonts — worth carrying forward for brand continuity
- Teaser boundary should feel respectful, not manipulative — "Read in print" is an invitation, not a paywall
- Edition page as a "table of contents" — readers should feel like they're looking at the inside front cover of the issue
- Homepage is a window into the current edition, not a content dump

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- BaseLayout.astro: bare HTML shell with title prop, viewport meta, Tailwind import — will be extended with nav/footer slots
- content.config.ts: four Zod-validated collections (editions, articles, contributors, special) ready to query
- Sample content: 2 editions (3 articles each), 6 contributors, 2 special articles — enough to build all page templates

### Established Patterns
- Astro Content Layer API with `entry.id` (not `entry.slug`) — established in Phase 1
- Tailwind v4 via @tailwindcss/vite plugin — no tailwind.config.js, CSS via `@import "tailwindcss"` in global.css
- Images stored in git repo, build-time optimization via astro:assets (Phase 5 does full pipeline, but basic support available now)
- Static output mode (`output: 'static'`) — no server-side rendering

### Integration Points
- src/pages/ needs: index.astro (rewrite), editions/[...slug].astro, articles via dynamic routes, about.astro
- Edition articles use glob loader pattern `*/articles/*.md` under `content/editions/` — article IDs encode edition path
- Contributors referenced by filename ID (e.g., `hugo-goncales`) in article frontmatter `author` field
- purchase_url field exists in edition schema but is optional — buy CTA can link to it when present, show placeholder otherwise

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-pages*
*Context gathered: 2026-03-03*
