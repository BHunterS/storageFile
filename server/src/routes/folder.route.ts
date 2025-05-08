import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
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

const router = express.Router();
router.use(verifyToken);

// Створення нової папки
router.post("/", createFolder);

// Отримання списку папок (на певному рівні)
router.get("/", getFolders);

router.get("/:folderId/details", getFolderDetails);

router.get("/:folderId/download", downloadFolderAsZip);

// Отримання вмісту папки (файли та підпапки)
// router.post("/content", getFolderContents);
router.post("/content", getContents);

// // Перейменування папки
router.put("/:folderId/rename", renameFolder);

// // Видалення папки
router.delete("/:folderId", deleteFolder);

// Restore folder from trash
router.put("/restore/:folderId", restoreFolder);

// // Переміщення папки
// router.put("/folders/:folderId/move", moveFolder);

export default router;
