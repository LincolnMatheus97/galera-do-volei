import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validationMiddleware = (schema: ZodSchema) => 
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            next(error);
        }
}