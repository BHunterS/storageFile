import { Response, NextFunction } from "express";
import { RequestWithScopeAndUserId } from "types";

import { createError } from "../utils/createError";

export const checkScope = (
    req: RequestWithScopeAndUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const rawHeader = req.headers["x-space-id"];
        const rawQuery = req.query.spaceId;

        const rawSpaceId =
            typeof rawHeader === "string"
                ? rawHeader.trim()
                : typeof rawQuery === "string"
                ? rawQuery.trim()
                : null;

        if (!rawSpaceId) throw createError(400, "Missing or invalid space ID.");

        const spaceId = rawSpaceId === "personal" ? null : rawSpaceId;
        req.scope = {
            spaceId,
            ...(spaceId === null && { accountId: req.userId }),
        };

        console.log(req.scope);

        next();
    } catch (error) {
        next(error);
    }
};
