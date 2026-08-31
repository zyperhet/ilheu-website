// Campaign attribution tag construction.
//
// Kept separate from the DOM wiring in Attribution.astro so the tag format can
// be tested directly. Every function here is pure.
//
// The invariant that matters: whatever a campaign URL throws at us, the
// resulting reference must match /^[A-Za-z0-9_-]{1,200}$/. Stripe silently
// discards the entire client_reference_id if a single character falls outside
// that set — no error, no warning, the field simply arrives null and the sale
// becomes unattributable. See docs/tracking-plan-v2.md.

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type Attribution = Partial<Record<UtmKey, string>> & { fbclid?: string };

/** Stripe's hard ceiling for client_reference_id. */
export const MAX_REFERENCE_LENGTH = 200;

const FIELD_LIMITS = { source: 12, campaign: 24, content: 16, page: 24 } as const;

/**
 * Reduce an arbitrary string to Stripe's accepted character set.
 *
 * Truncation happens before the trailing separator is stripped, so a value cut
 * mid-word cannot leave a dangling '-'. Returns 'none' rather than an empty
 * string so the reference keeps a fixed field count and stays splittable.
 */
export function scrub(value: unknown, max: number): string {
  const cleaned = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, max)
    .replace(/^-+|-+$/g, '');
  return cleaned || 'none';
}

/** Collapse a pathname to a single field. '/' becomes 'home'. */
export function pageSlug(pathname: string): string {
  const trimmed = String(pathname ?? '').replace(/^\/+|\/+$/g, '');
  return trimmed ? scrub(trimmed, FIELD_LIMITS.page) : 'home';
}

/** Pull campaign parameters out of a query string. Returns null if none are present. */
export function readAttribution(search: string): Attribution | null {
  const params = new URLSearchParams(search);
  const found: Attribution = {};
  let any = false;

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      found[key] = value;
      any = true;
    }
  }

  // Meta's own click identifier. Unlike a campaign name it is immutable, so
  // renaming a campaign in Ads Manager cannot orphan the data.
  const fbclid = params.get('fbclid');
  if (fbclid) {
    found.fbclid = fbclid;
    any = true;
  }

  return any ? found : null;
}

/**
 * Build the reference: source_campaign_content_page_random.
 *
 * '_' separates fields and never appears inside one, so the reference splits
 * unambiguously when read back off the Checkout Session. `random` is injected
 * rather than generated here to keep this pure.
 */
export function buildReference(
  attribution: Attribution | null,
  pathname: string,
  random: string,
): string {
  const source = attribution?.utm_source
    ? scrub(attribution.utm_source, FIELD_LIMITS.source)
    : attribution?.fbclid
      ? 'meta'
      : 'direct';

  return [
    source,
    scrub(attribution?.utm_campaign, FIELD_LIMITS.campaign),
    scrub(attribution?.utm_content, FIELD_LIMITS.content),
    pageSlug(pathname),
    scrub(random, 8),
  ].join('_');
}

/**
 * Decide which attribution applies to the current page view.
 *
 * The live URL wins over anything stored. A visitor arriving on a tagged link
 * carries their campaign in the query string, and that is readable even when
 * sessionStorage throws — private browsing, and some in-app browsers, block it.
 * Reading storage first would silently downgrade exactly those visitors to
 * 'direct', which is the failure mode hardest to notice after the fact.
 */
export function resolveAttribution(
  search: string,
  stored: Attribution | null,
): Attribution | null {
  return readAttribution(search) ?? stored;
}
