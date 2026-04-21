import { Router } from "express";
import {
  createPost,
  getPosts,
  getMyPosts,
  getPostBySlug,
  getPostBySlugPrivate,
  updatePost,
  deletePost
} from "../controllers/post.controller.js";

import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { PostCreateSchema, PostUpdateSchema, PostIdParamSchema, PostSlugParamSchema } from "../schemas/post.schema.js";

const router = Router();

router.get("/", getPosts);
router.get("/:slug", validate(PostSlugParamSchema, "params"), getPostBySlug);
router.post("/", requireAuth, validate(PostCreateSchema), createPost);
router.put("/:id", requireAuth, validate(PostUpdateSchema), updatePost);
router.delete("/:id", requireAuth, deletePost);

export default router;