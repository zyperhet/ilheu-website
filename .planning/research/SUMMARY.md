# Project Research Summary

**Project:** Ilhéu Magazine Website 2.0
**Domain:** Static editorial/magazine site — biannual independent print publication
**Researched:** 2026-03-02
**Confidence:** MEDIUM

## Executive Summary

Ilhéu Magazine Website 2.0 is a static editorial site for a biannual independent print magazine rooted in the Azores. The expert approach for this class of product is a Markdown-first, statically generated site deployed to a CDN — no server runtime, no CMS backend, no custom commerce infrastructure. Research consistently points to Astro as the SSG of choice: its islands architecture ships zero JavaScript by default, its content collections enforce typed frontmatter schemas, and its Cloudflare Pages integration is first-class. The site's primary job is to serve the magazine's identity, sell the physical object, and give editors a low-friction way to publish. Complexity must be actively resisted.

The recommended approach is to treat the content schema and directory structure as the highest-priority first decision. Before any templates are built or content authored at scale, the frontmatter schema for editions, articles, and contributors must be locked in. Editions should be modeled as first-class entities with their own content files — not as tags on articles. This architectural decision unlocks auto-generated edition pages, avoids hardcoded HTML, and makes the archive scale cleanly as new editions are published. The stack is Astro + Tailwind CSS + Astro's built-in image optimization, deployed to Cloudflare Pages via git-push-to-deploy.

The key risks are all front-loaded in Phase 1: schema defined too late (causing content rework), images committed unoptimized to git (causing repo bloat and deployment failures), and the SSG selection delaying the directory structure decision. The mitigation is to fix these decisions explicitly before content is authored — the cost of changing them later is high. Commerce and translation integrations carry moderate risk from third-party embed compatibility with Cloudflare Pages CSP headers, but both can be isolated as leaf components and tested early on the actual deployment target.

---

## Key Findings

### Recommended Stack

Astro is the clear SSG recommendation for a content-heavy static magazine site. It is purpose-built for this use case: content collections with TypeScript-validated frontmatter, zero-JS by default for article pages, an islands architecture for interactive embeds (commerce, translate widget), and a well-maintained Cloudflare Pages adapter. No alternatives are as well-suited: Next.js is overkill and carries SSR overhead, Hugo has a less modern component model, Gatsby is declining. Tailwind CSS with `@tailwindcss/typography` handles the magazine's typographic needs with minimal configuration. All image optimization runs at build time via `astro:assets` — no runtime CDN required for image transforms.

**Core technologies:**
- **Astro 4.x**: SSG framework — purpose-built for content sites, zero-JS by default, typed content collections, Cloudflare Pages adapter
- **Tailwind CSS 3.x / 4.x**: Utility-first styling — rapid iteration before final design, `@tailwindcss/typography` for article prose
- **Astro `astro:assets`**: Build-time image optimization — WebP generation, responsive srcsets, Cloudflare-compatible
- **Astro Content Collections**: Typed frontmatter schema enforcement — prevents schema drift across editions and articles
- **MDX (`@astrojs/mdx`)**: Rich Markdown with embedded components — needed for flipbook embeds, purchase CTAs, and photo essays
- **Cloudflare Pages**: Static hosting and CDN — already decided, free tier generous, git-push-to-deploy
- **Stripe Payment Links / Shopify Buy Button**: Commerce embed — decision deferred; build placeholder that accepts a configurable URL
- **Google Translate widget**: Client-side translation — lowest friction for Portuguese content; verify it remains embeddable

**Version check required before building:** Tailwind v4 may now be production-stable (breaking changes from v3). Confirm Astro current version at astro.build. Pin Node.js version in `.nvmrc` and match it in Cloudflare Pages dashboard.

Full detail: `.planning/research/STACK.md`

---

### Expected Features

The article reading experience is the structural foundation — edition pages, contributor profiles, web exclusives, and the homepage all link into it. Build this before anything else.

**Must have (table stakes):**
- Homepage showcasing the current edition — first impression, answers "what is this?"
- Edition archive / back issues listing — shows history, builds credibility
- Individual edition page — theme, contributors, article list, purchase CTA
- Article reading experience — readable, distraction-free, strong typography
- About page — mission, team, contact
- Purchase / buy CTA — primary revenue action, must be discoverable
- Mobile-responsive layout — majority of discovery traffic is mobile
- Fast page loads — static hosting already planned, optimize images
- Clear navigation — 4-6 items max: editions, articles, shop, about
- Readable editorial typography — serif body, considered scale, matches print identity

**Should have (differentiators):**
- Digital flipbook embed — existing site has Edition 1 flipbook; continue with same provider
- Place-as-protagonist visual identity — Azores photography as aesthetic, not just content
- Edition "themes" prominently featured — each edition has a distinct identity
- Contributor profiles — builds community dimension; readers follow contributors
- Web-exclusive content section — gives readers a reason to return between editions
- Newsletter signup — highest-value direct channel for a biannual
- Featured article on homepage — creates editorial pull beyond edition showcase
- Language / translation support — serves local Azorean audience and Portuguese diaspora

**Defer (v2+):**
- Full contributor profile pages — edition-page bios sufficient at launch
- Web-exclusive content section — publish edition content first, exclusives post-launch
- Edition-specific colour palettes — unify initially, add per-edition theming later
- Search — not needed at 2-edition scale; add at 5+ editions
- Comments, user accounts, subscriptions, infinite scroll, dark mode, push notifications — explicitly out of scope

Full detail: `.planning/research/FEATURES.md`

---

### Architecture Approach

The architecture has three layers that must stay cleanly separated: content (Markdown files + images), build (Astro transforms content to HTML), and delivery (Cloudflare Pages serves static assets). Nothing bleeds between layers. Commerce and translation widgets are client-side-only leaf components — they do not affect the build output. Image optimization runs entirely at build time. Edition pages are auto-generated from `content/editions/*/index.md` — adding a new edition means adding a folder, not editing a template.

**Major components:**
1. **Content Store** — source of truth: Markdown files, frontmatter, edition-scoped images
2. **Build Engine (Astro)** — reads frontmatter, applies templates, processes images, emits `/dist/`
3. **Edition Index** — auto-generated list of all editions from edition content files (never hardcoded)
4. **Article Renderer** — per-type layouts (`article-full`, `article-teaser`, `article-web-exclusive`) sharing a base; edition → article → special section
5. **Store Widget** — client-side-only leaf; receives embed URL from frontmatter; no build-time API calls
6. **Flipbook Embed** — iframe pointing to external service (Issuu/Heyzine); responsive CSS container required
7. **Translate Widget** — client-side Google Translate snippet; per-article `lang` attribute driven from frontmatter
8. **Image Pipeline** — build-time via Astro `astro:assets`; source images max 2MB; edition-scoped directories
9. **Delivery (Cloudflare Pages)** — serves `/dist/`, CDN caches assets; no runtime compute needed

**Key architectural constraints:**
- Editions are first-class content entities with their own `index.md` files, not tags on articles
- Article `type` is a first-class frontmatter field (`full | teaser | excerpt | web-exclusive | extended-cut`) — different types render differently
- All images go in `public/images/{edition}/` with naming convention `{edition}-{slug}-{role}.ext`
- Store embed and translate widget are leaf components — they cannot drive any other component

Full detail: `.planning/research/ARCHITECTURE.md`

---

### Critical Pitfalls

1. **Frontmatter schema defined too late** — Content authored without a schema leads to inconsistent field names (`author` vs `byline`, `date` vs `published`). Every template query breaks. Prevention: define and document the canonical schema before any content is authored at scale; run a validation script (`zod`) as part of the build.

2. **Editions modeled as tags, not entities** — If editions are just a frontmatter field on articles with no corresponding edition content file, edition pages must be hand-coded. Every new edition requires a code change. Prevention: create `content/editions/` as a first-class content type with `index.md` per edition from day one.

3. **Images committed unoptimized to git** — Magazine content is image-heavy. Unoptimized commits produce repo bloat, balloon build times, and hit Cloudflare Pages' 25MB-per-file limit. Prevention: decide on media strategy before onboarding content (Cloudflare R2, Cloudflare Images, or build-time optimization via `astro:assets`); enforce a 2MB source image maximum; document in `CONTRIBUTING.md`.

4. **Commerce embed blocked by CSP on Cloudflare Pages** — Stripe/Shopify/Gumroad embed scripts are blocked by Cloudflare Pages' Content Security Policy unless explicitly allowlisted. Prevention: configure `_headers` file to allowlist embed script origins; wrap embed in `client:only` Astro component; test on the actual Cloudflare Pages deployment before launch.

5. **Cloudflare Pages build environment mismatch** — Site builds locally but fails on Cloudflare Pages due to Node.js version mismatch or native binary packages (e.g., `sharp`). Prevention: pin Node.js in `.nvmrc`, set same version in Cloudflare Pages dashboard, avoid native binary packages, deploy to Cloudflare Pages in Phase 1 (not just local builds).

**Additional moderate pitfalls:**
- Portuguese content + translate widget interaction: tag every article container with correct `lang` attribute driven from frontmatter
- Slug instability breaking SEO: make `slug` an explicit, immutable frontmatter field; implement `_redirects` for any changes
- Contributor data duplicated across articles: create `content/contributors/` as single source of truth; articles reference contributors by slug

Full detail: `.planning/research/PITFALLS.md`

---

## Implications for Roadmap

Based on the component dependency map from ARCHITECTURE.md and the pitfall phase warnings from PITFALLS.md, the natural phase structure is:

### Phase 1: Foundation — Content Architecture and Project Setup

**Rationale:** All research converges on this being the highest-leverage phase. The frontmatter schema and directory structure are the decisions that are most expensive to change later. SSG selection (Astro) and deployment target (Cloudflare Pages) are already fixed — set them up immediately and deploy to Cloudflare Pages before writing any content. This front-loads the risk of environment mismatches.

**Delivers:**
- Canonical frontmatter schema documented and enforced (editions, articles, contributors)
- Directory structure established (`content/editions/`, `content/special/`, `content/pages/`, `content/contributors/`)
- Media strategy decided and documented (Cloudflare Images, R2, or build-time; source image conventions)
- Astro project initialized with MDX, Cloudflare adapter, Tailwind integrations
- Cloudflare Pages deployment live with a skeleton site (even a single "coming soon" page)
- Node.js version pinned in `.nvmrc` and in Cloudflare Pages dashboard
- Edition 1 and Edition 2 content stubs with correct frontmatter

**Addresses:** Table stakes foundation (fast loads, mobile layout baseline)
**Avoids:** Pitfall 1 (schema too late), Pitfall 2 (SSG lock-in), Pitfall 3 (editions as tags), Pitfall 4 (image chaos), Pitfall 10 (build environment mismatch)

---

### Phase 2: Core Pages — Edition, Article, and Navigation

**Rationale:** With the content schema and structure in place, templates can be built against known data. This phase delivers the primary editorial experience: edition landing pages, article reading, the homepage, and navigation. The article renderer is the foundation for all content display — build it first, then compose it into edition pages and the homepage.

**Delivers:**
- Base layout (HTML shell, navigation, footer)
- Homepage with current edition hero and featured article slot
- Edition archive page (auto-generated from edition content files)
- Individual edition landing page (theme, contributors, article previews, purchase CTA placeholder)
- Article renderer: `full` and `teaser` types
- About page
- Mobile-responsive layouts across all pages
- Editorial typography (Tailwind + `@tailwindcss/typography`)

**Addresses:** All table stakes features: homepage, edition archive, edition page, article reading, about page, navigation, mobile responsiveness, typography
**Uses:** Astro content collections, MDX, Tailwind typography plugin
**Implements:** Edition Index, Article Renderer, Base Layouts components

---

### Phase 3: Integrations — Commerce, Flipbook, and Translation

**Rationale:** Third-party integrations are isolated to this phase deliberately. They are client-side leaf components that do not affect the content architecture or build output, but they carry integration risk (CSP headers, mobile behavior, embed compatibility). Isolating them to Phase 3 means the core editorial experience is shippable before this risk is resolved. Each integration must be tested on the actual Cloudflare Pages deployment, not just locally.

**Delivers:**
- Commerce embed: Stripe Payment Link redirect (or chosen provider) on shop page and edition pages
- Cloudflare Pages `_headers` file with CSP allowlists for commerce embed domains
- Shop page
- Digital flipbook iframe for Edition 1 (responsive CSS container, PDF fallback, `aria-label`)
- Google Translate widget with per-article `lang` attribute driven from frontmatter
- Canonical URL configuration (apex vs www redirect, disable `.pages.dev` indexing)
- `robots.txt`, `<link rel="canonical">` on all pages

**Addresses:** Purchase CTA (table stakes), flipbook (differentiator), translation (differentiator)
**Avoids:** Pitfall 6 (CSP blocking commerce embed), Pitfall 7 (translate widget conflicts), Pitfall 9 (flipbook mobile failure), Pitfall 12 (canonical URL/SEO)

---

### Phase 4: Editorial Depth — Web Exclusives and Newsletter

**Rationale:** These features require the article renderer from Phase 2 to exist first. Web exclusives are the same rendering pipeline as edition articles; newsletter signup is a third-party embed similar to Phase 3 integrations. This phase gives the magazine a reason to publish between editions and captures the audience built at launch.

**Delivers:**
- Special section: web exclusives and editorial (`/special/` route)
- `web-exclusive` article type in the renderer
- Newsletter signup integration (Mailchimp/ConvertKit/Buttondown)
- Featured article slot on homepage (if not completed in Phase 2)
- Social links in footer

**Addresses:** Web-exclusive content section (differentiator), newsletter signup (differentiator), social links (table stakes)

---

### Phase 5: Polish — Image Optimization, Performance, and Contributor Profiles

**Rationale:** Image optimization and contributor profiles are meaningful quality improvements but are not blocking launch. This phase addresses the visual and performance finishing that elevates the site from functional to editorial-quality. It also validates the image pipeline at scale.

**Delivers:**
- Full responsive image pipeline: WebP generation, `srcset`, lazy loading via Astro `astro:assets`
- Contributor profile pages (`/contributors/[slug]/`) with articles linked
- Edition-specific visual accents (accent colour per edition, if design allows)
- Performance audit: Lighthouse score targets, Core Web Vitals
- Image naming convention enforcement and any retroactive cleanup

**Addresses:** Contributor profiles (differentiator, deferred from launch), image optimization (table stakes — performance), edition visual identity (differentiator)
**Avoids:** Pitfall 4 (image chaos at scale), Pitfall 13 (contributor data duplicated)

---

### Phase Ordering Rationale

- **Schema and structure before content** (Phase 1 first): The frontmatter schema is the most expensive decision to change retroactively. Research unanimously identifies this as the primary risk. It must be locked in before content is authored at scale.
- **Core editorial experience before integrations** (Phase 2 before Phase 3): The article renderer and edition pages form the structural backbone that all integrations compose into. Building integrations against a stable template foundation avoids double rework.
- **Integrations isolated** (Phase 3): Isolating third-party embeds lets the core site ship independently of third-party compatibility issues. Each integration carries its own risk profile (CSP, mobile, embed deprecation) that should not block the editorial experience.
- **Depth features last** (Phases 4-5): Web exclusives, contributor profiles, and image optimization are improvements on a working foundation. They are high-value but not launch-blocking.

---

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 3 (Integrations):** Commerce provider selection is deferred and carries product/business implications. When the provider is chosen, verify current embed compatibility with Cloudflare Pages CSP and test on a staging deployment before committing to it. Flipbook embed: identify which provider the current site uses before building Phase 3.
- **Phase 5 (Image Pipeline):** Verify whether Cloudflare Images is the right media strategy vs. build-time `astro:assets` at the point image volume is known. Cloudflare Pages 25MB file limit and 20,000 file limit should be confirmed against current documentation.

Phases with standard patterns (skip research-phase):

- **Phase 1 (Foundation):** Astro project setup, content collection schema, Cloudflare Pages deployment — all well-documented official patterns.
- **Phase 2 (Core Pages):** Astro template authoring, Tailwind + typography plugin, content collection queries — well-established; official docs are sufficient.
- **Phase 4 (Editorial Depth):** Newsletter embed and web exclusives follow the same patterns as Phase 2 and Phase 3 integrations.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Astro as the leading content-site SSG is well-established. Tailwind v4 stability and exact Astro version require verification against official docs before starting. Web search was unavailable during research. |
| Features | MEDIUM-HIGH | Table stakes are HIGH — universally consistent patterns across independent magazine sites. Differentiators (flipbook, contributor profiles, newsletter) are MEDIUM — common in quality publications but not universal. Anti-features are HIGH — project constraints explicitly exclude them. |
| Architecture | HIGH | Content schema patterns, edition-as-directory, build-time image optimization, and client-side-only integration leaf components are well-established SSG best practices consistent across Hugo, Astro, and Eleventy documentation. |
| Pitfalls | MEDIUM | Critical pitfalls (schema too late, editions as tags, unoptimized images) are HIGH confidence — they reflect structural decisions with clearly understood consequences. Cloudflare Pages-specific limits (25MB, 20,000 files, build environment) are MEDIUM confidence — verified in training data but should be confirmed at official docs before acting on them. |

**Overall confidence:** MEDIUM — sufficient to structure a roadmap. Version numbers and Cloudflare Pages limits require verification before Phase 1 begins.

---

### Gaps to Address

- **Tailwind version:** Verify whether Tailwind v4 is production-stable. If so, use v4 and do not mix v3 assumptions. Breaking changes in configuration approach.
- **Commerce provider:** Decision explicitly deferred in `PROJECT.md`. Must be resolved before Phase 3. Options: Stripe Payment Links (simplest), Shopify Buy Button (more capable), Gumroad, Lemon Squeezy.
- **Flipbook provider:** Identify which service the current Edition 1 flipbook uses before Phase 3. Embed approach depends on provider (Issuu, Heyzine, FlipHTML5 all have different embed codes).
- **Media strategy:** Cloudflare Images vs. Cloudflare R2 vs. build-time `astro:assets` — must be decided before onboarding Edition 2 content in Phase 1. Affects image URL structure and cannot be changed retroactively without updating every Markdown file.
- **Design system:** Design is deferred per `PROJECT.md`. Content contracts (excerpt length, image aspect ratios, portrait dimensions) must be defined in Phase 1 as schema constraints so they can accommodate whatever design arrives. Do not wait for design to define these.
- **Google Translate widget availability:** The widget has had availability concerns at various points. Verify it is still freely embeddable before committing to it; DeepL widget is a backup.

---

## Sources

### Primary (HIGH confidence)
- Astro official docs: https://docs.astro.build — content collections, image optimization, Cloudflare adapter
- Project context: `/Users/filipemoura/dev/ilheu/website-2.0/.planning/PROJECT.md` — authoritative source for project constraints

### Secondary (MEDIUM confidence)
- Training data (August 2025 cutoff) — SSG ecosystem patterns, Cloudflare Pages constraints, independent magazine site conventions
- Cloudflare Pages docs: https://developers.cloudflare.com/pages/ — build limits, `_headers` format, environment variables
- Tailwind CSS: https://tailwindcss.com — typography plugin, v4 migration status
- Independent magazine reference sites: Cereal, Kinfolk, Atmos, Delayed Gratification, Monocle — feature and design patterns

### Tertiary (LOW confidence)
- Community discussions and post-mortems on SSG magazine site builds — pitfall patterns, embed compatibility notes (unverified external sources)

---

*Research completed: 2026-03-02*
*Ready for roadmap: yes*
