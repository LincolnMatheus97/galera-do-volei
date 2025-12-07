import { ConflictError } from "../errors/ConflictError.errors.js";
import { NotFoundErro } from "../errors/NotFoundErro.errors.js";
import { NotAllowed } from "../errors/NotAllowed.errors.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { IJogadorRepository } from "../repositories/interfaces.js";

type CriarJogadorDTO = {
    nome: string;
    email: string;
    senha: string;
    sexo: string;
    categoria: string;
};

type LoginDTO = {
    email: string;
    senha: string;
};

export class JogadorService {
    
    // INJEÇÃO DE DEPENDÊNCIA:
    constructor(private jogadorRepository: IJogadorRepository) {}

    // --- AUTENTICAÇÃO ---

    async login(data: LoginDTO) {
        const jogador = await this.jogadorRepository.buscarPorEmail(data.email);

        if (!jogador) {
            throw new NotAllowed("Email ou senha incorretos.");
        }

        const senhaBate = await bcrypt.compare(data.senha, jogador.senhaHash);

        if (!senhaBate) {
            throw new NotAllowed("Email ou senha incorretos.");
        }

        const token = jwt.sign(
            { 
                id: jogador.id, 
                email: jogador.email, 
                moderador: jogador.moderador 
            },
            process.env.JWT_SECRET ?? 'segredo_padrao_dev',
            { expiresIn: '1d' }
        );

        return {
            token,
            usuario: {
                id: jogador.id,
                nome: jogador.nome,
                email: jogador.email,
                moderador: jogador.moderador
            }
        };
    }

    // --- CRUD ---

    async criarJogador(data: CriarJogadorDTO) {
        const existe = await this.jogadorRepository.buscarPorEmail(data.email);
        
        if (existe) {
            throw new ConflictError("Já existe um jogador com este email!");
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(data.senha, salt);

        const novoJogador = await this.jogadorRepository.criar({
            nome: data.nome,
            email: data.email,
            senhaHash: hash,
            sexo: data.sexo,
            categoria: data.categoria
        });

        const { senhaHash, ...jogadorSemSenha } = novoJogador;
        return jogadorSemSenha;
    }

    async listarJogadores() {
        return await this.jogadorRepository.listarTodos();
    }

    async excluirJogador(id: number) {
        const existe = await this.jogadorRepository.buscarPorId(id);
        if (!existe) {
            throw new NotFoundErro("Jogador não encontrado!");
        }
        await this.jogadorRepository.excluir(id);
    }

    async atualizarDados(id: number, data: { nome?: string, sexo?: string, categoria?: string }) {
        const existe = await this.jogadorRepository.buscarPorId(id);
        if (!existe) throw new NotFoundErro("Jogador não encontrado!");

        return await this.jogadorRepository.atualizar(id, data);
    }

    async atualizarModeracao(id: number, data: { moderador: boolean }) {
        const existe = await this.jogadorRepository.buscarPorId(id);
        if (!existe) throw new NotFoundErro("Jogador não encontrado!");

        return await this.jogadorRepository.atualizar(id, { moderador: data.moderador });
    }

    async buscarPorId(id: number) {
        const jogador = await this.jogadorRepository.buscarPorId(id);
        if (!jogador) throw new NotFoundErro("Jogador não encontrado");
        return jogador;
    }
}