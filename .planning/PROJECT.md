# Ilhéu Magazine Website 2.0

## What This Is

A static website for Ilhéu Magazine — a biannual print publication featuring "conversations from the Atlantic," produced in the Azores. The site serves as the magazine's digital home: showcasing editions, publishing editorial content between releases, and enabling readers to purchase print copies. Hosted on Cloudflare Pages.

## Core Value

Visitors can discover what Ilhéu Magazine is, explore its content across editions, and buy the latest issue — all in a beautiful, magazine-worthy presentation.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Edition-centric homepage showcasing current and past editions
- [ ] Edition 2 landing page with theme, contributors, article previews, and purchase CTA
- [ ] Edition 1 content: mix of full articles, teasers/excerpts, and digital flipbook
- [ ] Special articles section: web exclusives, extended print cuts, and editorial pieces
- [ ] Purchase integration (3rd party embed — Stripe, Shopify, or similar; placeholder for now)
- [ ] About page (magazine mission, team, contact)
- [ ] Markdown-first content architecture (all content as .md files, theme/SSG decided separately)
- [ ] Static site output deployable to Cloudflare Pages
- [ ] English primary with some Portuguese content; optional translate button (Google Translate or similar)

### Out of Scope

- Full e-commerce store — purchase is via embedded 3rd party widget, not custom-built
- Mobile app — web only
- CMS or admin panel — content managed as markdown files
- Real-time features (comments, live chat) — static site
- Full bilingual i18n — not a translated mirror site, just occasional Portuguese articles + translate widget
- Custom design/theme — structure and content first, visual design decided later

## Context

- Ilhéu Magazine launched its first edition covering São Miguel, Azores — featuring interviews with Netflix scriptwriter Hugo Gonçales, architect Pedro Borges, and ceramic artist Hun-Chung Lee
- Edition 2 is launching now — this website redesign coincides with that launch
- The current site (ilheumagazine.com) has an elegant minimal style with Cardo/Inter fonts, a teaser flipbook, and a shop link
- Content (articles, images, bios) is mostly ready and can be provided during build
- The magazine serves an international English-speaking audience interested in Atlantic culture, architecture, literature, environment, and art

## Constraints

- **Hosting**: Cloudflare Pages — must be fully static (no server-side rendering at runtime)
- **Content format**: All content authored as Markdown files — SSG/theme layer wraps these into HTML
- **Design**: Deferred — build content structure first, apply visual theme later. Must eventually look beautiful and magazine-worthy
- **Store**: 3rd party embed (Stripe, Shopify, etc.) — decision deferred, build with placeholder
- **SSG**: No preference yet — will be chosen based on what fits best for a content-heavy magazine site

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Markdown-first content | Decouples content from presentation; allows theme changes without rewriting content | — Pending |
| Static hosting on Cloudflare Pages | Simple, fast, cheap, no server management | — Pending |
| 3rd party store embed | Avoid building e-commerce; focus on content | — Pending |
| Design deferred | Ship structure first, beautiful design later | — Pending |
| SSG choice deferred | Pick after content structure is defined | — Pending |

---
*Last updated: 2026-03-02 after initialization*
