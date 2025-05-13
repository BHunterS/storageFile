import { Request, Response, NextFunction } from "express";

import { decryptAES, AesKey } from "../services/aes.service";
import { decryptRSA } from "../services/rsa.service";

import RSAkeys from "../models/RSAkeys.model";

import { createError } from "../utils/createError";
import { RequestWithUserId } from "types";

export const decryptRequestBody = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const encryptedKey = req.headers["x-encrypted-key"] as string;
        const { encryptedData }: { encryptedData: string } = req.body;

        if (!encryptedKey || !encryptedData) {
            return next();
        }

        const rsaKeys = await RSAkeys.findOne({ accountId }).select(
            "+privateKey"
        );
        if (!rsaKeys) throw createError(404, "Public key not found");

        const decryptedAesKeyJson = JSON.parse(
            decryptRSA(rsaKeys.privateKey, encryptedKey)
        );

        const decipher = decryptAES(decryptedAesKeyJson, encryptedData);
        const data = JSON.parse(decipher);

        req.body = data;
        next();
    } catch (error) {
        next(error);
    }
};
