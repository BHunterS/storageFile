import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
    createFolder,
    getFolders,
    getFolderContents,
    renameFolder,
    deleteFolder,
    moveFolder,
} from "../controllers/folder.controller";

const router = express.Router();
router.use(verifyToken);

// Створення нової папки
router.post("/", createFolder);

// Отримання списку папок (на певному рівні)
router.get("/", getFolders);

// Отримання вмісту папки (файли та підпапки)
router.post("/content", getFolderContents);

// // Перейменування папки
router.put("/:folderId/rename", renameFolder);

// // Видалення папки
router.delete("/:folderId", deleteFolder);

// // Переміщення папки
// router.put("/folders/:folderId/move", moveFolder);

export default router;
