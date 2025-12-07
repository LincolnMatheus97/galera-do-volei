import request from 'supertest';
import { app } from '../../src/main/app.js'; // Importa o app (sem abrir a porta)
import { prisma } from '../../src/persistence/prisma/client.js';

// --- LIMPEZA DO BANCO ANTES DOS TESTES ---
beforeAll(async () => {
    await prisma.inscricao.deleteMany();
    await prisma.convite.deleteMany();
    await prisma.avaliacao.deleteMany();
    await prisma.partida.deleteMany();
    await prisma.jogador.deleteMany();
});

// --- FECHAR CONEXÃO DEPOIS ---
afterAll(async () => {
    await prisma.$disconnect();
});

describe('Autenticação (Auth)', () => {

    // Teste 1: Criar Conta
    it('Deve ser possível criar um novo jogador', async () => {
        const response = await request(app)
            .post('/jogadores')
            .send({
                nome: "Tester Automatizado",
                email: "test@auto.com",
                senha: "password123",
                sexo: "Robô",
                categoria: "Bot"
            });

        // Esperamos status 201 (Criado)
        expect(response.status).toBe(201);
        // Esperamos que retorne um ID e o email correto
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe("test@auto.com");
    });

    // Teste 2: Evitar Duplicidade
    it('Não deve permitir criar jogador com email duplicado', async () => {
        const response = await request(app)
            .post('/jogadores')
            .send({
                nome: "Tester Duplicado",
                email: "test@auto.com", // O mesmo email de cima
                senha: "password123",
                sexo: "M",
                categoria: "Pro"
            });

        // Esperamos erro 409 (Conflito)
        expect(response.status).toBe(409);
    });

    // Teste 3: Login Correto
    it('Deve realizar login e retornar Token', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: "test@auto.com",
                senha: "password123"
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    // Teste 4: Login Errado
    it('Deve falhar login com senha errada', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: "test@auto.com",
                senha: "senhaerrada"
            });

        // Pode ser 401 ou 405 dependendo da sua implementação exata de erro
        expect([401, 405]).toContain(response.status);
    });
});