#!/usr/bin/env node

// Restore shipping options to the current Issue B (€15) payment link.
//
// Background: commit 6c5722d repointed the site to a hand-made €15 payment
// link (eVq7…) that carried NO shipping options, so checkout stopped charging
// postage. Stripe Payment Links cannot be patched to add shipping_options, so
// this script mints a NEW €15 link that carries the four shipping rates below
// + address collection, repoints the local data at it, and deactivates the
// stale magazine links — while preserving the unrelated concert link.
//
// Shipping rates (Jul 2026): Pickup €0 / Portugal €2 / Europe €2 / World €5.
// Stripe shipping-rate amounts are immutable, so rates are matched by
// display_name + amount and created only when a match doesn't already exist.
// The USA is intentionally NOT in the allowed-countries list (we can no longer
// ship there).
//
// Needs a live key with payment_links:write and shipping_rates:write.
// Safe to re-run: it reuses matching rates and always creates a fresh link.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- Load .env (same pattern as the other Stripe scripts) ---
try {
  const envRaw = await readFile(join(ROOT, '.env'), 'utf-8');
  for (const line of envRaw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) {
  console.error('STRIPE_SECRET_KEY not set');
  process.exit(1);
}
if (!KEY.startsWith('sk_live_') && !KEY.startsWith('rk_live_')) {
  console.error('This script is for live keys only (sk_live_ or rk_live_). Got:', KEY.slice(0, 12) + '...');
  process.exit(1);
}

async function stripe(method, path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${btoa(KEY + ':')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Stripe error (${res.status}):`, data.error?.message);
    process.exit(1);
  }
  return data;
}

const QUANTITY_MAX = 99;
const CUSTOM_MESSAGE =
  'Thank you for ordering Ilhéu Magazine. ' +
  'If you selected pickup in Ponta Delgada, please email ' +
  'contact@ilheumagazine.com to arrange a time. ' +
  'Shipped orders go out within 3 business days.';

// The Romeu Bairos concert-ticket link is a different product — never touch it.
const CONCERT_LINK_SLUG = 'aFacN7boegr7biI2MbfMA04';

// Desired shipping rates. `display_name` is what the buyer sees at checkout;
// `short` is the label stored in src/data/shipping.json. Amounts are in cents.
const RATES = [
  { key: 'pickup',   display_name: 'Collect in Ponta Delgada — Azores only (free)', short: 'Pickup (Ponta Delgada)', amount: 0 },
  { key: 'portugal', display_name: 'Portugal (including Azores & Madeira)',          short: 'Portugal',              amount: 200 },
  { key: 'europe',   display_name: 'Europe',                                          short: 'Europe',                amount: 200 },
  { key: 'world',    display_name: 'Rest of World',                                   short: 'Rest of World',         amount: 500 },
];

// --- Load local data ---
const productsFile = join(ROOT, 'src/data/products.json');
const shippingFile = join(ROOT, 'src/data/shipping.json');
const editionFile = join(ROOT, 'content/editions/edition-2/index.md');

const products = JSON.parse(await readFile(productsFile, 'utf-8'));

const issueB = products.find((p) => p.id === 'edition-2');
if (!issueB) {
  console.error('No edition-2 entry in products.json');
  process.exit(1);
}

const PRICE_ID = issueB.stripe_price_id;
if (!PRICE_ID) {
  console.error('edition-2 has no stripe_price_id in products.json');
  process.exit(1);
}

console.log('Local state:');
console.log('  Price (€15):  ', PRICE_ID);
console.log('  Current link: ', issueB.stripe_payment_link);

// --- 1. Find or create the four shipping rates ---
console.log('\n1. Resolving shipping rates (reuse by name+amount, else create)...');
const existingRates = (await stripe('GET', '/shipping_rates?active=true&limit=100')).data;
const resolved = {};
for (const spec of RATES) {
  let rate = existingRates.find(
    (r) =>
      r.display_name === spec.display_name &&
      r.fixed_amount?.amount === spec.amount &&
      r.fixed_amount?.currency === 'eur',
  );
  if (rate) {
    console.log(`   Reusing  ${spec.key.padEnd(8)} ${rate.id}  €${(spec.amount / 100).toFixed(2)}`);
  } else {
    rate = await stripe('POST', '/shipping_rates', {
      display_name: spec.display_name,
      type: 'fixed_amount',
      'fixed_amount[amount]': String(spec.amount),
      'fixed_amount[currency]': 'eur',
    });
    console.log(`   Created  ${spec.key.padEnd(8)} ${rate.id}  €${(spec.amount / 100).toFixed(2)}`);
  }
  resolved[spec.key] = rate;
}

// --- 2. Create the new payment link with shipping ---
console.log('\n2. Creating new €15 payment link with shipping options...');

// Allowed shipping destinations. NOTE: US is intentionally excluded.
const countries = [
  'PT', 'BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL',
  'CA',
  'GB', 'IE', 'FR', 'BE', 'NL', 'LU', 'MC',
  'DE', 'AT', 'CH', 'LI',
  'ES', 'IT', 'GR', 'MT', 'CY', 'AD', 'SM', 'VA',
  'SE', 'DK', 'NO', 'FI', 'IS',
  'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI',
  'EE', 'LV', 'LT',
  'RS', 'ME', 'BA', 'MK', 'AL', 'XK',
  'MO',
];

const linkBody = {
  'line_items[0][price]': PRICE_ID,
  'line_items[0][quantity]': '1',
  'line_items[0][adjustable_quantity][enabled]': 'true',
  'line_items[0][adjustable_quantity][minimum]': '1',
  'line_items[0][adjustable_quantity][maximum]': String(QUANTITY_MAX),
  'shipping_options[0][shipping_rate]': resolved.pickup.id,
  'shipping_options[1][shipping_rate]': resolved.portugal.id,
  'shipping_options[2][shipping_rate]': resolved.europe.id,
  'shipping_options[3][shipping_rate]': resolved.world.id,
  'after_completion[type]': 'hosted_confirmation',
  'after_completion[hosted_confirmation][custom_message]': CUSTOM_MESSAGE,
};
countries.forEach((code, i) => {
  linkBody[`shipping_address_collection[allowed_countries][${i}]`] = code;
});

const paymentLink = await stripe('POST', '/payment_links', linkBody);
console.log(`   New payment link: ${paymentLink.url}`);

// --- 3. Deactivate stale magazine links (preserve the concert link) ---
console.log('\n3. Deactivating stale magazine payment link(s)...');
const allLinks = await stripe('GET', '/payment_links?limit=100');
let deactivated = 0;
for (const link of allLinks.data) {
  if (link.id === paymentLink.id) continue;
  if (!link.active) continue;
  if (link.url.includes(CONCERT_LINK_SLUG)) {
    console.log(`   Preserved (concert): ${link.url}`);
    continue;
  }
  await stripe('POST', `/payment_links/${link.id}`, { active: 'false' });
  console.log(`   Deactivated: ${link.id} (${link.url})`);
  deactivated++;
}
if (deactivated === 0) console.log('   (none to deactivate)');

// --- 4. Update products.json ---
console.log('\n4. Updating src/data/products.json...');
issueB.stripe_payment_link = paymentLink.url;
await writeFile(productsFile, JSON.stringify(products, null, 2) + '\n');

// --- 5. Update edition frontmatter ---
console.log('5. Updating content/editions/edition-2/index.md...');
let content = await readFile(editionFile, 'utf-8');
content = content.replace(/^purchase_url:.*$/m, `purchase_url: "${paymentLink.url}"`);
await writeFile(editionFile, content);

// --- 6. Rewrite src/data/shipping.json to the live rate set ---
console.log('6. Updating src/data/shipping.json...');
const shippingOut = {
  rates: RATES.map((spec) => ({
    id: resolved[spec.key].id,
    name: spec.short,
    amount: spec.amount,
    currency: 'eur',
  })),
};
await writeFile(shippingFile, JSON.stringify(shippingOut, null, 2) + '\n');

console.log('\n✓ Done.');
console.log(`   New payment link: ${paymentLink.url}`);
console.log(`   Shipping options: Pickup (free) / PT €2.00 / EU €2.00 / World €5.00`);
console.log(`   USA excluded from shipping destinations.`);
console.log(`   Price: €15  ·  Quantity max: ${QUANTITY_MAX}`);
console.log('\n   Next: commit the updated products.json, shipping.json and edition');
console.log('   frontmatter, rebuild, and deploy so the new link goes live.');
