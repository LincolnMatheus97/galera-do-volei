import type { Jogador, Convite, Partida } from "../../main/index.model.js";
import { jogadorService } from "./jogador.service.js";
import { partidaService } from "./partida.service.js";

const jogadores: Array<Jogador> = await jogadorService.listarJogadores();
const partidas: Array<Partida> = await partidaService.listarPartidas();

class ConviteService {
    private convites: Convite[] = [
        { id: 1, status: "pendente", remetente: {id_remetente: 1, nome_remetente: "Thalisson"}, 
        destinatario: {id_destinatario: 2, nome_destinatario: "Natiele"}, id_partida: 1}
    ];

    private indexPorID(lista: {id: number}[], id: number): number {
        return lista.findIndex(entid => entid.id === id);
    }

    private indexPorNome(nome: string):number {
        return jogadores.findIndex(jog => jog.nome === nome);
    }

    async listarConvites(): Promise<Convite[]> {
        return Promise.resolve(this.convites);
    }

    async criarConvite(
        dataRemetente: Omit<Jogador, 'id' | 'moderador' | 'sexo' | 'categoria'>, 
        dataDestinatario: Omit<Jogador, 'id' | 'moderador' | 'sexo' | 'categoria'>,
    ): Promise<Convite | null> {
        const indexRemetente = this.indexPorNome(dataRemetente.nome);
        const indexDestinatario = this.indexPorNome(dataDestinatario.nome);

        if (jogadores[indexRemetente]?.id === undefined || jogadores[indexDestinatario]?.id === undefined) {
            throw new Error("Jogadores não encontrados");
        }

        const indexPartida = partidas.findIndex(mod => mod.moderador.nome_moderador === dataRemetente.nome);

        if (indexPartida === -1) {
            throw new Error("Partida não encontrada");
        }

        const novoConvite = {
            id: this.convites.length > 0 ? this.convites.length + 1 : 1,
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
        this.convites.push(novoConvite);
        return Promise.resolve(novoConvite);
    }

    async conviteExiste(id: number): Promise<boolean>{
        const indexConvite = this.indexPorID(this.convites, id);
        return Promise.resolve(indexConvite != -1);
    }

    async excluirConvite(id: number): Promise<void>{
        const indexConvite = this.indexPorID(this.convites, id);   
        if (indexConvite > -1) {
            this.convites.splice(indexConvite, 1);
        }
        return Promise.resolve();
    }

    async aceitarConvite(id: number): Promise<void> {
        const indexConvite = this.indexPorID(this.convites, id);
        const convite = this.convites[indexConvite];

        if (!convite) {
            throw new Error("Convite não existe");
        }

        const partidaDoConvite = this.indexPorID(partidas, convite.id);
        const partida = partidas[partidaDoConvite];

        if (!partida) {
            throw new Error("Partida não existe");
        }

        if (convite.status != "pendente") {
            throw new Error('Convite já Aceito/Rejeitado');
        }

        convite.status = "aceita";
        const novoParticipante = {
            id_jogador: convite.destinatario.id_destinatario,
            nome_jogador: convite.destinatario.nome_destinatario
        }
        partida.participantes.push(novoParticipante);
        return Promise.resolve();
    }

    async rejeitarConvite(id: number): Promise<void> {
        const indexConvite = this.indexPorID(this.convites, id);
        const convite = this.convites[indexConvite];

        if (!convite) {
            throw new Error("Convite não existe");
        }

        const partidaDoConvite = this.indexPorID(partidas, convite.id);
        const partida = partidas[partidaDoConvite];

        if (!partida) {
            throw new Error("Partida não existe");
        }

        if (convite.status != "pendente") {
            throw new Error('Convite já Aceito/Rejeitado');
        }
        convite.status = "rejeitado";
        return Promise.resolve();
    }
}

export const conviteService = new ConviteService();