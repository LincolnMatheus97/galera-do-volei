import { prisma } from "../prisma/client.js";
import type { Convite } from "@prisma/client";

export class PrismaConviteRepository {
    
    async criar(data: { remetenteId: number, destinatarioId: number, partidaId: number }): Promise<Convite> {
        return await prisma.convite.create({
            data: {
                ...data,
                status: 'pendente'
            }
        });
    }

    async listarPorUsuario(usuarioId: number): Promise<Convite[]> {
        return await prisma.convite.findMany({
            where: {
                OR: [
                    { destinatarioId: usuarioId }, // Convites que recebi
                    { remetenteId: usuarioId }     // Convites que enviei
                ]
            },
            include: {
                remetente: { select: { id: true, nome: true } },
                destinatario: { select: { id: true, nome: true } },
                partida: { select: { id: true, titulo: true, data: true } }
            }
        });
    }

    async buscarPorId(id: number): Promise<Convite | null> {
        return await prisma.convite.findUnique({
            where: { id },
            include: {
                partida: true // Precisamos saber da partida para inscrever o jogador depois
            }
        });
    }

    async atualizarStatus(id: number, status: string): Promise<void> {
        await prisma.convite.update({
            where: { id },
            data: { status }
        });
    }

    async excluir(id: number): Promise<void> {
        await prisma.convite.delete({ where: { id } });
    }

    // Verifica se já existe convite pendente entre essas pessoas para essa partida
    async verificarDuplicidade(remetenteId: number, destinatarioId: number, partidaId: number): Promise<boolean> {
        const count = await prisma.convite.count({
            where: {
                remetenteId,
                destinatarioId,
                partidaId,
                status: 'pendente'
            }
        });
        return count > 0;
    }
}

export const conviteRepository = new PrismaConviteRepository();