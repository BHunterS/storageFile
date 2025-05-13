import { Response, NextFunction } from "express";

import { generateCryptoKeys } from "../services/rsa.service";

import { createError } from "../utils/createError";
import { encryptRSA } from "../services/rsa.service";

import RSAkeys from "../models/RSAkeys.model";

import { RequestWithUserId } from "../types";

export const getPublicKey = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;

        let keys = await RSAkeys.findOne({ accountId });

        if (!keys) {
            const { publicKey, privateKey } = generateCryptoKeys();

            keys = await RSAkeys.create({
                accountId,
                publicKey,
                privateKey,
            });
        }

        res.status(200).json({
            success: true,
            message: "RSA keys are successfully generated.",
            publicKey: keys.publicKey,
        });
    } catch (error) {
        next(error);
    }
};

export const encryptData = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const { data } = req.body;
        if (!data) throw createError(400, "Data is required");

        const keys = await RSAkeys.findOne({ accountId });
        if (!keys) throw createError(404, "Public key not found");

        const encryptedData = encryptRSA(keys.publicKey, data);

        res.status(200).json({
            success: true,
            message: "Data is successfully encrypted.",
            data: encryptedData,
        });
    } catch (error) {
        next(error);
    }
};
