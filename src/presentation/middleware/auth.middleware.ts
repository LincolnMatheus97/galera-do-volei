import type { NextFunction, Request, Response } from "express";
import { HttpException } from "./httpException.middleware.js";

const token = 'volei123';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
        throw new HttpException('Token de acesso não informado.', 401);
    }

    if (authorization !== token) {
        throw new HttpException('Token de acesso inválido.', 401);
    }

    next();
}