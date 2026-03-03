// src/content.config.ts
// Content Layer API collections for Ilhéu Magazine
//
// IMPORTANT — image fields:
//   cover_image and portrait are marked .optional() so placeholder content
//   (which has no real image files) can validate. Content authors MUST provide
//   cover images for published editions and portraits for visible contributors
//   even though the schema does not enforce it at build time.
//
// Fields deferred to later phases are also optional:
//   accent_colour, purchase_url, flipbook_embed_url — used in Phase 3/5
//   linked_articles — circular back-reference, used in Phase 4

import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const editions = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './content/editions' }),
  schema: ({ image }) =>
    z.object({
      edition_number: z.number(),
      title: z.string(),
      theme: z.string(),
      release_date: z.coerce.date(),
      cover_image: image().optional(), // optional: placeholder content won't have real images
      accent_colour: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      purchase_url: z.string().url().optional(),
      status: z.enum(['current', 'archive']),
      flipbook_embed_url: z.string().url().optional(),
      contributors: z.array(reference('contributors')).optional(),
    }),
});

const articles = defineCollection({
  loader: glob({ pattern: '*/articles/*.md', base: './content/editions' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: reference('contributors'),
      published_date: z.coerce.date(),
      excerpt: z.string(),
      cover_image: image().optional(), // optional: placeholder content won't have real images
      featured: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      language: z.enum(['en', 'pt']).default('en'),
      type: z.enum(['full', 'teaser', 'excerpt', 'web-exclusive', 'editorial', 'extended-cut']),
    }),
});

const contributors = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/contributors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string(),
      portrait: image().optional(), // optional: placeholder contributor won't have photo
      linked_articles: z.array(reference('articles')).optional(),
    }),
});

const special = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/special' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      published_date: z.coerce.date(),
      excerpt: z.string(),
      cover_image: image().optional(),
      type: z.enum(['web-exclusive', 'editorial', 'extended-cut']),
      language: z.enum(['en', 'pt']).default('en'),
    }),
});

export const collections = { editions, articles, contributors, special };
