import express, { Router } from "express";
import {
    uploadSingle,
    uploadFile,
    getFile,
    renameFile,
    deleteFile,
    restoreFile,
} from "../controllers/file.controller";

import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();
router.use(verifyToken);

router.get("/:name", getFile);
router.post("/upload", uploadSingle, uploadFile);
router.post("/:fileId/rename", renameFile);
router.delete("/:fileId", deleteFile);
// Restore file from trash
router.put("/restore/:fileId", restoreFile);
// router.post("/share", shareFileWithUsers);

export default router;
