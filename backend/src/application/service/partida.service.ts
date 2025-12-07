import { NotFoundErro } from "../errors/NotFoundErro.errors.js";
import { NotAllowed } from "../errors/NotAllowed.errors.js";
import type { IPartidaRepository, IJogadorRepository } from "../repositories/interfaces.js";

export class PartidaService {
    
    // Injetamos DOIS repositórios (Partida e Jogador)
    constructor(
        private partidaRepository: IPartidaRepository,
        private jogadorRepository: IJogadorRepository
    ) {}

    // Helper privado
    private async buscarJogador(nome: string) {
        const todos = await this.jogadorRepository.listarTodos();
        return todos.find((j: any) => j.nome === nome);
    }
    
    async listarPartidas() {
        return await this.partidaRepository.listarTodas();
    }

    async criarPartida(idModerador: number, dataPartida: any) { 
        const moderador = await this.jogadorRepository.buscarPorId(idModerador);

        if (!moderador) {
            throw new NotFoundErro("Moderador não encontrado.");
        }

        return await this.partidaRepository.criar({
            ...dataPartida,
            data: dataPartida.data ? new Date(dataPartida.data) : new Date(),
            situacao: "Aberta",
            moderadorId: moderador.id
        });
    }
    
    async excluirPartida(id: number) {
        const existe = await this.partidaRepository.buscarPorId(id);
        if (!existe) throw new NotFoundErro("Partida não encontrada!");
        
        await this.partidaRepository.excluir(id);
    }

    async atualizarDados(id: number, data: { situacao: string }) {
        const existe = await this.partidaRepository.buscarPorId(id);
        if (!existe) throw new NotFoundErro("Partida não encontrada!");

        return await this.partidaRepository.atualizar(id, { situacao: data.situacao });
    }

    async listarInscricoes(id: number) {
        const partida = await this.partidaRepository.buscarPorId(id);
        if (!partida) throw new NotFoundErro("Partida não encontrada!");
        return await this.partidaRepository.buscarInscricoesPorPartida(id);
    }

    async adicionarInscricao(idPartida: number, dataJogador: { nome: string }) {
        const partida = await this.partidaRepository.buscarPorId(idPartida);
        if (!partida) throw new NotFoundErro("Partida não encontrada");
        if (partida.situacao === "fechado") throw new NotAllowed("Partida já fechada");

        const jogador = await this.buscarJogador(dataJogador.nome);
        if (!jogador) throw new NotFoundErro('Jogador não existente');

        const jaInscrito = await this.partidaRepository.verificarInscricaoExistente(idPartida, jogador.id);
        if (jaInscrito) throw new NotAllowed("Jogador já inscrito.");

        return await this.partidaRepository.adicionarInscricao({
            partidaId: idPartida,
            jogadorId: jogador.id
        });
    }

    async aceitarInscricao(idInscricao: number) {
        const inscricao = await this.partidaRepository.buscarInscricaoPorId(idInscricao);
        if (!inscricao) throw new NotFoundErro("Inscrição não encontrada.");

        if (inscricao.status !== 'pendente') {
            throw new NotAllowed("Inscrição já processada.");
        }

        await this.partidaRepository.atualizarInscricao(idInscricao, 'aceita');
    }

    async recusarInscricao(idInscricao: number) {
        const inscricao = await this.partidaRepository.buscarInscricaoPorId(idInscricao);
        if (!inscricao) throw new NotFoundErro("Inscrição não encontrada.");
        
        await this.partidaRepository.atualizarInscricao(idInscricao, 'recusada');
    }

    async adicionarAvaliacao(idPartida: number, nota: number, comentario: string, dataJogador: { nome: string }) {
        const partida = await this.partidaRepository.buscarPorId(idPartida);
        if (!partida) throw new NotFoundErro("Partida não encontrada");

        const jogador = await this.buscarJogador(dataJogador.nome);
        if (!jogador) throw new NotFoundErro("Jogador não encontrado");

        const inscricoes = await this.partidaRepository.buscarInscricoesPorPartida(idPartida);
        const participou = inscricoes.some((i: any) => i.jogadorId === jogador.id && i.status === 'aceita');
        
        return await this.partidaRepository.adicionarAvaliacao({
            partidaId: idPartida,
            jogadorId: jogador.id,
            nota,
            comentario
        });
    }
}