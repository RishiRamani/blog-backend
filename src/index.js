import "dotenv/config";
import connectDB from './db/db.js'
import app from "./app.js";

const PORT = process.env.PORT || 8080;

async function start() {
  try {
    
    connectDB();

    // Check for required Clerk keys
    if (!process.env.CLERK_SECRET_KEY) {
      console.error("CLERK_SECRET_KEY not set in environment");
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
