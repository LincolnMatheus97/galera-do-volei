import type { Partida, Jogador, Inscricao, Avaliacao} from "../../main/index.model.js";
import { jogadorService } from "./jogador.service.js";

const jogadores: Array<Jogador> = await jogadorService.listarJogadores(); 

class PartidaService {
    private partidas: Partida[] = [
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

    private indexPorID(id: number): number {
        return this.partidas.findIndex(part => part.id === id);
    }

    private indexPorNome(nome: string): number {
        return jogadores.findIndex(jog => jog.nome === nome);
    }

    async listarPartidas(): Promise<Partida[]> {
        return Promise.resolve(this.partidas);
    };

    async criarPartida(dataJogador: Pick<Jogador, 'nome'>, dataPartida: Pick<Partida, 'tipo'>): Promise<Partida | null> {
        const jogadorIndex = this.indexPorNome(dataJogador.nome);

        if (jogadorIndex === -1 || jogadores[jogadorIndex]?.id === undefined) {
            throw new Error("Moderador não encontrado ou ID inválido.");
        }

        const novaPartida = {
            id: this.partidas.length > 0 ? this.partidas.length + 1 : 1,
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
        this.partidas.push(novaPartida);
        return Promise.resolve(novaPartida);
    }

    async partidaExiste(id: number): Promise<boolean> {
        const partidaIndex = this.indexPorID(id);
        return Promise.resolve(partidaIndex != -1);
    }

    async excluirPartida(id: number): Promise<void> {
        const partidaIndex = this.indexPorID(id);
        if (partidaIndex > -1) {
            this.partidas.splice(partidaIndex, 1);
        }
        return Promise.resolve();
    }

    async atualizarDados(id: number, data: Pick<Partida, 'situacao'>): Promise<Partida | null> {
        const partidaIndex = this.indexPorID(id);

        if (partidaIndex === -1) {
            return Promise.resolve(null);
        }

        const partidaAtualizada = this.partidas[partidaIndex]!;
        partidaAtualizada.situacao = data.situacao ?? partidaAtualizada.situacao;
        return Promise.resolve(partidaAtualizada);
    }

    async listarInscricoes(id: number): Promise<Inscricao[] | undefined> {
        const partidaIndex = this.indexPorID(id);
        return Promise.resolve(this.partidas[partidaIndex]?.inscricoes);
    }

    async adicionarInscricao(id: number, dataJogador: Pick<Jogador, 'nome'>): Promise<Inscricao | null>{
        const partidaIndex = this.indexPorID(id);
        const partida = this.partidas[partidaIndex];

        if (!partida) {
            throw new Error("Partida não encontrada");
        }

        if (partida.situacao === "fechado") {
            throw new Error("Partida já fechada");
        }

        const jogadorIndex = this.indexPorNome(dataJogador.nome);
        const idJogador = jogadores[jogadorIndex]?.id;
        
        if (typeof(idJogador) != "number") {
            throw new Error('ID de jogador não existente');
        }

        const novaInscricao = {
            id_inscricao: partida.inscricoes.length + 1,
            id_jogador: idJogador,
            nome_jogador: dataJogador.nome,
            status: "pendente",
            data: new Date()
        };

        partida.inscricoes.push(novaInscricao);
        return Promise.resolve(novaInscricao);
    }

    async aceitarInscricao(id: number): Promise<void> {
        let partidaDaInscricao: Partida | undefined;
        let inscricao: Inscricao | undefined;

        for (let i = 0; i < this.partidas.length; i++) {
            const partidaEncontrada = this.partidas[i];
            const inscricaoEncontrada = partidaEncontrada?.inscricoes.find(ins => ins.id_inscricao === id);
            if (inscricaoEncontrada) {
                partidaDaInscricao = partidaEncontrada;
                inscricao = inscricaoEncontrada;
                break;
            }
        }

        if (!inscricao || inscricao.status !== 'pendente' || partidaDaInscricao?.situacao !== 'Aberta') {
            throw new Error("Inscrição não encontrada, já aceita/rejeitada ou partida não está aberta.");
        }

        inscricao.status = 'aceita';
        const novoParticipante = {
            id_jogador: inscricao.id_jogador,
            nome_jogador: inscricao.nome_jogador
        }
        partidaDaInscricao?.participantes.push(novoParticipante);
        return Promise.resolve();
    }

    async recusarInscricao(id: number): Promise<void> {
        let inscricao: Inscricao | undefined;

        for (let i = 0; i < this.partidas.length; i++) {
            const partidaProcurada = this.partidas[i];
            const inscricaoEncontrada = partidaProcurada?.inscricoes.find(ins => ins.id_inscricao === id);
            if (inscricaoEncontrada) {
                inscricao = inscricaoEncontrada;
                break;
            }
        }

        if (!inscricao || inscricao.status != "pendente") {
            throw new Error('Incrição não encontrada,já aceita/rejeitada');
        }
        inscricao.status = 'rejeitada';
        return Promise.resolve();
    }

    async adicionarAvaliacao(id: number, nota: number, comentario: string, dataJogador: Pick<Jogador, 'nome'>): Promise<Avaliacao | null> {
        const partidaIndex = this.indexPorID(id);
        const partida = this.partidas[partidaIndex];

        const jogadorIndex = this.indexPorNome(dataJogador.nome);
        const idJogador = jogadores[jogadorIndex]?.id;
        const jaParticipa = partida?.participantes.some(part => part.nome_jogador === dataJogador.nome);

        if (typeof idJogador !== "number" || !jaParticipa) {
        throw new Error("Jogador não encontrado");
        }

        const novaAvaliacao = {
            id: (partida?.avaliacoes?.length ?? 0) + 1,
            id_jogador: idJogador,
            nome_jogador: dataJogador.nome,
            nota: nota,
            comentario: comentario
        }

        partida?.avaliacoes.push(novaAvaliacao);
        return Promise.resolve(novaAvaliacao);
    }
}

export const partidaService = new PartidaService();