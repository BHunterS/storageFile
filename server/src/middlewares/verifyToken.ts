import { Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { createError } from "../utils/createError";
import { environmentVariable, RequestWithUserId } from "types";

export const verifyToken: RequestHandler = (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const token: string = req?.cookies?.token;
        if (!token) throw createError(401, "Unauthorized - no token provided");

        const jwtSecret: environmentVariable = process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error("Internal Server Error");

        const decoded: JwtPayload = jwt.verify(token, jwtSecret) as JwtPayload;
        if (!decoded) throw createError(401, "Unauthorized - invalid token");

        req.userId = decoded.userId;
        next();
    } catch (error) {
        next(error);
    }
};
