import mongoose from "mongoose";

export default async function connectDB () {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
        if (!mongoUri) {
        console.error("MONGO_URI not set in environment");
        process.exit(1);
        }

        await mongoose.connect(mongoUri);

        console.log("MongoDB connected");

    } catch (error) {
        console.log(error);
    }
}
