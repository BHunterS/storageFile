import express, { Router } from "express";
import {
    handleCreateSpace,
    handleGetSpaceById,
    handleGetUserSpaces,
    handleUpdateSpace,
    handleAddMember,
    handleUpdateMemberRole,
    handleRemoveMember,
    handleDeleteSpace,
    handleCheckSpaceAccess,
} from "../controllers/space.controller";

import { verifyToken } from "../middlewares/verifyToken";
import { decryptRequestBody } from "../middlewares/decryptBody";

const router: Router = express.Router();
router.use(verifyToken, decryptRequestBody);

// Space Routes
router.post("/", handleCreateSpace);
router.get("/my", handleGetUserSpaces);
router.get("/:spaceId", handleGetSpaceById);
router.put("/:spaceId", handleUpdateSpace);
router.delete("/:spaceId", handleDeleteSpace);

// // Member Management Routes
router.post("/:spaceId/members", handleAddMember);
router.put("/:spaceId/members/:memberId", handleUpdateMemberRole);
router.delete("/:spaceId/members/:memberId", handleRemoveMember);

// // Space Access Check
router.get("/:spaceId/access", handleCheckSpaceAccess);

export default router;
