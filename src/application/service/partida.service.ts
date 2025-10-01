import type { Partida, Jogador, Inscricao } from "../../main/index.model.js";
import { indexPorID, indexPorNome } from "../../utils/utils.js";
import { jogadores } from "./jogador.service.js";

export let partidas: Partida[] = [
    {
        id: 1,
        tipo: "Amador",
        data: new Date,
        situacao: "Aberta",
        moderador: { id_moderador: 1, nome_moderador: "Thalisson" },
        participantes: [],
        inscricoes: [{ id_inscricao: 1, id_jogador: 3, nome_jogador: "Marcos", status: "pendente", data: new Date }],
        avaliacoes: []
    }
];

export const listarPartidas = () => {
    return partidas;
}

export const criarPartida = (dataJogador: Omit<Jogador, 'id' | 'moderador' | 'sexo' | 'categoria'>, dataPartida: Omit<Partida, 'id' | 'data' | 'situacao' | 'participantes' | 'inscricoes' | 'avaliacoes'>) => {
    const jogadorIndex = indexPorNome(jogadores, dataJogador.nome);

    if (jogadorIndex === -1 || jogadores[jogadorIndex]?.id === undefined) {
        throw new Error("Moderador não encontrado ou ID inválido.");
    }

    const novaPartida = {
        id: partidas.length + 1,
        tipo: dataPartida.tipo,
        data: new Date,
        situacao: "Aberta",
        moderador: {
            id_moderador: jogadores[jogadorIndex].id,
            nome_moderador: dataJogador.nome
        },
        participantes: [],
        inscricoes: [],
        avaliacoes: []
    }
    partidas.push(novaPartida);
    return novaPartida;
}

export const partidaExiste = (id: number) => {
    const partidaIndex = indexPorID(partidas, id);

    if (partidaIndex === -1) {
        return false;
    }

    return true;
}

export const excluirPartida = (id: number) => {
    const partidaIndex = indexPorID(partidas, id);
    partidas.slice(partidaIndex, 1);
}

export const atualizarDados = (id: number, data: Omit<Partida, 'id' | 'tipo' | 'data' | 'moderador' | 'participantes' | 'inscricoes' | 'avaliacoes'>) => {
    const partidaIndex = indexPorID(partidas, id);
    const partidaAtualizada = partidas[partidaIndex]!;

    partidaAtualizada.situacao = data.situacao ?? partidaAtualizada.situacao;
    return partidaAtualizada;
}

export const listarInscricoes = (id: number) => {
    const partidaIndex = indexPorID(partidas, id);
    return partidas[partidaIndex]?.inscricoes;
}

export const adicionarInscricao = (id: number, dataJogador: Omit<Jogador, 'id' | 'moderador' | 'sexo' | 'categoria'>) => {
    const partidaIndex = indexPorID(partidas, id);
    const partida = partidas[partidaIndex];

    if (!partida) {
        return false;
    }

    const jogadorIndex = indexPorNome(jogadores, dataJogador.nome);
    const idJogador = jogadores[jogadorIndex]?.id;
    if (typeof idJogador !== "number") {
        return false;
    }

    const novaInscricao = {
        id_inscricao: partida.inscricoes.length + 1,
        id_jogador: idJogador,
        nome_jogador: dataJogador.nome,
        status: "pendente",
        data: new Date()
    };

    partida.inscricoes.push(novaInscricao);
    return novaInscricao;
}

export const aceitarInscricao = (id: number) => {
    let partidaDaInscricao: Partida | undefined;
    let inscricao: Inscricao | undefined;

    for (let i = 0; i < partidas.length; i++) {
        const partidaEncontrada = partidas[i];
        const inscricaoEncontrada = partidaEncontrada?.inscricoes.find(ins => ins.id_inscricao === id);
        if (inscricaoEncontrada) {
            partidaDaInscricao = partidaEncontrada;
            inscricao = inscricaoEncontrada;
            break;
        }
    }

    if (inscricao && inscricao.status === 'pendente') {
        inscricao.status = 'aceita';

        const novoParticipante = {
            id_jogador: inscricao.id_jogador,
            nome_jogador: inscricao.nome_jogador
        }

        partidaDaInscricao?.participantes.push(novoParticipante);
        return true;
    } else {
        return false;
    }
}

export const recusarInscricao = (id: number) => {
    let inscricao: Inscricao | undefined;

    for (let i = 0; i < partidas.length; i++) {
        const partidaProcurada = partidas[i];
        const inscricaoEncontrada = partidaProcurada?.inscricoes.find(ins => ins.id_inscricao === id);
        if (inscricaoEncontrada) {
            inscricao = inscricaoEncontrada;
            break;
        }
    }

    if (inscricao && inscricao.status === "pendente") {
        inscricao.status = 'rejeitada';
        return true;
    } else {
        return false;
    }
}

export const adicionarAvaliacao = (id: number, nota: number, comentario: string,dataJogador: Omit<Jogador, 'id' | 'moderador' | 'sexo' | 'categoria'>) => {
    const partidaIndex = indexPorID(partidas, id);
    const partida = partidas[partidaIndex];

    const jogadorIndex = indexPorNome(jogadores, dataJogador.nome);
    const idJogador = jogadores[jogadorIndex]?.id;
    const jaParticipa = partida?.participantes.some(part => part.nome_jogador === dataJogador.nome);

    if (typeof idJogador !== "number" || !jaParticipa) {
       return false;
    }

    const novaAvaliacao = {
        id: (partida?.avaliacoes?.length ?? 0) + 1,
        id_jogador: idJogador,
        nome_jogador: dataJogador.nome,
        nota: nota,
        comentario: comentario
    }

    partida?.avaliacoes.push(novaAvaliacao);
    return novaAvaliacao;
}