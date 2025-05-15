import { Response, NextFunction } from "express";

import Log from "../models/log.model";

import { RequestWithUserId } from "types";

export const getLogs = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const logs =
            (await Log.find({ accountId })
                .sort({ createdAt: -1 })
                .limit(100)) || [];

        res.status(200).json({
            message: "Logs fetched successfully",
            success: true,
            logs,
        });
    } catch (error) {
        next(error);
    }
};
