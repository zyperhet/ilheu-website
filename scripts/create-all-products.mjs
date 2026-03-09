#!/usr/bin/env node

// One-shot script: creates all products in Stripe and updates local files.
// Run: node scripts/create-all-products.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { env, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load .env
const envFile = await readFile(join(ROOT, '.env'), 'utf-8');
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  if (!env[key]) env[key] = val;
}

const KEY = env.STRIPE_SECRET_KEY;
if (!KEY) { console.error('No STRIPE_SECRET_KEY'); exit(1); }

async function stripe(path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(KEY + ':')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Stripe error on ${path}:`, data.error?.message);
    exit(1);
  }
  return data;
}

// Shipping countries
const COUNTRIES = [
  'PT','BR','AO','MZ','CV','GW','ST','TL',
  'US','CA',
  'GB','IE','FR','BE','NL','LU','MC',
  'DE','AT','CH','LI',
  'ES','IT','GR','MT','CY','AD','SM','VA',
  'SE','DK','NO','FI','IS',
  'PL','CZ','SK','HU','RO','BG','HR','SI','EE','LV','LT',
  'RS','ME','BA','MK','AL','XK',
  'MO',
];

async function createProduct({ name, description, price, currency }) {
  console.log(`\n--- ${name} ---`);

  // 1. Product
  const prodBody = { name };
  if (description) prodBody.description = description;
  const product = await stripe('/products', prodBody);
  console.log(`  Product: ${product.id}`);

  // 2. Price
  const priceObj = await stripe('/prices', {
    product: product.id,
    unit_amount: String(Math.round(price * 100)),
    currency,
  });
  console.log(`  Price: ${priceObj.id}`);

  // 3. Payment Link
  const linkBody = {
    'line_items[0][price]': priceObj.id,
    'line_items[0][quantity]': '1',
    'line_items[0][adjustable_quantity][enabled]': 'true',
    'line_items[0][adjustable_quantity][minimum]': '1',
    'line_items[0][adjustable_quantity][maximum]': '10',
  };
  COUNTRIES.forEach((code, i) => {
    linkBody[`shipping_address_collection[allowed_countries][${i}]`] = code;
  });
  const link = await stripe('/payment_links', linkBody);
  console.log(`  Payment Link: ${link.url}`);

  return {
    stripe_product_id: product.id,
    stripe_price_id: priceObj.id,
    stripe_payment_link: link.url,
  };
}

// Define the products to create
const products = [
  { id: 'edition-1', type: 'edition', name: 'Ilhéu Magazine — Issue A: São Miguel', description: 'Island of Origins. Limited print edition.', price: 18.00, currency: 'eur', edition_number: 1 },
  { id: 'edition-2', type: 'edition', name: 'Ilhéu Magazine — Issue B: The Nine', description: 'Across the Archipelago. Limited print edition.', price: 18.00, currency: 'eur', edition_number: 2 },
  { id: 'ilheu-tshirt', type: 'merch', name: 'Ilhéu T-Shirt', description: '100% organic cotton, screen-printed logo.', price: 28.00, currency: 'eur' },
  { id: 'ilheu-tote-bag', type: 'merch', name: 'Ilhéu Tote Bag', description: 'Heavy-duty canvas tote with magazine artwork.', price: 22.00, currency: 'eur' },
  { id: 'poster-edition-2', type: 'merch', name: 'Issue B Cover Poster', description: 'A2 giclée print of the Issue B cover artwork.', price: 35.00, currency: 'eur' },
];

const results = [];
const editionLinks = {};

for (const p of products) {
  const stripeData = await createProduct(p);
  const now = new Date().toISOString();

  if (p.type === 'edition') {
    editionLinks[p.edition_number] = stripeData.stripe_payment_link;
    results.push({
      id: p.id, type: p.type, name: p.name, description: p.description,
      price: p.price, currency: p.currency,
      ...stripeData, shipping: true, created_at: now,
    });
  } else {
    results.push({
      id: p.id, type: p.type, name: p.name, description: p.description,
      price: p.price, currency: p.currency, image: null,
      ...stripeData, shipping: true, active: true, created_at: now,
    });
  }
}

// Save products.json
const productsFile = join(ROOT, 'src/data/products.json');
await writeFile(productsFile, JSON.stringify(results, null, 2) + '\n');
console.log('\nSaved src/data/products.json');

// Update edition frontmatter
for (const [num, url] of Object.entries(editionLinks)) {
  const filePath = join(ROOT, `content/editions/edition-${num}/index.md`);
  let content = await readFile(filePath, 'utf-8');
  if (content.includes('purchase_url:')) {
    content = content.replace(/^purchase_url:.*$/m, `purchase_url: "${url}"`);
  } else {
    const parts = content.split('---');
    parts[1] = parts[1].trimEnd() + `\npurchase_url: "${url}"\n`;
    content = parts.join('---');
  }
  await writeFile(filePath, content);
  console.log(`Updated edition-${num} frontmatter with purchase_url`);
}

console.log('\nAll done!');
