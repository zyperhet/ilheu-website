#!/usr/bin/env node

// Interactive CLI to create a Stripe product + payment link
// and save it locally (products.json for merch, frontmatter for editions).
//
// Usage: npm run product:add
// Requires: STRIPE_SECRET_KEY in .env or environment

import { createInterface } from 'node:readline/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { stdin, stdout, env, exit } from 'node:process';
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
    // no .env file — that's fine if the var is already set
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
    console.error(`\nStripe API error (${res.status}):`);
    console.error(data.error?.message || JSON.stringify(data, null, 2));
    exit(1);
  }
  return data;
}

async function prompt(rl, question, defaultVal) {
  const suffix = defaultVal != null ? ` [${defaultVal}]` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || defaultVal || '';
}

async function promptRequired(rl, question) {
  let answer = '';
  while (!answer) {
    answer = (await rl.question(`${question}: `)).trim();
    if (!answer) console.log('  (required)');
  }
  return answer;
}

async function promptChoice(rl, question, choices, defaultVal) {
  const display = choices.map((c) => (c === defaultVal ? `[${c}]` : c)).join(' / ');
  while (true) {
    const answer = (await rl.question(`${question} (${display}): `)).trim().toLowerCase();
    if (!answer && defaultVal) return defaultVal;
    if (choices.includes(answer)) return answer;
    console.log(`  Choose one of: ${choices.join(', ')}`);
  }
}

// ---------------------------------------------------------------------------
// Stripe operations
// ---------------------------------------------------------------------------

async function createStripeProduct({ name, description, imageUrl }) {
  const body = { name };
  if (description) body.description = description;
  if (imageUrl) body['images[0]'] = imageUrl;
  return stripe('POST', '/products', body);
}

async function createStripePrice({ productId, amountCents, currency }) {
  return stripe('POST', '/prices', {
    product: productId,
    unit_amount: String(amountCents),
    currency,
  });
}

async function loadShippingRates() {
  try {
    const data = JSON.parse(await readFile(SHIPPING_FILE, 'utf-8'));
    return data.rates.map((r) => r.id);
  } catch {
    console.error('\nWarning: No shipping rates found in src/data/shipping.json');
    console.error('Run `node scripts/setup-shipping.mjs` first to create them.\n');
    return [];
  }
}

async function createStripePaymentLink({ priceId, shippingRequired }) {
  const body = {
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'line_items[0][adjustable_quantity][enabled]': 'true',
    'line_items[0][adjustable_quantity][minimum]': '1',
    'line_items[0][adjustable_quantity][maximum]': '3',
  };
  if (shippingRequired) {
    // Attach shipping rates from shipping.json
    const shippingRateIds = await loadShippingRates();
    shippingRateIds.forEach((id, i) => {
      body[`shipping_options[${i}][shipping_rate]`] = id;
    });

    // All European countries + US + Canada + Brazil + Portuguese-speaking countries
    const countries = [
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
      // Macau (Portuguese-speaking)
      'MO',
    ];
    countries.forEach((code, i) => {
      body[`shipping_address_collection[allowed_countries][${i}]`] = code;
    });
  }
  return stripe('POST', '/payment_links', body);
}

// ---------------------------------------------------------------------------
// Local persistence
// ---------------------------------------------------------------------------

async function saveToProductsJson(product) {
  let products = [];
  try {
    products = JSON.parse(await readFile(PRODUCTS_FILE, 'utf-8'));
  } catch {
    // file doesn't exist or is empty
  }
  products.push(product);
  await writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2) + '\n');
}

async function updateEditionFrontmatter(editionNumber, paymentLinkUrl) {
  const editionDir = join(ROOT, 'content/editions', `edition-${editionNumber}`);
  const filePath = join(editionDir, 'index.md');

  let content;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch {
    console.error(`\nWarning: Could not find ${filePath}`);
    console.error('You will need to add the purchase_url manually.\n');
    return false;
  }

  if (content.includes('purchase_url:')) {
    // Replace existing purchase_url
    content = content.replace(
      /^purchase_url:.*$/m,
      `purchase_url: "${paymentLinkUrl}"`
    );
  } else {
    // Insert before the closing --- of frontmatter
    const parts = content.split('---');
    if (parts.length >= 3) {
      parts[1] = parts[1].trimEnd() + `\npurchase_url: "${paymentLinkUrl}"\n`;
      content = parts.join('---');
    }
  }

  await writeFile(filePath, content);
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await loadEnv();

  const rl = createInterface({ input: stdin, output: stdout });

  console.log('\n--- Ilheu Product Creator ---\n');
  console.log('This will create a product in Stripe and save it locally.\n');

  const type = await promptChoice(rl, 'Product type', ['edition', 'merch'], 'merch');
  const name = await promptRequired(rl, 'Product name');
  const description = await prompt(rl, 'Description (optional)');
  const priceStr = await promptRequired(rl, 'Price in EUR (e.g. 15.00)');
  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) {
    console.error('Invalid price.');
    exit(1);
  }
  const currency = await prompt(rl, 'Currency', 'eur');
  const imageUrl = await prompt(rl, 'Product image URL for Stripe (optional)');
  const shippingRequired = (await promptChoice(rl, 'Requires shipping?', ['yes', 'no'], 'yes')) === 'yes';

  let editionNumber;
  if (type === 'edition') {
    editionNumber = parseInt(await promptRequired(rl, 'Edition number'), 10);
    if (isNaN(editionNumber)) {
      console.error('Invalid edition number.');
      exit(1);
    }
  }

  rl.close();

  const amountCents = Math.round(price * 100);

  console.log('\nCreating Stripe product...');
  const product = await createStripeProduct({ name, description, imageUrl });
  console.log(`  Product: ${product.id}`);

  console.log('Creating Stripe price...');
  const priceObj = await createStripePrice({
    productId: product.id,
    amountCents,
    currency,
  });
  console.log(`  Price: ${priceObj.id}`);

  console.log('Creating Stripe payment link...');
  const paymentLink = await createStripePaymentLink({
    priceId: priceObj.id,
    shippingRequired,
  });
  console.log(`  Payment Link: ${paymentLink.url}`);

  if (type === 'edition') {
    console.log(`\nUpdating edition-${editionNumber} frontmatter...`);
    const updated = await updateEditionFrontmatter(editionNumber, paymentLink.url);
    if (updated) {
      console.log('  Done. purchase_url added to frontmatter.');
    }
    // Also save to products.json for record-keeping
    await saveToProductsJson({
      id: `edition-${editionNumber}`,
      type: 'edition',
      name,
      description,
      price,
      currency,
      stripe_product_id: product.id,
      stripe_price_id: priceObj.id,
      stripe_payment_link: paymentLink.url,
      shipping: shippingRequired,
      created_at: new Date().toISOString(),
    });
  } else {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await saveToProductsJson({
      id: slug,
      type: 'merch',
      name,
      description,
      price,
      currency,
      image: imageUrl || null,
      stripe_product_id: product.id,
      stripe_price_id: priceObj.id,
      stripe_payment_link: paymentLink.url,
      shipping: shippingRequired,
      active: true,
      created_at: new Date().toISOString(),
    });
    console.log('\nSaved to src/data/products.json');
  }

  console.log(`\nAll done! Payment link: ${paymentLink.url}\n`);
}

main();
