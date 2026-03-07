import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum([
      'AI & Teaching',
      'Personal Knowledge Mgt',
      'Second Mountain',
      'Learning How to Learn',
      'Languages',
    ]),
    tag: z.enum([
      'Library',
      'Galaxy (Essay)',
      'Constellation (Pattern)',
      'Star (Note)',
    ]),
    image: z.string().optional(),
    description: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { posts };
