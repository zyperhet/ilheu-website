---
status: testing
phase: 02-core-pages
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md]
started: 2026-03-03T16:50:00Z
updated: 2026-03-03T16:50:00Z
---

## Current Test

number: 1
name: Navigation bar and logo
expected: |
  ILHÉU logo centered at top of every page (Cardo serif, uppercase, tracked). Below it: 4 nav links — Editions, Articles, Shop, About — evenly spaced. The current page's link should appear bold/underlined.
awaiting: user response

## Tests

### 1. Navigation bar and logo
expected: ILHÉU logo centered at top (Cardo serif, uppercase, tracked). 4 nav links below: Editions, Articles, Shop, About. Current page link appears bold/underlined.
result: [pending]

### 2. Mobile hamburger menu
expected: At mobile width (~375px), nav links collapse behind a hamburger icon. Tapping it reveals the 4 links vertically. Tapping again closes them.
result: [pending]

### 3. Homepage hero section
expected: Homepage (/) shows Edition 2 with large "Across the Archipelago" heading in navy blue (#1B3A5C), "The Nine" subtitle, and a navy blue cover placeholder. Desktop: text left, cover right. Mobile: stacked.
result: [pending]

### 4. Homepage featured article
expected: Below the hero, a gray background section shows "FROM THIS EDITION", then "The Middle of Everything" heading, an excerpt, and "By João Medeiros" with a link.
result: [pending]

### 5. Homepage archive preview
expected: "Past Editions" section with Edition 1 "São Miguel" shown as a card with green (#2D5F3E) cover placeholder. "View all editions" link in the top right.
result: [pending]

### 6. Editions archive page
expected: /editions shows both editions as cards in a grid, newest first (Edition 2 before Edition 1). Each card has a colored cover placeholder, edition number, title, and theme.
result: [pending]

### 7. Edition detail page
expected: /editions/edition-2 shows "Across the Archipelago" theme hero, 3 articles listed (Nine Islands, The Middle of Everything, After the Silence), 3 contributors with initial circles and roles, and "← All editions" back link.
result: [pending]

### 8. Full article reading
expected: /articles/edition-1/articles/hugo-goncales-interview shows a full article with Cardo headings, prose-styled body text in a ~65ch column, author/edition/date metadata, and back navigation to the parent edition.
result: [pending]

### 9. Teaser article with print CTA
expected: /articles/edition-2/articles/joao-medeiros-essay shows article content then a clean horizontal line separator with "Read the full piece in print." text and a link/CTA to the edition.
result: [pending]

### 10. About page
expected: /about shows "About Ilhéu" heading, 3 paragraphs of mission text, "The People Behind Ilhéu" section with all 6 contributors (initial circles, names, roles, bios), and "Get in Touch" with email and Instagram.
result: [pending]

### 11. Articles index page
expected: /articles lists all 6 articles grouped by edition (newest edition first). Each article shows title (linked), author name, and excerpt.
result: [pending]

### 12. Shop page
expected: /shop shows a placeholder/coming-soon page — not a 404. When editions have purchase URLs, they should appear here.
result: [pending]

### 13. Footer on every page
expected: Every page has a footer with "ILHÉU" (Cardo, uppercase), "A biannual magazine from the Azores", and "© 2026 Ilhéu Magazine. All rights reserved."
result: [pending]

## Summary

total: 13
passed: 0
issues: 0
pending: 13
skipped: 0

## Gaps

[none yet]
