import { z } from "zod";

const tagSchema = z.string().trim().min(1).max(30);

export const PostCreateSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(1),        // markdown or HTML
  bannerImage: z.string().url().optional(),
  tags: z.array(tagSchema).min(1, "At least one tag is required").max(10),
  published: z.boolean().optional()
});

export const PostUpdateSchema = PostCreateSchema.partial();

export const PostIdParamSchema = z.object({
  id: z.string().min(1)
});

export const PostSlugParamSchema = z.object({
  slug: z.string().min(1)
});

export const PostCommentCreateSchema = z.object({
  authorName: z.string().trim().min(2).max(60),
  content: z.string().trim().min(2).max(1000)
});
