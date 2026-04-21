import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  content: { type: String, required: true }, 
  bannerImage: { type: String },
  tags: [{ type: String }],
  authorId: { type: String, required: true },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date }
}, { timestamps: true });

PostSchema.index({ title: "text", content: "text" });

export default mongoose.model("Post", PostSchema);