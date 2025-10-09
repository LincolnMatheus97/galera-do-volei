import { type Request, type Response } from 'express';
import z from 'zod';
import { partidaService } from '../../application/service/partida.service.js';
import { HttpException } from '../middleware/HttpException.middleware.js';

const criarPartidaSchema = z.object({
    tipo: z.string(),
    nome_moderador: z.string()
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

class PartidaController {
    async listarPartidas(req: Request, res: Response) {
        const todasAsPartidas = await partidaService.listarPartidas();
        res.status(200).json(todasAsPartidas);
    }

    async criarPartida(req: Request, res: Response) {
        const data = criarPartidaSchema.parse(req.body);
        const novaPartida = await partidaService.criarPartida({ nome: data.nome_moderador }, { tipo: data.tipo });
        res.status(201).json(novaPartida);
    }

    async deletar(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaDeletar = parseInt(idParam, 10);

        if (isNaN(idParaDeletar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        await partidaService.excluirPartida(idParaDeletar);
        return res.status(204).send();
    }

    async atualizarDados(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAtualizar = parseInt(idParam, 10);

        if (isNaN(idParaAtualizar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        const data = edtDadosBasicosPartidaSchema.parse(req.body);
        const partidaAtualizada = await partidaService.atualizarDados(idParaAtualizar, { situacao: data.situacao });
        return res.status(200).json(partidaAtualizada);
    }

    async listarInscricoes(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaListar = parseInt(idParam, 10);

        if (isNaN(idParaListar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        const todasAsInscricoes = await partidaService.listarInscricoes(idParaListar);
        res.status(200).json(todasAsInscricoes);
    }

    async criarInscricao(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAdd = parseInt(idParam, 10);

        if (isNaN(idParaAdd)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        const data = addInscricaoPartidaSchema.parse(req.body);
        const novaInscricao = await partidaService.adicionarInscricao(idParaAdd, { nome: data.nome_jogador });
        return res.status(200).json(novaInscricao);
    }

    async aceitarInscricao(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAceitar = parseInt(idParam, 10);

        if (isNaN(idParaAceitar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        await partidaService.aceitarInscricao(idParaAceitar);
        return res.status(200).json({ message: 'Inscrição Aceita' });
    }

    async recusarInscricao(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAceitar = parseInt(idParam, 10);

        if (isNaN(idParaAceitar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        await partidaService.recusarInscricao(idParaAceitar)
        res.status(200).json({ message: `Jogador foi recusado na partida!` });
    }

    async criarAvaliacao(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAdd = parseInt(idParam, 10);

        if (isNaN(idParaAdd)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        const data = addAvaliacaoSchema.parse(req.body);
        const novaAvaliacao = await partidaService.adicionarAvaliacao(idParaAdd, data.nota, data.comentario, { nome: data.nome_jogador });
        res.status(201).json(novaAvaliacao);
    }
}

export const partidaController = new PartidaController();