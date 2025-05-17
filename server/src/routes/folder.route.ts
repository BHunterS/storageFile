import express from "express";

import {
    handleCreateNewFolder,
    handleRenameFolder,
    handleDeleteFolder,
    moveFolder,
    handleGetFolderDetails,
    handleDownloadFolderAsZip,
    handleGetContent,
    handleRestoreFolder,
} from "../controllers/folder.controller";

import { verifyToken } from "../middlewares/verifyToken";
import { decryptRequestBody } from "../middlewares/decryptBody";
import { checkScope } from "../middlewares/checkScope";
import {
    editAccessMiddleware,
    viewAccessMiddleware,
} from "../middlewares/checkSpaceAccessLevel";

const router = express.Router();
router.use(verifyToken, checkScope, decryptRequestBody);

// Створення нової папки
router.post("/", editAccessMiddleware, handleCreateNewFolder);

router.get("/:folderId/details", viewAccessMiddleware, handleGetFolderDetails);

router.get(
    "/:folderId/download",
    viewAccessMiddleware,
    handleDownloadFolderAsZip
);

router.get("/content", viewAccessMiddleware, handleGetContent);

// // Перейменування папки
router.put("/:folderId/rename", editAccessMiddleware, handleRenameFolder);

// // Видалення папки
router.delete("/:folderId", editAccessMiddleware, handleDeleteFolder);

// Restore folder from trash
router.put("/restore/:folderId", editAccessMiddleware, handleRestoreFolder);

// // Переміщення папки
// router.put("/folders/:folderId/move", moveFolder);

export default router;
