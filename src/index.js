// src/index.js
import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 8080;

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI not set in environment");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI); // <-- FIX HERE (no options)

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
