# Domain Pitfalls

**Domain:** Magazine / Editorial Static Site (Markdown-first, Cloudflare Pages)
**Project:** Ilhéu Magazine Website 2.0
**Researched:** 2026-03-02
**Confidence:** MEDIUM (training data — no external sources available during session)

---

## Critical Pitfalls

Mistakes that cause rewrites, major structural rework, or blocked launches.

---

### Pitfall 1: Markdown Frontmatter Schema Defined Too Late

**What goes wrong:** Content is authored in Markdown without a defined frontmatter schema. Each article gets different field names (`author` vs `byline`, `date` vs `published`, `edition` vs `issue`). By the time the SSG is chosen and templates built, dozens of files have inconsistent metadata. Every template query breaks on missing or misnamed fields.

**Why it happens:** "We'll figure out the schema later" feels safe when you're deferring the SSG choice. In practice, content and schema are coupled — once content is written at scale, retroactively enforcing a schema requires touching every file.

**Consequences:**
- Template queries silently return undefined for misnamed fields
- Edition filtering and article grouping break
- Build fails when required frontmatter is missing
- Content team has to re-edit already-written articles

**Prevention:**
- Define a canonical frontmatter schema before writing any content, even before choosing the SSG
- Create a `content-schema.md` spec document early (Phase 1)
- Enforce schema with a simple validation script (`zod` or `yup` against frontmatter) run as part of build
- Example minimal schema to lock in early:
  ```yaml
  ---
  title: ""
  slug: ""
  edition: 1          # integer, ties article to edition
  type: article|teaser|exclusive|editorial
  author: ""
  date: 2026-03-01
  language: en|pt
  excerpt: ""
  cover_image: ""
  draft: false
  ---
  ```

**Warning signs:** Articles being written with ad-hoc frontmatter, different contributors using different field names, no schema document exists yet.

**Phase to address:** Phase 1 (content architecture, before any content is written at scale)

---

### Pitfall 2: SSG Choice Lock-In via Content Structure

**What goes wrong:** The SSG is deferred, but content directory structure, frontmatter conventions, and image path assumptions get baked in early — sometimes in ways that are idiomatic to one SSG (Hugo's `content/posts/`, Astro's `src/content/`, Next.js's `pages/`) and then resist migration.

**Why it happens:** Content structure feels "neutral" but every SSG has opinions. Hugo requires specific directory layouts. Astro uses content collections with TypeScript schemas. Next.js with `next-mdx-remote` has no built-in structure at all. Choices made early (even just directory naming) create migration friction.

**Consequences:**
- Changing the SSG mid-project requires restructuring hundreds of files
- Image relative paths break when directory structure changes
- Internal links between articles break

**Prevention:**
- Before writing content, commit to a directory structure that maps clearly to SSG conventions for top candidates (Astro, Hugo, Eleventy)
- Keep content in a dedicated `content/` directory at the root, separate from framework files — this is portable across all major SSGs
- Use absolute-style image paths relative to a `public/` or `static/` root, not relative paths in Markdown

**Warning signs:** Articles placed inside framework-specific directories (e.g., `src/pages/articles/`) rather than a neutral `content/` root. Image references using `../images/` relative paths.

**Phase to address:** Phase 1 (before content is authored)

---

### Pitfall 3: Edition-as-Taxonomy Not Modeled Properly

**What goes wrong:** Editions are treated as a tag or category rather than as first-class entities. Articles reference `edition: 2` in frontmatter but there is no corresponding edition content file defining the edition's theme, cover, contributors list, or purchase CTA. As a result, the edition landing page has to be hardcoded rather than generated from data.

**Why it happens:** The editorial mental model ("articles belong to an edition") doesn't automatically map to how most blog-oriented SSGs structure content.

**Consequences:**
- Edition pages are hand-coded HTML; adding Edition 3 requires duplicating page template manually
- Edition metadata (theme, release date, cover image, ISBN, CTA URL) lives in template code rather than content
- No programmatic way to list "all articles in Edition 2"

**Prevention:**
- Model editions as their own content type with a separate directory or collection: `content/editions/edition-2.md` with full metadata
- Articles reference their edition by slug/ID in frontmatter
- Edition pages are generated from the edition content file
- This is a data modeling decision, not a design decision — lock it in early

**Warning signs:** Edition pages planned as one-off static pages. No `editions/` content directory exists. Edition metadata only appears in navigation or hardcoded page files.

**Phase to address:** Phase 1 (content architecture)

---

### Pitfall 4: Image Management Becomes Chaos at Scale

**What goes wrong:** Magazine content is image-heavy — article covers, contributor portraits, edition covers, in-article photos. Without an image organization convention, images accumulate with undescriptive names (`IMG_3847.jpg`, `photo.png`) and unknown origin. Build times balloon. Duplicate images proliferate. Responsive image variants are inconsistent.

**Why it happens:** Images feel like a later-stage concern. The immediate task is getting content into Markdown files.

**Consequences:**
- 50–200MB+ of images committed to git with no optimization
- Different articles use different image sizes, breaking visual consistency
- Cloudflare Pages has a 25MB file size limit — large unoptimized images fail deployment
- No systematic way to generate `srcset` variants

**Prevention:**
- Establish image naming convention immediately: `{edition}-{slug}-{role}.{ext}` (e.g., `ed2-hugo-goncales-cover.jpg`)
- Organize under `public/images/{edition}/` or similar
- Decide upfront whether to use Cloudflare Images, a CDN, or build-time optimization (sharp, @astrojs/image, etc.)
- Set a maximum source image size policy (e.g., no source image over 2MB; resize before committing)
- Cloudflare Pages supports Cloudflare Images as a CDN — worth using from day one for a media-heavy site

**Warning signs:** Images committed with camera roll names. `public/images/` flat directory with mixed content. No image optimization in the build pipeline.

**Phase to address:** Phase 1 (content setup) with tooling in Phase 2 (build pipeline)

---

### Pitfall 5: Deferred Design Blocks Content Decisions That Require Design

**What goes wrong:** Design is deferred intentionally, but content decisions that look neutral actually carry design implications. Teaser vs. full article, excerpt length, number of contributor bios shown, flipbook embed dimensions — all of these need at least rough layout assumptions. When design finally arrives, content structure needs rework.

**Why it happens:** "Content first, design later" is a sound principle, but the interface between content and design is more coupled than expected for a visually complex magazine.

**Consequences:**
- Articles written with 500-word excerpts that a card-based layout only shows 50 words of
- Cover images shot at 4:3 ratio; layout assumes 16:9
- Flipbook embed hardcoded at a pixel width that breaks on mobile

**Prevention:**
- Define layout constraints as content constraints: "excerpt must be 1–3 sentences," "cover image must be at least 1200×800px landscape," "contributor bio max 80 words"
- These are not design decisions — they are content contracts that design must accommodate
- Document these constraints in the content schema
- For the flipbook embed specifically: use a responsive container (CSS aspect-ratio) from day one, not a fixed pixel dimension

**Warning signs:** No excerpt length guidance for content authors. Cover images accepted in any aspect ratio. Flipbook embedded with `width="800" height="600"` hardcoded attributes.

**Phase to address:** Phase 1 (content schema) and Phase 2 (embed integration)

---

## Moderate Pitfalls

---

### Pitfall 6: 3rd Party Commerce Embed Breaks Static Build

**What goes wrong:** The purchase embed (Stripe, Shopify Buy Button, Gumroad, etc.) is added to the edition landing page as a raw JavaScript snippet. During local development it works. On Cloudflare Pages, the Content Security Policy (CSP) headers block the 3rd party script domain, or the embed references `window.document` in a way that breaks SSR/SSG hydration.

**Why it happens:** Embed snippets are written assuming a traditional browser-loaded page, not a statically generated site with potential partial hydration.

**Consequences:**
- Purchase button silently fails in production
- CSP errors logged in browser console but not noticed
- Embed loads but fails to initialize because it expects a DOM that isn't present at build time

**Prevention:**
- Test the embed on Cloudflare Pages (not just locally) as soon as it's integrated — even with a placeholder product
- Configure Cloudflare Pages headers (`_headers` file) to explicitly allowlist the embed's script and frame origins
- Wrap the embed in a client-only rendering component (most SSGs support this: Astro's `client:only`, Next.js's dynamic import with `ssr: false`)
- Keep the embed decoupled: one include file, one place to swap vendors

**Warning signs:** Embed only tested in local dev. No `_headers` file configuring CSP. Embed script hardcoded inline in page template.

**Phase to address:** Phase 2 (commerce integration milestone)

---

### Pitfall 7: Portuguese Content and Translate Widget Conflict

**What goes wrong:** Some articles are authored in Portuguese. A Google Translate widget is added for readers. Google Translate attempts to translate the already-translated Portuguese articles into another language, producing garbled output. Alternatively, the translate widget tries to translate UI elements (navigation, labels) that should not be translated.

**Why it happens:** Translate widgets work on a page-level DOM translation model — they do not respect per-element language tagging unless `lang` attributes are present and the widget is configured correctly.

**Consequences:**
- Portuguese articles get double-translated
- English UI elements adjacent to Portuguese body copy get incorrectly handled
- Screen reader accessibility broken by DOM mutation from translate widget

**Prevention:**
- Tag every article's container with the correct `lang` attribute (`lang="pt"` for Portuguese articles, `lang="en"` for English)
- Drive this from frontmatter: `language: pt` → rendered as `<article lang="pt">`
- Test Google Translate widget behavior against both English and Portuguese pages before shipping
- Consider that Google Translate widget is deprecated in favor of the Google Cloud Translation API — evaluate whether a CSS-only locale toggle is simpler

**Warning signs:** No `lang` attribute on article content elements. Translate widget added globally without per-page language awareness.

**Phase to address:** Phase 2 (internationalization)

---

### Pitfall 8: Git Repository Bloat from Unoptimized Media

**What goes wrong:** High-resolution editorial photos (5–20MB each), PDF flipbooks, and other binary assets are committed directly to the git repository. After a few editions, the repo is hundreds of megabytes. `git clone` becomes slow. Cloudflare Pages build times increase. CI/CD pipelines time out.

**Why it happens:** Markdown-first workflows feel natural for committing everything to git. Binary assets seem small until they accumulate.

**Consequences:**
- `git clone` takes minutes
- Cloudflare Pages has a 20,000 file limit and deployment size constraints
- Build cache is invalidated more often
- Contributor onboarding is slow

**Prevention:**
- Decide on a media strategy before onboarding content: options are git LFS, Cloudflare R2/Images, or an external CDN
- For a biannual magazine, R2 or Cloudflare Images is the right call — images are referenced by URL in Markdown, not stored in the repo
- Establish a "no binaries in git" rule from day one; document it in a `CONTRIBUTING.md`
- If git LFS is used, configure it in `.gitattributes` before any images are committed

**Warning signs:** First article's images committed as raw JPEGs. No `.gitattributes` file. Repo size exceeds 50MB before site is built.

**Phase to address:** Phase 1 (before content is onboarded)

---

### Pitfall 9: Flipbook Embed Accessibility and Mobile Failure

**What goes wrong:** The digital flipbook (likely Issuu, Yumpu, or a custom PDF viewer) is embedded via iframe. On mobile, the iframe is unscrollable or renders at desktop dimensions inside a squished container. Screen readers cannot access the flipbook content at all. The embed degrades to a broken experience rather than a graceful fallback.

**Why it happens:** Flipbook vendors optimize for desktop. Embed codes are often fixed dimensions. Mobile behavior is an afterthought.

**Consequences:**
- Mobile users (potentially 60%+ of visitors) cannot use the flipbook feature
- No content alternative for screen reader users
- Embed iframe may be blocked on iOS Safari if vendor uses cross-origin cookies

**Prevention:**
- Wrap iframe in a responsive container using CSS `aspect-ratio` and `width: 100%`
- Provide a fallback: a direct PDF download link and/or teaser images as an alternative
- Test on real mobile devices before shipping — not just browser DevTools mobile emulation
- Add `aria-label` to the iframe and a text-based alternative link adjacent to it

**Warning signs:** Flipbook iframe with hardcoded `width` and `height` attributes. No mobile test done. No fallback content outside the iframe.

**Phase to address:** Phase 1 (Edition 1 content setup)

---

### Pitfall 10: Cloudflare Pages Build Environment Mismatches

**What goes wrong:** The site builds locally but fails on Cloudflare Pages due to Node.js version mismatch, environment variable missing in Cloudflare dashboard, or a package that uses native binaries not available in the Cloudflare build environment (e.g., `sharp` needing specific libc).

**Why it happens:** Local development environment differs from Cloudflare Pages' build container. This is especially common with image optimization libraries that use native binaries.

**Consequences:**
- Build fails at deployment even though local build works
- Hard to debug without access to Cloudflare's build logs
- `sharp` (the most common image processing library) frequently fails in Cloudflare Pages because it requires pre-built binaries for the correct platform

**Prevention:**
- Pin Node.js version in `.nvmrc` or `package.json` engines field, and set the same version in Cloudflare Pages dashboard
- Set all required environment variables in Cloudflare Pages settings from the start — not just locally
- Avoid native binary packages in the build pipeline where possible; use WASM alternatives (e.g., `@squoosh/lib` instead of `sharp`, or delegate image optimization to Cloudflare Images)
- Test a Cloudflare Pages deployment early (first sprint) with the real repository, not just local builds

**Warning signs:** Local-only testing. `sharp` in dependencies. No `.nvmrc`. Environment variables only in `.env.local`.

**Phase to address:** Phase 1 (project setup), repeated check in Phase 2

---

## Minor Pitfalls

---

### Pitfall 11: Slug Instability Breaks SEO and Sharing

**What goes wrong:** Article slugs are generated automatically from titles during development (e.g., `conversations-about-light-and-stone`). Later, a title is edited, the slug regenerates, and all external links to that article return 404.

**Prevention:**
- Make slug an explicit, mandatory frontmatter field — never auto-derived from title
- Once an article is published (even to staging), the slug is frozen
- Implement redirect rules (`_redirects` file on Cloudflare Pages) for any slug that must change

**Phase to address:** Phase 1 (content schema definition)

---

### Pitfall 12: No Canonical URL Strategy

**What goes wrong:** The site is accessible at both `www.ilheumagazine.com` and `ilheumagazine.com`, or at both `https://` and the Cloudflare Pages `.pages.dev` subdomain. Search engines index both versions, splitting link equity and causing duplicate content penalties.

**Prevention:**
- Configure Cloudflare to redirect the non-canonical domain variant (www vs. apex) immediately
- Add `<link rel="canonical">` to every page
- Disable indexing of the `.pages.dev` subdomain via `robots.txt` or Cloudflare settings

**Phase to address:** Phase 2 (deployment configuration)

---

### Pitfall 13: Contributor Data Duplicated Across Files

**What goes wrong:** Contributor bios and portraits are copy-pasted into every article's frontmatter. When a bio needs updating, it must be updated in every article. If a contributor has two articles, their portrait is stored twice.

**Prevention:**
- Create a `content/contributors/` directory with one file per contributor as the single source of truth
- Articles reference contributors by slug in frontmatter: `authors: [hugo-goncales]`
- SSG template looks up contributor data from the contributors collection

**Phase to address:** Phase 1 (content architecture)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Content architecture setup | Frontmatter schema not defined before content is written | Define and document schema first; add validation script |
| SSG selection and setup | SSG-specific directory structure baked in before decision | Keep content in neutral `content/` root; use portable conventions |
| Edition modeling | Editions treated as tags not entities | Create `content/editions/` as a first-class content type |
| Image pipeline | Unoptimized images committed to git | Decide on external media hosting (R2/Cloudflare Images) before onboarding content |
| Flipbook integration | Fixed-dimension iframe fails on mobile | Responsive CSS wrapper + mobile testing + PDF fallback |
| Commerce embed | CSP headers block 3rd party script on Cloudflare Pages | Configure `_headers` file; test on Pages deployment not just local |
| Portuguese content | Translate widget double-translates or ignores `lang` | Set `lang` attribute per article from frontmatter |
| Deployment setup | Node version or native binary mismatch on Cloudflare Pages | Deploy early; pin Node version; avoid native binaries |
| Design deferred | Content structure assumptions break when design arrives | Define content contracts (excerpt length, image ratios) as schema constraints |
| Slug management | Auto-generated slugs break on title edit | Explicit slug field in frontmatter; freeze on first publish |

---

## Sources

- Training data knowledge of SSG ecosystems (Hugo, Astro, Eleventy, Next.js) — MEDIUM confidence
- Cloudflare Pages documentation (build environment, file limits, `_headers` format) — MEDIUM confidence (from training; recommend verifying current limits at https://developers.cloudflare.com/pages/)
- Common editorial site patterns observed across public post-mortems and community discussions — LOW confidence (unverified external sources)
- Project context: `/Users/filipemoura/dev/ilheu/website-2.0/.planning/PROJECT.md` — HIGH confidence (authoritative source for this project)

**Note:** External web search was unavailable during this research session. All findings are based on training data. Critical claims about Cloudflare Pages limits, SSG behaviors, and 3rd party embed compatibility should be verified against official documentation before acting on them.
