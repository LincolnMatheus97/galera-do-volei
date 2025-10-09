import type { Request, Response, NextFunction } from "express";
import { HttpException } from "./httpException.middleware.js";
import { NotFoundErro } from "../../application/errors/NotFoundErro.errors.js";
import { NotAllowed } from "../../application/errors/NotAllowed.errors.js";
import { ZodError } from "zod";

export const globalErrorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(`ERRO: ${error.message}`);

    if (error instanceof ZodError) {
        const message = error.issues.map(err => err.message);
        return res.status(400).json({ message: message });
    }

    if (error instanceof NotFoundErro) {
        return res.status(404).json({ message: error.message });
    }

    if (error instanceof NotAllowed) {
        return res.status(405).json({ message: error.message });
    }

    if (error instanceof HttpException) {
        return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: `Houve um erro interno no servidor!` });
}