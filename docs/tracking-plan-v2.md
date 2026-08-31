# Ilhéu — tracking & acquisition plan, v2

Revised 17 Aug 2026, after adversarial review (Codex) and re-analysis of the live Stripe data.
Tags: `[KEPT]` unchanged · `[CHANGED]` materially revised · `[CUT]` removed · `[NEW]` added.

---

## What the re-analysis actually shows

Three corrections to the v1 evidence base. All from live-mode `acct_1T876JRsfkWOq7pP`.

**1. The conversion difference is real, but its cause is not identified.**
The 7% period (71 sessions, 5 paid) vs the 28% period (40 sessions, 11 paid) is statistically
solid — Fisher exact **p = 0.0048**. This is not noise. But three things changed at once between
those periods: shipping price fell to zero, the Payment Link was replaced, *and* German editorial
traffic arrived. Shipping is one of three candidate causes, not the established cause.
**The "~€225 lost at checkout" figure is not defensible and should not be repeated.**

**2. The German effect is much larger than v1 states, and it is sustained, not a spike.**
Weekly completed sessions, with buyer country from the charges:

| Week | Sessions | Paid | Rate | Buyers |
|---|---|---|---|---|
| W21 (18–24 May) | 3 | 0 | 0% | — |
| W22 (25–31 May) | 9 | 0 | 0% | — |
| **W23 (1–7 Jun)** | **24** | **4** | 17% | **DE ×4** ← Weekender |
| W24 (8–14 Jun) | 8 | 0 | 0% | — |
| W25 (15–21 Jun) | 13 | 3 | 23% | FR, PT, US |
| W26 (22–28 Jun) | 4 | 3 | 75% | US, DE ×2 |
| W27 (29 Jun–5 Jul) | 7 | 1 | 14% | DE |
| W28 (6–12 Jul) | 14 | 4 | 29% | DE ×2, BE, CH |
| W29 (13–19 Jul) | 6 | 2 | 33% | FR, DE |
| W30–W32 (20 Jul–9 Aug) | 10 | 0 | 0% | — |
| W33 (10–16 Aug) | 2 | 2 | 100% | FR, PT |

**11 of 19 online sales ever (58%) were to German-speaking buyers (DE + CH)**, spread across
six weeks from 5 June to 15 July. That is the decay curve of a print mention, not a spike.
One free editorial cross-promotion outsold everything else Ilhéu has ever done online, combined.

Critically: **the 5–7 June German buyers paid €18 and €26 — they paid shipping and bought anyway.**
Cold traffic in the same shipping regime (W21–W22, 12 sessions) converted at 0%. This suggests
shipping price suppresses *cold* traffic much more than *referred* traffic — a different and more
actionable conclusion than "lower the shipping."

**3. The revenue baseline mixes channels.**
Of 25 succeeded charges from 4 May–15 Aug, **5 are `card_present`** (four × €15 on 18 Jun, one
× €50 on 20 Jun) — in-person sales, ~€110. They create no Checkout Session. Any online conversion
or revenue figure that includes them is wrong.

**Also corrected:** v1 says "5 of 19 sales used Klarna and Link." Actual split of the 20 online
sales: card 9, **Link 6, Klarna 3, Amazon Pay 2** — **11 of 20 (55%) used a wallet or BNPL.**
Amazon Pay was not in v1 at all. Any checkout change that disturbs wallet availability is high-risk.

---

## Phase 0 — Economics `[NEW]` — blocks all spend

Nobody has computed what a sale is worth. Optimising cost-per-anything before this is meaningless.
This is the single largest omission in v1 and it is a spreadsheet, not a project.

Per destination zone (PT / EU / CH+UK / US / RoW), compute:
print cost per copy · packaging · actual postage paid · Stripe fee (incl. the higher rate on
Klarna/Amazon Pay) · VAT/IOSS handling · breakage and replacement rate.

Output: **contribution margin per order per zone → maximum allowable CAC per zone.**

Two decisions fall straight out of it:
- Whether a €15 magazine posted to the US can be sold direct at all, or only via a stockist.
- Whether €80 of Meta spend could ever pay for itself. If break-even needs an implausible number
  of orders, the honest answer is to spend €0 on Meta.

**Also in Phase 0:** get the *Weekender* publication date from Kathleen, plus any Meta spend history
and Ilhéu's own social/newsletter send dates. Without those, the June attribution stays a hypothesis.

---

## Phase 1 — Instrument `[KEPT, with fixes]`

The architecture survives review. `client_reference_id` on a Payment Link URL is documented to
attach to the Checkout Session and is readable via the API — verified against current Stripe docs
by both reviewers. UTMs reach only the redirect URL and do not persist on the Session; the
distinction v1 drew is correct.

1. **Attribution script** `[CHANGED]` — in `BaseLayout.astro`, so it covers every route at once.
   - Sanitise and truncate every component before building the tag. Stripe silently drops the
     *entire* `client_reference_id` if any character is invalid — a single `%20` from a UTM kills
     attribution with no error. `[NEW]`
   - Use **immutable Meta campaign/ad IDs**, not editable campaign names, with a local mapping file.
     Renaming a campaign in Ads Manager must not orphan the data. `[NEW]`
   - Accept that `sessionStorage` loses cross-device and returning-visitor attribution. Numbers
     under-count. `[KEPT]`

2. **`/thank-you` route** `[CHANGED]` — generic confirmation only. It must **not** claim "payment
   confirmed": a static page cannot verify the Session, the URL can be revisited, and it must never
   hold a Stripe key. Strip `session_id` from the URL before any analytics script sees it. `[NEW]`

3. **Payment Links → `after_completion: redirect`** `[KEPT]`

4. **One dedicated Payment Link per test cell** `[NEW]` — cheap redundancy. The Payment Link ID is
   on every Checkout Session, so if `client_reference_id` is dropped the cell is still identifiable.
   With only one or two cells this costs nothing.

5. **Verification matrix** `[CHANGED]` — v1's single test purchase is not enough. Must confirm:
   - **`client_reference_id` is present on `open` (abandoned) sessions, not only completed ones.**
     Stripe documents it on `checkout.session.completed`; presence on abandoned sessions is
     *undocumented*. The entire "cost per checkout start" metric depends on it. **Test by opening a
     tagged link and not paying.** `[NEW — highest-risk unknown in the plan]`
   - Instagram and Facebook in-app webviews, iOS and Android — query string survival is not
     guaranteed. `[NEW]`
   - Link, Klarna and Amazon Pay flows, since they are 55% of sales. `[NEW]`
   - Count sales by `payment_status: paid`, not by session completion; reconcile refunds. `[NEW]`

6. **Analytics** `[CHANGED]` — hosted Plausible (~€9/mo). Self-hosting is not free for a two-person
   team; it is maintenance you will not do.

7. **Housekeeping** `[NEW]` — `noindex` or remove the ~10 archived design-variant routes
   (`v1`–`v135`, `home-old`); they are live acquisition surfaces with stale pricing. And
   `products.json` still holds **test-mode** payment links for Issue A and all merch — dormant only
   because `active: false`. Flipping one flag would ship a test link to production.

### The Pixel decision `[CHANGED]`
v1's reasoning does not hold up. Its premise was that going Pixel-free avoids a consent banner —
but under EDPB Guidelines 2/2023 the `sessionStorage` attribution v1 proposes is itself arguably in
scope of ePrivacy Art 5(3), because it is marketing attribution, not strictly-necessary storage.
**The plan does not actually escape the banner question; it just stops measuring.**

However, Codex's counter — "no Pixel means no purchaser list ever" — is also wrong as stated: Meta
builds audiences from customer-list uploads and on-Meta engagement too, and 19 purchasers is far too
few to seed a useful lookalike regardless.

**Recommendation:** a minimal consent layer, with no Meta code before consent, then Pixel PageView +
buy-click. Do not upload the Stripe buyer list to Meta — fulfilment email is not advertising consent.
This is a judgement call about a small legal risk against a small measurement gain; if you would
rather ship bannerless and accept both the risk and the blind spot, say so and I will note it as a
decision rather than an oversight.

---

## Phase 2 — Fix the offer `[CHANGED]` (was "fix the leak")

1. **`[CUT]` The €15+€3 vs €18-free-shipping A/B test.** Two independent reasons. It holds the
   delivered total constant, so it tests framing only and cannot answer whether the delivered price
   is affordable. And at ~40 sessions/month a 50/50 split needs many hundreds of sessions per arm to
   resolve a plausible effect — the test cannot conclude within any relevant timeframe.

2. **`[NEW]` Publish the delivered price *before* the Buy button.** "€15 + €2 postage in Portugal
   and Europe, €5 rest of world — €17 delivered." If checkout shock is the suspected leak, moving
   the surprise to a cheaper tier is not the fix; removing the surprise is. Costs nothing, needs no
   test, and is the highest-confidence change available.

3. **`[CHANGED]` US shipping** — re-enable only if Phase 0 shows a US order is profitable.
   Otherwise publish a US interest form and approach a New Bedford bookseller or Azorean
   association about a bulk consignment. Two US buyers justify a stockist conversation, not an
   expensive direct-fulfilment lane.

4. **`[KEPT]` Checkout hygiene** — store policies and support contact in Stripe's checkout settings.
   Keep Link, Klarna **and Amazon Pay** enabled.

---

## Phase 3 — Spend `[CHANGED]` — €120, and most of it is not Meta

v1's six €20 campaigns are cut. At ~€3/day none would exit learning, and one creative per audience
confounds audience with creative — if Germany beat Portugal you could not tell whether the market or
the ad won. One CBO campaign with six ad sets does not fix it: learning is per-ad-set, and CBO
reallocates budget away from equal comparison by design.

The evidence says the best-performing channel Ilhéu has ever used was free editorial. Weight
accordingly:

- **€40 — four review copies, posted only to recipients who have agreed to consider coverage.**
  One *Weekender* follow-up, one other German/Swiss indie title, one New Bedford Azorean
  organisation or bookseller, one Portuguese cultural outlet. **Unique tagged link each.** This is
  the one channel with demonstrated results, and v1 treated it as a footnote.
- **€80 — one Meta test, or zero.** If Phase 0 clears it: one campaign, one ad set, Germany,
  ~€11/day for 7 days, two executions of the *same* proposition (so creative is not confounded
  with audience). Judge on paid orders and contribution after ad spend.
  **If the margin maths says break-even is implausible, spend it on more review copies instead.**
  Unspent budget beats six fabricated lessons.

**`[CUT]` "Cost per checkout start" as the primary metric.** Confirmed as noise at this volume: at
€20/cell, 3 vs 6 starts has a two-sided p of **0.51**, and 3 vs 8 gives **0.23**. The pre-committed
2× kill rule would fire on random variation roughly half the time. Checkout starts stay as a funnel
diagnostic; they do not decide anything.

**`[NEW]` Stopping rule that protects cash instead of pretending to pick winners:**
1. Max allowable CAC from Phase 0 contribution margin.
2. A fixed loss cap per cell, agreed up front.
3. Stop early *only* for broken tracking, or spend past the cap with no sale.
4. Do not scale unless paid-order CAC is under the ceiling **and** it repeats in a second period.
5. Do not rank checkout-start rates below ~20 starts per cell. Report counts, no ranking.
6. **"Inconclusive" is an expected, acceptable outcome.** Plan for it.

---

## Phase 4 — The loop `[KEPT, retimed]`

Monthly rather than fortnightly — fortnightly cycles at this volume read noise as signal. Join Meta
and Stripe on the tag, change one variable per cycle, re-verify tags still flow. Revisit CAPI and a
Cloudflare Function past ~30 sales/month.

---

## `[NEW]` What v1 missed entirely

- **Retention.** No newsletter, waitlist, or pre-order consent flow exists. Ilhéu is a biannual with
  a third issue coming; the ~19 existing buyers and the German readership that found Issue B are
  worth more than six cold audiences. This is probably higher-leverage than the entire ad budget.
- **Earned distribution as a repeatable system** rather than a one-off: partner links, agreed
  publication dates, review copies, reciprocal inserts, follow-up. The strongest signal in the data
  deserves a process.
- **Order reconciliation** — 19 completed sessions vs 24–25 charges. Now explained (in-person
  `card_present` sales), but it should be reconciled properly before any baseline is trusted.

---

## Open decisions for Filipe

1. **Consent layer + Pixel, or stay bannerless and blind?** (My recommendation: minimal consent
   layer. But it is your call on a small legal risk vs a small measurement gain.)
2. **Does Meta get €80, or does editorial get the whole €120?** Cannot be answered before Phase 0.
3. Phase 1 is agreed by every reviewer and does not depend on either. **It can start now.**
