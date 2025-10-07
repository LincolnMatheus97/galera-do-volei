import type { Request, Response } from "express";
import z from "zod";
import * as conviteServices from '../../application/service/convite.service.js';

const criarConviteSchema = z.object({
    nome_remetente: z.string(),
    nome_destinatario: z.string()
});

export const listar = (req: Request, res: Response) => {
    const todosOsConvites = conviteServices.listarConvites();
    return res.status(200).json(todosOsConvites);
}

export const criar = (req: Request, res: Response) => {
    try {
        const data = criarConviteSchema.parse(req.body);
        const novoConvite = conviteServices.criarConvite({nome: data.nome_remetente}, {nome: data.nome_destinatario});
        return res.status(201).json(novoConvite);
    } catch (error) {
        return res.status(400).json({message: "Dados inválidos", erros: error});
    }
}

export const excluir = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaDeletar = parseInt(idParam, 10);

    if (isNaN(idParaDeletar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!conviteServices.conviteExiste(idParaDeletar)) {
        return res.status(404).json({message: "Convite não existe!"});
    }

    conviteServices.excluirConvite(idParaDeletar);
    return res.status(204).json({message: `Convite de id ${idParaDeletar} excluído com sucesso`});
}

export const aceitar = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAceitar = parseInt(idParam, 10);

    if (isNaN(idParaAceitar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!conviteServices.conviteExiste(idParaAceitar)) {
        return res.status(404).json({message: "Convite não existe!"});
    }

    if (conviteServices.aceitarConvite(idParaAceitar)) {
        res.status(200).json({ message: `Jogador aceito na partida!` });
    } else {
        res.status(400).json({message: "Dados inválidos"});
    }
}

export const recusar = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAceitar = parseInt(idParam, 10);

    if (isNaN(idParaAceitar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!conviteServices.conviteExiste(idParaAceitar)) {
        return res.status(404).json({message: "Convite não existe!"});
    }

    if (conviteServices.rejeitarConvite(idParaAceitar)) {
        res.status(200).json({ message: `Jogador rejeitado na partida!` });
    } else {
        res.status(400).json({message: "Dados inválidos"});
    }
}