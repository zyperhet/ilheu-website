#!/usr/bin/env node

// One-shot script: creates Stripe shipping rates, re-creates all payment links
// with shipping options and max qty 3, then updates local data files.
//
// Usage: node scripts/setup-shipping.mjs
// Requires: STRIPE_SECRET_KEY in .env or environment

import { readFile, writeFile } from 'node:fs/promises';
import { env, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PRODUCTS_FILE = join(ROOT, 'src/data/products.json');
const SHIPPING_FILE = join(ROOT, 'src/data/shipping.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadEnv() {
  try {
    const raw = await readFile(join(ROOT, '.env'), 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!env[key]) env[key] = val;
    }
  } catch {
    // no .env file
  }
}

async function stripe(method, path, body) {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('\nError: STRIPE_SECRET_KEY is not set.');
    console.error('Add it to .env or export it in your shell.\n');
    exit(1);
  }

  const url = `https://api.stripe.com/v1${path}`;
  const opts = {
    method,
    headers: {
      Authorization: `Basic ${btoa(key + ':')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  if (body) opts.body = new URLSearchParams(body).toString();

  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) {
    console.error(`\nStripe API error (${res.status}) on ${path}:`);
    console.error(data.error?.message || JSON.stringify(data, null, 2));
    exit(1);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Shipping address countries (same list as add-product.mjs)
// ---------------------------------------------------------------------------

const ALLOWED_COUNTRIES = [
  // Portuguese-speaking countries (CPLP)
  'PT', 'BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL',
  // North America
  'US', 'CA',
  // Western Europe
  'GB', 'IE', 'FR', 'BE', 'NL', 'LU', 'MC',
  // Central Europe
  'DE', 'AT', 'CH', 'LI',
  // Southern Europe
  'ES', 'IT', 'GR', 'MT', 'CY', 'AD', 'SM', 'VA',
  // Northern Europe
  'SE', 'DK', 'NO', 'FI', 'IS',
  // Eastern Europe
  'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI',
  'EE', 'LV', 'LT',
  // Balkans & others
  'RS', 'ME', 'BA', 'MK', 'AL', 'XK',
  // Macau
  'MO',
];

// ---------------------------------------------------------------------------
// Step 1 — Create shipping rates
// ---------------------------------------------------------------------------

const SHIPPING_DEFS = [
  {
    name: 'Portugal',
    amount: 500,
    min_days: 2,
    max_days: 4,
  },
  {
    name: 'Europe',
    amount: 800,
    min_days: 5,
    max_days: 10,
  },
  {
    name: 'Rest of World',
    amount: 1300,
    min_days: 10,
    max_days: 20,
  },
];

async function createShippingRates() {
  const rates = [];

  for (const def of SHIPPING_DEFS) {
    console.log(`Creating shipping rate: ${def.name} (€${(def.amount / 100).toFixed(2)})...`);
    const rate = await stripe('POST', '/shipping_rates', {
      display_name: def.name,
      type: 'fixed_amount',
      'fixed_amount[amount]': String(def.amount),
      'fixed_amount[currency]': 'eur',
      'delivery_estimate[minimum][unit]': 'business_day',
      'delivery_estimate[minimum][value]': String(def.min_days),
      'delivery_estimate[maximum][unit]': 'business_day',
      'delivery_estimate[maximum][value]': String(def.max_days),
    });
    console.log(`  Created: ${rate.id}`);
    rates.push({
      id: rate.id,
      name: def.name,
      amount: def.amount,
      currency: 'eur',
    });
  }

  return rates;
}

// ---------------------------------------------------------------------------
// Step 2 — Re-create payment links with shipping options
// ---------------------------------------------------------------------------

function buildPaymentLinkBody(priceId, shippingRateIds) {
  const body = {
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'line_items[0][adjustable_quantity][enabled]': 'true',
    'line_items[0][adjustable_quantity][minimum]': '1',
    'line_items[0][adjustable_quantity][maximum]': '3',
  };

  // Attach shipping options
  shippingRateIds.forEach((id, i) => {
    body[`shipping_options[${i}][shipping_rate]`] = id;
  });

  // Shipping address collection
  ALLOWED_COUNTRIES.forEach((code, i) => {
    body[`shipping_address_collection[allowed_countries][${i}]`] = code;
  });

  return body;
}

async function deactivatePaymentLink(url) {
  // Extract the payment link ID from the URL to deactivate it.
  // Stripe payment link URLs look like: https://buy.stripe.com/test_XXXXX
  // We need to list payment links and find the matching one, or use the API.
  // Actually, we can list payment links and match by URL.
  const list = await stripe('GET', '/payment_links?limit=100');
  const link = list.data.find((l) => l.url === url);
  if (link) {
    console.log(`  Deactivating old link ${link.id}...`);
    await stripe('POST', `/payment_links/${link.id}`, { active: 'false' });
  }
}

// ---------------------------------------------------------------------------
// Step 3 — Update local files
// ---------------------------------------------------------------------------

async function updateEditionFrontmatter(editionNumber, paymentLinkUrl) {
  const filePath = join(ROOT, 'content/editions', `edition-${editionNumber}`, 'index.md');

  let content;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch {
    console.error(`  Warning: Could not find ${filePath}`);
    return;
  }

  if (content.includes('purchase_url:')) {
    content = content.replace(
      /^purchase_url:.*$/m,
      `purchase_url: "${paymentLinkUrl}"`
    );
  } else {
    const parts = content.split('---');
    if (parts.length >= 3) {
      parts[1] = parts[1].trimEnd() + `\npurchase_url: "${paymentLinkUrl}"\n`;
      content = parts.join('---');
    }
  }

  await writeFile(filePath, content);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await loadEnv();

  console.log('\n--- Ilhéu Shipping Setup ---\n');

  // 1. Create shipping rates
  console.log('Step 1: Creating shipping rates...\n');
  const rates = await createShippingRates();
  const shippingRateIds = rates.map((r) => r.id);

  // Save shipping.json
  const shippingData = { rates };
  await writeFile(SHIPPING_FILE, JSON.stringify(shippingData, null, 2) + '\n');
  console.log(`\nSaved shipping rates to ${SHIPPING_FILE}\n`);

  // 2. Load products and re-create payment links
  console.log('Step 2: Re-creating payment links with shipping options...\n');
  const products = JSON.parse(await readFile(PRODUCTS_FILE, 'utf-8'));

  for (const product of products) {
    if (!product.shipping) {
      console.log(`Skipping ${product.name} (no shipping)`);
      continue;
    }

    console.log(`Processing: ${product.name}`);

    // Deactivate old payment link
    await deactivatePaymentLink(product.stripe_payment_link);

    // Create new payment link with shipping
    const body = buildPaymentLinkBody(product.stripe_price_id, shippingRateIds);
    const newLink = await stripe('POST', '/payment_links', body);
    console.log(`  New link: ${newLink.url}`);

    // Update products.json entry
    product.stripe_payment_link = newLink.url;

    // Update edition frontmatter if applicable
    if (product.type === 'edition') {
      const editionNum = parseInt(product.id.replace('edition-', ''), 10);
      console.log(`  Updating edition-${editionNum} frontmatter...`);
      await updateEditionFrontmatter(editionNum, newLink.url);
    }
  }

  // 3. Save updated products.json
  await writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2) + '\n');
  console.log('\nUpdated src/data/products.json');

  console.log('\n--- Done! ---');
  console.log(`Created ${rates.length} shipping rates`);
  console.log(`Updated ${products.filter((p) => p.shipping).length} payment links`);
  console.log('Max quantity per order: 3\n');
}

main();
