# Phase 1: Foundation - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Lock in the content schema and directory structure, initialize the Astro project with MDX and Tailwind, and deploy a skeleton site to Cloudflare Pages. This is the load-bearing phase — the frontmatter schema and directory structure are the most expensive things to change later (every content file depends on them).

Requirements: TECH-01 (Markdown/MDX with structured frontmatter), TECH-02 (Static site on Cloudflare Pages)

</domain>

<decisions>
## Implementation Decisions

### Content Organization
- Edition-first directory structure: `content/editions/edition-1/articles/slug.md`
- Articles live inside their edition folder, not in a flat global list
- Special content (web exclusives, editorial, extended cuts) in a separate top-level section: `content/special/`
- Standalone contributor files: `content/contributors/name.md` — each contributor gets their own file with bio, photo, links (needed for Phase 5 contributor profiles)
- Edition-scoped URLs: `/editions/edition-1/hugo-goncales-interview`

### Frontmatter Schema
- Comprehensive from day one — include all fields even if some aren't used until later phases
- **Article fields:** title, author, published date, excerpt, cover_image, featured flag, tags array, language (en/pt), type
- **All 6 article types from the start:** full, teaser, excerpt, web-exclusive, editorial, extended-cut
- **Edition fields:** edition number, title, theme, release_date, cover_image, accent_colour, purchase_url, status (current/archive), flipbook_embed_url, contributors list
- **Contributor fields:** name, role, bio, portrait image, linked articles
- **Strict validation:** Build must fail if required fields are missing — catch errors early since content is mostly ready

### Media Strategy
- Images stored directly in the git repository (no Git LFS, no external storage like Cloudflare R2)
- User will provide high-res originals (~5-20MB each) — build-time optimization pipeline handles conversion
- Medium volume: ~20-50 images per edition
- Image reference style: Claude's discretion based on Astro's `astro:assets` best practices
- Note: repo will grow with high-res images; acceptable for first few editions, revisit around edition 5-6

### Skeleton Content
- Minimal placeholders only — bare minimum to validate schema works
- Include both editions: Edition 1 (status: archive) and Edition 2 (status: current)
- One placeholder article per edition, one placeholder contributor, one placeholder special article
- No real content in the skeleton — structure validation only
- Cloudflare Pages deployment setup deferred — user will set up account when ready
- Staging domain first (not ilheumagazine.com directly)

### Claude's Discretion
- Image reference paths (relative vs project-root) — pick based on Astro best practices
- Exact Tailwind configuration and version (v3 vs v4 — verify current stability)
- Astro project structure (src/ layout, component organization)
- Which frontmatter fields are required vs optional in the schema
- Node.js version pinning strategy
- Build output directory configuration

</decisions>

<specifics>
## Specific Ideas

- The magazine is biannual — edition-first navigation mirrors how readers think about the content
- Content is mostly ready (articles, images, bios) and can be provided during build phases
- The current site (ilheumagazine.com) has Cardo heading font and Inter body font — worth noting for when design decisions come later
- Design is explicitly deferred — this phase is pure structure, no visual work

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, empty repository

### Established Patterns
- None — patterns will be established in this phase

### Integration Points
- Cloudflare Pages deployment pipeline (to be configured)
- Content authored as Markdown/MDX files → Astro content collections → static HTML output
- Future phases will build templates on top of the schema defined here

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-03*
