import { prisma } from "../prisma/client.js";
import type { Jogador } from "@prisma/client";

export class PrismaJogadorRepository {
    
    async criar(data: Omit<Jogador, 'id' | 'moderador'>): Promise<Jogador> {
        const jogador = await prisma.jogador.create({
            data: {
                ...data,
                moderador: false // Padrão, ninguém nasce moderador
            }
        });
        return jogador;
    }

    async buscarPorEmail(email: string): Promise<Jogador | null> {
        return await prisma.jogador.findUnique({
            where: { email }
        });
    }

    async buscarPorId(id: number): Promise<Jogador | null> {
        return await prisma.jogador.findUnique({
            where: { id }
        });
    }

    async listarTodos(): Promise<Jogador[]> {
        return await prisma.jogador.findMany();
    }

    async excluir(id: number): Promise<void> {
        await prisma.jogador.delete({
            where: { id }
        });
    }

    async atualizar(id: number, data: Partial<Jogador>): Promise<Jogador> {
        return await prisma.jogador.update({
            where: { id },
            data
        });
    }
}

export const jogadorRepository = new PrismaJogadorRepository();