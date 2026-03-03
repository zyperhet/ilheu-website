# Phase 1: Foundation - Research

**Researched:** 2026-03-03
**Domain:** Astro v5 content collections, Cloudflare Pages static deployment, Tailwind CSS v4
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Content Organization**
- Edition-first directory structure: `content/editions/edition-1/articles/slug.md`
- Articles live inside their edition folder, not in a flat global list
- Special content (web exclusives, editorial, extended cuts) in a separate top-level section: `content/special/`
- Standalone contributor files: `content/contributors/name.md` — each contributor gets their own file with bio, photo, links (needed for Phase 5 contributor profiles)
- Edition-scoped URLs: `/editions/edition-1/hugo-goncales-interview`

**Frontmatter Schema**
- Comprehensive from day one — include all fields even if some aren't used until later phases
- **Article fields:** title, author, published date, excerpt, cover_image, featured flag, tags array, language (en/pt), type
- **All 6 article types from the start:** full, teaser, excerpt, web-exclusive, editorial, extended-cut
- **Edition fields:** edition number, title, theme, release_date, cover_image, accent_colour, purchase_url, status (current/archive), flipbook_embed_url, contributors list
- **Contributor fields:** name, role, bio, portrait image, linked articles
- **Strict validation:** Build must fail if required fields are missing — catch errors early since content is mostly ready

**Media Strategy**
- Images stored directly in the git repository (no Git LFS, no external storage like Cloudflare R2)
- User will provide high-res originals (~5-20MB each) — build-time optimization pipeline handles conversion
- Medium volume: ~20-50 images per edition
- Image reference style: Claude's discretion based on Astro's `astro:assets` best practices
- Note: repo will grow with high-res images; acceptable for first few editions, revisit around edition 5-6

**Skeleton Content**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TECH-01 | All content authored as Markdown/MDX files with structured frontmatter schema | Astro v5 Content Layer API with Zod schemas enforces at build time; `glob()` loader matches nested directory structure |
| TECH-02 | Static site built with Astro (or chosen SSG) deployable to Cloudflare Pages | Static output requires no adapter; build command `npm run build`, output dir `dist`; Node.js version pinned via `.nvmrc` |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield Astro v5 project initialization. The primary work is: scaffold the project, define three Zod-backed content collections (editions, articles, contributors), wire up Tailwind v4 via the Vite plugin, and connect to Cloudflare Pages for static deployment. All three tasks are well-supported by current tooling with no novel complexity.

The most important architectural decision in this phase is the frontmatter schema design. Every future phase builds on top of the collections defined here — the schema is the API surface between content authors and templates. Getting this right before any real content is authored is exactly what the user identified as the core risk. Astro's Content Layer API (introduced in v5) enforces schema at build time via Zod, making schema violations impossible to miss.

Tailwind v4 is stable and production-ready as of early 2025. It uses a CSS-first configuration model (`@tailwindcss/vite` plugin, no `tailwind.config.js`) which is cleaner for new projects. The Cloudflare Pages deployment for a fully static Astro site requires no adapter — just build command `npm run build`, output directory `dist`, and a `.nvmrc` file to pin the Node.js version across local and CI environments.

**Primary recommendation:** Scaffold with `npm create astro@latest`, install Tailwind v4 via `@tailwindcss/vite`, define all three collections in `src/content.config.ts` using Zod with strict validation, and deploy as a static site to Cloudflare Pages with `.nvmrc` for version parity.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | ^5.13+ | Static site generator, content collections, routing | Chosen SSG; Content Layer API in v5 enforces Zod schemas at build time |
| @astrojs/mdx | ^4.3+ | MDX support in content files | Needed for rich content with JSX components in articles (future phases) |
| tailwindcss | ^4.x | Utility-first CSS | v4 is stable, CSS-first config, faster builds via Oxide engine; no `tailwind.config.js` needed |
| @tailwindcss/vite | ^4.x | Vite plugin for Tailwind v4 | Required integration method for Tailwind v4 in Astro |
| zod | bundled with astro | Schema validation | Bundled with Astro; `astro/zod` re-exports it for collection schemas |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| typescript | bundled | Type safety | Astro is TypeScript-first; tsconfig with `strictNullChecks: true` required for content collections |
| @types/node | ^22 | Node.js types | Match pinned Node.js version in .nvmrc |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 | Tailwind v3 | v3 uses `tailwind.config.js` (JS-first) — familiar but the older approach; v4 is the current standard for new projects |
| @tailwindcss/vite (v4) | @astrojs/tailwind (v3 integration) | The old `@astrojs/tailwind` integration is for v3 only; do not use for a new project targeting v4 |
| Zod via `astro/zod` | Standalone zod package | `astro/zod` re-exports the same Zod bundled with Astro; use it to avoid version conflicts |

**Installation:**
```bash
npm create astro@latest
# during setup: choose "minimal" template, TypeScript strict
npx astro add mdx
npm install tailwindcss @tailwindcss/vite
```

---

## Architecture Patterns

### Recommended Project Structure
```
/
├── .nvmrc                    # Node.js version pin (e.g. "22")
├── astro.config.mjs          # Astro config with Tailwind Vite plugin
├── tsconfig.json             # strictNullChecks: true, allowJs: true
├── src/
│   ├── content.config.ts     # Collection schemas (Astro v5 location)
│   ├── styles/
│   │   └── global.css        # @import "tailwindcss"; entry point
│   ├── layouts/
│   │   └── BaseLayout.astro  # HTML shell, imports global.css
│   ├── pages/
│   │   └── index.astro       # Skeleton placeholder page
│   └── assets/               # Site-level images (logo, etc.)
├── content/
│   ├── editions/
│   │   ├── edition-1/
│   │   │   ├── index.md      # Edition frontmatter
│   │   │   ├── articles/
│   │   │   │   └── placeholder-article.md
│   │   │   └── images/       # Edition-specific images (colocated)
│   │   └── edition-2/
│   │       ├── index.md
│   │       ├── articles/
│   │       │   └── placeholder-article.md
│   │       └── images/
│   ├── contributors/
│   │   └── placeholder-contributor.md
│   └── special/
│       └── placeholder-special.md
└── public/
    └── favicon.svg
```

**Key structural note:** Astro v5 Content Layer API uses `src/content.config.ts` at the project root-level `src/` (not inside `src/content/config.ts`). This is a v5 breaking change from v4.

**Content directory note:** The user's edition-first structure (`content/editions/edition-1/articles/slug.md`) places content outside `src/`. Astro's `glob()` loader accepts any path, so `base: './content/editions'` works correctly. This is intentional to keep content separate from source code.

### Pattern 1: Content Layer API Collection Definition (Astro v5)

**What:** Define typed collections in `src/content.config.ts` using `defineCollection`, `glob()` loader, and Zod schemas.
**When to use:** All content collections in this project — editions, articles, contributors, special.

```typescript
// src/content.config.ts
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const editions = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './content/editions' }),
  schema: ({ image }) => z.object({
    edition_number: z.number(),
    title: z.string(),
    theme: z.string(),
    release_date: z.coerce.date(),
    cover_image: image(),
    accent_colour: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    purchase_url: z.string().url().optional(),
    status: z.enum(['current', 'archive']),
    flipbook_embed_url: z.string().url().optional(),
    contributors: z.array(reference('contributors')).optional(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '*/articles/*.md', base: './content/editions' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    author: reference('contributors'),
    published_date: z.coerce.date(),
    excerpt: z.string(),
    cover_image: image().optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    language: z.enum(['en', 'pt']).default('en'),
    type: z.enum(['full', 'teaser', 'excerpt', 'web-exclusive', 'editorial', 'extended-cut']),
  }),
});

const contributors = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/contributors' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    portrait: image().optional(),
    linked_articles: z.array(reference('articles')).optional(),
  }),
});

const special = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/special' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    published_date: z.coerce.date(),
    excerpt: z.string(),
    cover_image: image().optional(),
    type: z.enum(['web-exclusive', 'editorial', 'extended-cut']),
    language: z.enum(['en', 'pt']).default('en'),
  }),
});

export const collections = { editions, articles, contributors, special };
```

### Pattern 2: Tailwind v4 Setup in Astro

**What:** Install Tailwind v4 via the Vite plugin, import via CSS.
**When to use:** Once at project setup. This is the v4-only approach — do not use `@astrojs/tailwind` (that is the v3 integration).

```javascript
// astro.config.mjs
// Source: https://tailwindcss.com/docs/installation/framework-guides/astro
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx()],
});
```

```css
/* src/styles/global.css */
@import "tailwindcss";
```

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Ilhéu Magazine</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Pattern 3: Image Co-location with Content

**What:** Store images alongside their edition content folder, reference them with relative paths in frontmatter. The `image()` schema helper validates and imports them through the build pipeline.
**When to use:** For edition covers, article cover images, contributor portraits.

```markdown
---
# content/editions/edition-1/index.md
title: "Edition 1"
cover_image: "./images/edition-1-cover.jpg"
---
```

```markdown
---
# content/contributors/john-doe.md
portrait: "./images/john-doe-portrait.jpg"
---
```

**Important:** Images in frontmatter validated by `image()` must be relative paths to files that exist. The build will fail if the referenced file does not exist — this is a feature, not a bug.

### Pattern 4: Node.js Version Pinning

**What:** Pin Node.js version in `.nvmrc` at project root. Cloudflare Pages reads this file and uses the specified version.
**When to use:** Required — ensures local and CI environments use the same Node.js version.

```
# .nvmrc
22
```

Cloudflare Pages v3 build system defaults to Node.js 22.16.0. Pinning `22` in `.nvmrc` explicitly aligns both environments. Priority order on Cloudflare Pages: project files (`.nvmrc` / `.node-version`) take precedence over the `NODE_VERSION` env var.

### Anti-Patterns to Avoid

- **Using `src/content/config.ts` (v4 path) instead of `src/content.config.ts` (v5 path):** Astro v5 moved the config file. Using the old location causes collections to not load.
- **Using `entry.slug` instead of `entry.id`:** Content Layer API (v5) replaced `slug` with `id`. All route params and queries must use `id`.
- **Using `@astrojs/tailwind` integration:** This is the Tailwind v3 integration and does not work with v4. Use `@tailwindcss/vite` plugin directly.
- **Installing `@astrojs/cloudflare` adapter for a static site:** This adapter is only needed for SSR/on-demand rendering. A static Astro site deploys to Cloudflare Pages without any adapter.
- **Relying on `package.json` `engines` field for Node.js version on Cloudflare Pages:** Cloudflare Pages ignores the `engines` field entirely. Only `.nvmrc`, `.node-version`, or the `NODE_VERSION` env var work.
- **Assuming `getCollection()` returns entries in deterministic order:** Astro v5 collection sort order is non-deterministic. Always sort explicitly when order matters.
- **`type: 'content'` in collection definition:** This is the legacy v4 syntax. In v5 Content Layer API, use `loader: glob(...)` instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frontmatter validation | Custom validation script | Zod schemas in `src/content.config.ts` | Build-time error messages with field names; TypeScript types auto-generated; deeply tested |
| Image processing / WebP conversion | Sharp scripts, custom pipelines | Astro's `astro:assets` + `image()` schema helper | Handles responsive images, format conversion, lazy loading; colocated images work without any config |
| Cross-collection relationships | Manual ID string matching | `reference()` helper in collection schema | Type-safe references; `getEntries()` resolves them; refactor-safe |
| Routing from content slugs | Custom slug-to-path logic | Astro's `glob()` loader + `getStaticPaths()` | `entry.id` maps directly to file path; no hand-coded mappings needed |
| Node.js version sync | Shell scripts / Docker | `.nvmrc` + Cloudflare Pages native support | One file, read by both `nvm` locally and Cloudflare Pages CI |

**Key insight:** Astro v5's Content Layer API is specifically designed to replace hand-rolled content pipelines. The build-fail-on-invalid-schema behavior is more reliable than any custom validation script because it runs on every build, not just when someone remembers to run the validator.

---

## Common Pitfalls

### Pitfall 1: Content Layer API Config File Location

**What goes wrong:** Collections don't appear, `getCollection()` returns empty arrays, no build errors.
**Why it happens:** Astro v5 moved the config from `src/content/config.ts` to `src/content.config.ts`. If you create the file in the old location, Astro silently ignores it.
**How to avoid:** Always create `src/content.config.ts` (at `src/` root, not in a subdirectory).
**Warning signs:** `getCollection('editions')` returns `[]` on a project with content files in place.

### Pitfall 2: `image()` Schema with Missing Files

**What goes wrong:** Build fails with "ImageNotFound" or "Local images must be imported" errors.
**Why it happens:** The `image()` helper requires that the referenced image file physically exists relative to the content file. If a placeholder frontmatter references `"./images/cover.jpg"` but that file doesn't exist, the build fails.
**How to avoid:** Either include placeholder image files (a tiny 1x1 PNG is fine for skeleton content), or mark `cover_image` as `.optional()` and omit it from placeholder frontmatter.
**Warning signs:** Build succeeds locally with real images but fails on CI where placeholder files are missing.

### Pitfall 3: Glob Pattern Doesn't Match Nested Structure

**What goes wrong:** Articles collection loads editions `index.md` files, or editions collection loads articles — wrong entries loaded into wrong collection.
**Why it happens:** `glob()` patterns are powerful but easy to mis-specify. `'**/*.md'` matches everything; `'*/index.md'` only matches one level deep.
**How to avoid:** Be explicit with patterns. Test with the skeleton content: editions use `'*/index.md'`, articles use `'*/articles/*.md'`.
**Warning signs:** `getCollection('articles')` includes edition index files.

### Pitfall 4: `entry.slug` vs `entry.id`

**What goes wrong:** TypeScript errors in page templates, or routes that 404.
**Why it happens:** Astro v4 used `entry.slug`; v5 Content Layer API uses `entry.id`. If you follow v4 tutorials/docs while building on v5, all URL generation breaks.
**How to avoid:** In `getStaticPaths()`, always use `entry.id` for route params. The `id` is path-derived from the file location.
**Warning signs:** `entry.slug` shows as `undefined` in templates.

### Pitfall 5: Tailwind v4 CSS Not Applied

**What goes wrong:** Classes have no effect; page renders unstyled.
**Why it happens:** Forgetting to import `global.css` in the base layout, or using `@tailwind base/components/utilities` directives (v3 syntax) instead of `@import "tailwindcss"` (v4 syntax).
**How to avoid:** The global CSS file must contain exactly `@import "tailwindcss";` and must be imported in the base layout `<head>` or via a layout component that wraps all pages.
**Warning signs:** No Tailwind output in browser devtools CSS panel.

### Pitfall 6: Cloudflare Pages Deployment Using Wrong Node Version

**What goes wrong:** Build succeeds locally but fails on Cloudflare Pages with dependency resolution errors or syntax errors.
**Why it happens:** Cloudflare Pages v2 build system defaults to Node.js 18; without a `.nvmrc`, you might be using Node.js 22 locally and 18 on CI.
**How to avoid:** Create `.nvmrc` with `22` and use it locally. Cloudflare Pages reads `.nvmrc` before falling back to defaults.
**Warning signs:** Different `node --version` output locally vs build logs on Cloudflare Pages dashboard.

---

## Code Examples

Verified patterns from official sources:

### Defining a Collection with image() Helper

```typescript
// src/content.config.ts
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const editions = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './content/editions' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    cover_image: image(),
    status: z.enum(['current', 'archive']),
  }),
});

export const collections = { editions };
```

### Cross-Collection Reference

```typescript
// Source: https://docs.astro.build/en/reference/modules/astro-content/
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '*/articles/*.md', base: './content/editions' }),
  schema: z.object({
    title: z.string(),
    author: reference('contributors'),  // type-safe cross-collection reference
  }),
});
```

### Querying Collections in Page Templates

```typescript
// Source: https://docs.astro.build/en/reference/modules/astro-content/
import { getCollection, getEntry, getEntries } from 'astro:content';

// Get all editions, sorted by edition number
const editions = (await getCollection('editions'))
  .sort((a, b) => a.data.edition_number - b.data.edition_number);

// Resolve cross-collection references
const contributors = await getEntries(edition.data.contributors);
```

### Static Paths from Content

```typescript
// In any [id].astro dynamic route page
export async function getStaticPaths() {
  const articles = await getCollection('articles');
  return articles.map(article => ({
    params: { id: article.id },  // use .id not .slug in Astro v5
    props: { article },
  }));
}
```

### Rendering MDX/Markdown Content

```typescript
// Astro v5 Content Layer API
const { Content } = await article.render();
// Then in template: <Content />
```

### Astro Config for Static Cloudflare Pages Deployment

```javascript
// astro.config.mjs
// Source: https://docs.astro.build/en/guides/deploy/cloudflare/
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',  // explicit — Cloudflare Pages serves static files
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx()],
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `src/content/config.ts` | `src/content.config.ts` | Astro v5 (Nov 2024) | File location change; old path silently ignored |
| `type: 'content'` in defineCollection | `loader: glob(...)` | Astro v5 | New Content Layer API; legacy API still works but discouraged |
| `entry.slug` for URLs | `entry.id` | Astro v5 | Must update all dynamic route params |
| `@astrojs/tailwind` | `@tailwindcss/vite` plugin | Tailwind v4 (Jan 2025) | No `tailwind.config.js`; CSS-first `@import "tailwindcss"` |
| `@tailwind base/components/utilities` directives | `@import "tailwindcss"` | Tailwind v4 | Old v3 directives don't work in v4 |
| `post.render()` | `post.render()` still works | Astro v5 | Method preserved but Content Layer adds new capabilities |

**Deprecated/outdated:**
- `type: 'content'` collection field: replaced by `loader: glob(...)` in Astro v5 Content Layer API
- `@astrojs/tailwind` npm package: Tailwind v3 integration; incompatible with Tailwind v4
- `entry.slug`: replaced by `entry.id` in Content Layer API
- `src/content/config.ts` file path: moved to `src/content.config.ts` in Astro v5

---

## Open Questions

1. **Image path resolution for co-located images in `content/` (outside `src/`)**
   - What we know: The `image()` helper works with relative paths in frontmatter. Images co-located with content files (e.g., `content/editions/edition-1/images/cover.jpg`) are referenced as relative paths in frontmatter.
   - What's unclear: Whether Astro v5's Content Layer API fully supports `image()` for content files stored outside `src/`. There was a reported v5 issue (#12772) where images co-located with MDX files in content collections returned 404 errors.
   - Recommendation: During implementation, use a small placeholder image to test that `image()` resolves correctly before importing real high-res images. If co-location outside `src/` causes issues, the fallback is storing images in `src/assets/editions/` and referencing them via project-root paths.

2. **Glob pattern for articles nested inside editions**
   - What we know: The pattern `'*/articles/*.md'` should match `edition-1/articles/article-slug.md`.
   - What's unclear: Whether the generated `entry.id` will be `edition-1/articles/article-slug` (full path) or just `article-slug`. This affects how URLs are constructed.
   - Recommendation: Test with skeleton content; if the `id` includes the edition path prefix, the URL generation for `edition-scoped URLs` (`/editions/edition-1/article-slug`) becomes straightforward.

3. **`reference('contributors')` in articles collection**
   - What we know: `reference()` creates type-safe cross-collection links. The article frontmatter `author:` field would hold the contributor's `id` string.
   - What's unclear: Whether the contributor `id` (derived from filename `john-doe.md` → `john-doe`) is stable and author-friendly to type in frontmatter.
   - Recommendation: Use human-readable filenames for contributors (e.g., `hugo-goncalves.md`) so the author reference in article frontmatter is readable (`author: hugo-goncalves`).

---

## Sources

### Primary (HIGH confidence)
- https://docs.astro.build/en/guides/content-collections/ — Content Layer API, Zod schemas, glob loader, image() helper
- https://docs.astro.build/en/guides/deploy/cloudflare/ — Static deployment, build command, output dir
- https://tailwindcss.com/docs/installation/framework-guides/astro — Tailwind v4 Vite plugin installation
- https://developers.cloudflare.com/pages/configuration/build-image/ — Node.js version pinning via .nvmrc
- https://docs.astro.build/en/guides/images/ — image() schema helper for content collections

### Secondary (MEDIUM confidence)
- https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/ — Cloudflare Pages build settings (verified against Astro docs)
- https://astro.build/blog/astro-5/ — Astro v5 release notes, Content Layer API introduction
- https://tailwindcss.com/blog/tailwindcss-v4 — Tailwind v4 stable release announcement

### Tertiary (LOW confidence)
- https://medium.com/@pradeepgudipati/downgrading-from-tailwind-css-v4-to-v3 — Tailwind v4 stability concerns (community, single source; v4 assessed as stable for new projects)
- https://github.com/withastro/astro/issues/12772 — v5 image co-location issue (GitHub issue, status unknown; flagged as open question)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Astro v5 and Tailwind v4 are current stable releases; verified via official docs
- Architecture: HIGH — Content Layer API patterns verified against official Astro docs; collection structure matches user decisions
- Pitfalls: HIGH — v5 migration pitfalls verified against official upgrade guide and multiple community reports with consistent findings
- Cloudflare Pages deployment: HIGH — verified against both Astro deploy guide and Cloudflare Pages official docs

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable libraries; Tailwind v4 and Astro v5 have stable release cadences)
