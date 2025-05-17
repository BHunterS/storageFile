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
import { checkScope } from "../middlewares/checkScope";
import {
    onlyPersonalAccessMiddleware,
    editAccessMiddleware,
    viewAccessMiddleware,
} from "../middlewares/checkSpaceAccessLevel";

const router: Router = express.Router();
router.use(verifyToken, checkScope, decryptRequestBody);

router.get("/:fileId", viewAccessMiddleware, getFile);
router.post("/upload", editAccessMiddleware, uploadSingle, uploadFile);
router.post("/:fileId/rename", editAccessMiddleware, renameFile);
router.delete("/:fileId", editAccessMiddleware, deleteFile);
router.put("/restore/:fileId", editAccessMiddleware, restoreFile);
router.put("/favorite/:fileId", editAccessMiddleware, updateFavorite);
router.post("/share", onlyPersonalAccessMiddleware, updateUsers);
router.get("/shared/:fileId", onlyPersonalAccessMiddleware, getSharedEmails);
router.get(
    "/shared/:fileId/:email",
    onlyPersonalAccessMiddleware,
    removeSharedUser
);

export default router;
