import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
    status?: number;
}

export const handleError = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        success: false,
        message,
    });
};
