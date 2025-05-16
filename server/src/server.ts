import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { logger } from "./middlewares/logger";
import { errorLogger } from "./middlewares/errorLogger";
import { handleError } from "./middlewares/handleError";

import { connect } from "./db/connect";

import userRoutes from "./routes/user.route";
import fileRoutes from "./routes/file.route";
import authRoutes from "./routes/auth.route";
import folderRoutes from "./routes/folder.route";
import profileRoutes from "./routes/profile.route";
import cipherRoutes from "./routes/cipher.route";
import logRoutes from "./routes/log.route";
import spaceRoutes from "./routes/space.route";

dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(cookieParser());
app.use(logger);

// Connect to database
connect();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/ciphers", cipherRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/spaces", spaceRoutes);

// Error handling
app.use(errorLogger);
app.use(handleError);

// Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
