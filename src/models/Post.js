import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    authorId: { type: String, required: true },
    authorName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  content: { type: String, required: true }, 
  bannerImage: { type: String },
  tags: [{ type: String, trim: true, lowercase: true }],
  comments: [CommentSchema],
  authorId: { type: String, required: true },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date }
}, { timestamps: true });

PostSchema.index({ title: "text", content: "text" });
PostSchema.index({ tags: 1 });

export default mongoose.model("Post", PostSchema);
