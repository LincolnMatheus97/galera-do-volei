import { prisma } from "../prisma/client.js";
import type { Partida, Inscricao, Avaliacao } from "@prisma/client";

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
            // Aqui garantimos que ao buscar a partida, as inscrições vêm junto
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

    // --- MÉTODOS ESPECÍFICOS ---
    // Criamos métodos que o Service precisa, escondendo o Prisma aqui dentro.

    async buscarInscricoesPorPartida(partidaId: number): Promise<Inscricao[]> {
        return await prisma.inscricao.findMany({
            where: { partidaId },
            include: { jogador: true }
        });
    }

    async verificarInscricaoExistente(partidaId: number, jogadorId: number): Promise<boolean> {
        const count = await prisma.inscricao.count({
            where: {
                partidaId,
                jogadorId
            }
        });
        return count > 0;
    }

    // --- Métodos de Manipulação de Inscrição/Avaliação ---

    async adicionarInscricao(data: { partidaId: number, jogadorId: number }): Promise<Inscricao> {
        return await prisma.inscricao.create({
            data: {
                partidaId: data.partidaId,
                jogadorId: data.jogadorId,
                status: 'pendente'
            }
        });
    }

    async atualizarInscricao(id: number, status: string): Promise<void> {
        await prisma.inscricao.update({
            where: { id },
            data: { status }
        });
    }

    async buscarInscricaoPorId(id: number): Promise<Inscricao | null> {
        return await prisma.inscricao.findUnique({ where: { id } });
    }

    async adicionarAvaliacao(data: { partidaId: number, jogadorId: number, nota: number, comentario: string }): Promise<Avaliacao> {
        return await prisma.avaliacao.create({ data });
    }
}

export const partidaRepository = new PrismaPartidaRepository();