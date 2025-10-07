import type { Jogador, Convite } from "../../main/index.model.js";
import { indexPorID, indexPorNome } from "../../utils/utils.js";
import { jogadores } from "./jogador.service.js";
import { partidas } from "./partida.service.js";

let convites: Convite[] = [
    { id: 1, status: "pendente", remetente: {id_remetente: 1, nome_remetente: "Thalisson"}, 
    destinatario: {id_destinatario: 2, nome_destinatario: "Natiele"}, id_partida: 1}
];

export const listarConvites = () => {
    return convites;
}

export const criarConvite = (
    dataRemetente: Omit<Jogador, 'id' | 'moderador' | 'sexo' | 'categoria'>, 
    dataDestinatario: Omit<Jogador, 'id' | 'moderador' | 'sexo' | 'categoria'>,
) => {
    const indexRemetente = indexPorNome(jogadores, dataRemetente.nome);
    const indexDestinatario = indexPorNome(jogadores, dataDestinatario.nome);

    if (jogadores[indexRemetente]?.id === undefined || jogadores[indexDestinatario]?.id === undefined) {
        throw new Error("Jogadores não encontrados");
    }

      const indexPartida = partidas.findIndex(mod => mod.moderador.nome_moderador === dataRemetente.nome);

    if (indexPartida === -1) {
        throw new Error("Partida não encontrada");
    }

    const novoConvite = {
        id: convites.length + 1,
        status: "pendente",
        remetente: {
            id_remetente: jogadores[indexRemetente]?.id,
            nome_remetente: dataRemetente.nome
        },
        destinatario: {
            id_destinatario: jogadores[indexDestinatario]?.id,
            nome_destinatario: dataDestinatario.nome
        },
        id_partida: indexPartida + 1
    }
    convites.push(novoConvite);
    return novoConvite;
}

export const conviteExiste = (id: number) => {
    const indexConvite = indexPorID(convites, id);

    if (indexConvite === -1) {
        return false;
    }

    return true;
}

export const excluirConvite = (id: number) => {
    const indexConvite = indexPorID(convites, id);   
    convites.slice(indexConvite, 1);
}

export const aceitarConvite = (id: number) => {
    const indexConvite = indexPorID(convites, id);
    const convite = convites[indexConvite];

    if (!convite) {
        throw new Error("Convite não existe");
    }

    const partidaDoConvite = indexPorID(partidas, convite.id);
    const partida = partidas[partidaDoConvite];

    if (!partida) {
        throw new Error("Partida não existe");
    }

    if (convite.status === "pedente") {
        convite.status = "aceita";

        const novoParticipante = {
            id_jogador: convite.destinatario.id_destinatario,
            nome_jogador: convite.destinatario.nome_destinatario
        }

        partida.participantes.push(novoParticipante);
        return true;
    } else {
        return false;
    }
}

export const rejeitarConvite = (id: number) => {
    const indexConvite = indexPorID(convites, id);
    const convite = convites[indexConvite];

    if (!convite) {
        throw new Error("Convite não existe");
    }

    const partidaDoConvite = indexPorID(partidas, convite.id);
    const partida = partidas[partidaDoConvite];

    if (!partida) {
        throw new Error("Partida não existe");
    }

    if (convite.status === "pedente") {
        convite.status = "rejeitado";
        return true;
    } else {
        return false;
    }
}