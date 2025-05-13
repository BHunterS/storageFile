import express from "express";

import {
    createFolder,
    getFolders,
    renameFolder,
    deleteFolder,
    moveFolder,
    getFolderDetails,
    downloadFolderAsZip,
    getContents,
    restoreFolder,
} from "../controllers/folder.controller";

import { verifyToken } from "../middlewares/verifyToken";
import { decryptRequestBody } from "../middlewares/decryptBody";

const router = express.Router();
router.use(verifyToken, decryptRequestBody);

// Створення нової папки
router.post("/", createFolder);

// Отримання списку папок (на певному рівні)
router.get("/", getFolders);

router.get("/:folderId/details", getFolderDetails);

router.get("/:folderId/download", downloadFolderAsZip);

// Отримання вмісту папки (файли та підпапки)
// router.post("/content", getFolderContents);
router.get("/content", getContents);

// // Перейменування папки
router.put("/:folderId/rename", renameFolder);

// // Видалення папки
router.delete("/:folderId", deleteFolder);

// Restore folder from trash
router.put("/restore/:folderId", restoreFolder);

// // Переміщення папки
// router.put("/folders/:folderId/move", moveFolder);

export default router;
