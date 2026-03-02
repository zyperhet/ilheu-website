# Architecture Patterns: Static Magazine/Editorial Website

**Project:** Ilheu Magazine Website 2.0
**Domain:** Static magazine/editorial site — biannual print publication digital home
**Researched:** 2026-03-02
**Confidence:** MEDIUM (training data through Aug 2025; web search unavailable; patterns well-established)

---

## Recommended Architecture

A static magazine site has three conceptually distinct layers that must stay cleanly separated:

1. **Content layer** — Markdown files, frontmatter, images
2. **Build layer** — SSG that transforms content into HTML
3. **Delivery layer** — Cloudflare Pages serving static assets

These layers should NEVER bleed into each other. Content must not embed presentation logic. Build tools must not hard-code content assumptions. Delivery must be CDN-only (no runtime compute).

### High-Level Diagram

```
Content Layer                Build Layer                Delivery Layer
─────────────────────────    ───────────────────────    ───────────────
content/
  editions/                  SSG (Astro/Hugo/11ty)      Cloudflare Pages
    edition-1/               ├── reads frontmatter       ├── serves /
      articles/              ├── applies templates       ├── serves /editions/*
      index.md               ├── generates routes        ├── serves /articles/*
    edition-2/               ├── processes images        ├── serves /shop
      articles/              ├── bundles CSS/JS          └── CDN caches assets
      index.md               └── emits /dist/
  special/
    web-exclusives/
  pages/
    about.md
    shop.md
assets/
  images/
    edition-1/
    edition-2/
  fonts/
```

---

## Component Boundaries

| Component | Responsibility | Inputs | Outputs | Communicates With |
|-----------|---------------|--------|---------|-------------------|
| **Content Store** | Source of truth for all text/metadata | Authors (via git) | Markdown files + images | Build Engine |
| **Build Engine** (SSG) | Transforms content into HTML | Markdown, templates, config | Static HTML/CSS/JS/assets | Delivery Layer |
| **Template Layer** | Visual structure for each page type | Page data from SSG | HTML fragments | Build Engine |
| **Edition Index** | Lists all editions, drives homepage | Edition frontmatter | Edition list page | Build Engine |
| **Article Renderer** | Handles per-article pages | Article Markdown | Article HTML pages | Build Engine, Image Pipeline |
| **Image Pipeline** | Optimises and serves images | Raw source images | Responsive WebP/AVIF | Build Engine, Delivery Layer |
| **Store Widget** | Purchase CTA / embed | External embed code (Stripe/Shopify) | Iframe or JS widget | Delivery Layer (client-side only) |
| **Translate Widget** | Google Translate or similar | Page HTML | Translated DOM (client-side) | Delivery Layer (client-side only) |
| **Delivery (CF Pages)** | Serves all static assets globally | /dist output | HTTP responses | End users |

### Boundary rules

- Store Widget and Translate Widget are **client-side only** — they run in the browser, not during build. They cannot affect SSG output.
- Image Pipeline runs **at build time** — never at request time. Cloudflare Pages has no image transform runtime.
- Template Layer **must not** contain content. If text is in a template, it's a bug.
- Edition Index is generated **from frontmatter** — not hand-coded. Adding a new edition means adding a folder + `index.md`, not editing a list.

---

## Content Architecture

### Directory Structure (SSG-agnostic)

```
content/
├── editions/
│   ├── edition-1/
│   │   ├── index.md              # Edition metadata: title, theme, coverImage, releaseDate
│   │   └── articles/
│   │       ├── hugo-goncales-interview.md
│   │       ├── pedro-borges-architect.md
│   │       └── hun-chung-lee-ceramics.md
│   └── edition-2/
│       ├── index.md
│       └── articles/
│           ├── ...
│           └── ...
├── special/                      # Web exclusives, editorial, extended cuts
│   ├── web-exclusives/
│   │   └── some-exclusive.md
│   └── extended-cuts/
│       └── longer-interview.md
└── pages/                        # Standalone pages
    ├── about.md
    └── shop.md
```

### Frontmatter Schema

**Edition index (`editions/edition-N/index.md`)**
```yaml
---
edition: 2
title: "Edition 2"
theme: "..."
release_date: 2026-03-01
cover_image: /images/edition-2/cover.jpg
status: current          # current | archive
purchase_url: "..."      # or placeholder
contributors:
  - name: "..."
    role: "..."
    bio_short: "..."
    portrait: /images/edition-2/portraits/name.jpg
---
```

**Article (`editions/edition-N/articles/slug.md`)**
```yaml
---
title: "Interview with Hugo Gonçales"
edition: 1
type: full | teaser | excerpt | web-exclusive | editorial | extended-cut
author: "..."
published: 2024-01-01
featured: true           # appears in edition landing page preview
cover_image: /images/edition-1/hugo.jpg
excerpt: "One-sentence preview for cards"
tags: [interview, film, azores]
language: en             # en | pt
---
```

**Special article (`special/*/slug.md`)**
```yaml
---
title: "..."
type: web-exclusive | editorial | extended-cut
author: "..."
published: 2025-06-01
cover_image: ...
excerpt: "..."
tags: [...]
language: en
---
```

---

## Page Types and Routes

| Page | Route | Data Sources | Notes |
|------|-------|-------------|-------|
| Homepage | `/` | Latest edition frontmatter, featured articles | Edition-centric hero |
| Edition Landing | `/editions/edition-[N]/` | Edition `index.md` + featured articles | Per-edition; auto-generated |
| Article | `/editions/edition-[N]/[slug]/` | Article Markdown | Full content |
| Special Section | `/special/` | All special articles, grouped by type | Web exclusives + editorial |
| Special Article | `/special/[slug]/` | Article Markdown | Full content |
| About | `/about/` | `pages/about.md` | Static content |
| Shop | `/shop/` | `pages/shop.md` + store embed snippet | Embed placeholder here |

---

## Data Flow

### Build-Time Data Flow

```
Markdown files
   │
   ▼
SSG reads frontmatter + body
   │
   ├──► Edition index queries:
   │      - All editions sorted by number
   │      - Featured articles per edition
   │
   ├──► Article queries:
   │      - Articles by edition
   │      - Articles by type (full / teaser / excerpt)
   │
   ├──► Special section queries:
   │      - All special articles sorted by date
   │
   ▼
Templates applied (layout + components)
   │
   ▼
Image pipeline (resize, optimise, generate srcsets)
   │
   ▼
/dist/ static output (HTML + CSS + JS + assets)
   │
   ▼
Cloudflare Pages deployment
```

### Runtime Data Flow (Client-Side Only)

```
Browser loads page
   │
   ├──► Translate widget loads (Google Translate JS)
   │      - Reads current page DOM
   │      - Replaces text nodes on user request
   │
   └──► Store widget loads (Stripe/Shopify embed)
          - Loads external JS from payment provider
          - Renders purchase flow in iframe or modal
          - No SSG interaction — fully external
```

---

## Patterns to Follow

### Pattern 1: Edition as the Primary Taxonomy

**What:** Every piece of content belongs to an edition (or the `special` section). Editions are top-level directories, not just tags.

**When:** Always — this is the core mental model of a biannual magazine.

**Why:** Readers navigate by edition ("what's in Edition 2?"), not by arbitrary tag clouds. The filesystem structure mirrors this.

**Example:**
```
content/editions/edition-2/articles/pedro-borges.md
```
Not: `content/articles/pedro-borges.md` with `edition: 2` as a tag.

### Pattern 2: Article Type as a First-Class Frontmatter Field

**What:** Every article declares its `type` explicitly: `full | teaser | excerpt | web-exclusive | editorial | extended-cut`

**When:** Always — different types render differently (teaser shows excerpt + paywall hint, full shows everything).

**Why:** The magazine has a mix of print reprints and web originals. The SSG needs to know how to render each without template sprawl.

**Example:**
```yaml
type: teaser   # renders excerpt only, links to "get the print edition"
type: full     # renders complete article
type: web-exclusive  # renders with "only available online" badge
```

### Pattern 3: Cover Images Live Next to Content, Not in a Global Pool

**What:** Images for Edition N go in `assets/images/edition-N/`, not a flat `assets/images/` dump.

**When:** Always — prevents naming collisions across editions as the archive grows.

**Why:** A magazine accumulates images across years. Edition-scoped directories keep things navigable.

### Pattern 4: Store Integration as a Leaf Component

**What:** The purchase embed (Stripe/Shopify) is a leaf component — it receives configuration, it does not drive any other component.

**When:** Shop page and edition landing pages.

**Why:** 3rd party embeds are black boxes. Treating them as leaves prevents coupling the rest of the site to their APIs.

**Implementation:**
```
pages/shop.md frontmatter:
  store_embed: "shopify"     # or "stripe" or "placeholder"
  product_id: "xxx"

Template reads store_embed flag → renders appropriate embed snippet
```

### Pattern 5: Flipbook as an Iframe Embed, Not a Built Component

**What:** The digital flipbook (for Edition 1) is embedded via an iframe pointing to an external flipbook service (e.g., Issuu, FlipHTML5, Heyzine).

**When:** Edition 1 page, potentially future editions.

**Why:** Building a custom page-flip reader is out of scope and fragile. External services handle this well and are embeddable as static iframes.

**Implementation:**
```yaml
# edition-1/index.md frontmatter
flipbook_embed_url: "https://heyzine.com/flip-book/..."
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Hardcoding Edition Lists

**What:** A file like `editions.json` or a template that lists `[edition-1, edition-2]` explicitly.

**Why bad:** Every new edition requires a code change, not just a content change. The whole point of a content-driven site is that adding content = adding a folder.

**Instead:** Generate edition lists by querying `content/editions/*/index.md` at build time. Any SSG supports this pattern.

### Anti-Pattern 2: Mixing Content and Presentation in Markdown

**What:** Using raw `<div class="pullquote">` HTML inside Markdown article files.

**Why bad:** When the visual design changes, all Markdown files need editing. Design changes should require only template edits.

**Instead:** Use SSG-specific shortcodes/components for special formatting:
```markdown
{{< pullquote >}}
"The Atlantic is not just geography."
{{< /pullquote >}}
```
Or Astro MDX components:
```mdx
<PullQuote>The Atlantic is not just geography.</PullQuote>
```

### Anti-Pattern 3: Putting Store Logic in the SSG Build

**What:** Having the SSG call Shopify/Stripe APIs at build time to fetch product data.

**Why bad:** Build fails when the payment provider has an outage. The store embed only needs to load client-side.

**Instead:** Store the product ID or embed URL in frontmatter. The SSG just renders the embed snippet as a string — no API calls during build.

### Anti-Pattern 4: One Giant Template for All Article Types

**What:** A single `article.html` template with many `if type == "teaser" ... elif type == "full"` branches.

**Why bad:** Becomes unreadable and fragile quickly.

**Instead:** Separate layout files per type, shared via composition:
```
layouts/
  article-full.html      (extends base-article.html)
  article-teaser.html    (extends base-article.html)
  article-web-exclusive.html
```

### Anti-Pattern 5: Storing Large Images Unoptimised in the Repo

**What:** Committing 5MB full-resolution JPEGs directly to git.

**Why bad:** Repo becomes enormous; CI/CD build times balloon; no responsive images served to mobile.

**Instead:** Either:
- Use an image optimisation step in the build pipeline (Astro's built-in image service, or Hugo's image processing)
- Or store originals in Cloudflare R2 / external storage and reference URLs

---

## Component Dependency Map

Build Order of Components (what must exist before what):

```
1. Content Schema (frontmatter spec)
         │
         ▼
2. Content Files (Markdown with correct frontmatter)
         │
         ▼
3. Base Layouts (HTML shell, head, nav, footer)
         │
         ├──► 4a. Edition Index Page (reads all editions)
         │
         ├──► 4b. Edition Landing Template (reads one edition + its articles)
         │
         ├──► 4c. Article Templates (full, teaser, excerpt, web-exclusive)
         │
         ├──► 4d. Special Section Template (reads all special articles)
         │
         └──► 4e. Static Page Template (about, shop)
                    │
                    └──► 5. Store Embed Component (leaf, no dependencies)
                    └──► 6. Translate Widget (leaf, no dependencies)
```

Phase implications:
- **Phase 1** (Foundation): Content schema + directory structure + base layouts
- **Phase 2** (Core pages): Edition Index, Edition Landing, Article rendering
- **Phase 3** (Special content): Special section + article types beyond `full`
- **Phase 4** (Integrations): Store embed, translate widget, flipbook iframes
- **Phase 5** (Polish): Image optimisation pipeline, responsive images, performance

---

## Scalability Considerations

| Concern | Current (2 editions) | At 10 editions | At 30+ editions |
|---------|---------------------|----------------|-----------------|
| Build time | < 5 seconds | ~30 seconds | Minutes (acceptable for SSG) |
| Image storage | Small | Consider R2 or CDN | Definitely offload from git |
| Navigation | Simple edition picker | Needs edition archive page | Decade grouping |
| Search | Not needed | Nice to have | Pagefind or Algolia |
| Content org | Flat articles/ per edition | Still fine | May want sub-sections per edition |

---

## Cloudflare Pages Specific Constraints

| Constraint | Impact | Mitigation |
|------------|--------|-----------|
| No server-side rendering at runtime | All routes must pre-exist at build time | Use SSG static output mode; no dynamic routes |
| 25MB file size limit per asset | Large images can exceed this | Image optimisation in build pipeline; offload video |
| Build command must produce `/dist` or `/public` | SSG output directory must match CF Pages config | Set in CF Pages dashboard |
| Environment variables for build | API keys for store embeds (if needed) | Store in CF Pages env vars, not in repo |
| No Edge Workers required | Store widget loads client-side from payment provider | No CF Workers needed for MVP |
| Free tier: 500 builds/month | Plenty for a content site | N/A |

---

## Suggested Build Order for This Project

1. **Content schema first** — agree on frontmatter fields before writing content or templates
2. **Directory structure** — create empty edition folders, placeholder `index.md` files
3. **SSG selection** — based on content complexity and template language preference (see STACK.md)
4. **Base layouts** — navigation, footer, head tags
5. **Homepage** — edition hero, latest edition highlight
6. **Edition landing page** — per-edition with contributor list, article previews
7. **Article renderer** — starting with `full` type, then `teaser`/`excerpt`
8. **Special section** — web exclusives and editorial pieces
9. **Static pages** — about, shop placeholder
10. **Store embed** — drop in Stripe/Shopify widget on shop + edition pages
11. **Flipbook embed** — iframe into Edition 1 landing page
12. **Translate widget** — Google Translate snippet in head/nav
13. **Image optimisation** — responsive images, WebP generation
14. **Cloudflare Pages deploy** — CI/CD pipeline, preview deployments

---

## Sources

**Confidence notes:**
- Content architecture patterns (editions as directories, frontmatter schema): HIGH — well-established SSG best practice, consistent across Hugo, Astro, and Eleventy documentation as of Aug 2025
- Cloudflare Pages constraints (file limits, build limits): MEDIUM — based on training data; verify current limits at https://developers.cloudflare.com/pages/platform/limits/
- Store embed patterns (client-side only, iframe approach): HIGH — fundamental web architecture; unaffected by SSG choice
- Flipbook embed approach: MEDIUM — Issuu/Heyzine/FlipHTML5 all support iframe embed as of training cutoff; verify current embed availability
- Image pipeline: HIGH — Astro image service and Hugo image processing are well-documented; Cloudflare Pages 25MB limit documented

**Recommended verification:**
- Cloudflare Pages current build limits: https://developers.cloudflare.com/pages/platform/limits/
- Astro content collections docs: https://docs.astro.build/en/guides/content-collections/
- Hugo content organisation: https://gohugo.io/content-management/organization/
