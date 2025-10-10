import type { Jogador } from "../../main/index.model.js";
import { ConflictError } from "../errors/ConflictError.errors.js";
import { NotFoundErro } from "../errors/NotFoundErro.errors.js";

class JogadorService {
    private jogadores: Jogador[] = [
    { id: 1, nome: "Thalisson", moderador: true, sexo: "Masculino", categoria: "Amador" },
    { id: 2, nome: "Natiele", moderador: false, sexo: "Feminino", categoria: "Intermediario" },
    { id: 3, nome: "Marcos", moderador: false, sexo: "Masculino", categoria: "Amador" }
    ];

    private indexPorID(id: number): number {
        return this.jogadores.findIndex(ent => ent.id === id);
    };

    async listarJogadores(): Promise<Jogador[]> {
        return Promise.resolve(this.jogadores);
    };

    async criarJogador(data: Omit<Jogador, 'id' | 'moderador'>): Promise<Jogador> {
        const nomeNovoJogador = data.nome;
        const jogador = this.jogadores.find(jog => jog.nome.toLowerCase() === nomeNovoJogador.toLowerCase());
        
        if (jogador) {
            throw new ConflictError("Jogador já existe, não é possivel adicionar!");
        }

        const novoJogador = {
            id: (this.jogadores.length > 0 ? this.jogadores.length + 1 : 1),
            nome: nomeNovoJogador,
            moderador: false,
            sexo: data.sexo,
            categoria: data.categoria
        }
        this.jogadores.push(novoJogador);
        return Promise.resolve(novoJogador);
    }

    async jogadorExiste(id: number): Promise<boolean> {
        const jogadorIndex = this.indexPorID(id);
        return Promise.resolve(jogadorIndex !== -1);
    }

    async excluirJogador(id: number): Promise<void> {
        const jogadorIndex = this.indexPorID(id);
        if (jogadorIndex > -1) {
            throw new NotFoundErro("Jogador não encontrado!");
        }
        this.jogadores.splice(jogadorIndex, 1);
    }

    async atualizarDados(id: number, data: Partial<Omit<Jogador, 'id' | 'moderador'>>): Promise<Jogador> {
        const jogadorIndex = this.indexPorID(id);
        if(jogadorIndex === -1) {
            throw new NotFoundErro("Jogador não encontrado!");
        }

        const jogadorAtualizado = this.jogadores[jogadorIndex]!;
        jogadorAtualizado.nome = data.nome ?? jogadorAtualizado.nome;
        jogadorAtualizado.sexo = data.sexo ?? jogadorAtualizado.sexo;
        jogadorAtualizado.categoria = data.categoria ?? jogadorAtualizado.categoria;
        return Promise.resolve(jogadorAtualizado);
    }

    async atualizarModeracao(id: number, data: Pick<Jogador, 'moderador'>): Promise<Jogador> {
        const jogadorIndex = this.indexPorID(id);
        if (jogadorIndex === -1) {
            throw new NotFoundErro("Jogador não encontrado!");
        }

        const jogadorAtualizado = this.jogadores[jogadorIndex]!;
        jogadorAtualizado.moderador = data.moderador ?? jogadorAtualizado.moderador;
        return Promise.resolve(jogadorAtualizado);
    }
}

export const jogadorService = new JogadorService();