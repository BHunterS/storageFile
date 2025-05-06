// src/routes/trash.route.ts
import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
    getTrashContents,
    restoreFile,
    restoreFolder,
} from "../controllers/trash.controller";

const router = express.Router();
router.use(verifyToken);

// Get all items in trash
router.post("/", getTrashContents);

// Restore file from trash
router.put("/restore/file/:fileId", restoreFile);

// Restore folder from trash
router.put("/restore/folder/:folderId", restoreFolder);

export default router;
