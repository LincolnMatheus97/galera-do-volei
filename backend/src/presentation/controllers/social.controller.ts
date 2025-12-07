import type { Request, Response } from "express";
import z from "zod";
import { makeSocialService as socialService } from '../../main/factories.js';
import { HttpException } from "../middleware/HttpException.middleware.js";

// Schemas Zod
const solicitarAmizadeSchema = z.object({
    email: z.string().email()
});

const enviarMensagemSchema = z.object({
    destinatarioId: z.number(),
    conteudo: z.string().min(1)
});

class SocialController {
    
    async solicitarAmizade(req: Request, res: Response) {
        const idUsuario = parseInt(req.headers['user-id'] as string, 10);
        if (isNaN(idUsuario)) throw new HttpException("Token inválido.", 401);

        const { email } = solicitarAmizadeSchema.parse(req.body);
        
        const solicitacao = await socialService.solicitarAmizade(idUsuario, email);
        return res.status(201).json(solicitacao);
    }

    async aceitarAmizade(req: Request, res: Response) {
        const idUsuario = parseInt(req.headers['user-id'] as string, 10);
        const idAmizade = parseInt(req.params.id || '', 10);
        if (isNaN(idUsuario) || isNaN(idAmizade)) throw new HttpException("Dados inválidos.", 400);

        await socialService.aceitarAmizade(idAmizade, idUsuario);
        return res.status(200).json({ message: "Amizade aceita!" });
    }

    async listarAmigos(req: Request, res: Response) {
        const idUsuario = parseInt(req.headers['user-id'] as string, 10);
        const amigos = await socialService.listarAmigos(idUsuario);
        return res.status(200).json(amigos);
    }

    async enviarMensagem(req: Request, res: Response) {
        const idRemetente = parseInt(req.headers['user-id'] as string, 10);
        const { destinatarioId, conteudo } = enviarMensagemSchema.parse(req.body);

        const msg = await socialService.enviarMensagem(idRemetente, destinatarioId, conteudo);
        return res.status(201).json(msg);
    }

    async listarMensagens(req: Request, res: Response) {
        const idUsuario = parseInt(req.headers['user-id'] as string, 10);
        const mensagens = await socialService.listarMensagens(idUsuario);
        return res.status(200).json(mensagens);
    }
}

export const socialController = new SocialController();