// src/index.js
import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 8080;

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error("MONGO_URI not set in environment");
      process.exit(1);
    }

    // Check for required Clerk keys
    if (!process.env.CLERK_SECRET_KEY) {
      console.error("CLERK_SECRET_KEY not set in environment");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);

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
