import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const systems = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/systems' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    tag: z.string(),
    src: z.array(z.string()),
    published: z.boolean(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({ title: z.string(), date: z.coerce.date(), summary: z.string() }),
});

export const collections = { systems, notes };
