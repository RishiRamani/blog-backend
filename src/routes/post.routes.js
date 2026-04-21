import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  getMyPosts,
  getUserPublishedPosts,
  addComment
} from "../controllers/post.controller.js";

import { validate } from "../middleware/validate.js";

import {
  PostCreateSchema,
  PostUpdateSchema,
  PostIdParamSchema,
  PostSlugParamSchema,
  PostCommentCreateSchema
} from "../schemas/post.schema.js";
import { requireAuth } from "@clerk/express";

const router = Router();

router.get("/", getPosts);
router.get("/my-posts", requireAuth(), getMyPosts); // Get all posts by current user (including unpublished)
router.get("/user/:authorId", getUserPublishedPosts); // Get published posts by a specific user
router.get("/:slug", validate(PostSlugParamSchema, "params"), getPostBySlug);
router.post("/", requireAuth(), validate(PostCreateSchema), createPost);
router.post("/:slug/comments", requireAuth(), validate(PostSlugParamSchema, "params"), validate(PostCommentCreateSchema), addComment);
router.put("/:id", requireAuth(), validate(PostIdParamSchema, "params"), validate(PostUpdateSchema), updatePost);
router.delete("/:id", requireAuth(), validate(PostIdParamSchema, "params"), deletePost);

export default router;
