#!/usr/bin/env node

// Fix EU shipping: create new rate at 8.00, new payment link, deactivate old one.

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
if (!KEY) { console.error('STRIPE_SECRET_KEY not set'); process.exit(1); }

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

// Existing IDs
const OLD_PAYMENT_LINK_ID = 'plink_1TEUzFRsfkWOq7pPf1pFJtFM'; // will try to extract from URL
const PT_RATE = 'shr_1TEUzDRsfkWOq7pP9l9Do9m9';
const WORLD_RATE = 'shr_1TEUzERsfkWOq7pPcuuFC7qE';
const PRICE_ID = 'price_1TEUzFRsfkWOq7pPhb0lqQ4s';

// 1. Create new EU shipping rate at 8.00
console.log('1. Creating new Europe shipping rate (8.00 EUR)...');
const newEU = await stripe('POST', '/shipping_rates', {
  display_name: 'Europe',
  type: 'fixed_amount',
  'fixed_amount[amount]': '800',
  'fixed_amount[currency]': 'eur',
  'delivery_estimate[minimum][unit]': 'business_day',
  'delivery_estimate[minimum][value]': '5',
  'delivery_estimate[maximum][unit]': 'business_day',
  'delivery_estimate[maximum][value]': '14',
});
console.log(`  New EU rate: ${newEU.id}`);

// 2. Create new payment link
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
  'line_items[0][adjustable_quantity][maximum]': '3',
  'shipping_options[0][shipping_rate]': PT_RATE,
  'shipping_options[1][shipping_rate]': newEU.id,
  'shipping_options[2][shipping_rate]': WORLD_RATE,
};
countries.forEach((code, i) => {
  linkBody[`shipping_address_collection[allowed_countries][${i}]`] = code;
});

const paymentLink = await stripe('POST', '/payment_links', linkBody);
console.log(`  New payment link: ${paymentLink.url}`);

// 3. Deactivate old payment link
console.log('\n3. Deactivating old payment link...');
// List recent payment links to find the old one
const links = await stripe('GET', '/payment_links?limit=5');
for (const link of links.data) {
  if (link.id !== paymentLink.id && link.active) {
    await stripe('POST', `/payment_links/${link.id}`, { active: 'false' });
    console.log(`  Deactivated: ${link.id}`);
  }
}

// 4. Update shipping.json
console.log('\n4. Updating shipping.json...');
await writeFile(
  join(ROOT, 'src/data/shipping.json'),
  JSON.stringify({
    rates: [
      { id: PT_RATE, name: 'Portugal', amount: 500, currency: 'eur' },
      { id: newEU.id, name: 'Europe', amount: 800, currency: 'eur' },
      { id: WORLD_RATE, name: 'Rest of World', amount: 1800, currency: 'eur' },
    ],
  }, null, 2) + '\n'
);

// 5. Update edition frontmatter
console.log('5. Updating edition-2/index.md...');
const editionFile = join(ROOT, 'content/editions/edition-2/index.md');
let content = await readFile(editionFile, 'utf-8');
content = content.replace(/^purchase_url:.*$/m, `purchase_url: "${paymentLink.url}"`);
await writeFile(editionFile, content);

// 6. Update products.json
console.log('6. Updating products.json...');
const productsFile = join(ROOT, 'src/data/products.json');
const products = JSON.parse(await readFile(productsFile, 'utf-8'));
const ed2 = products.find(p => p.id === 'edition-2');
if (ed2) {
  ed2.stripe_payment_link = paymentLink.url;
}
await writeFile(productsFile, JSON.stringify(products, null, 2) + '\n');

console.log(`\n✓ Done! New payment link: ${paymentLink.url}\n`);
console.log('Shipping rates: PT 5.00 / EU 8.00 / World 18.00');
