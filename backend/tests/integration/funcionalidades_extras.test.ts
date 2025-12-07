import request from 'supertest';
import { app } from '../../src/main/app.js';
import { prisma } from '../../src/persistence/prisma/client.js';

let tokenMod: string;
let tokenPlayer: string;
let idPartida: number;
let idInscricao: number;
let qrCode: string;

beforeAll(async () => {
    // Limpeza completa do banco
    await prisma.mensagem.deleteMany();
    await prisma.amizade.deleteMany();
    await prisma.inscricao.deleteMany();
    await prisma.convite.deleteMany();
    await prisma.avaliacao.deleteMany();
    await prisma.partida.deleteMany();
    await prisma.jogador.deleteMany();

    // 1. Criar Moderador (Senha forte > 6 digitos)
    const modResponse = await request(app).post('/jogadores').send({ 
        nome: "Moderator", 
        email: "mod@extras.com", 
        senha: "password123", 
        sexo: "M", 
        categoria: "A" 
    });
    
    // Sanity Check: Se falhar aqui, paramos o teste para não dar erro 401 falso depois
    if (modResponse.status !== 201) {
        console.error("Erro ao criar Moderador:", modResponse.body);
        throw new Error("Falha no Setup: Não foi possível criar Moderador");
    }

    const loginMod = await request(app).post('/login').send({ email: "mod@extras.com", senha: "password123" });
    tokenMod = loginMod.body.token;

    // 2. Criar Player (Senha forte > 6 digitos)
    await request(app).post('/jogadores').send({ 
        nome: "PlayerExtra", 
        email: "player@extras.com", 
        senha: "password123", // CORRIGIDO
        sexo: "F", 
        categoria: "A" 
    });
    
    const loginPlayer = await request(app).post('/login').send({ email: "player@extras.com", senha: "password123" });
    tokenPlayer = loginPlayer.body.token;

    // 3. Partida (Com Carga Horária)
    const partida = await request(app).post('/partidas')
        .set('Authorization', `Bearer ${tokenMod}`)
        .send({ tipo: "Amador", titulo: "Curso Volei", cargaHoraria: 10 });
    idPartida = partida.body.id;

    // 4. Inscrição e Aceite
    const insc = await request(app).post(`/partidas/${idPartida}/inscricoes`)
        .set('Authorization', `Bearer ${tokenPlayer}`)
        .send({ nome_jogador: "PlayerExtra" });
    idInscricao = insc.body.id;
    qrCode = insc.body.qrCode;

    await request(app).post(`/inscricoes/${idInscricao}/aceitar`).set('Authorization', `Bearer ${tokenMod}`);
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Funcionalidades Extras (PDF e CSV)', () => {

    it('Deve permitir ao moderador exportar lista de inscritos (CSV)', async () => {
        const res = await request(app)
            .get(`/partidas/${idPartida}/export`)
            .set('Authorization', `Bearer ${tokenMod}`);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('text/csv');
        // Verifica se o CSV contém o nome do jogador
        expect(res.text).toContain('PlayerExtra');
        expect(res.text).toContain('ID,Nome,Email'); // Cabeçalho
    });

    it('NÃO deve gerar certificado se não fez Check-in', async () => {
        const res = await request(app)
            .get(`/partidas/${idPartida}/certificado`)
            .set('Authorization', `Bearer ${tokenPlayer}`);

        // Agora que o token é válido, esperamos o erro de Regra de Negócio (405) e não Auth (401)
        expect([400, 403, 405]).toContain(res.status);
        expect(res.body.message).toMatch(/check-in/i);
    });

    it('Deve realizar Check-in', async () => {
        const res = await request(app)
            .post(`/partidas/${idPartida}/checkin`)
            .set('Authorization', `Bearer ${tokenMod}`)
            .send({ qrCode });
        
        expect(res.status).toBe(200);
    });

    it('Deve gerar certificado (PDF) após Check-in', async () => {
        const res = await request(app)
            .get(`/partidas/${idPartida}/certificado`)
            .set('Authorization', `Bearer ${tokenPlayer}`);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toBe('application/pdf');
    });
});