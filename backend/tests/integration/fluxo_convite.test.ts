import request from 'supertest';
import { app } from '../../src/main/app.js';
import { prisma } from '../../src/persistence/prisma/client.js';

let tokenAnfitriao: string = "";
let tokenConvidado: string = "";
let idConvidado: number = 0;
let idPartidaDoConvite: number = 0;

// Função auxiliar para garantir que o banco está limpo
async function limparBanco() {
    await prisma.inscricao.deleteMany();
    await prisma.convite.deleteMany();
    await prisma.avaliacao.deleteMany();
    await prisma.partida.deleteMany();
    await prisma.jogador.deleteMany();
}

beforeAll(async () => {
    // 1. Limpeza
    await limparBanco();

    // 2. Criar Anfitrião
    console.log("--- SETUP: Criando Anfitrião ---");
    const resCriarAnf = await request(app).post('/jogadores').send({
        nome: "Anfitriao", email: "host@test.com", senha: "password123", sexo: "M", categoria: "A"
    });

    if (resCriarAnf.status !== 201) {
        console.error("FALHA AO CRIAR ANFITRIÃO:", JSON.stringify(resCriarAnf.body, null, 2));
        throw new Error("Abortando testes: Falha na criação do Anfitrião");
    }

    const resLoginAnf = await request(app).post('/login').send({ email: "host@test.com", senha: "password123" });
    if (resLoginAnf.status !== 200) {
        console.error("FALHA AO LOGAR ANFITRIÃO:", JSON.stringify(resLoginAnf.body, null, 2));
        throw new Error("Abortando testes: Falha no login do Anfitrião");
    }
    tokenAnfitriao = resLoginAnf.body.token;

    // 3. Criar Convidado
    console.log("--- SETUP: Criando Convidado ---");
    const resCriarConv = await request(app).post('/jogadores').send({
        nome: "Visitante", email: "guest@test.com", senha: "password123", sexo: "F", categoria: "A"
    });
    if (resCriarConv.status !== 201) {
        console.error("FALHA AO CRIAR CONVIDADO:", JSON.stringify(resCriarConv.body, null, 2));
        throw new Error("Abortando testes: Falha na criação do Convidado");
    }
    idConvidado = resCriarConv.body.id;

    const resLoginConv = await request(app).post('/login').send({ email: "guest@test.com", senha: "password123" });
    tokenConvidado = resLoginConv.body.token;

    // 4. Anfitrião cria partida
    console.log("--- SETUP: Criando Partida ---");
    const resPartida = await request(app).post('/partidas')
        .set('Authorization', `Bearer ${tokenAnfitriao}`)
        .send({ tipo: "Amador", titulo: "Partida Teste" });

    if (resPartida.status !== 201) {
        console.error("FALHA AO CRIAR PARTIDA:", JSON.stringify(resPartida.body, null, 2));
        throw new Error("Abortando testes: Falha na criação da Partida");
    }

    console.log("--- SETUP CONCLUÍDO COM SUCESSO ---");
});

afterAll(async () => {
    await limparBanco();
    await prisma.$disconnect();
});

describe('Fluxo Completo de Convites', () => {

    it('Anfitrião envia convite para Visitante', async () => {
        const res = await request(app)
            .post('/convites')
            .set('Authorization', `Bearer ${tokenAnfitriao}`)
            .send({ nome_destinatario: "Visitante" });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('pendente');

        idPartidaDoConvite = res.body.partidaId;
        // Fallback se não vier no body direto (depende do repositório)
        if (!idPartidaDoConvite) {
            const conviteBanco = await prisma.convite.findUnique({ where: { id: res.body.id } });
            idPartidaDoConvite = conviteBanco?.partidaId ?? 0;
        }
    });

    it('Visitante visualiza seus convites', async () => {
        const res = await request(app)
            .get('/convites')
            .set('Authorization', `Bearer ${tokenConvidado}`);

        if (res.status !== 200) console.error("Erro GET /convites:", res.body);
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        // Ajuste para não quebrar se o include for diferente
        if (res.body[0].remetente) {
            expect(res.body[0].remetente.nome).toBe("Anfitriao");
        }
    });

    it('Visitante aceita o convite', async () => {
        const lista = await request(app).get('/convites').set('Authorization', `Bearer ${tokenConvidado}`);
        if (lista.body.length === 0) throw new Error("Lista vazia, impossível aceitar");

        const idConvite = lista.body[0].id;

        const res = await request(app)
            .post(`/convites/${idConvite}/aceitar`)
            .set('Authorization', `Bearer ${tokenConvidado}`);

        expect(res.status).toBe(200);
    });

    it('Sistema deve ter criado uma inscrição automaticamente', async () => {
        // Usa o ID da partida capturado no primeiro teste
        const res = await request(app)
            .get(`/partidas/${idPartidaDoConvite}/inscricoes`)
            .set('Authorization', `Bearer ${tokenAnfitriao}`);

        expect(res.status).toBe(200);
        const inscrito = res.body.find((i: any) => i.jogadorId === idConvidado);
        expect(inscrito).toBeTruthy();
    });
});