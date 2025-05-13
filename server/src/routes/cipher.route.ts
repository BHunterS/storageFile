import express, { Router } from "express";

import { getPublicKey, encryptData } from "../controllers/cipher.controller";

import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();
router.use(verifyToken);

router.get("/public-key", getPublicKey);
router.post("/encrypt", encryptData);

export default router;
