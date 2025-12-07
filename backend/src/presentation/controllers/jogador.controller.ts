import { type Request, type Response } from 'express';
import z from 'zod';
import { jogadorService } from '../../application/service/jogador.service.js';
import { HttpException } from '../middleware/httpException.middleware.js';

export const criarJogadorSchema = z.object({
    nome: z.string().min(3, { message: "O nome é obrigatório e deve ter ao menos 3 caracteres." }),
    sexo: z.string({ message: "O sexo é obrigatório." }),
    categoria: z.string({ message: "A categoria é obrigatória." })
});

export const edtDadosBasicosJogadorSchema = z.object({
    nome: z.string().min(3).optional(),
    sexo: z.string().optional(),
    categoria: z.string().optional()
});

export const edtModeracaoJogadorSchema = z.object({
    moderador: z.boolean({ message: "O estado de moderação é obrigatorio, sendo apenas verdadeiro ou falso" })
});

class JogadorController {
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
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        await jogadorService.excluirJogador(idParaDeletar);
        return res.status(204).send();
    }

    async atualizarDados(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAtualizar = parseInt(idParam, 10);

        if (isNaN(idParaAtualizar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        const jogadorAtualizado = await jogadorService.atualizarDados(idParaAtualizar, req.body);
        return res.status(200).json(jogadorAtualizado);
    }

    async atualizarModerador(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAtualizar = parseInt(idParam, 10);

        if (isNaN(idParaAtualizar)) {
            throw new HttpException("ID inválido. Por favor digite um ID válido", 400);
        }

        const jogadorAtualizado = await jogadorService.atualizarModeracao(idParaAtualizar, req.body);
        return res.status(200).json(jogadorAtualizado);
    }
}

export const jogadorController = new JogadorController();