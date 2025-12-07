import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpException } from "./HttpException.middleware.js";

interface TokenPayload {
    id: number;
    email: string;
    moderador: boolean;
    iat: number;
    exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    console.log("DEBUG HEADER:", authorization);

    if (!authorization) {
        throw new HttpException('Token não fornecido.', 401);
    }

    const parts = authorization.split(' ');

    if (parts.length !== 2) {
        throw new HttpException('Erro no Token.', 401);
    }

    const [scheme, token] = parts;

    // Verificação de segurança simples para o 'Bearer'
    if (!/^Bearer$/i.test(scheme ?? '')) {
        throw new HttpException('Token malformatado.', 401);
    }

    try {
        const secret = process.env.JWT_SECRET || 'segredo_padrao_dev';

        const decoded = jwt.verify(token ?? '', secret);

        // Type Guard: Verifica manualmente se 'decoded' é um objeto e tem ID
        // Isso satisfaz o TypeScript sem usar 'as unknown'
        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
            const payload = decoded as TokenPayload;

            req.headers['user-id'] = String(payload.id);
            req.headers['is-moderador'] = String(payload.moderador);
            return next();
        }

        throw new Error("Payload inválido");

    } catch (err) {
        throw new HttpException('Token inválido ou expirado.', 401);
    }
}