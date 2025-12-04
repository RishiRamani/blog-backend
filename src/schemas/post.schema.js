import { z } from "zod";

export const PostCreateSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(1),        // markdown or HTML
  bannerImage: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional()
});

export const PostUpdateSchema = PostCreateSchema.partial();

export const PostIdParamSchema = z.object({
  id: z.string().min(1)
});

export const PostSlugParamSchema = z.object({
  slug: z.string().min(1)
});
