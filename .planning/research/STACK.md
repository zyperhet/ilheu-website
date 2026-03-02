# Technology Stack

**Project:** Ilhéu Magazine Website 2.0
**Researched:** 2026-03-02
**Research Mode:** Ecosystem — standard stack for static magazine/editorial website
**Verification Note:** Web search and WebFetch tools were unavailable during this session. All findings are based on training data (cutoff August 2025). Versions and current ecosystem positions should be verified against official docs before finalizing. Confidence levels reflect this constraint.

---

## Recommended Stack

### Core Framework (SSG)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro | 4.x (verify: astro.build/blog) | Static site generation, content routing, Markdown handling | Purpose-built for content-heavy sites; islands architecture means zero JS by default; native Markdown/MDX collection support; best-in-class for magazine-style content hierarchies |

**Why Astro over alternatives:**

- **Hugo**: Go-based, extremely fast build times, mature ecosystem for blogs/magazines. However, templating in Go HTML templates is limiting for custom layouts; less modern component model; harder to integrate React/Svelte components for interactive islands (e.g., commerce embed). Hugo would be a valid choice if build simplicity trumps component flexibility.
- **Next.js (static export)**: Mature, huge ecosystem, excellent image optimization. Overkill for a fully static site — SSR infrastructure bleeds into the mental model even on static export. React overhead for pages that are pure content is unnecessary. Cloudflare Pages has some friction with Next.js static export edge cases.
- **Eleventy (11ty)**: Excellent content-site heritage; very flexible. However, more manual configuration for content collections, image optimization requires plugins, and the ecosystem is smaller. Good fallback if Astro feels heavyweight.
- **Gatsby**: Declining adoption; heavy GraphQL layer adds complexity without benefit for Markdown files. Not recommended.
- **SvelteKit (static mode)**: Excellent, but less content-collection ergonomics than Astro. Better fit if there's significant interactivity.

**Astro strengths for Ilhéu specifically:**
- `content collections` with typed schemas — enforces frontmatter structure across articles, editions, contributors
- Built-in image optimization via `@astrojs/image` (Cloudflare-compatible at build time)
- Islands architecture: embed Stripe/Shopify widgets as reactive components without shipping JS to content pages
- Zero-JS by default — fast Time to First Byte, no hydration penalty on article pages
- First-class Cloudflare Pages support (`@astrojs/cloudflare` adapter)

**Confidence:** MEDIUM — Astro's position as the leading content-site SSG was well-established at training cutoff. Verify current version (4.x vs newer) at astro.build.

---

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 3.x (verify: tailwindcss.com) | Utility-first CSS for layout and typography | Magazine typography requires granular control; Tailwind + `@tailwindcss/typography` plugin handles prose perfectly |
| @tailwindcss/typography | Latest | Markdown prose rendering | Provides beautiful, magazine-appropriate defaults for long-form article text with one class (`prose`) |

**Why Tailwind over alternatives:**

- **Plain CSS / CSS Modules**: Perfectly valid for a magazine site and keeps styling close to the HTML. However, without design guidance yet ("design deferred"), Tailwind's utility classes allow rapid iteration. When a designer provides a system, Tailwind config maps directly to design tokens.
- **Styled Components / CSS-in-JS**: Not appropriate for a static Astro site — adds runtime JS unnecessarily.
- **Open Props / Vanilla CSS custom properties**: Elegant, but smaller ecosystem; requires more manual typography work.

**Confidence:** MEDIUM — Tailwind + typography plugin is the dominant choice for content sites at training cutoff. Verify version (v4 may be stable by now — it was in beta/RC in late 2024).

**Important:** Check if Tailwind v4 is production-stable as of research date. If so, use v4 (breaking changes from v3 in configuration approach). Do not mix v3 and v4 assumptions.

---

### Image Optimization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro built-in Image (`astro:assets`) | Bundled with Astro | Responsive images, WebP conversion, lazy loading | Native to Astro; no extra package needed; generates optimized images at build time; Cloudflare Pages serves them from CDN |

**Architecture note:** Because Cloudflare Pages is a static host (no runtime image resizing), all image optimization MUST happen at build time. Astro's `<Image />` component does this correctly. Do NOT use runtime image CDN approaches (Cloudinary, imgix) unless the content team needs to upload images without rebuilding the site — which is out of scope for a Markdown-file-managed site.

**Confidence:** HIGH — Astro's asset system handles build-time optimization well; this pattern is well-established.

---

### Content Architecture

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro Content Collections | Bundled with Astro | Typed, validated Markdown content schema | Defines the data shape for articles, editions, contributors; provides TypeScript safety and IDE autocompletion |
| MDX (via `@astrojs/mdx`) | Latest Astro integration | Rich Markdown with embedded components | Needed for flipbook embeds, purchase CTAs, photo essays — allows JSX components inside Markdown articles |

**Content collection structure recommendation:**

```
src/content/
  editions/         # Edition 1, Edition 2, etc.
    edition-1.md
    edition-2.md
  articles/         # All articles, linked to editions via frontmatter
    article-slug.mdx
  contributors/     # Author/photographer bios
    name-slug.md
  editorial/        # Web exclusives, blog posts, extended cuts
    post-slug.mdx
```

Each article frontmatter includes: `edition`, `author`, `type` (full/teaser/exclusive), `publishedDate`, `tags`, and `coverImage`.

**Confidence:** HIGH — This is the canonical Astro pattern for content-heavy sites.

---

### Commerce Embed

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Placeholder iframe / script tag | N/A | Purchase integration | Decision deferred per PROJECT.md; build placeholder that can be swapped with Stripe Payment Links, Shopify Buy Button, or similar |

**Evaluation note for when this decision is made:**

- **Stripe Payment Links**: Simplest option — redirect to hosted Stripe checkout. No embed, just a button linking to `buy.stripe.com/...`. Zero code, works everywhere. Best for low volume / simple SKUs (single print edition).
- **Shopify Buy Button (Storefront API embed)**: Adds a product widget to any static page. Shopify manages inventory, fulfillment, cart. One-time setup; JS snippet embed. More capable than Stripe Links but requires Shopify subscription.
- **Gumroad embed**: Dead-simple for digital/physical products; lower fees than Shopify; less brand control. Worth considering for a boutique magazine.
- **Lemon Squeezy**: Stripe-like simplicity with Gumroad-like features; growing adoption for indie publishers.

**Recommendation for Phase 1:** Use Stripe Payment Links (redirect, not embed) — zero complexity, easy to replace later. Build the CTA button to accept a configurable URL so the commerce provider can change without touching templates.

**Confidence:** HIGH for the placeholder approach. MEDIUM for specific provider recommendations (market conditions change).

---

### Flipbook Embed

| Technology | Purpose | Why |
|------------|---------|-----|
| FlipHTML5 / Issuu / Heyzine (existing provider) | Digital flipbook of print edition | Magazine-standard digital replica experience |

**Note:** The current site uses a flipbook already. Identify which provider it is and embed the same `<iframe>` or `<script>` tag in the new site. MDX makes this trivial — create a `<Flipbook url="..." />` component and drop it into the edition page.

**Confidence:** HIGH — embed pattern is straightforward; provider is pre-existing.

---

### Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Cloudflare Pages | N/A | Static hosting, CDN, CI/CD | Already decided; free tier is generous; global CDN; automatic HTTPS; git-push-to-deploy |
| `@astrojs/cloudflare` adapter | Latest | Astro-Cloudflare build integration | Ensures correct output format for Cloudflare Pages; not needed for pure static but good practice |

**Deployment configuration:**
- Build command: `astro build`
- Output directory: `dist`
- Node.js version: 20.x (LTS at time of writing — verify Cloudflare Pages current LTS support)

**Confidence:** HIGH — Cloudflare Pages + Astro is a well-documented, official integration.

---

### Translation (Optional)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Google Website Translator widget | N/A | One-click translate for Portuguese content | Client-side, zero backend required, free; embed script tag in layout; shows translation bar |

**Note:** Full i18n is out of scope. Google Translate widget is the lowest-friction approach for occasional Portuguese articles. Alternative: DeepL widget (higher quality translation). The widget is embedded in the Astro layout component as a `<script>` tag.

**Confidence:** MEDIUM — Google Translate widget API has had availability concerns in some periods; verify it's still free and embeddable.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| SSG | Astro 4.x | Hugo | Less flexible component model; Go templates limiting for rich magazine layouts |
| SSG | Astro 4.x | Next.js (static) | Overkill; React SSR mental model; unnecessary JS overhead |
| SSG | Astro 4.x | Eleventy | Valid backup; less content-collection ergonomics |
| SSG | Astro 4.x | Gatsby | Declining ecosystem; GraphQL overhead without benefit |
| Styling | Tailwind CSS | Plain CSS | Tailwind faster for iteration before final design is provided |
| Styling | Tailwind CSS | CSS-in-JS | Adds runtime JS; antithetical to static Astro |
| Images | Astro built-in | Cloudinary | Runtime CDN not needed; build-time optimization sufficient |
| Commerce | Placeholder / Stripe Links | Custom Stripe integration | No server to run; static site cannot process payments directly |

---

## Installation

```bash
# Create Astro project
npm create astro@latest ilheu-website -- --template minimal

# Add integrations
npx astro add mdx
npx astro add cloudflare
npx astro add tailwind

# Tailwind typography plugin
npm install -D @tailwindcss/typography
```

**Tailwind config (`tailwind.config.mjs`):**
```js
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  plugins: [require('@tailwindcss/typography')],
}
```

**Astro config (`astro.config.mjs`):**
```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  integrations: [mdx(), tailwind()],
});
```

---

## Versions to Verify Before Building

The following versions were current at training cutoff (August 2025) but MUST be confirmed before starting work:

| Package | Verify At | Risk |
|---------|-----------|------|
| `astro` | astro.build/blog | Major version may have changed; check migration guides |
| `tailwindcss` | tailwindcss.com | v4 may now be stable — breaking changes from v3 |
| `@tailwindcss/typography` | npmjs.com | May have v4 compatibility update |
| `@astrojs/cloudflare` | github.com/withastro/adapters | Cloudflare adapter is maintained separately from Astro core |
| Node.js on CF Pages | developers.cloudflare.com/pages | Verify supported Node.js versions |

---

## Sources

- Training data (August 2025 cutoff) — MEDIUM confidence overall
- Astro official docs: https://docs.astro.build (verify current)
- Cloudflare Pages framework guides: https://developers.cloudflare.com/pages/framework-guides/
- Tailwind CSS: https://tailwindcss.com
- Astro content collections: https://docs.astro.build/en/guides/content-collections/
- Astro + Cloudflare: https://docs.astro.build/en/guides/deploy/cloudflare/

**Note:** All URLs are provided for verification purposes. Web access was not available during this research session. The recommendations are grounded in well-established ecosystem patterns as of August 2025 and are unlikely to have changed radically, but version numbers and specific API surfaces must be confirmed.
