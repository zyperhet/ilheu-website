#!/usr/bin/env node

// Creates the live Stripe product for Issue B:
// 1. Shipping rates (Portugal, Europe, Rest of World)
// 2. Product + Price (18 EUR)
// 3. Payment Link with shipping
// 4. Updates edition-2/index.md frontmatter
// 5. Updates products.json

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load .env
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
if (!KEY.startsWith('sk_live_')) {
  console.error('This script is for live keys only. Got:', KEY.slice(0, 12) + '...');
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

// --- 1. Shipping rates ---
console.log('\n1. Creating shipping rates...');

const shippingPT = await stripe('POST', '/shipping_rates', {
  display_name: 'Portugal (including Azores & Madeira)',
  type: 'fixed_amount',
  'fixed_amount[amount]': '500',
  'fixed_amount[currency]': 'eur',
  'delivery_estimate[minimum][unit]': 'business_day',
  'delivery_estimate[minimum][value]': '3',
  'delivery_estimate[maximum][unit]': 'business_day',
  'delivery_estimate[maximum][value]': '7',
});
console.log(`  Portugal: ${shippingPT.id}`);

const shippingEU = await stripe('POST', '/shipping_rates', {
  display_name: 'Europe',
  type: 'fixed_amount',
  'fixed_amount[amount]': '1200',
  'fixed_amount[currency]': 'eur',
  'delivery_estimate[minimum][unit]': 'business_day',
  'delivery_estimate[minimum][value]': '5',
  'delivery_estimate[maximum][unit]': 'business_day',
  'delivery_estimate[maximum][value]': '14',
});
console.log(`  Europe: ${shippingEU.id}`);

const shippingWorld = await stripe('POST', '/shipping_rates', {
  display_name: 'Rest of World',
  type: 'fixed_amount',
  'fixed_amount[amount]': '1800',
  'fixed_amount[currency]': 'eur',
  'delivery_estimate[minimum][unit]': 'business_day',
  'delivery_estimate[minimum][value]': '7',
  'delivery_estimate[maximum][unit]': 'business_day',
  'delivery_estimate[maximum][value]': '21',
});
console.log(`  Rest of World: ${shippingWorld.id}`);

// Save shipping rates
await writeFile(
  join(ROOT, 'src/data/shipping.json'),
  JSON.stringify({
    rates: [
      { id: shippingPT.id, name: 'Portugal', amount: 500, currency: 'eur' },
      { id: shippingEU.id, name: 'Europe', amount: 1200, currency: 'eur' },
      { id: shippingWorld.id, name: 'Rest of World', amount: 1800, currency: 'eur' },
    ],
  }, null, 2) + '\n'
);
console.log('  Saved to src/data/shipping.json');

// --- 2. Product + Price ---
console.log('\n2. Creating product & price...');

const product = await stripe('POST', '/products', {
  name: 'Ilhéu Magazine — Issue B: The Nine',
  description: 'Across the Archipelago. Limited print edition.',
});
console.log(`  Product: ${product.id}`);

const price = await stripe('POST', '/prices', {
  product: product.id,
  unit_amount: '1800',
  currency: 'eur',
});
console.log(`  Price: ${price.id}`);

// --- 3. Payment Link ---
console.log('\n3. Creating payment link...');

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
  'line_items[0][price]': price.id,
  'line_items[0][quantity]': '1',
  'line_items[0][adjustable_quantity][enabled]': 'true',
  'line_items[0][adjustable_quantity][minimum]': '1',
  'line_items[0][adjustable_quantity][maximum]': '3',
  'shipping_options[0][shipping_rate]': shippingPT.id,
  'shipping_options[1][shipping_rate]': shippingEU.id,
  'shipping_options[2][shipping_rate]': shippingWorld.id,
};
countries.forEach((code, i) => {
  linkBody[`shipping_address_collection[allowed_countries][${i}]`] = code;
});

const paymentLink = await stripe('POST', '/payment_links', linkBody);
console.log(`  Payment Link: ${paymentLink.url}`);

// --- 4. Update edition frontmatter ---
console.log('\n4. Updating edition-2/index.md...');

const editionFile = join(ROOT, 'content/editions/edition-2/index.md');
let content = await readFile(editionFile, 'utf-8');
content = content.replace(
  /^purchase_url:.*$/m,
  `purchase_url: "${paymentLink.url}"`
);
await writeFile(editionFile, content);
console.log('  Done.');

// --- 5. Update products.json ---
console.log('\n5. Updating products.json...');

const productsFile = join(ROOT, 'src/data/products.json');
const products = JSON.parse(await readFile(productsFile, 'utf-8'));
const existing = products.find(p => p.id === 'edition-2');
if (existing) {
  existing.stripe_product_id = product.id;
  existing.stripe_price_id = price.id;
  existing.stripe_payment_link = paymentLink.url;
  existing.created_at = new Date().toISOString();
} else {
  products.push({
    id: 'edition-2',
    type: 'edition',
    name: 'Ilhéu Magazine — Issue B: The Nine',
    description: 'Across the Archipelago. Limited print edition.',
    price: 18,
    currency: 'eur',
    stripe_product_id: product.id,
    stripe_price_id: price.id,
    stripe_payment_link: paymentLink.url,
    shipping: true,
    created_at: new Date().toISOString(),
  });
}
await writeFile(productsFile, JSON.stringify(products, null, 2) + '\n');
console.log('  Done.');

console.log(`\n✓ All done! Live payment link: ${paymentLink.url}\n`);
