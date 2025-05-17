// middlewares/checkSpaceAccessLevel.ts
import { Response, NextFunction } from "express";
import { RequestWithScopeAndUserId } from "types";
import { checkSpaceAccess } from "../services/space.service";
import { createError } from "../utils/createError";

const checkSpaceAccessLevel =
    (required: "view" | "edit" | "personal") =>
    async (
        req: RequestWithScopeAndUserId,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const accountId = req.userId!;
            const { spaceId } = req.scope!;

            if (!spaceId || required === "personal") return next();

            const access = await checkSpaceAccess(spaceId, accountId);

            if (!access.hasAccess) {
                throw createError(403, "You do not have access to this space.");
            }

            if (required === "edit" && !access.hasEditAccess) {
                throw createError(
                    403,
                    "You do not have permission to edit in this space."
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };

export const viewAccessMiddleware = checkSpaceAccessLevel("view");
export const editAccessMiddleware = checkSpaceAccessLevel("edit");
export const onlyPersonalAccessMiddleware = checkSpaceAccessLevel("personal");
