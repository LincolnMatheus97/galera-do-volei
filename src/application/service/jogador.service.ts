import type { Jogador } from "../../main/index.model.js";
import { indexPorID } from "../../utils/utils.js";

export let jogadores: Jogador[] = [
    { id: 1, nome: "Thalisson", moderador: true, sexo: "Masculino", categoria: "Amador" },
    { id: 2, nome: "Natiele", moderador: false, sexo: "Feminino", categoria: "Intermediario" },
    { id: 3, nome: "Marcos", moderador: false, sexo: "Masculino", categoria: "Amador" }
];

export const listarJogadores = () => {
    return jogadores;
};

export const criarJogador = (data: Omit<Jogador, 'id' | 'moderador'>) => {
    const novoJogador = {
        id: jogadores.length + 1,
        nome: data.nome,
        moderador: false,
        sexo: data.sexo,
        categoria: data.categoria
    }
    jogadores.push(novoJogador);
    return novoJogador;
}

export const jogadorExiste = (id: number) => {
    const jogadorIndex = indexPorID(jogadores, id);

    if (jogadorIndex === -1) {
        return false;
    }

    return true;
}

export const excluirJogador = (id: number) => {
    const jogadorIndex = indexPorID(jogadores, id);
    jogadores.splice(jogadorIndex, 1);
}

export const atualizarDados = (id: number, data: Omit<Jogador, 'id' | 'moderador'>) => {
    const jogadorIndex = indexPorID(jogadores, id);
    const jogadorAtualizado = jogadores[jogadorIndex]!;

    jogadorAtualizado.nome = data.nome ?? jogadorAtualizado.nome;
    jogadorAtualizado.sexo = data.sexo ?? jogadorAtualizado.sexo;
    jogadorAtualizado.categoria = data.categoria ?? jogadorAtualizado.categoria;
    return jogadorAtualizado;
}

export const atualizarModeracao = (id: number, data: Omit<Jogador, 'id' | 'nome' | 'sexo' | 'categoria'>) => {
    const jogadorIndex = indexPorID(jogadores, id);
    const jogadorAtualizado = jogadores[jogadorIndex]!;

    jogadorAtualizado.moderador = data.moderador ?? jogadorAtualizado.moderador;
    return jogadorAtualizado;
}