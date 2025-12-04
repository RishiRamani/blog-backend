import Post from "../models/Post.js";
import { makeSlug } from "../utils/slugify.js";

export const createPost = async (req, res, next) => {
  try {
    const data = req.body;
    const slug = makeSlug(data.title);
    let finalSlug = slug;
    let counter = 1;
    while (await Post.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter++}`;
    }

    const post = await Post.create({
      ...data,
      slug: finalSlug,
      authorId: req.user.sub,
      publishedAt: data.published ? new Date() : null
    });

    return res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    let filter = { published: true };

    // TITLE-ONLY SEARCH (case-insensitive)
    if (q && q.trim() !== "") {
      filter.title = { $regex: q.trim(), $options: "i" };
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

export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.sub; // from Supabase JWT
    const posts = await Post.find({ authorId: userId }).sort({ updatedAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user's posts" });
  }
};

export const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug });
    if (!post) return res.status(404).json({ error: "Not found" });
    // if not published and not author, deny
    if (!post.published && (!req.user || req.user.sub !== post.authorId)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const getPostBySlugPrivate = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug });
    if (!post) return res.status(404).json({ error: "Not found" });

    if (post.authorId !== req.user.sub)
      return res.status(403).json({ error: "Forbidden" });

    res.json(post);
  } catch (err) {
    next(err);
  }
};


export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.authorId !== req.user.sub) return res.status(403).json({ error: "Forbidden" });

    Object.assign(post, req.body);
    if (req.body.title) post.slug = makeSlug(req.body.title);
    if (req.body.published && !post.publishedAt) post.publishedAt = new Date();

    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.authorId !== req.user.sub) return res.status(403).json({ error: "Forbidden" });

    await post.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
