import { type Request, type Response } from 'express';
import z from 'zod';
import { partidaService } from '../../application/service/partida.service.js';

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
    async listarPartidas(req: Request, res: Response){
        const todasAsPartidas = await partidaService.listarPartidas();
        res.status(200).json(todasAsPartidas);
    }

    async criarPartida(req: Request, res: Response) {
        try {
            const data = criarPartidaSchema.parse(req.body);
            const novaPartida = await partidaService.criarPartida({nome :data.nome_moderador}, {tipo: data.tipo});
            res.status(201).json(novaPartida);
        } catch (error) {
            res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }

    async deletar(req: Request, res: Response){
        const idParam = req.params.id ?? '';
        const idParaDeletar = parseInt(idParam, 10);

        if (isNaN(idParaDeletar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await partidaService.partidaExiste(idParaDeletar)) {
            return res.status(404).json({message: "Partida não existe!"});
        }

        await partidaService.excluirPartida(idParaDeletar);
        return res.status(204).send();
    }

    async atualizarDados(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAtualizar = parseInt(idParam, 10);

        if (isNaN(idParaAtualizar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await partidaService.partidaExiste(idParaAtualizar)) {
            return res.status(404).json({message: "Partida não existe!"});
        }

        try {
            const data = edtDadosBasicosPartidaSchema.parse(req.body);
            const partidaAtualizada = await partidaService.atualizarDados(idParaAtualizar, {situacao: data.situacao});
            res.status(200).json(partidaAtualizada);
        } catch (error) {
            res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }

    async listarInscricoes(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaListar = parseInt(idParam, 10);

        if (isNaN(idParaListar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await partidaService.partidaExiste(idParaListar)) {
            return res.status(404).json({message: "Partida não existe!"});
        }

        const todasAsInscricoes = await partidaService.listarInscricoes(idParaListar);
        res.status(200).json(todasAsInscricoes);
    }

    async criarInscricao(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAdd = parseInt(idParam, 10);

        if (isNaN(idParaAdd)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await partidaService.partidaExiste(idParaAdd)) {
            return res.status(404).json({message: "Partida não existe!"});
        }

        try {
            const data = addInscricaoPartidaSchema.parse(req.body);
            const novaInscricao = await partidaService.adicionarInscricao(idParaAdd, {nome: data.nome_jogador});
            res.status(200).json(novaInscricao);
        } catch (error) {
            res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }

    async aceitarInscricao(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAceitar = parseInt(idParam, 10);

        if (isNaN(idParaAceitar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await partidaService.partidaExiste(idParaAceitar)) {
            return res.status(404).json({message: "Partida não existe!"});
        }

        try {
            await partidaService.aceitarInscricao(idParaAceitar);
            return res.status(200).json({message: 'Inscrição Aceita'});
        } catch (error) {
            res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }

    async recusarInscricao(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAceitar = parseInt(idParam, 10);

        if (isNaN(idParaAceitar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await partidaService.partidaExiste(idParaAceitar)) {
            return res.status(404).json({message: "Partida não existe!"});
        }

        try {
            await partidaService.recusarInscricao(idParaAceitar)
            res.status(200).json({ message: `Jogador foi recusado na partida!` });
        } catch (error) {
            res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }

    async criarAvaliacao (req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAdd = parseInt(idParam, 10);

        if (isNaN(idParaAdd)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await partidaService.partidaExiste(idParaAdd)) {
            return res.status(404).json({message: "Partida não existe!"});
        }

        try {
            const data = addAvaliacaoSchema.parse(req.body);
            const novaAvaliacao = await partidaService.adicionarAvaliacao(idParaAdd, data.nota, data.comentario, {nome: data.nome_jogador});
            res.status(201).json(novaAvaliacao);
        } catch (error) {
            res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }
}

export const partidaController = new PartidaController();