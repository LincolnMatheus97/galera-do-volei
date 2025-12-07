import type { Request, Response } from "express";
import z from "zod";
import { makeConviteService as conviteService } from '../../main/factories.js'; 
import { HttpException } from "../middleware/HttpException.middleware.js";

export const criarConviteSchema = z.object({
    nome_destinatario: z.string({ message: 'Nome do destinatario do convite é obrigatorio.' })
});

class ConviteController {
    async listar(req: Request, res: Response) {
        
        const idUsuario = parseInt(req.headers['user-id'] as string, 10);

        if (isNaN(idUsuario)) {
            console.error("--> ERRO: user-id é NaN ou inexistente!");
            throw new HttpException("Usuário não identificado.", 401);
        }

        const todosOsConvites = await conviteService.listarConvites(idUsuario);
        return res.status(200).json(todosOsConvites);
    }

    async criar(req: Request, res: Response) {
        
        const idRemetente = parseInt(req.headers['user-id'] as string, 10);

        if (isNaN(idRemetente)) {
            console.error("--> ERRO: Token inválido (user-id NaN) no POST");
            throw new HttpException("Token inválido.", 401);
        }

        const novoConvite = await conviteService.criarConvite(
            idRemetente,
            req.body.nome_destinatario
        );
        return res.status(201).json(novoConvite);
    }

    async excluir(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaDeletar = parseInt(idParam, 10);

        if (isNaN(idParaDeletar)) {
            throw new HttpException("ID inválido.", 400);
        }

        await conviteService.excluirConvite(idParaDeletar);
        return res.status(204).json({ message: `Convite de id ${idParaDeletar} excluído com sucesso` });
    }

    async aceitar(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idConvite = parseInt(idParam, 10);
        const idUsuarioLogado = parseInt(req.headers['user-id'] as string, 10);

        if (isNaN(idConvite)) throw new HttpException("ID inválido.", 400);

        await conviteService.aceitarConvite(idConvite, idUsuarioLogado);
        return res.status(200).json({ message: `Convite aceito com sucesso!` });
    }

    async recusar(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idConvite = parseInt(idParam, 10);
        const idUsuarioLogado = parseInt(req.headers['user-id'] as string, 10);

        if (isNaN(idConvite)) throw new HttpException("ID inválido.", 400);

        await conviteService.rejeitarConvite(idConvite, idUsuarioLogado);
        return res.status(200).json({ message: `Convite rejeitado.` });
    }
}

export const conviteController = new ConviteController();