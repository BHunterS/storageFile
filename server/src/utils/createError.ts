export interface CustomError extends Error {
    status?: number;
}

export const createError = (status: number, message: string): CustomError => {
    const err: CustomError = new Error(message);
    err.status = status;
    return err;
};
