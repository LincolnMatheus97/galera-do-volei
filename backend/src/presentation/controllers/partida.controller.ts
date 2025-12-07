import { type Request, type Response } from 'express';
import z from 'zod';
import { partidaService } from '../../application/service/partida.service.js';
import { HttpException } from '../middleware/httpException.middleware.js';

export const criarPartidaSchema = z.object({
    tipo: z.string({ message: "O tipo da partida é obrigatória." }),
    nome_moderador: z.string({ message: "O nome do moderador é obrigatório." })
});

export const edtDadosBasicosPartidaSchema = z.object({
    situacao: z.string({ message: "A situação da partida é obrigatória." })
});

export const addInscricaoPartidaSchema = z.object({
    nome_jogador: z.string({ message: "O nome do jogador é obrigatório para inscrição." })
});

export const addAvaliacaoSchema = z.object({
    nome_jogador: z.string({ message: "O nome do jogador é obrigatório para avaliação." }),
    nota: z.number({ message: "A nota é do jogador é obrigatório para avaliação." }).min(0).max(10),
    comentario: z.string({ message: "O comentario do jogador é obrigatório para avaliação." })
});

class PartidaController {
    async listarPartidas(req: Request, res: Response) {
        const todasAsPartidas = await partidaService.listarPartidas();
        res.status(200).json(todasAsPartidas);
    }

    async criarPartida(req: Request, res: Response) {
        const novaPartida = await partidaService.criarPartida({ nome: req.body.nome_moderador }, { tipo: req.body.tipo });
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

        const partidaAtualizada = await partidaService.atualizarDados(idParaAtualizar, { situacao: req.body.situacao });
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

        const novaInscricao = await partidaService.adicionarInscricao(idParaAdd, { nome: req.body.nome_jogador });
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

        const novaAvaliacao = await partidaService.adicionarAvaliacao(idParaAdd, req.body.nota, req.body.comentario, { nome: req.body.nome_jogador });
        res.status(201).json(novaAvaliacao);
    }
}

export const partidaController = new PartidaController();