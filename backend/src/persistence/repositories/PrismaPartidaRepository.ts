import { prisma } from "../prisma/client.js";
import type { Partida, Inscricao, Avaliacao } from "@prisma/client";
import { randomUUID } from "crypto"; // Para gerar o QR Code

export class PrismaPartidaRepository {
    
    // --- Métodos Básicos de Partida ---

    async criar(data: any): Promise<Partida> {
        return await prisma.partida.create({ data });
    }

    async listarTodas(): Promise<Partida[]> {
        return await prisma.partida.findMany({
            include: {
                moderador: { select: { id: true, nome: true } },
                inscricoes: true
            }
        });
    }

    async buscarPorId(id: number): Promise<Partida | null> {
        return await prisma.partida.findUnique({
            where: { id },
            include: {
                moderador: true,
                inscricoes: { include: { jogador: true } }, 
                avaliacoes: true
            }
        });
    }

    async excluir(id: number): Promise<void> {
        const deleteInscricoes = prisma.inscricao.deleteMany({ where: { partidaId: id } });
        const deleteAvaliacoes = prisma.avaliacao.deleteMany({ where: { partidaId: id } });
        const deleteConvites = prisma.convite.deleteMany({ where: { partidaId: id } }); 
        const deletePartida = prisma.partida.delete({ where: { id } });

        await prisma.$transaction([deleteInscricoes, deleteAvaliacoes, deleteConvites, deletePartida]);
    }

    async atualizar(id: number, data: Partial<Partida>): Promise<Partida> {
        return await prisma.partida.update({
            where: { id },
            data
        });
    }

    // --- Métodos Específicos ---

    async buscarInscricoesPorPartida(partidaId: number): Promise<Inscricao[]> {
        return await prisma.inscricao.findMany({
            where: { partidaId },
            include: { jogador: true }
        });
    }

    async verificarInscricaoExistente(partidaId: number, jogadorId: number): Promise<boolean> {
        const count = await prisma.inscricao.count({
            where: { partidaId, jogadorId }
        });
        return count > 0;
    }

    async buscarInscricaoPorQrCode(qrCode: string): Promise<Inscricao | null> {
        return await prisma.inscricao.findUnique({
            where: { qrCode },
            include: { partida: true, jogador: true } // Trazemos dados para validar regras
        });
    }

    // --- Métodos de Manipulação de Inscrição/Avaliação ---

    async adicionarInscricao(data: { partidaId: number, jogadorId: number }): Promise<Inscricao> {
        // Gera um hash único para o QR Code no momento da criação
        const qrCodeHash = randomUUID();
        
        return await prisma.inscricao.create({
            data: {
                partidaId: data.partidaId,
                jogadorId: data.jogadorId,
                status: 'pendente',
                qrCode: qrCodeHash
            }
        });
    }

    async atualizarInscricao(id: number, data: Partial<Inscricao>): Promise<void> {
        await prisma.inscricao.update({
            where: { id },
            data
        });
    }

    async buscarInscricaoPorId(id: number): Promise<Inscricao | null> {
        return await prisma.inscricao.findUnique({ where: { id } });
    }

    async realizarCheckIn(inscricaoId: number): Promise<void> {
        await prisma.inscricao.update({
            where: { id: inscricaoId },
            data: {
                checkInCount: { increment: 1 } // Incrementa atômico no banco
            }
        });
    }

    async adicionarAvaliacao(data: { partidaId: number, jogadorId: number, nota: number, comentario: string }): Promise<Avaliacao> {
        return await prisma.avaliacao.create({ data });
    }
}

export const partidaRepository = new PrismaPartidaRepository();