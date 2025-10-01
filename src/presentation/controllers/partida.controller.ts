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

const addavaliacaoSchema = z.object({
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
        const novaPartida = partidaServices.criarPartida(data.nome_moderador, data.tipo);
    } catch (error) {
        
    }
}