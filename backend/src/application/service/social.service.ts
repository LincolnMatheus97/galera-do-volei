import { NotAllowed } from "../../shared/errors/NotAllowed.errors.js";
import { NotFoundErro } from "../../shared/errors/NotFoundErro.errors.js";
import { ConflictError } from "../../shared/errors/ConflictError.errors.js"; // Importe isso
import type { ISocialRepository, IJogadorRepository } from "../../domain/repositories/interfaces.js";

export class SocialService {
    constructor(
        private socialRepository: ISocialRepository,
        private jogadorRepository: IJogadorRepository
    ) {}

    async solicitarAmizade(solicitanteId: number, emailDestinatario: string) {
        const destinatario = await this.jogadorRepository.buscarPorEmail(emailDestinatario);
        if (!destinatario) throw new NotFoundErro("Usuário não encontrado.");
        
        if (destinatario.visibilidade === false) {
            throw new NotFoundErro("Usuário não encontrado ou perfil privado.");
        }
        
        if (solicitanteId === destinatario.id) throw new NotAllowed("Você não pode ser amigo de si mesmo.");
        const relacaoExistente = await this.socialRepository.buscarRelacao(solicitanteId, destinatario.id);
        
        if (relacaoExistente) {
             throw new ConflictError("Vocês já são amigos ou já existe uma solicitação pendente.");
        }

        return await this.socialRepository.solicitarAmizade(solicitanteId, destinatario.id);
    }

    // ... restante dos métodos (aceitarAmizade, enviarMensagem, etc) mantenha igual ...
    async aceitarAmizade(idAmizade: number, usuarioLogadoId: number) {
        const amizade = await this.socialRepository.buscarAmizade(idAmizade);
        if (!amizade) throw new NotFoundErro("Solicitação não encontrada.");

        if (amizade.destinatarioId !== usuarioLogadoId) {
            throw new NotAllowed("Essa solicitação não é para você.");
        }

        await this.socialRepository.aceitarAmizade(idAmizade);
    }

    async enviarMensagem(remetenteId: number, destinatarioId: number, conteudo: string) {
        const saoAmigos = await this.socialRepository.verificarAmizade(remetenteId, destinatarioId);
        
        if (!saoAmigos) {
            throw new NotAllowed("Você só pode enviar mensagens para amigos.");
        }

        return await this.socialRepository.enviarMensagem(remetenteId, destinatarioId, conteudo);
    }

    async listarMensagens(usuarioId: number) {
        return await this.socialRepository.listarMensagens(usuarioId);
    }
    
    async listarAmigos(usuarioId: number) {
        return await this.socialRepository.listarAmigos(usuarioId);
    }
}