import request from 'supertest';
import { app } from '../../src/main/app.js';
import { prisma } from '../../src/persistence/prisma/client.js';

let tokenModerador: string;
let tokenJogador: string;
let idPartida: number;
let idInscricaoConfirmada: number;

beforeAll(async () => {
    // Limpeza completa
    await prisma.mensagem.deleteMany();
    await prisma.amizade.deleteMany();
    await prisma.inscricao.deleteMany();
    await prisma.convite.deleteMany();
    await prisma.avaliacao.deleteMany();
    await prisma.partida.deleteMany();
    await prisma.jogador.deleteMany();

    // 1. Criar Moderador
    await request(app).post('/jogadores').send({ nome: "Mod Insc", email: "mod-insc@test.com", senha: "password123", sexo: "M", categoria: "A" });
    const loginMod = await request(app).post('/login').send({ email: "mod-insc@test.com", senha: "password123" });
    tokenModerador = loginMod.body.token;

    // 2. Criar Jogador
    await request(app).post('/jogadores').send({ nome: "Player Insc", email: "player-insc@test.com", senha: "password123", sexo: "F", categoria: "A" });
    const loginPlay = await request(app).post('/login').send({ email: "player-insc@test.com", senha: "password123" });
    tokenJogador = loginPlay.body.token;

    // 3. Criar Partida Paga
    const partida = await request(app).post('/partidas')
        .set('Authorization', `Bearer ${tokenModerador}`)
        .send({ 
            tipo: "Amador", 
            preco: 20.00,
            limiteCheckin: 1
        });
    idPartida = partida.body.id;
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Fluxo de Inscrição Avançado', () => {

    it('Jogador solicita inscrição', async () => {
        const res = await request(app)
            .post(`/partidas/${idPartida}/inscricoes`)
            .set('Authorization', `Bearer ${tokenJogador}`)
            .send({ nome_jogador: "Player Insc" });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('pendente');
    });

    it('Moderador aceita a inscrição', async () => {
        // Busca ID
        const lista = await request(app).get(`/partidas/${idPartida}/inscricoes`).set('Authorization', `Bearer ${tokenModerador}`);
        idInscricaoConfirmada = lista.body[0].id;

        const res = await request(app)
            .post(`/inscricoes/${idInscricaoConfirmada}/aceitar`)
            .set('Authorization', `Bearer ${tokenModerador}`);

        expect(res.status).toBe(200);
    });

    it('Moderador confirma pagamento', async () => {
        const res = await request(app)
            .post(`/inscricoes/${idInscricaoConfirmada}/pagamento`)
            .set('Authorization', `Bearer ${tokenModerador}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("Pagamento Confirmado");

        // Verifica no banco se mudou mesmo
        const inscricao = await prisma.inscricao.findUnique({ where: { id: idInscricaoConfirmada } });
        expect(inscricao?.statusPagamento).toBe('pago');
        expect(inscricao?.status).toBe('confirmada');
    });

    it('Deve realizar Check-in via QR Code', async () => {
        // 1. Precisamos do QR Code (hash) que está no banco
        const inscricao = await prisma.inscricao.findUnique({ where: { id: idInscricaoConfirmada } });
        const qrCode = inscricao?.qrCode;

        expect(qrCode).toBeDefined();

        // 2. Moderador bipa o QR Code
        const res = await request(app)
            .post(`/partidas/${idPartida}/checkin`)
            .set('Authorization', `Bearer ${tokenModerador}`)
            .send({ qrCode });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("sucesso");
        expect(res.body.participante).toBe("Player Insc");
    });

    it('Deve bloquear Check-in se exceder limite', async () => {
        // A partida foi criada com limiteCheckin: 1
        // Já fizemos 1 check-in acima. O próximo deve falhar.
        const inscricao = await prisma.inscricao.findUnique({ where: { id: idInscricaoConfirmada } });
        const qrCode = inscricao?.qrCode;

        const res = await request(app)
            .post(`/partidas/${idPartida}/checkin`)
            .set('Authorization', `Bearer ${tokenModerador}`)
            .send({ qrCode });

        expect(res.status).toBe(405); // Not Allowed
        expect(res.body.message).toContain("Limite");
    });
});