import { prisma } from "../prisma/client.js";

export class PrismaSocialRepository {
    async solicitarAmizade(solicitanteId: number, destinatarioId: number) {
        return await prisma.amizade.create({
            data: {
                solicitanteId,
                destinatarioId,
                status: 'pendente'
            }
        });
    }

    async aceitarAmizade(id: number) {
        await prisma.amizade.update({
            where: { id },
            data: { status: 'aceita' }
        });
    }

    async buscarAmizade(id: number) {
        return await prisma.amizade.findUnique({ where: { id } });
    }

    async listarAmigos(usuarioId: number) {
        return await prisma.amizade.findMany({
            where: {
                OR: [
                    { solicitanteId: usuarioId, status: 'aceita' },
                    { destinatarioId: usuarioId, status: 'aceita' }
                ]
            },
            include: {
                solicitante: { select: { id: true, nome: true } },
                destinatario: { select: { id: true, nome: true } }
            }
        });
    }

    async verificarAmizade(userA: number, userB: number): Promise<boolean> {
        const count = await prisma.amizade.count({
            where: {
                OR: [
                    { solicitanteId: userA, destinatarioId: userB, status: 'aceita' },
                    { solicitanteId: userB, destinatarioId: userA, status: 'aceita' }
                ]
            }
        });
        return count > 0;
    }

    async enviarMensagem(remetenteId: number, destinatarioId: number, conteudo: string) {
        return await prisma.mensagem.create({
            data: {
                remetenteId,
                destinatarioId,
                conteudo
            }
        });
    }

    async listarMensagens(usuarioId: number) {
        return await prisma.mensagem.findMany({
            where: {
                OR: [
                    { remetenteId: usuarioId },
                    { destinatarioId: usuarioId }
                ]
            },
            orderBy: { data: 'asc' },
            include: {
                remetente: { select: { nome: true } },
                destinatario: { select: { nome: true } }
            }
        });
    }
}

export const socialRepository = new PrismaSocialRepository();