#!/usr/bin/env node

// Add "Collect in Ponta Delgada" free shipping option and lift the
// adjustable-quantity cap from 3 to 99 (Stripe's hard max).
//
// Stripe Payment Links cannot be patched for line_items or shipping_options,
// so this script creates a NEW payment link and deactivates the old one.
//
// Idempotent: re-running won't duplicate the pickup shipping rate.

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

const PICKUP_DISPLAY_NAME = 'Collect in Ponta Delgada — Azores only (free)';
const QUANTITY_MAX = 99;
const CUSTOM_MESSAGE =
  'Thank you for ordering Ilhéu Magazine. ' +
  'If you selected pickup in Ponta Delgada, please email ' +
  'contact@ilheumagazine.com to arrange a time. ' +
  'Shipped orders go out within 3 business days.';

// --- Load existing local data ---
const productsFile = join(ROOT, 'src/data/products.json');
const shippingFile = join(ROOT, 'src/data/shipping.json');
const editionFile = join(ROOT, 'content/editions/edition-2/index.md');

const products = JSON.parse(await readFile(productsFile, 'utf-8'));
const shipping = JSON.parse(await readFile(shippingFile, 'utf-8'));

const issueB = products.find((p) => p.id === 'edition-2');
if (!issueB) {
  console.error('No edition-2 entry in products.json');
  process.exit(1);
}

const PRICE_ID = issueB.stripe_price_id;
const OLD_URL = issueB.stripe_payment_link;
const PT_RATE = shipping.rates.find((r) => r.name === 'Portugal')?.id;
const EU_RATE = shipping.rates.find((r) => r.name === 'Europe')?.id;
const WORLD_RATE = shipping.rates.find((r) => r.name === 'Rest of World')?.id;

if (!PRICE_ID || !PT_RATE || !EU_RATE || !WORLD_RATE) {
  console.error('Missing required IDs in local data files');
  process.exit(1);
}

console.log('Local state:');
console.log('  Price:        ', PRICE_ID);
console.log('  PT rate:      ', PT_RATE);
console.log('  EU rate:      ', EU_RATE);
console.log('  World rate:   ', WORLD_RATE);
console.log('  Old link URL: ', OLD_URL);

// --- 1. Find or create the pickup shipping rate ---
console.log('\n1. Finding/creating pickup shipping rate...');
const existingRates = await stripe('GET', '/shipping_rates?active=true&limit=100');
let pickupRate = existingRates.data.find(
  (r) => r.display_name === PICKUP_DISPLAY_NAME,
);

if (pickupRate) {
  console.log(`   Reusing existing rate: ${pickupRate.id}`);
} else {
  pickupRate = await stripe('POST', '/shipping_rates', {
    display_name: PICKUP_DISPLAY_NAME,
    type: 'fixed_amount',
    'fixed_amount[amount]': '0',
    'fixed_amount[currency]': 'eur',
  });
  console.log(`   Created rate: ${pickupRate.id}`);
}

// --- 2. Create the new payment link ---
console.log('\n2. Creating new payment link...');

const countries = [
  'PT', 'BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL',
  'US', 'CA',
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
  'shipping_options[0][shipping_rate]': pickupRate.id,
  'shipping_options[1][shipping_rate]': PT_RATE,
  'shipping_options[2][shipping_rate]': EU_RATE,
  'shipping_options[3][shipping_rate]': WORLD_RATE,
  'after_completion[type]': 'hosted_confirmation',
  'after_completion[hosted_confirmation][custom_message]': CUSTOM_MESSAGE,
};
countries.forEach((code, i) => {
  linkBody[`shipping_address_collection[allowed_countries][${i}]`] = code;
});

const paymentLink = await stripe('POST', '/payment_links', linkBody);
console.log(`   New payment link: ${paymentLink.url}`);

// --- 3. Deactivate any other active payment links ---
console.log('\n3. Deactivating old active payment link(s)...');
const allLinks = await stripe('GET', '/payment_links?limit=20');
let deactivated = 0;
for (const link of allLinks.data) {
  if (link.id !== paymentLink.id && link.active) {
    await stripe('POST', `/payment_links/${link.id}`, { active: 'false' });
    console.log(`   Deactivated: ${link.id} (${link.url})`);
    deactivated++;
  }
}
if (deactivated === 0) console.log('   (none to deactivate)');

// --- 4. Update shipping.json (prepend pickup, dedupe by id) ---
console.log('\n4. Updating src/data/shipping.json...');
const merged = [
  { id: pickupRate.id, name: 'Pickup (Ponta Delgada)', amount: 0, currency: 'eur' },
  ...shipping.rates,
];
const seen = new Set();
const dedupedRates = merged.filter((r) => {
  if (seen.has(r.id)) return false;
  seen.add(r.id);
  return true;
});
await writeFile(
  shippingFile,
  JSON.stringify({ rates: dedupedRates }, null, 2) + '\n',
);

// --- 5. Update products.json ---
console.log('5. Updating src/data/products.json...');
issueB.stripe_payment_link = paymentLink.url;
await writeFile(productsFile, JSON.stringify(products, null, 2) + '\n');

// --- 6. Update edition frontmatter ---
console.log('6. Updating content/editions/edition-2/index.md...');
let content = await readFile(editionFile, 'utf-8');
content = content.replace(/^purchase_url:.*$/m, `purchase_url: "${paymentLink.url}"`);
await writeFile(editionFile, content);

console.log('\n✓ Done.');
console.log(`   New payment link: ${paymentLink.url}`);
console.log(`   Shipping options: Pickup (free) / PT 5.00 / EU 8.00 / World 18.00`);
console.log(`   Quantity max: ${QUANTITY_MAX} (was 3)`);
