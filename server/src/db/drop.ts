// drop.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Import models
import Folder from "../models/folder.model";
import File from "../models/file.model";
import User from "../models/user.model";

async function dropAll() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("✅ Connected to MongoDB");

        // Delete all documents from collections
        await Folder.deleteMany({});
        console.log("🗑️ All folders deleted");

        await File.deleteMany({});
        console.log("🗑️ All files deleted");

        await User.deleteMany({});
        console.log("🗑️ All users deleted");
    } catch (error) {
        console.error("❌ Error while deleting:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

dropAll();
