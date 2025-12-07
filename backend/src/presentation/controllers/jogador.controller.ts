import { type Request, type Response } from 'express';
import z from 'zod';
import { makeJogadorService as jogadorService } from '../../main/factories.js';
import { HttpException } from '../middleware/HttpException.middleware.js';

// Schema atualizado para exigir Email e Senha
export const criarJogadorSchema = z.object({
    nome: z.string().min(3, { message: "O nome é obrigatório e deve ter ao menos 3 caracteres." }),
    email: z.string().email({ message: "Email inválido." }),
    senha: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
    sexo: z.string({ message: "O sexo é obrigatório." }),
    categoria: z.string({ message: "A categoria é obrigatória." })
});

export const loginSchema = z.object({
    email: z.string().email(),
    senha: z.string()
});

export const edtDadosBasicosJogadorSchema = z.object({
    nome: z.string().min(3).optional(),
    sexo: z.string().optional(),
    categoria: z.string().optional()
});

export const edtModeracaoJogadorSchema = z.object({
    moderador: z.boolean({ message: "O estado de moderação é obrigatorio." })
});

class JogadorController {

    // --- NOVO: Login ---
    async login(req: Request, res: Response) {
        const resultado = await jogadorService.login(req.body);
        return res.status(200).json(resultado);
    }

    async listar(req: Request, res: Response) {
        const todosOsJogadores = await jogadorService.listarJogadores();
        return res.status(200).json(todosOsJogadores);
    }

    async criar(req: Request, res: Response) {
        const novoJogador = await jogadorService.criarJogador(req.body);
        return res.status(201).json(novoJogador);
    }

    async deletar(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaDeletar = parseInt(idParam, 10);

        if (isNaN(idParaDeletar)) {
            throw new HttpException("ID inválido.", 400);
        }

        await jogadorService.excluirJogador(idParaDeletar);
        return res.status(204).send();
    }

    async atualizarDados(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAtualizar = parseInt(idParam, 10);

        if (isNaN(idParaAtualizar)) {
            throw new HttpException("ID inválido.", 400);
        }

        const jogadorAtualizado = await jogadorService.atualizarDados(idParaAtualizar, req.body);
        return res.status(200).json(jogadorAtualizado);
    }

    async atualizarModerador(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAtualizar = parseInt(idParam, 10);

        if (isNaN(idParaAtualizar)) {
            throw new HttpException("ID inválido.", 400);
        }

        const jogadorAtualizado = await jogadorService.atualizarModeracao(idParaAtualizar, req.body);
        return res.status(200).json(jogadorAtualizado);
    }
}

export const jogadorController = new JogadorController();