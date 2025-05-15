import express, { Router } from "express";
import {
    uploadSingle,
    uploadFile,
    getFile,
    renameFile,
    deleteFile,
    restoreFile,
    updateFavorite,
    updateUsers,
    getSharedEmails,
    removeSharedUser,
} from "../controllers/file.controller";

import { verifyToken } from "../middlewares/verifyToken";
import { decryptRequestBody } from "../middlewares/decryptBody";

const router: Router = express.Router();
router.use(verifyToken, decryptRequestBody);

router.get("/:fileId", getFile);
router.post("/upload", uploadSingle, uploadFile);
router.post("/:fileId/rename", renameFile);
router.delete("/:fileId", deleteFile);
// Restore file from trash
router.put("/restore/:fileId", restoreFile);
router.put("/favorite/:fileId", updateFavorite);
router.post("/share", updateUsers);
router.get("/shared/:fileId", getSharedEmails);
router.get("/shared/:fileId/:email", removeSharedUser);

export default router;
