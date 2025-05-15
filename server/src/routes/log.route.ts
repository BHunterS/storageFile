import express, { Router } from "express";
import { getLogs } from "../controllers/log.controller";

import { verifyToken } from "../middlewares/verifyToken";
import { decryptRequestBody } from "../middlewares/decryptBody";

const router: Router = express.Router();
router.use(verifyToken);

router.get("/", getLogs);

export default router;
