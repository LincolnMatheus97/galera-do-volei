import { type Request, type Response } from 'express';
import z from 'zod';
import { jogadorService } from '../../application/service/jogador.service.js';

const criarJogadorSchema = z.object({
    nome: z.string().min(3, { message: "O nome é obrigatório e deve ter ao menos 3 caracteres." }),
    sexo: z.string({ message: "O sexo é obrigatório." }),
    categoria: z.string({ message: "A categoria é obrigatória." })
});

const edtDadosBasicosJogadorSchema = z.object({
    nome: z.string().min(3).optional(),
    sexo: z.string().optional(),
    categoria: z.string().optional()
});

const edtModeracaoJogadorSchema = z.object({
    moderador: z.boolean()
});

class JogadorController {
    async listar(req: Request, res: Response) {
        const todosOsJogadores = await jogadorService.listarJogadores();
        return res.status(200).json(todosOsJogadores);
    }

    async criar(req: Request, res: Response) {
        try {
            const data = criarJogadorSchema.parse(req.body);
            const novoJogador = await jogadorService.criarJogador(data);
            return res.status(201).json(novoJogador);
        } catch (error) {
            return res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }

    async deletar(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaDeletar = parseInt(idParam, 10);

        if (isNaN(idParaDeletar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await jogadorService.jogadorExiste(idParaDeletar)) {
            return res.status(404).json({message: "Jogador não encontrado!"});
        }
        
        await jogadorService.excluirJogador(idParaDeletar);
        return res.status(204).send();
    }

    async atualizarDados(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAtualizar = parseInt(idParam, 10);

        if (isNaN(idParaAtualizar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await jogadorService.jogadorExiste(idParaAtualizar)) {
            return res.status(404).json({message: "Jogador não encontrado!"});
        }
        
        try {
            const data = edtDadosBasicosJogadorSchema.parse(req.body);
            const jogadorAtualizado = await jogadorService.atualizarDados(idParaAtualizar, data);
            res.status(200).json(jogadorAtualizado);
        } catch (error) {
            res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }

    async atualizarModerador(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAtualizar = parseInt(idParam, 10);

        if (isNaN(idParaAtualizar)) {
            return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
        }

        if (!await jogadorService.jogadorExiste(idParaAtualizar)) {
            return res.status(404).json({message: "Jogador não encontrado!"});
        }
        
        try {
            const data = edtModeracaoJogadorSchema.parse(req.body);
            const jogadorAtualizado = await jogadorService.atualizarModeracao(idParaAtualizar, data);
            return res.status(200).json(jogadorAtualizado);
        } catch (error) {
            return res.status(400).json({message: "Dados inválidos", erros: error});
        }
    }
}

export const jogadorController = new JogadorController();