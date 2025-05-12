import express, { Router } from "express";
import {
    getProfile,
    createOrUpdateProfile,
} from "../controllers/profile.controller";

import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();
router.use(verifyToken);

router.get("/myprofile", getProfile);
router.put("/", createOrUpdateProfile);

export default router;
