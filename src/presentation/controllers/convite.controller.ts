import type { Request, Response } from "express";
import z from "zod";
import { conviteService } from "../../application/service/convite.service.js";

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
        try {
            const data = criarConviteSchema.parse(req.body);
            const novoConvite = await conviteService.criarConvite({nome: data.nome_remetente}, {nome: data.nome_destinatario});
            return res.status(201).json(novoConvite);
        } catch (error) {
            return res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }

    async excluir (req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaDeletar = parseInt(idParam, 10);

        if (isNaN(idParaDeletar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await conviteService.conviteExiste(idParaDeletar)) {
            return res.status(404).json({message: "Convite não existe!"});
        }

        await conviteService.excluirConvite(idParaDeletar);
        return res.status(204).json({message: `Convite de id ${idParaDeletar} excluído com sucesso`});
    }

    async aceitar (req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAceitar = parseInt(idParam, 10);

        if (isNaN(idParaAceitar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await conviteService.conviteExiste(idParaAceitar)) {
            return res.status(404).json({message: "Convite não existe!"});
        }

        try {
            await conviteService.aceitarConvite(idParaAceitar)
            res.status(200).json({ message: `Jogador aceito na partida!` });
        } catch (error) {
            return res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }

    async recusar (req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAceitar = parseInt(idParam, 10);

        if (isNaN(idParaAceitar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await conviteService.conviteExiste(idParaAceitar)) {
            return res.status(404).json({message: "Convite não existe!"});
        }

        try {
            await conviteService.rejeitarConvite(idParaAceitar)
            res.status(200).json({ message: `Jogador rejeitado na partida!` });
        } catch (error) {
            return res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }
}

export const conviteController = new ConviteController();