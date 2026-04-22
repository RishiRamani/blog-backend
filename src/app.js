import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";

dotenv.config();

import postRoutes from "./routes/post.routes.js"; 

import { apiLimiter } from "./middleware/rateLimit.js";

const app = express();

// Clerk Middleware
app.use(clerkMiddleware());

// Body size limits (avoid DOS with huge payloads)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Logging in dev
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);


// Global rate limiter for all /api endpoints
app.use("/api", apiLimiter);

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Mount routes
app.use("/api/posts", postRoutes);


// 404 fallback
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

export default app;
