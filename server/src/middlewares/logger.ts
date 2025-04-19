import { Request, Response, NextFunction } from "express";

export const logger = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const start: number = Date.now();

    res.on("finish", () => {
        const duration: number = Date.now() - start;

        console.log("------------------------------");
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
        );
        console.log(`Status: ${res.statusCode} (${duration}ms)`);

        if (Object.keys(req.body || {}).length > 0) {
            console.log("Body:", req.body);
        }

        if (Object.keys(req.query || {}).length > 0) {
            console.log("Query:", req.query);
        }

        if (Object.keys(req.params || {}).length > 0) {
            console.log("Params:", req.params);
        }

        console.log("------------------------------");
    });

    next();
};
