# Feature Landscape

**Domain:** Independent print magazine website (culture/arts/editorial, biannual, small press)
**Researched:** 2026-03-02
**Confidence:** MEDIUM — Based on deep familiarity with independent magazine web conventions; external verification tools unavailable in this environment. Findings reflect consistent patterns across the independent magazine space (Monocle, Delayed Gratification, Riposte, Cereal, The Gentlewoman, Kinfolk, Atmos, etc.).

---

## Table Stakes

Features users expect. Missing = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Homepage showcasing current edition | First thing a visitor sees — sets identity and answers "what is this?" | Low | Hero section with cover image, edition number, theme/title, CTA to buy or explore |
| Edition archive / back issues listing | Readers want to see past work; shows the magazine has a history | Low | Grid or list of editions with cover thumbnails, dates, themes |
| Individual edition page | Readers need a dedicated page per edition: theme, contributors, article list, buy link | Medium | Includes cover art, edition description, contributors section, table of contents |
| Article reading experience | Web-exclusive content and excerpts need readable, distraction-free layouts | Medium | Good typography, appropriate line length, image support |
| About page | Establishes credibility, explains the project, humanises the team | Low | Mission statement, team bios/photos, contact info or email |
| Purchase / buy CTA | Primary revenue action — must be discoverable and low-friction | Low-Medium | Prominent button or embed; can be 3rd-party (Shopify, Stripe, Gumroad, etc.) |
| Mobile-responsive layout | Majority of discovery traffic is mobile; broken mobile = lost readers | Medium | Must work at 375px+ without horizontal scroll or tiny text |
| Fast page loads | Slow sites feel cheap; readers compare to editorial publications with prestige | Low-Medium | Optimised images, lean HTML/CSS, static hosting (Cloudflare Pages already planned) |
| Clear navigation | Readers need to find: editions, articles, shop, about | Low | Persistent nav bar with 4-6 items max |
| Social / contact links | Readers expect to find Instagram/social links and a contact email | Low | Footer or about page |
| Readable typography | Editorial publications live and die by type; bad fonts undermine credibility | Low | Serif body, considered scale, proper leading — matches print identity |

---

## Differentiators

Features that set the product apart from generic magazine sites. Not universally expected, but meaningfully raise quality or connection with readers.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Digital flipbook / PDF reader embed | Lets online readers experience the print magazine; bridges print and digital; unusual for small press | Medium | Existing site already has this for Edition 1; Issuu, Publit, or custom embed |
| Place-as-protagonist visual identity | Azores photography and geography as a design element — not just content, but aesthetic | Low-Medium | Full-bleed landscape photography, map elements, sense of island remoteness |
| Edition "themes" prominently featured | Biannual magazines with strong thematic focus (e.g., Issue 1: São Miguel) give each issue a distinct identity online | Low | Theme name, colour accent, or visual motif per edition page |
| Contributor profiles | Featuring writers, photographers, architects, artists gives the magazine a community dimension; readers follow contributors | Medium | Per-contributor page or bio card linking to their articles |
| Web-exclusive content section | Gives readers a reason to return between editions; builds audience beyond print subscribers | Medium | "Dispatches", "Online", or "Between Editions" section — separate from print excerpts |
| Newsletter signup | Highest-value direct channel; especially important for a biannual that needs to maintain presence between issues | Low-Medium | Email capture with Mailchimp/ConvertKit/Buttondown integration |
| Language / translation support | Bilingual content (English + Portuguese) serves local Azorean audience and Portuguese diaspora | Low | Google Translate widget or hreflang tags for Portuguese articles |
| Featured article on homepage | Beyond edition showcase — surfacing one article creates editorial voice and pull for content-first readers | Low | A "read now" feature slot on the homepage |
| Edition-specific colour palette or visual accent | High-end print magazines (Cereal, Kinfolk) carry each issue's visual identity into the web | Medium | Per-edition accent colour applied to edition pages — reinforces print identity |

---

## Anti-Features

Features to explicitly NOT build for Ilheu Magazine's scope, audience, and constraints.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Custom e-commerce / cart | Complex, security-sensitive, requires ongoing maintenance; overkill for a biannual selling 1-2 SKUs | Embed Shopify Buy Button, Gumroad widget, or Stripe Payment Link |
| CMS admin panel | Adds server-side complexity; content team is small and technical enough for Markdown | All content as Markdown files in the repo; deploy on commit |
| Comments / community features | Spam risk, moderation burden, adds JS weight; not expected for a print magazine | Link to social channels (Instagram) for community discussion |
| User accounts / subscriptions | Unnecessary complexity for a biannual that doesn't have a subscription model | If subscriptions ever added, defer to Shopify/Substack/etc. |
| Search | Low ROI at current content volume (2 editions, ~20-30 articles); adds complexity | Add when archive grows to 5+ editions; browser CMD+F covers short term |
| Related articles / recommendation engine | Overkill at small content scale; no ML/server infra available on static site | Manual "you might also like" links in article Markdown frontmatter |
| Live / real-time features | No server runtime on Cloudflare Pages static; contradicts project constraints | Out of scope by design |
| Full i18n (translated mirror site) | Doubles content maintenance burden; audience is primarily English-speaking | Google Translate widget for occasional PT articles; hreflang for PT-content pages |
| Infinite scroll | Creates disorientation in editorial contexts; readers should know where they are in a magazine | Pagination or explicit "load more" if ever needed |
| Paywalled content | Alienates discovery audience; Ilheu's model is sell the beautiful print object, not lock digital | Teasers/excerpts are fine, but don't gate web content behind payment |
| Push notifications | Intrusive; mismatched with a biannual publication rhythm | Email newsletter is the right channel |
| Dark mode toggle | Engineering cost not justified; magazine visual design is intentional — don't let users break it | Ship one well-crafted theme |

---

## Feature Dependencies

```
Edition archive page → Individual edition pages
Individual edition page → Article reading experience (articles linked from edition)
Contributor profiles → Articles (profiles linked from articles)
Web-exclusive content section → Article reading experience (same renderer)
Newsletter signup → (independent — 3rd party embed, no dependency)
Purchase CTA → 3rd party store (Shopify/Stripe/Gumroad — external dependency)
Digital flipbook → 3rd party embed (Issuu or equivalent — external dependency)
Language translation widget → (independent — Google Translate JS snippet)
Featured article on homepage → Article reading experience
```

Key structural dependency: **the article reading experience is the foundation**. Edition pages, contributor profiles, web exclusives, and homepage features all link into it. Get the article layout right first.

---

## MVP Recommendation

Prioritise these for launch of Website 2.0 (coinciding with Edition 2 release):

1. **Edition 2 landing page** — Theme, cover, contributors, article previews, purchase CTA. This is the launch moment.
2. **Edition archive** — Even with just 2 editions, show the history. Builds credibility.
3. **Article reading experience** — Needed for any edition content or web exclusives.
4. **About page** — Establishes the magazine's identity and voice.
5. **Purchase integration (3rd party embed)** — Revenue-critical; even a simple link beats nothing.
6. **Homepage with current edition hero + featured article** — First impression for all visitors.
7. **Newsletter signup** — Capture the audience you build at launch.

Defer (not blocking launch):
- **Contributor profile pages** — Bios on edition page are sufficient at launch; full profiles are a Phase 2 nice-to-have.
- **Digital flipbook for Edition 2** — Edition 1 flipbook can carry over; Edition 2 flipbook can follow if time-constrained.
- **Web-exclusive content section** — Valuable, but launch with edition content first; web exclusives can publish post-launch.
- **Language translation widget** — Low complexity, but skip if it slows launch; add in first post-launch update.
- **Edition-specific colour palettes** — Good-to-have but styling can be unified initially.

---

## Comparable Reference Sites

The following independent magazine sites represent strong patterns to study (knowledge-based, not verified against live sites):

- **Cereal Magazine** (cereal.co) — Edition-centric, minimal, photography-led, strong buy CTA
- **Kinfolk** (kinfolk.com) — Editorial-first, contributor-forward, clean reading experience
- **Atmos Magazine** (atmos.earth) — Place/environment focus, web exclusives alongside print, newsletter-heavy
- **Monocle** (monocle.com) — Archive-heavy, multi-product, good model for what complexity looks like at scale (avoid over-indexing on this)
- **Delayed Gratification** (slow-journalism.com) — Back issues prominent, edition identity strong, unpretentious e-commerce

---

## Sources

- Project context: `/Users/filipemoura/dev/ilheu/website-2.0/.planning/PROJECT.md`
- Domain knowledge: Patterns observed across independent magazine publishing websites (Cereal, Kinfolk, Atmos, Monocle, Riposte, The Gentlewoman) — MEDIUM confidence (training data, cutoff August 2025, not live-verified due to tool restrictions)
- External web research: Unavailable in this session (WebSearch and WebFetch tools restricted)

**Confidence note:** Core table stakes (edition pages, article reading, about page, purchase CTA, mobile responsiveness) are HIGH confidence — universally consistent patterns. Differentiators (flipbook, contributor profiles, web exclusives, newsletter) are MEDIUM confidence — common in quality independent magazines but not universal. Anti-features are HIGH confidence — project constraints explicitly exclude several (CMS, e-commerce, real-time).
