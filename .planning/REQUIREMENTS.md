# Requirements: Ilhéu Magazine Website 2.0

**Defined:** 2026-03-02
**Core Value:** Visitors can discover what Ilhéu Magazine is, explore its content across editions, and buy the latest issue — all in a beautiful, magazine-worthy presentation.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Editions & Navigation

- [x] **EDIT-01**: Homepage showcases current edition with hero image, cover, and buy CTA
- [x] **EDIT-02**: Homepage features one article as editorial highlight
- [x] **EDIT-03**: Edition archive page lists all editions with cover thumbnails and themes
- [x] **EDIT-04**: Individual edition page shows theme, cover, contributors, article list, and buy link
- [ ] **EDIT-05**: Edition pages have per-edition colour accents reflecting print identity
- [ ] **EDIT-06**: Digital flipbook embed on Edition 1 page (and Edition 2 when available)
- [x] **NAV-01**: Persistent navigation with 4-6 items (editions, articles, shop, about)

### Content & Articles

- [x] **CONT-01**: Article pages render Markdown/MDX with readable typography and image support
- [x] **CONT-02**: Articles support multiple types: full, teaser/excerpt, web-exclusive, editorial, extended-cut
- [ ] **CONT-03**: Web-exclusive content section ("Between Editions" or similar)
- [ ] **CONT-04**: Contributor profile pages with bio, photo, and linked articles

### Commerce & Engagement

- [ ] **COMM-01**: Purchase CTA via 3rd party embed (Stripe/Shopify/Gumroad — placeholder OK)
- [ ] **COMM-02**: Newsletter signup embed (Mailchimp/ConvertKit/Buttondown)
- [ ] **COMM-03**: Google Translate widget or similar for optional PT translation
- [ ] **COMM-04**: Social links (Instagram, email) in footer and/or about page

### Foundation & Technical

- [x] **TECH-01**: All content authored as Markdown/MDX files with structured frontmatter schema
- [x] **TECH-02**: Static site built with Astro (or chosen SSG) deployable to Cloudflare Pages
- [x] **TECH-03**: Mobile-first responsive design (designed for 375px+, enhanced for tablet and desktop)
- [ ] **TECH-04**: Optimised images (build-time processing, responsive images)
- [x] **TECH-05**: About page with mission, team bios, and contact info

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Discovery & Archive

- **DISC-01**: Search across articles and editions (when archive grows to 5+ editions)
- **DISC-02**: Related articles suggestions (manual frontmatter links initially)

### Contributor Experience

- **CTRB-01**: Contributor portfolio pages with external links and full bio

### Moderation & Admin

- **ADMN-01**: Content preview workflow before deploy

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom e-commerce / cart | Overkill for 1-2 SKUs; use 3rd party embed |
| CMS / admin panel | Content team is small; Markdown files in repo suffice |
| User accounts / subscriptions | No subscription model; defer to Shopify/Substack if needed |
| Comments / community features | Spam risk, moderation burden; use Instagram for community |
| Real-time features | Static site on Cloudflare Pages; no server runtime |
| Full i18n (translated mirror) | Doubles content maintenance; Google Translate covers needs |
| Dark mode | Engineering cost not justified; one well-crafted theme |
| Paywalled content | Model is sell print, not gate digital content |
| Search (v1) | Low ROI at 2 editions; browser Cmd+F is sufficient |
| Infinite scroll | Disorienting for editorial; readers need orientation |
| Push notifications | Intrusive; mismatched with biannual rhythm |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EDIT-01 | Phase 2 | Complete |
| EDIT-02 | Phase 2 | Complete |
| EDIT-03 | Phase 2 | Complete |
| EDIT-04 | Phase 2 | Complete |
| EDIT-05 | Phase 5 | Pending |
| EDIT-06 | Phase 3 | Pending |
| NAV-01 | Phase 2 | Complete |
| CONT-01 | Phase 2 | Complete |
| CONT-02 | Phase 2 | Complete |
| CONT-03 | Phase 4 | Pending |
| CONT-04 | Phase 5 | Pending |
| COMM-01 | Phase 3 | Pending |
| COMM-02 | Phase 4 | Pending |
| COMM-03 | Phase 3 | Pending |
| COMM-04 | Phase 4 | Pending |
| TECH-01 | Phase 1 | Complete |
| TECH-02 | Phase 1 | Complete |
| TECH-03 | Phase 2 | Complete |
| TECH-04 | Phase 5 | Pending |
| TECH-05 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 after roadmap creation*
