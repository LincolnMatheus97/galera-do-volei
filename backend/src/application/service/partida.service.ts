import { NotFoundErro } from "../../shared/errors/NotFoundErro.errors.js";
import { NotAllowed } from "../../shared/errors/NotAllowed.errors.js";
import type { IPartidaRepository, IJogadorRepository } from "../../domain/repositories/interfaces.js";
import type { CriarPartidaDTO, AtualizarPartidaDTO } from "../../shared/dto/index.dto.js";

export class PartidaService {

    constructor(
        private partidaRepository: IPartidaRepository,
        private jogadorRepository: IJogadorRepository
    ) { }

    private async buscarJogador(nome: string) {
        const todos = await this.jogadorRepository.listarTodos();
        return todos.find((j: any) => j.nome === nome);
    }

    async listarPartidas() {
        return await this.partidaRepository.listarTodas();
    }

    async buscarPorId(id: number) {
        const partida = await this.partidaRepository.buscarPorId(id);
        if (!partida) {
            throw new NotFoundErro("Partida não encontrada.");
        }
        return partida;
    }

    // Agora usamos o DTO oficial atualizado
    async criarPartida(idModerador: number, dataPartida: CriarPartidaDTO) {
        const moderador = await this.jogadorRepository.buscarPorId(idModerador);
        if (!moderador) throw new NotFoundErro("Moderador não encontrado.");

        return await this.partidaRepository.criar({
            ...dataPartida,
            data: dataPartida.data ? new Date(dataPartida.data) : new Date(),
            situacao: "Aberta",
            moderadorId: moderador.id,
            preco: dataPartida.preco || 0,
            pixChave: dataPartida.pixChave,
            limiteCheckin: dataPartida.limiteCheckin || 1,
            bannerUrl: dataPartida.bannerUrl,
            cargaHoraria: dataPartida.cargaHoraria || 0
        });
    }

    async excluirPartida(id: number) {
        const existe = await this.partidaRepository.buscarPorId(id);
        if (!existe) throw new NotFoundErro("Partida não encontrada!");
        await this.partidaRepository.excluir(id);
    }

    async atualizarDados(id: number, data: AtualizarPartidaDTO) {
        const existe = await this.partidaRepository.buscarPorId(id);
        if (!existe) throw new NotFoundErro("Partida não encontrada!");
        return await this.partidaRepository.atualizar(id, data);
    }

    async listarInscricoes(id: number) {
        const partida = await this.partidaRepository.buscarPorId(id);
        if (!partida) throw new NotFoundErro("Partida não encontrada!");
        return await this.partidaRepository.buscarInscricoesPorPartida(id);
    }

    async exportarListaInscritos(idPartida: number) {
        const partida = await this.partidaRepository.buscarPorId(idPartida);
        if (!partida) throw new NotFoundErro("Partida não encontrada!");

        const inscricoes = await this.partidaRepository.buscarInscricoesPorPartida(idPartida);
        
        if (inscricoes.length === 0) {
            throw new NotFoundErro("Não há inscritos para esta partida.");
        }

        // Gera CSV
        let csv = "ID,Nome,Email,Status,CheckIns\n";
        inscricoes.forEach((i: any) => {
            csv += `${i.id},${i.jogador.nome},${i.jogador.email},${i.status},${i.checkInCount}\n`;
        });

        return csv;
    }

    async gerarDadosCertificado(idPartida: number, idUsuario: number) {
        const partida = await this.partidaRepository.buscarPorId(idPartida);
        if (!partida) throw new NotFoundErro("Partida não encontrada.");

        const inscricoes = await this.partidaRepository.buscarInscricoesPorPartida(idPartida);
        const inscricao = inscricoes.find((i: any) => i.jogadorId === idUsuario);

        if (!inscricao) throw new NotAllowed("Você não está inscrito neste evento.");
        
        // Regra do PDF: Exige Check-in
        if (inscricao.checkInCount < 1) {
            throw new NotAllowed("Certificado disponível apenas para quem realizou check-in.");
        }

        return {
            participante: inscricao.jogador.nome,
            evento: partida.titulo,
            data: partida.data,
            cargaHoraria: partida.cargaHoraria,
            codigoValidacao: inscricao.qrCode
        };
    }

    async adicionarInscricao(idPartida: number, dataJogador: { nome: string }) {
        const partida = await this.partidaRepository.buscarPorId(idPartida);
        if (!partida) throw new NotFoundErro("Partida não encontrada");
        if (partida.situacao !== "Aberta") throw new NotAllowed("Partida não está aberta para inscrições.");

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
        if (inscricao.status !== 'pendente') throw new NotAllowed("Inscrição já processada.");

        await this.partidaRepository.atualizarInscricao(idInscricao, { status: 'aceita' });
    }

    async recusarInscricao(idInscricao: number) {
        const inscricao = await this.partidaRepository.buscarInscricaoPorId(idInscricao);
        if (!inscricao) throw new NotFoundErro("Inscrição não encontrada.");
        
        await this.partidaRepository.atualizarInscricao(idInscricao, { status: 'recusada' });
    }

    async confirmarPagamento(idInscricao: number) {
        const inscricao = await this.partidaRepository.buscarInscricaoPorId(idInscricao);
        if (!inscricao) throw new NotFoundErro("Inscrição não encontrada.");

        await this.partidaRepository.atualizarInscricao(idInscricao, { 
            statusPagamento: 'pago',
            status: 'confirmada' 
        });
    }

    async realizarCheckIn(qrCode: string, idPartidaModerador: number) {
        const inscricao = await this.partidaRepository.buscarInscricaoPorQrCode(qrCode);
        
        if (!inscricao) throw new NotFoundErro("QR Code inválido ou inscrição não encontrada.");

        if (inscricao.partidaId !== idPartidaModerador) {
            throw new NotAllowed("Este QR Code pertence a outra partida.");
        }

        const limite = inscricao.partida.limiteCheckin;
        if (inscricao.checkInCount >= limite) {
            throw new NotAllowed(`Limite de ${limite} check-ins atingido para este participante.`);
        }

        await this.partidaRepository.realizarCheckIn(inscricao.id);
        
        return { 
            message: "Check-in realizado com sucesso!", 
            participante: inscricao.jogador.nome,
            checkInsRestantes: limite - (inscricao.checkInCount + 1)
        };
    }

    async adicionarAvaliacao(idPartida: number, nota: number, comentario: string, dataJogador: { nome: string }) {
        const partida = await this.partidaRepository.buscarPorId(idPartida);
        if (!partida) throw new NotFoundErro("Partida não encontrada");

        const jogador = await this.buscarJogador(dataJogador.nome);
        if (!jogador) throw new NotFoundErro("Jogador não encontrado");

        const inscricoes = await this.partidaRepository.buscarInscricoesPorPartida(idPartida);
        const participou = inscricoes.some((i: any) => i.jogadorId === jogador.id && (i.status === 'aceita' || i.status === 'confirmada'));
        
        if (!participou) throw new NotAllowed("Jogador não participou da partida.");

        return await this.partidaRepository.adicionarAvaliacao({
            partidaId: idPartida,
            jogadorId: jogador.id,
            nota,
            comentario
        });
    }
}