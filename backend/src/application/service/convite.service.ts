import { NotFoundErro } from "../../shared/errors/NotFoundErro.errors.js";
import { NotAllowed } from "../../shared/errors/NotAllowed.errors.js";
import { ConflictError } from "../../shared/errors/ConflictError.errors.js";
import type { IConviteRepository, IJogadorRepository, IPartidaRepository } from "../../domain/repositories/interfaces.js";

export class ConviteService {

    // Injeção de 3 dependências via construtor
    constructor(
        private conviteRepository: IConviteRepository,
        private jogadorRepository: IJogadorRepository,
        private partidaRepository: IPartidaRepository
    ) { }

    async listarConvites(usuarioId?: number) {
        if (usuarioId) {
            return await this.conviteRepository.listarPorUsuario(usuarioId);
        }
        return [];
    }

    async criarConvite(remetenteId: number, nomeDestinatario: string) {

        const remetente = await this.jogadorRepository.buscarPorId(remetenteId);
        if (!remetente) throw new NotFoundErro("Remetente inválido.");

        // Busca todos para filtrar por nome (poderia ser otimizado no repo futuro)
        const todos = await this.jogadorRepository.listarTodos();
        const destinatario = todos.find((j: any) => j.nome === nomeDestinatario);

        if (!destinatario) throw new NotFoundErro("Jogador destinatário não encontrado.");
        if (remetente.id === destinatario.id) throw new NotAllowed("Você não pode convidar a si mesmo.");

        const todasPartidas = await this.partidaRepository.listarTodas();
        const partida = todasPartidas.find((p: any) => p.moderadorId === remetente.id && p.situacao === 'Aberta');

        if (!partida) {
            throw new NotFoundErro("Você não tem nenhuma partida aberta para convidar jogadores.");
        }

        const jaConvidado = await this.conviteRepository.verificarDuplicidade(remetente.id, destinatario.id, partida.id);
        if (jaConvidado) {
            throw new ConflictError("Já existe um convite pendente para este jogador.");
        }

        return await this.conviteRepository.criar({
            remetenteId: remetente.id,
            destinatarioId: destinatario.id,
            partidaId: partida.id
        });
    }

    async excluirConvite(id: number) {
        const existe = await this.conviteRepository.buscarPorId(id);
        if (!existe) throw new NotFoundErro("Convite não encontrado");
        await this.conviteRepository.excluir(id);
    }

    async aceitarConvite(id: number, usuarioId: number) {
        const convite = await this.conviteRepository.buscarPorId(id);
        if (!convite) throw new NotFoundErro("Convite não encontrado");

        if (convite.destinatarioId !== usuarioId) throw new NotAllowed("Este convite não é para você.");
        if (convite.status !== "pendente") throw new NotAllowed("Convite já respondido.");

        await this.conviteRepository.atualizarStatus(id, "aceita");
        const inscricao = await this.partidaRepository.adicionarInscricao({
            partidaId: convite.partidaId,
            jogadorId: convite.destinatarioId
        });

        if (inscricao && inscricao.id) {
            await this.partidaRepository.atualizarInscricao(inscricao.id, { status: 'aceita' });
        }
    }

    async rejeitarConvite(id: number, usuarioId: number) {
        const convite = await this.conviteRepository.buscarPorId(id);
        if (!convite) throw new NotFoundErro("Convite não encontrado");

        if (convite.destinatarioId !== usuarioId) throw new NotAllowed("Este convite não é para você.");
        if (convite.status !== "pendente") throw new NotAllowed("Convite já respondido.");

        await this.conviteRepository.atualizarStatus(id, "rejeitada");
    }
}