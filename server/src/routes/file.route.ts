import express, { Router } from "express";
import {
    uploadSingle,
    uploadFile,
    getFilesByAccountId,
    getFile,
    renameFile,
    deleteFile,
} from "../controllers/file.controller";

import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();
router.use(verifyToken);

router.post("/", getFilesByAccountId);
router.get("/:name", getFile);
router.post("/upload", uploadSingle, uploadFile);
router.post("/rename", renameFile);
router.delete("/:name", deleteFile);
// router.post("/share", shareFileWithUsers);

export default router;
