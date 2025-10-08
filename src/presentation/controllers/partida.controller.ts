import { type Request, type Response } from 'express';
import z from 'zod';
import * as partidaServices from '../../application/service/partida.service.js';

const criarPartidaSchema = z.object({
    tipo: z.string(),
    nome_moderador: z.string()
});

const addJogadorNaPartidaSchema = z.object({
    nome_jogador: z.string()
});

const edtDadosBasicosPartidaSchema = z.object({
    situacao: z.string()
});

const addInscricaoPartidaSchema = z.object({
    nome_jogador: z.string()
});

const addAvaliacaoSchema = z.object({
    nome_jogador: z.string(),
    nota: z.number().min(0).max(10),
    comentario: z.string()
});

export const listarPartidas = (req: Request, res: Response) => {
    const todasAsPartidas = partidaServices.listarPartidas();
    res.status(200).json(todasAsPartidas);
}

export const criarPartida = (req: Request, res: Response) => {
    try {
        const data = criarPartidaSchema.parse(req.body);
        const novaPartida = partidaServices.criarPartida({nome :data.nome_moderador}, {tipo: data.tipo});
        res.status(201).json(novaPartida);
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
}

export const deletar = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaDeletar = parseInt(idParam, 10);

    if (isNaN(idParaDeletar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!partidaServices.partidaExiste(idParaDeletar)) {
        return res.status(404).json({message: "Partida não existe!"});
    }

    partidaServices.excluirPartida(idParaDeletar);
    return res.status(204).send();
}

export const atualizarDados = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAtualizar = parseInt(idParam, 10);

    if (isNaN(idParaAtualizar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!partidaServices.partidaExiste(idParaAtualizar)) {
        return res.status(404).json({message: "Partida não existe!"});
    }

    try {
        const data = edtDadosBasicosPartidaSchema.parse(req.body);
        const partidaAtualizada = partidaServices.atualizarDados(idParaAtualizar, {situacao: data.situacao});
        res.status(200).json(partidaAtualizada);
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
}

export const listarInscricoes = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaListar = parseInt(idParam, 10);

    if (isNaN(idParaListar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!partidaServices.partidaExiste(idParaListar)) {
        return res.status(404).json({message: "Partida não existe!"});
    }

    const todasAsInscricoes = partidaServices.listarInscricoes(idParaListar);
    res.status(200).json(todasAsInscricoes);
}

export const criarInscricao = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAdd = parseInt(idParam, 10);

    if (isNaN(idParaAdd)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!partidaServices.partidaExiste(idParaAdd)) {
        return res.status(404).json({message: "Partida não existe!"});
    }

    try {
        const data = addInscricaoPartidaSchema.parse(req.body);
        const novaInscricao = partidaServices.adicionarInscricao(idParaAdd, {nome: data.nome_jogador});
        res.status(200).json(novaInscricao);
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
}

export const aceitarInscricao = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAceitar = parseInt(idParam, 10);

    if (isNaN(idParaAceitar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!partidaServices.partidaExiste(idParaAceitar)) {
        return res.status(404).json({message: "Partida não existe!"});
    }

    try {
        partidaServices.aceitarInscricao(idParaAceitar);
        return res.status(200).json({message: 'Inscrição Aceita'});
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
}

export const recusarInscricao = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAceitar = parseInt(idParam, 10);

    if (isNaN(idParaAceitar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!partidaServices.partidaExiste(idParaAceitar)) {
        return res.status(404).json({message: "Partida não existe!"});
    }

    try {
        partidaServices.recusarInscricao(idParaAceitar)
        res.status(200).json({ message: `Jogador foi recusado na partida!` });
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
}

export const criarAvaliacao = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAdd = parseInt(idParam, 10);

    if (isNaN(idParaAdd)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!partidaServices.partidaExiste(idParaAdd)) {
        return res.status(404).json({message: "Partida não existe!"});
    }

    try {
        const data = addAvaliacaoSchema.parse(req.body);
        const novaAvaliacao = partidaServices.adicionarAvaliacao(idParaAdd, data.nota, data.comentario, {nome: data.nome_jogador});
        res.status(201).json(novaAvaliacao);
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
}