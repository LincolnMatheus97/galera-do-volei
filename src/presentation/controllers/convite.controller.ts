import type { Request, Response } from "express";
import z from "zod";
import { conviteService } from "../../application/service/convite.service.js";
import { HttpException } from "../middleware/httpException.middleware.js";

export const criarConviteSchema = z.object({
    nome_remetente: z.string({message: 'Nome do remetente do convite é obrigatorio.'}),
    nome_destinatario: z.string({message: 'Nome do destinatario do convite é obrigatorio.'})
});

class ConviteController {
    async listar(req: Request, res: Response) {
        const todosOsConvites = await conviteService.listarConvites();
        return res.status(200).json(todosOsConvites);
    }

    async criar(req: Request, res: Response) {
        const novoConvite = await conviteService.criarConvite({ nome: req.body.nome_remetente }, { nome: req.body.nome_destinatario });
        return res.status(201).json(novoConvite);
    }

    async excluir(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaDeletar = parseInt(idParam, 10);

        if (isNaN(idParaDeletar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        await conviteService.excluirConvite(idParaDeletar);
        return res.status(204).json({ message: `Convite de id ${idParaDeletar} excluído com sucesso` });
    }

    async aceitar(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAceitar = parseInt(idParam, 10);

        if (isNaN(idParaAceitar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        await conviteService.aceitarConvite(idParaAceitar)
        return res.status(200).json({ message: `Jogador aceito na partida!` });
    }

    async recusar(req: Request, res: Response) {
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