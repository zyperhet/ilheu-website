# Roadmap: Ilhéu Magazine Website 2.0

## Overview

Five phases deliver the magazine's digital home in dependency order: foundation first (content schema and deployment pipeline), then editorial templates (the reading experience), then third-party integrations (commerce, flipbook, translation), then editorial depth (web exclusives and newsletter), and finally polish (images, contributor profiles, and per-edition identity). Each phase is independently verifiable before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Content schema, Astro project, and Cloudflare Pages deployment pipeline
- [ ] **Phase 2: Core Pages** - Edition pages, article reading, homepage, navigation, and about page
- [ ] **Phase 3: Integrations** - Commerce embed, digital flipbook, and translation widget
- [ ] **Phase 4: Editorial Depth** - Web exclusives section, newsletter signup, and social links
- [ ] **Phase 5: Polish** - Image optimization, contributor profiles, and per-edition visual accents

## Phase Details

### Phase 1: Foundation
**Goal**: The project can be built and deployed; content schema is locked in before any content is authored at scale
**Depends on**: Nothing (first phase)
**Requirements**: TECH-01, TECH-02
**Success Criteria** (what must be TRUE):
  1. A visitor can reach a live URL on Cloudflare Pages and see the skeleton site (even a placeholder page)
  2. The frontmatter schema for editions, articles, and contributors is documented and enforced via Astro content collections
  3. A developer can add a new edition by creating a folder under `content/editions/` with a valid `index.md` — no code changes required
  4. The site builds locally and on Cloudflare Pages from the same source without error, with Node.js version pinned and matched in both environments
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold Astro v5 project with MDX, Tailwind v4 Vite plugin, static output; pin Node.js 22 in .nvmrc; verify build produces dist/
- [ ] 01-02-PLAN.md — Define four Zod-backed content collections (editions, articles, contributors, special); create placeholder content files; verify build-time schema validation
- [ ] 01-03-PLAN.md — Deploy skeleton site to Cloudflare Pages; verify Node.js version parity; document deployment configuration

### Phase 2: Core Pages
**Goal**: Visitors can read articles, explore editions, understand the magazine, and navigate the site — the full editorial experience without third-party integrations
**Depends on**: Phase 1
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, NAV-01, CONT-01, CONT-02, TECH-03, TECH-05
**Success Criteria** (what must be TRUE):
  1. A visitor landing on the homepage sees the current edition hero, cover image, and a buy CTA alongside a featured article highlight
  2. A visitor can browse the edition archive page and see all editions listed with cover thumbnails and themes
  3. A visitor can open an individual edition page and see its theme, contributors, article list, and a buy link
  4. A visitor can read a full article with readable typography and inline images, or see a teaser excerpt with a clear indication it is not the full text
  5. A visitor on a mobile device (375px+) can navigate the site, read articles, and access all pages without horizontal scrolling or broken layouts
**Plans**: 6 plans

Plans:
- [ ] 02-01-PLAN.md — Install @tailwindcss/typography, configure Cardo/Inter fonts, build Nav + Footer components, update BaseLayout
- [ ] 02-02-PLAN.md — Build homepage with current edition hero, buy CTA, featured article highlight, and edition archive preview
- [ ] 02-03-PLAN.md — Build edition archive page and individual edition page with reusable EditionCard, ArticleTeaser, and ContributorCard components
- [ ] 02-04-PLAN.md — Build article renderer with Prose component for full and teaser types, editorial typography, and "Read in print" boundary
- [ ] 02-05-PLAN.md — Build about page (mission, team bios from contributors collection, contact info), articles index, and shop stub
- [ ] 02-06-PLAN.md — Cross-page mobile responsive audit and human verification of complete editorial experience

### Phase 3: Integrations
**Goal**: Visitors can purchase the magazine, read the Edition 1 flipbook, and optionally translate content — all integrated and tested on the actual Cloudflare Pages deployment
**Depends on**: Phase 2
**Requirements**: EDIT-06, COMM-01, COMM-03
**Success Criteria** (what must be TRUE):
  1. A visitor on an edition page can click the buy CTA and reach the purchase flow (via a 3rd party embed or redirect link — placeholder is acceptable)
  2. A visitor on the Edition 1 page can view the digital flipbook in a responsive iframe that does not break on mobile
  3. A visitor can trigger optional translation of the page content using the translate widget
  4. The Cloudflare Pages `_headers` file allowlists the domains needed by commerce and translation embeds so they load without CSP errors
**Plans**: TBD

Plans:
- [ ] 03-01: Implement commerce embed component (configurable URL placeholder); configure Cloudflare Pages `_headers` for CSP allowlists
- [ ] 03-02: Implement digital flipbook iframe embed for Edition 1 with responsive container; verify on Cloudflare Pages deployment
- [ ] 03-03: Integrate Google Translate widget with per-article `lang` attribute driven from frontmatter

### Phase 4: Editorial Depth
**Goal**: The site gives readers a reason to return between editions — a web-exclusive content section, newsletter signup, and social links are live
**Depends on**: Phase 2
**Requirements**: CONT-03, COMM-02, COMM-04
**Success Criteria** (what must be TRUE):
  1. A visitor can navigate to a dedicated section (e.g., `/special/`) and find web-exclusive articles, editorial pieces, and extended cuts distinct from edition content
  2. A visitor can sign up for the newsletter from the site without leaving the page (via an embedded signup form)
  3. A visitor can find and follow the magazine on Instagram and reach the contact email from the footer or about page
**Plans**: TBD

Plans:
- [ ] 04-01: Build web-exclusive content section with `web-exclusive` article type rendered via the existing article pipeline
- [ ] 04-02: Integrate newsletter signup embed (Mailchimp/ConvertKit/Buttondown) and add social links to footer

### Phase 5: Polish
**Goal**: The site looks and performs at editorial quality — images are optimized, contributor profiles exist, and each edition has its own visual accent
**Depends on**: Phase 2
**Requirements**: EDIT-05, CONT-04, TECH-04
**Success Criteria** (what must be TRUE):
  1. All edition and article images load as WebP with responsive `srcset` attributes; no unoptimized source images are served to the browser
  2. A visitor can navigate to a contributor profile page (`/contributors/[slug]/`) and see the contributor's bio, photo, and a list of their linked articles
  3. An edition page has a distinct colour accent visible in its design that reflects the print edition's identity
**Plans**: TBD

Plans:
- [ ] 05-01: Implement full responsive image pipeline via Astro `astro:assets` (WebP, `srcset`, lazy loading) across all pages
- [ ] 05-02: Build contributor profile pages auto-generated from `content/contributors/`
- [ ] 05-03: Implement per-edition colour accent system in edition page templates

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/3 | In Progress|  |
| 2. Core Pages | 5/6 | In Progress|  |
| 3. Integrations | 0/3 | Not started | - |
| 4. Editorial Depth | 0/2 | Not started | - |
| 5. Polish | 0/3 | Not started | - |
