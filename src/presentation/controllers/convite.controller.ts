import type { Request, Response } from "express";
import z from "zod";
import { conviteService } from "../../application/service/convite.service.js";
import { HttpException } from "../middleware/HttpException.middleware.js";

const criarConviteSchema = z.object({
    nome_remetente: z.string(),
    nome_destinatario: z.string()
});

class ConviteController {
    async listar(req: Request, res: Response) {
        const todosOsConvites = await conviteService.listarConvites();
        return res.status(200).json(todosOsConvites);
    }

    async criar(req: Request, res: Response) {
        const data = criarConviteSchema.parse(req.body);
        const novoConvite = await conviteService.criarConvite({nome: data.nome_remetente}, {nome: data.nome_destinatario});
        return res.status(201).json(novoConvite);
    }

    async excluir (req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaDeletar = parseInt(idParam, 10);

        if (isNaN(idParaDeletar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        await conviteService.excluirConvite(idParaDeletar);
        return res.status(204).json({message: `Convite de id ${idParaDeletar} excluído com sucesso`});
    }

    async aceitar (req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAceitar = parseInt(idParam, 10);

        if (isNaN(idParaAceitar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        await conviteService.aceitarConvite(idParaAceitar)
        return res.status(200).json({ message: `Jogador aceito na partida!` });
    }

    async recusar (req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAceitar = parseInt(idParam, 10);

        if (isNaN(idParaAceitar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        await conviteService.rejeitarConvite(idParaAceitar)
        return res.status(200).json({ message: `Jogador rejeitado na partida!` });
    }
}

export const conviteController = new ConviteController();