import request from 'supertest';
import { app } from '../../src/main/app.js';
import { prisma } from '../../src/persistence/prisma/client.js';

let tokenModerador: string;
let tokenJogador: string;
let idPartida: number;

beforeAll(async () => {
    await prisma.inscricao.deleteMany();
    await prisma.convite.deleteMany();
    await prisma.partida.deleteMany();
    await prisma.jogador.deleteMany();

    // 1. Criar Moderador
    await request(app).post('/jogadores').send({ nome: "Mod", email: "mod@test.com", senha: "password123", sexo: "M", categoria: "A" });
    const loginMod = await request(app).post('/login').send({ email: "mod@test.com", senha: "password123" });
    tokenModerador = loginMod.body.token;

    // 2. Criar Jogador Comum
    await request(app).post('/jogadores').send({ nome: "Player", email: "player@test.com", senha: "password123", sexo: "F", categoria: "A" });
    const loginPlay = await request(app).post('/login').send({ email: "player@test.com", senha: "password123" });
    tokenJogador = loginPlay.body.token;

    // 3. Moderador cria partida
    const partida = await request(app).post('/partidas')
        .set('Authorization', `Bearer ${tokenModerador}`)
        .send({ tipo: "Amador" });
    idPartida = partida.body.id;
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Fluxo de Inscrição (Solicitação)', () => {

    it('Jogador deve conseguir solicitar inscrição', async () => {
        const res = await request(app)
            .post(`/partidas/${idPartida}/inscricoes`)
            .set('Authorization', `Bearer ${tokenJogador}`)
            .send({ nome_jogador: "Player" });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('pendente');
    });

    it('Não deve permitir inscrição duplicada', async () => {
        const res = await request(app)
            .post(`/partidas/${idPartida}/inscricoes`)
            .set('Authorization', `Bearer ${tokenJogador}`)
            .send({ nome_jogador: "Player" });

        expect(res.status).toBe(405); // Not Allowed
    });

    it('Moderador deve ver a inscrição pendente', async () => {
        const res = await request(app)
            .get(`/partidas/${idPartida}/inscricoes`)
            .set('Authorization', `Bearer ${tokenModerador}`);

        expect(res.status).toBe(200);
        expect(res.body[0].jogador.nome).toBe("Player");
    });

    it('Moderador deve conseguir Aceitar a inscrição', async () => {
        const lista = await request(app).get(`/partidas/${idPartida}/inscricoes`).set('Authorization', `Bearer ${tokenModerador}`);
        const idInscricao = lista.body[0].id;

        const res = await request(app)
            .post(`/inscricoes/${idInscricao}/aceitar`)
            .set('Authorization', `Bearer ${tokenModerador}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('Aceita');
    });
});