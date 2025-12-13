import request from 'supertest';
import { app } from '../../src/main/app.js';
import { prisma } from '../../src/persistence/prisma/client.js';

let token: string;

beforeAll(async () => {
    // Limpeza em ordem correta devido as chaves estrangeiras
    await prisma.mensagem.deleteMany();
    await prisma.amizade.deleteMany();
    await prisma.inscricao.deleteMany();
    await prisma.convite.deleteMany();
    await prisma.avaliacao.deleteMany();
    await prisma.partida.deleteMany();
    await prisma.jogador.deleteMany();

    await request(app).post('/jogadores').send({
        nome: "Organizador Master",
        email: "org@partida.com",
        senha: "password123",
        sexo: "M",
        categoria: "Pro"
    });

    const login = await request(app).post('/login').send({
        email: "org@partida.com",
        senha: "password123"
    });
    token = login.body.token;
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Módulo de Partidas', () => {

    it('Deve impedir criação de partida sem Token (401)', async () => {
        const res = await request(app)
            .post('/partidas')
            .send({ tipo: "Amador" });
        
        expect(res.status).toBe(401);
    });

    it('Deve criar uma partida Gratuita (Padrão)', async () => {
        const res = await request(app)
            .post('/partidas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                tipo: "Amador",
                titulo: "Volei de Areia"
            });

        expect(res.status).toBe(201);
        expect(res.body.situacao).toBe('Aberta');
        expect(res.body.preco).toBe(0); 
    });

    it('Deve criar uma partida Completa (EventSync: PIX, Banner, Carga Horária)', async () => {
        const res = await request(app)
            .post('/partidas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                tipo: "Federado",
                titulo: "Campeonato Pago",
                preco: 50.00,
                pixChave: "teste@pix.com",
                limiteCheckin: 2,
                bannerUrl: "https://site.com/banner.png", // Novo Campo
            });

        expect(res.status).toBe(201);
        expect(res.body.preco).toBe(50);
        expect(res.body.pixChave).toBe("teste@pix.com");
        expect(res.body.limiteCheckin).toBe(2);
        // Validando novos campos do PDF
        expect(res.body.bannerUrl).toBe("https://site.com/banner.png");
    });

    it('Deve listar as partidas', async () => {
        const res = await request(app).get('/partidas');
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
});