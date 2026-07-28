import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://ilheumagazine.com',
  output: 'static',

  redirects: {
    '/editions/edition-2': '/',
    '/home-2': '/',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx()],
  adapter: cloudflare()
});