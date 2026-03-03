# Phase 2: Core Pages - Research

**Researched:** 2026-03-03
**Domain:** Astro 5 static site — content collection routing, markdown rendering, Tailwind v4 typography, mobile-first layout
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Navigation structure**
- 4 items: Editions, Articles, Shop, About
- Centered magazine logo/name above the nav items — editorial/print magazine feel
- Static navigation — scrolls with the page, not sticky
- Mobile nav behavior: Claude's discretion (hamburger, inline, or other)

**Homepage hierarchy**
- Edition cover + theme as the dominant hero element — immediately says "this is a magazine"
- Prominent "Buy Edition" button in the hero section, next to/below the cover
- Below hero: featured article highlight (one article gets editorial pick treatment — matches EDIT-02)
- Below featured article: edition archive preview (past editions with covers/themes)
- Single scroll with previews + "View all" links to dedicated pages — focused, scales as archive grows

**Article reading experience**
- Narrow, centered text column (~65ch) — focused reading with generous whitespace
- Full-width hero image above the title when article has a cover_image
- Teaser/excerpt articles: render the excerpt content, then a clear "Read in print" boundary with buy CTA — honest, not a fade-out gimmick
- Minimal article metadata: author name (linking to contributor), published date, and edition link
- No tags, no reading time displayed

**Edition page layout**
- Theme text hero with cover image alongside — the theme statement ("Across the Archipelago") leads, cover image supports
- Articles presented as editorial list (table of contents style) — title, author, excerpt per row, vertical
- Contributors shown as small portraits with names and roles — personal, visual
- Prominent buy CTA near the top of the edition page, near theme/cover area
- Fallback needed for contributors without portrait images (portraits are optional in schema)

**About page**
- Mission, team bios, and contact info (TECH-05)
- Layout and content structure: Claude's discretion

**Edition archive page**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EDIT-01 | Homepage showcases current edition with hero image, cover, and buy CTA | `getCollection('editions', ({data}) => data.status === 'current')` returns the current edition; `purchase_url` field drives buy CTA |
| EDIT-02 | Homepage features one article as editorial highlight | `getCollection('articles', ({data}) => data.featured === true)` with ID filter for current edition |
| EDIT-03 | Edition archive page lists all editions with cover thumbnails and themes | `getCollection('editions')` sorted by `edition_number` desc; Image component renders cover thumbnails |
| EDIT-04 | Individual edition page shows theme, cover, contributors, article list, and buy link | `getCollection('articles', ({id}) => id.startsWith('edition-X/'))` + `getEntries(edition.data.contributors)` |
| NAV-01 | Persistent navigation with 4 items (editions, articles, shop, about) | Shared Nav component in BaseLayout; no JS needed for static nav; `<script>` tag for mobile toggle |
| CONT-01 | Article pages render Markdown/MDX with readable typography and image support | `render(entry)` returns `<Content />`; `@tailwindcss/typography` + `prose` class styles rendered MD |
| CONT-02 | Articles support multiple types: full, teaser/excerpt, web-exclusive, editorial, extended-cut | `article.data.type` field exists in schema; conditional rendering on article page based on type |
| TECH-03 | Mobile-first responsive design (375px+, enhanced for tablet and desktop) | Tailwind v4 breakpoints (`sm:`, `md:`, `lg:`); 375px base; no horizontal overflow |
| TECH-05 | About page with mission, team bios, and contact info | Static `about.astro` page; `getCollection('contributors')` for team bios if needed |
</phase_requirements>

---

## Summary

Phase 2 builds the full editorial reading experience on top of Phase 1's content collections and Astro configuration. The technical foundation is solid: Astro 5 with Content Layer API, Tailwind v4 via `@tailwindcss/vite`, and `@astrojs/mdx` are already installed and configured. The work is primarily routing, component composition, and layout — not infrastructure.

The key technical insight is that article IDs encode their edition path. An article at `content/editions/edition-1/articles/hugo-goncales-interview.md` has `id = 'edition-1/articles/hugo-goncales-interview'` (from the glob loader using `pattern: '*/articles/*.md'` and `base: './content/editions'`). This means filtering articles by edition uses `id.startsWith('edition-1/')` — no extra frontmatter field needed. Dynamic routes for articles use `[...slug].astro` (rest parameter) because the ID contains slashes.

Typography for rendered Markdown requires installing `@tailwindcss/typography` and adding `@plugin '@tailwindcss/typography'` to `global.css`. This is the only new dependency needed for the entire phase. Everything else (Astro, Tailwind v4, MDX) is already installed.

**Primary recommendation:** Build in this order: (1) BaseLayout with nav/footer, (2) edition archive, (3) individual edition page, (4) article page, (5) homepage, (6) about page. Edition and article pages establish the data patterns; homepage aggregates them.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | ^5.18.0 | SSG framework + content layer + routing | Already established in Phase 1 |
| tailwindcss | ^4.2.1 | Utility CSS with v4 plugin model | Already established in Phase 1 |
| @tailwindcss/vite | ^4.2.1 | Tailwind v4 Vite integration | Already established in Phase 1 |
| @astrojs/mdx | ^4.3.13 | MDX content rendering | Already installed |

### New Dependency (Phase 2)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|-------------|
| @tailwindcss/typography | ^0.5.x | Prose styles for rendered Markdown | Official Tailwind plugin; single `prose` class styles all rendered MD/MDX headings, paragraphs, lists, blockquotes, images |

### Not Needed
| Not Needed | Why |
|------------|-----|
| astro-navbar | Overkill; 4-item static nav with optional mobile toggle is simple enough without a library |
| Any JS animation library | Context specifies no animations in discretion |
| Any icon library | Hamburger can be pure SVG inline or CSS; no icon set needed |

**Installation:**
```bash
npm install -D @tailwindcss/typography
```

**global.css update:**
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── layouts/
│   └── BaseLayout.astro      # Extended with nav + footer slots (already exists — needs rewrite)
├── components/
│   ├── Nav.astro              # Site navigation (magazine logo + 4 nav items)
│   ├── Footer.astro           # Site footer
│   ├── EditionCard.astro      # Edition thumbnail + theme (used in archive + homepage)
│   ├── ArticleTeaser.astro    # Article row for edition TOC list
│   ├── ContributorCard.astro  # Portrait + name + role (with fallback)
│   └── Prose.astro            # Wrapper applying prose class to rendered MD
└── pages/
    ├── index.astro            # Homepage (EDIT-01, EDIT-02)
    ├── editions/
    │   ├── index.astro        # Archive page (EDIT-03)
    │   └── [editionId].astro  # Single edition page (EDIT-04)
    ├── articles/
    │   └── [...slug].astro    # Article page (CONT-01, CONT-02)
    └── about.astro            # About page (TECH-05)
```

### Pattern 1: Dynamic Route for Editions

Editions have simple IDs like `edition-1`, `edition-2` — no slashes, so `[editionId].astro` (not rest parameter) works.

```typescript
// src/pages/editions/[editionId].astro
// Source: https://docs.astro.build/en/guides/content-collections/
---
import { getCollection, getEntries, render } from 'astro:content';

export async function getStaticPaths() {
  const editions = await getCollection('editions');
  return editions.map(edition => ({
    params: { editionId: edition.id },
    props: { edition },
  }));
}

const { edition } = Astro.props;

// Filter articles belonging to this edition by ID prefix
const allArticles = await getCollection('articles', ({ id }) => {
  return id.startsWith(edition.id + '/');
});

// Resolve contributor references
const contributors = edition.data.contributors
  ? await getEntries(edition.data.contributors)
  : [];
---
```

### Pattern 2: Dynamic Route for Articles (Rest Parameter)

Article IDs contain slashes (e.g., `edition-1/articles/hugo-goncales-interview`), so use `[...slug].astro`.

```typescript
// src/pages/articles/[...slug].astro
// Source: https://docs.astro.build/en/guides/content-collections/
---
import { getCollection, getEntry, render } from 'astro:content';

export async function getStaticPaths() {
  const articles = await getCollection('articles');
  return articles.map(article => ({
    params: { slug: article.id },
    props: { article },
  }));
}

const { article } = Astro.props;
const author = await getEntry(article.data.author);
const { Content } = await render(article);

// Derive edition ID from article ID: "edition-1/articles/hugo-goncales-interview" -> "edition-1"
const editionId = article.id.split('/')[0];
---
```

**Resulting URL:** `/articles/edition-1/articles/hugo-goncales-interview`
— readable and self-describing; each article URL contains its edition context.

### Pattern 3: Rendering Markdown with Typography

```typescript
// src/components/Prose.astro
// Source: https://docs.astro.build/en/recipes/tailwind-rendered-markdown/
---
---
<div class="prose prose-lg max-w-none prose-headings:font-cardo prose-a:text-current">
  <slot />
</div>
```

```typescript
// Article page usage
const { Content } = await render(article);
---
<article class="max-w-[65ch] mx-auto px-4">
  <Prose>
    <Content />
  </Prose>
</article>
```

### Pattern 4: Filtering Articles by Type (CONT-02)

```typescript
// Conditional rendering based on article.data.type
const isTeaser = ['teaser', 'excerpt'].includes(article.data.type);
const isFull = article.data.type === 'full';
```

For teaser/excerpt articles: render `<Content />` (which is the excerpt/teaser body), then show the "Read in print" boundary section with a buy CTA linking to the edition's `purchase_url`.

### Pattern 5: Current Edition Query (EDIT-01)

```typescript
// src/pages/index.astro — get current edition
const allEditions = await getCollection('editions');
const currentEdition = allEditions.find(e => e.data.status === 'current');
const archivedEditions = allEditions
  .filter(e => e.data.status === 'archive')
  .sort((a, b) => b.data.edition_number - a.data.edition_number);

// Get featured article from current edition
const featuredArticle = await getCollection('articles', ({ id, data }) => {
  return id.startsWith(currentEdition.id + '/') && data.featured === true;
}).then(arr => arr[0]);
```

### Pattern 6: Optional Image Handling

```typescript
// Source: https://docs.astro.build/en/guides/images/
import { Image } from 'astro:assets';

// Always guard optional image fields before rendering
{edition.data.cover_image && (
  <Image
    src={edition.data.cover_image}
    alt={`Cover of ${edition.data.title}`}
    class="w-full"
  />
)}

// Contributor portrait fallback
{contributor.data.portrait ? (
  <Image src={contributor.data.portrait} alt={contributor.data.name} class="w-12 h-12 rounded-full object-cover" />
) : (
  <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
    <span class="text-sm font-medium text-gray-500">{contributor.data.name[0]}</span>
  </div>
)}
```

### Pattern 7: Font Loading (Cardo + Inter)

No npm package needed. Self-host via Google Fonts preconnect or use Fontsource for build-time bundling. Given the static output mode, a CSS `@import` from Google Fonts works and avoids adding an npm dependency.

```css
/* src/styles/global.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@import url('https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap');

@theme {
  --font-cardo: 'Cardo', serif;
  --font-inter: 'Inter', sans-serif;
}
```

Tailwind v4 uses `@theme` block (not `theme.extend` in config) to define custom values.

### Anti-Patterns to Avoid
- **Using `entry.slug` instead of `entry.id`**: In Astro v5 Content Layer API, `entry.slug` does not exist — always use `entry.id`. This was established in Phase 1 and must be consistent.
- **Calling `.render()` on the entry**: Old Astro v4 pattern. In v5, import `render` from `astro:content` and call `render(entry)`.
- **Using `[slug].astro` for articles**: Article IDs contain slashes — `[slug].astro` only matches single path segments. Use `[...slug].astro`.
- **Using `edition_number` or title as URL parameter**: Use `entry.id` (the filename-derived slug) as the URL param — it's already URL-safe and matches the `getEntry()` lookup key.
- **Sorting editions without direction**: Always sort by `edition_number` descending (newest first) for archive display.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown body styling | Custom CSS for every element | `@tailwindcss/typography` + `prose` class | Handles headings, paragraphs, lists, blockquotes, code, images, tables — dozens of edge cases |
| Image optimization | `<img>` tags with manual sizing | `astro:assets` `Image` component | Automatic WebP conversion, srcset, lazy loading, CLS prevention |
| Content type resolution | Manual string matching | `article.data.type` Zod enum field | Already validated at build time against the enum list |
| Contributor resolution | String split on article.data.author | `getEntry(article.data.author)` | Handles the reference object shape that Astro stores |

**Key insight:** The hard problems in this phase (MD rendering, image optimization, content validation) are already solved by Astro's built-in tools. The phase is about wiring existing APIs correctly, not building infrastructure.

---

## Common Pitfalls

### Pitfall 1: Article URL Structure with Rest Parameters
**What goes wrong:** Using `[slug].astro` for articles. The build succeeds but routes don't work because article IDs contain `/` characters.
**Why it happens:** Developers see `[id].astro` working for editions (simple IDs) and apply the same pattern to articles.
**How to avoid:** Use `[...slug].astro` for the articles route. The params will be `{ slug: 'edition-1/articles/hugo-goncales-interview' }`.
**Warning signs:** Build output shows only one article path generated, or 404s on all article pages.

### Pitfall 2: Missing `@plugin` Import for Typography
**What goes wrong:** Installing `@tailwindcss/typography` but the `prose` class has no effect.
**Why it happens:** Tailwind v4 doesn't use `tailwind.config.js` — plugins must be registered in CSS via `@plugin` directive, not in a config file.
**How to avoid:** Add `@plugin "@tailwindcss/typography";` to `src/styles/global.css` after `@import "tailwindcss"`.
**Warning signs:** `prose` class applies to elements but no typographic styles appear.

### Pitfall 3: Deriving Edition from Article ID
**What goes wrong:** Assuming the first path segment of an article ID is always the edition ID.
**Why it happens:** The glob pattern is `*/articles/*.md` with base `./content/editions` — the ID will be `edition-1/articles/article-name`. The first segment IS the edition ID.
**How to avoid:** Use `article.id.split('/')[0]` to extract the edition slug, then `getEntry('editions', editionSlug)` to fetch the edition. This is safe given the fixed path structure.
**Warning signs:** If content structure changes to deeper nesting, this breaks silently.

### Pitfall 4: Optional Image Fields Causing Build Errors
**What goes wrong:** Passing `undefined` to the `Image` component from `astro:assets`. Build fails with type error.
**Why it happens:** Cover images and portraits are `.optional()` in the schema. Placeholder content has no real image files.
**How to avoid:** Always guard with `{entry.data.cover_image && <Image src={entry.data.cover_image} ... />}`. For contributor portraits, provide an initial/avatar fallback div.
**Warning signs:** TypeScript error: "Argument of type 'undefined' is not assignable to parameter of type ImageMetadata"

### Pitfall 5: `getCollection` Returns All Editions' Articles
**What goes wrong:** Fetching all articles with `getCollection('articles')` on an edition page and displaying them all.
**Why it happens:** Developer forgets to filter by edition.
**How to avoid:** Always filter: `getCollection('articles', ({ id }) => id.startsWith(edition.id + '/'))`. The trailing `/` prevents prefix collision if edition IDs share prefixes (e.g., `edition-1` and `edition-10`).
**Warning signs:** Edition page shows more articles than expected; articles from other editions appear.

### Pitfall 6: `@theme` Syntax for Custom Fonts in Tailwind v4
**What goes wrong:** Adding custom fonts to a `tailwind.config.js` file that doesn't exist.
**Why it happens:** Tailwind v3 muscle memory. Tailwind v4 has no config file in this project.
**How to avoid:** Define custom theme values in `global.css` using `@theme { --font-cardo: 'Cardo', serif; }`. Use via `font-cardo` utility class.
**Warning signs:** Custom font classes have no effect.

---

## Code Examples

Verified patterns from official sources:

### Getting Current Edition for Homepage
```typescript
// Source: https://docs.astro.build/en/guides/content-collections/
import { getCollection, getEntry, render } from 'astro:content';

const allEditions = await getCollection('editions');
const currentEdition = allEditions.find(e => e.data.status === 'current');

// Featured article for EDIT-02
const editionArticles = await getCollection('articles', ({ id, data }) =>
  id.startsWith(currentEdition.id + '/') && data.featured === true
);
const featuredArticle = editionArticles[0];
```

### Resolving Referenced Contributors
```typescript
// Source: https://docs.astro.build/en/guides/content-collections/
import { getEntries, getEntry } from 'astro:content';

// Array of contributor references on an edition
const contributors = edition.data.contributors
  ? await getEntries(edition.data.contributors)
  : [];

// Single contributor reference on an article
const author = await getEntry(article.data.author);
```

### Rendering Markdown Content
```typescript
// Source: https://docs.astro.build/en/guides/content-collections/
import { render } from 'astro:content';

const { Content } = await render(article);
---
<Prose>
  <Content />
</Prose>
```

### Teaser Article Conditional Rendering
```astro
---
const isTeaser = ['teaser', 'excerpt'].includes(article.data.type);
const editionId = article.id.split('/')[0];
const edition = await getEntry('editions', editionId);
---

<article class="max-w-[65ch] mx-auto px-4 py-12">
  <!-- Hero image if present -->
  {article.data.cover_image && (
    <div class="-mx-4 mb-8">
      <Image src={article.data.cover_image} alt={article.data.title} class="w-full" />
    </div>
  )}

  <h1 class="font-cardo text-4xl mb-4">{article.data.title}</h1>

  <!-- Minimal metadata -->
  <div class="text-sm text-gray-500 mb-8">
    <a href={`/contributors/${author.id}`}>{author.data.name}</a>
    &nbsp;·&nbsp;
    <a href={`/editions/${editionId}`}>{edition?.data.title}</a>
  </div>

  <Prose>
    <Content />
  </Prose>

  <!-- Teaser boundary — only for teaser/excerpt types -->
  {isTeaser && (
    <div class="mt-12 pt-8 border-t border-gray-200 text-center">
      <p class="font-cardo text-xl mb-4">Read the full piece in print.</p>
      {edition?.data.purchase_url && (
        <a href={edition.data.purchase_url} class="inline-block px-6 py-3 bg-black text-white">
          Buy {edition.data.title}
        </a>
      )}
    </div>
  )}
</article>
```

### Mobile Navigation Toggle (minimal JS)
```astro
<!-- Nav.astro -->
<header>
  <div class="text-center py-4">
    <a href="/" class="font-cardo text-2xl tracking-widest uppercase">Ilhéu</a>
  </div>
  <nav>
    <!-- Desktop: always visible -->
    <ul class="hidden md:flex justify-center gap-8 text-sm uppercase tracking-wider py-2 border-t border-b">
      <li><a href="/editions">Editions</a></li>
      <li><a href="/articles">Articles</a></li>
      <li><a href="/shop">Shop</a></li>
      <li><a href="/about">About</a></li>
    </ul>
    <!-- Mobile: hamburger toggle -->
    <button id="menu-btn" class="md:hidden absolute top-4 right-4" aria-label="Menu">
      <svg .../>
    </button>
    <ul id="mobile-menu" class="hidden md:hidden flex-col text-center gap-4 py-4">
      <!-- same links -->
    </ul>
  </nav>
</header>
<script>
  document.getElementById('menu-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
  });
</script>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `entry.slug` for routing | `entry.id` | Astro v5 Content Layer API | `entry.slug` removed; `entry.id` is the canonical identifier |
| `entry.render()` method | `render(entry)` from `astro:content` | Astro v5 | Import `render` function, don't call as method |
| `tailwind.config.js` plugins array | `@plugin` directive in CSS | Tailwind v4 | No config file; all config in CSS |
| `theme.extend` in config | `@theme` block in CSS | Tailwind v4 | Custom design tokens defined in CSS `@theme {}` block |

**Deprecated/outdated:**
- `entry.slug`: Does not exist in Astro v5 Content Layer API — use `entry.id`
- `astrojs/tailwind` integration: Replaced by `@tailwindcss/vite` Vite plugin in Tailwind v4

---

## Open Questions

1. **Articles listing page (`/articles`)**
   - What we know: NAV-01 requires an "Articles" nav item; there's no explicit requirement for an articles listing page in Phase 2 scope
   - What's unclear: Does the Articles nav link go to an articles index page, or is it out of scope for Phase 2?
   - Recommendation: Create a minimal `/articles/index.astro` listing all articles across editions — required for the nav item to work. Without it, the nav link goes nowhere.

2. **Shop page stub**
   - What we know: NAV-01 requires a "Shop" nav item; actual commerce is Phase 3
   - What's unclear: Does "Shop" link to an external page, or needs a placeholder route in Phase 2?
   - Recommendation: Create a minimal `/shop.astro` stub that says "Coming soon" or links to an external URL placeholder. The nav item must not 404.

3. **About page content**
   - What we know: TECH-05 requires mission, team bios, and contact info; layout is Claude's discretion
   - What's unclear: Are team bios sourced from the `contributors` collection or hard-coded?
   - Recommendation: Source from the `contributors` collection — data already exists there. Avoids duplication.

4. **`purchase_url` fallback for editions without a URL**
   - What we know: `purchase_url` is optional in the schema; Edition 1 sample content may not have it
   - What's unclear: What should the buy CTA say/do when no URL exists?
   - Recommendation: Hide the buy button entirely when `purchase_url` is absent, or show a disabled state with "Available soon". The user specified "honest, not gimmick" — hiding is cleaner than a broken link.

---

## Sources

### Primary (HIGH confidence)
- `https://docs.astro.build/en/guides/content-collections/` — getCollection, getEntry, getEntries, getStaticPaths patterns, ID structure, reference resolution
- `https://docs.astro.build/en/reference/modules/astro-content/` — API signatures, render function, filter callback
- `https://docs.astro.build/en/guides/routing/` — rest parameters for dynamic routes with slashes
- `https://docs.astro.build/en/guides/images/` — Image component, optional image handling
- `https://docs.astro.build/en/recipes/tailwind-rendered-markdown/` — @tailwindcss/typography with Tailwind v4 + Astro

### Secondary (MEDIUM confidence)
- `https://github.com/tailwindlabs/tailwindcss-typography` — `@plugin` directive for Tailwind v4 plugin registration

### Tertiary (LOW confidence)
- Web search results on mobile nav patterns — verified against Astro official docs for component/script patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all major libraries verified against official Astro and Tailwind docs
- Architecture: HIGH — ID structure, routing patterns, and content query patterns verified against official docs
- Pitfalls: HIGH — verified against Astro v5 migration guide and API reference (especially entry.id vs slug, render function change)
- Typography setup: HIGH — verified against official Astro recipe for Tailwind Typography

**Research date:** 2026-03-03
**Valid until:** 2026-06-03 (Astro releases frequently but Content Layer API is stable; Tailwind v4 plugin API stable)
