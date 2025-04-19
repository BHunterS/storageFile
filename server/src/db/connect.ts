import mongoose from "mongoose";
import dotenv from "dotenv";
import { environmentVariable } from "types";

dotenv.config();

export const connect = async (): Promise<void> => {
    try {
        const mongoUri: environmentVariable = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error(
                "MONGO_URI is not defined in environment variables."
            );
        }

        console.log("Connecting to MongoDB...");
        const conn = await mongoose.connect(mongoUri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        const err = error as Error;
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1);
    }
};
