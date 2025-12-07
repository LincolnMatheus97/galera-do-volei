import { PrismaClient } from '@prisma/client';

// Criamos uma única conexão para o app todo usar
export const prisma = new PrismaClient({
    // log: ['query', 'error', 'warn'], // Mostra no terminal o que está acontecendo no banco
});