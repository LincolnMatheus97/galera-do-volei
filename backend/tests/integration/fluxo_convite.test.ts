import request from 'supertest';
import { app } from '../../src/main/app.js';
import { prisma } from '../../src/persistence/prisma/client.js';

let tokenAnfitriao: string = "";
let tokenConvidado: string = "";
let idConvidado: number = 0;
let idPartidaDoConvite: number = 0;

async function limparBanco() {
    await prisma.mensagem.deleteMany();
    await prisma.amizade.deleteMany();
    await prisma.inscricao.deleteMany();
    await prisma.convite.deleteMany();
    await prisma.avaliacao.deleteMany();
    await prisma.partida.deleteMany();
    await prisma.jogador.deleteMany();
}

beforeAll(async () => {
    await limparBanco();

    // 1. Anfitrião
    console.log("--- SETUP: Criando Anfitrião ---");
    const resCriarAnf = await request(app).post('/jogadores').send({ 
        nome: "Anfitriao", email: "host@test.com", senha: "password123", sexo: "M", categoria: "A" 
    });
    if (resCriarAnf.status !== 201) throw new Error("Falha criar Anfitrião");
    
    const loginAnf = await request(app).post('/login').send({ email: "host@test.com", senha: "password123" });
    tokenAnfitriao = loginAnf.body.token;

    // 2. Convidado
    const resCriarConv = await request(app).post('/jogadores').send({ 
        nome: "Visitante", email: "guest@test.com", senha: "password123", sexo: "F", categoria: "A" 
    });
    idConvidado = resCriarConv.body.id;
    const loginConv = await request(app).post('/login').send({ email: "guest@test.com", senha: "password123" });
    tokenConvidado = loginConv.body.token;

    // 3. Partida
    await request(app).post('/partidas')
        .set('Authorization', `Bearer ${tokenAnfitriao}`)
        .send({ tipo: "Amador", titulo: "Partida Convite" });
    
    console.log("--- SETUP OK ---");
});

afterAll(async () => {
    await limparBanco();
    await prisma.$disconnect();
});

describe('Fluxo Completo de Convites', () => {

    it('Anfitrião envia convite', async () => {
        const res = await request(app)
            .post('/convites')
            .set('Authorization', `Bearer ${tokenAnfitriao}`)
            .send({ nome_destinatario: "Visitante" });

        expect(res.status).toBe(201);
        
        // Pega o ID da partida (ou do body ou do banco)
        idPartidaDoConvite = res.body.partidaId;
        if (!idPartidaDoConvite) {
             const c = await prisma.convite.findUnique({ where: { id: res.body.id } });
             idPartidaDoConvite = c?.partidaId ?? 0;
        }
    });

    it('Não deve permitir convite duplicado (Robustez)', async () => {
        const res = await request(app)
            .post('/convites')
            .set('Authorization', `Bearer ${tokenAnfitriao}`)
            .send({ nome_destinatario: "Visitante" });

        // Esperamos 409 Conflict
        expect(res.status).toBe(409);
    });

    it('Visitante visualiza convites', async () => {
        const res = await request(app)
            .get('/convites')
            .set('Authorization', `Bearer ${tokenConvidado}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('Visitante aceita convite', async () => {
        const lista = await request(app).get('/convites').set('Authorization', `Bearer ${tokenConvidado}`);
        const idConvite = lista.body[0].id;

        const res = await request(app)
            .post(`/convites/${idConvite}/aceitar`)
            .set('Authorization', `Bearer ${tokenConvidado}`);

        expect(res.status).toBe(200);
    });

    it('Sistema cria inscrição', async () => {
        const res = await request(app)
            .get(`/partidas/${idPartidaDoConvite}/inscricoes`)
            .set('Authorization', `Bearer ${tokenAnfitriao}`);

        const inscrito = res.body.find((i: any) => i.jogadorId === idConvidado);
        expect(inscrito).toBeTruthy();
    });
});