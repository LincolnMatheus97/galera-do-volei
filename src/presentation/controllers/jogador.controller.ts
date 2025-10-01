import { type Request, type Response } from 'express';
import z from 'zod';
import * as jogadorService from '../../application/service/jogador.service.js'

const criarJogadorSchema = z.object({
    nome: z.string().min(3, { message: "O nome é obrigatório e deve ter ao menos 3 caracteres." }),
    sexo: z.string({ message: "O sexo é obrigatório." }),
    categoria: z.string({ message: "A categoria é obrigatória." })
});

const edtDadosBasicosJogadorSchema = z.object({
    nome: z.string().min(3),
    sexo: z.string(),
    categoria: z.string()
});

const edtModeracaoJogadorSchema = z.object({
    moderador: z.boolean()
});

export const listar = (req: Request, res: Response) => {
    const todosOsJogadores = jogadorService.listarJogadores();
    res.status(200).json(todosOsJogadores);
}

export const criar = (req: Request, res: Response) => {
    try {
        const data = criarJogadorSchema.parse(req.body);
        const novoJogador = jogadorService.criarJogador(data);
        res.status(201).json(novoJogador);
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

    if (!jogadorService.jogadorExiste(idParaDeletar)) {
        return res.status(404).json({message: "Jogador não encontrado!"});
    }
    
    jogadorService.excluirJogador(idParaDeletar);
    console.log(`Jogador com id ${idParaDeletar} deletado`);

    res.status(204).send();
}

export const atualizarDados = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAtualizar = parseInt(idParam, 10);

    if (isNaN(idParaAtualizar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!jogadorService.jogadorExiste(idParaAtualizar)) {
        return res.status(404).json({message: "Jogador não encontrado!"});
    }
    
    try {
        const data = edtDadosBasicosJogadorSchema.parse(req.body);
        const jogadorAtualizado = jogadorService.atualizarDados(idParaAtualizar, data);
        res.status(200).json(jogadorAtualizado);
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
}

export const atualizarModerador = (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAtualizar = parseInt(idParam, 10);

    if (isNaN(idParaAtualizar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    if (!jogadorService.jogadorExiste(idParaAtualizar)) {
        return res.status(404).json({message: "Jogador não encontrado!"});
    }
    
    try {
        const data = edtModeracaoJogadorSchema.parse(req.body);
        const jogadorAtualizado = jogadorService.atualizarModeracao(idParaAtualizar, data);
        res.status(200).json(jogadorAtualizado);
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
}