import jwt from "jsonwebtoken";
import { Response } from "express";

import { environmentVariable } from "types";

export const generateTokenAndSetCookie = (
    res: Response,
    userId: string
): string => {
    const JWT_SECRET: environmentVariable = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error("Internal Server Error");
    }

    const token: string = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};
