import { Request, Response, NextFunction } from "express";

export const errorLogger = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error("========== ERROR ==========");
    console.error(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);

    console.error("===========================");

    next(err); // Pass to the next error handler
};
