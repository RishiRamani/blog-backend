import { getAuth } from "@clerk/express";
import Post from "../models/Post.js";
import { makeSlug } from "../utils/slugify.js";

const normalizeTags = (tags = []) => {
  if (!Array.isArray(tags)) return [];

  return [...new Set(
    tags
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  )].slice(0, 10);
};

const getUniqueSlug = async (title, postIdToExclude) => {
  const baseSlug = makeSlug(title);
  let finalSlug = baseSlug;
  let counter = 1;

  while (
    await Post.findOne({
      slug: finalSlug,
      ...(postIdToExclude ? { _id: { $ne: postIdToExclude } } : {}),
    })
  ) {
    finalSlug = `${baseSlug}-${counter++}`;
  }

  return finalSlug;
};

export const createPost = async (req, res, next) => {
  try {
    const data = req.body;
    
    const userId = getAuth(req).userId; // Get user ID from Clerk

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User not authenticated" });
    }

    const finalSlug = await getUniqueSlug(data.title);

    const post = await Post.create({
      ...data,
      tags: normalizeTags(data.tags),
      authorId: userId, // Automatically set from authenticated user
      slug: finalSlug,
      publishedAt: data.published ? new Date() : null
    });

    return res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { q, tag, page = 1, limit = 10 } = req.query;

    let filter = { published: true };

    if (q && q.trim() !== "") {
      const query = q.trim();
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } }
      ];
    }

    if (tag && tag.trim() !== "") {
      filter.tags = tag.trim().toLowerCase();
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(posts);
  } catch (err) {
    next(err);
  }
};


export const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug });
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
};



export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getAuth(req).userId;// Get user ID from Clerk

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Check if user is the post author
    if (post.authorId !== userId) {
      return res.status(403).json({ error: "Forbidden - You can only edit your own posts" });
    }

    Object.assign(post, req.body);
    if (Object.prototype.hasOwnProperty.call(req.body, "tags")) {
      post.tags = normalizeTags(req.body.tags);
    }
    if (req.body.title) post.slug = await getUniqueSlug(req.body.title, post._id);
    if (req.body.published && !post.publishedAt) post.publishedAt = new Date();
    if (req.body.published === false) post.publishedAt = null;

    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getAuth(req).userId;// Get user ID from Clerk

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Check if user is the post author
    if (post.authorId !== userId) {
      return res.status(403).json({ error: "Forbidden - You can only delete your own posts" });
    }

    await post.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Get all posts by the current authenticated user (including unpublished)
export const getMyPosts = async (req, res, next) => {
  try {
    const userId = getAuth(req).userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User not authenticated" });
    }

    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments({ authorId: userId });

    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// Get published posts by a specific user (identified by authorId)
export const getUserPublishedPosts = async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ authorId, published: true })
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments({ authorId, published: true });

    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = getAuth(req).userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User not authenticated" });
    }

    const post = await Post.findOne({ slug, published: true });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({
      authorId: userId,
      authorName: req.body.authorName.trim(),
      content: req.body.content.trim(),
    });

    await post.save();

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    next(err);
  }
};

export const getAllTags = async (req, res, next) => {
  try {
    const tags = await Post.distinct("tags", { published: true });
    res.json(tags.sort());
  } catch (err) {
    next(err);
  }
};
