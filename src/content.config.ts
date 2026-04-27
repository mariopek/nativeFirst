import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    author: z.string().default('Mario'),
  }),
});

const course = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/course' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    courseSlug: z.string().default('vibe-code-native'),
    module: z.number(),
    moduleTitle: z.string(),
    lesson: z.number(),
    duration: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    topics: z.array(z.string()).default([]),
    author: z.string().default('Mario'),
    draft: z.boolean().default(false),
    pubDate: z.coerce.date(),
  }),
});

const fieldNotes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/field-notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    topics: z.array(z.string()).default([]),
    level: z.enum(['intro', 'intermediate', 'advanced']).default('intermediate'),
    draft: z.boolean().default(false),
    author: z.string().default('Mario'),
  }),
});

export const collections = { blog, course, fieldNotes };
