// Campaign tracking configuration.
//
// See docs/tracking-plan-v2.md for why attribution runs through Stripe's
// `client_reference_id` rather than through Meta's Pixel alone.

/**
 * Meta Pixel ID. Leave empty to disable the Pixel entirely — no Meta code is
 * emitted when this is blank, which is the safe default for a site that ships
 * without a consent banner.
 */
export const META_PIXEL_ID = '';

/**
 * Live Stripe Payment Link host. Any anchor pointing here is decorated with
 * campaign attribution on page load.
 */
export const STRIPE_LINK_HOST = 'buy.stripe.com';
