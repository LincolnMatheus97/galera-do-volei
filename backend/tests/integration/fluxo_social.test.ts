import request from 'supertest';
import { app } from '../../src/main/app.js';
import { prisma } from '../../src/persistence/prisma/client.js';

let tokenUserA: string;
let idUserA: number;
let tokenUserB: string;
let idUserB: number;
let emailUserB = "amigo@social.com";

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

    // User A
    const resA = await request(app).post('/jogadores').send({ 
        nome: "Social A", email: "a@social.com", senha: "password123", sexo: "M", categoria: "A" 
    });
    idUserA = resA.body.id;
    const loginA = await request(app).post('/login').send({ email: "a@social.com", senha: "password123" });
    tokenUserA = loginA.body.token;

    // User B
    const resB = await request(app).post('/jogadores').send({ 
        nome: "Social B", email: emailUserB, senha: "password123", sexo: "F", categoria: "A" 
    });
    idUserB = resB.body.id;
    const loginB = await request(app).post('/login').send({ email: emailUserB, senha: "password123" });
    tokenUserB = loginB.body.token;
});

afterAll(async () => {
    await limparBanco();
    await prisma.$disconnect();
});

describe('Módulo Social (Amigos e Mensagens)', () => {

    // Teste Novo de Privacidade
    it('Não deve permitir solicitar amizade se o usuário tiver perfil oculto (Privacidade)', async () => {
        // 1. Simulamos User B ocultando o perfil (update direto no banco pois não expusemos rota ainda)
        await prisma.jogador.update({
            where: { id: idUserB },
            data: { visibilidade: false }
        });

        // 2. A tenta solicitar B
        const res = await request(app)
            .post('/amigos/solicitar')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .send({ email: emailUserB });

        // 3. Esperamos erro (404 Not Found conforme regra implementada no service)
        expect(res.status).toBe(404);
        
        // 4. Restaurar visibilidade para os próximos testes
        await prisma.jogador.update({
            where: { id: idUserB },
            data: { visibilidade: true }
        });
    });

    it('Deve solicitar amizade com sucesso (Perfil Público)', async () => {
        const res = await request(app)
            .post('/amigos/solicitar')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .send({ email: emailUserB });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('pendente');
        expect(res.body.solicitanteId).toBe(idUserA);
        expect(res.body.destinatarioId).toBe(idUserB);
    });

    it('Não deve permitir enviar mensagem se não forem amigos', async () => {
        const res = await request(app)
            .post('/mensagens')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .send({ 
                destinatarioId: idUserB,
                conteudo: "Oi, quer ser meu amigo?"
            });

        // Esperamos erro 403/405 (Not Allowed) ou 400
        expect([400, 403, 405]).toContain(res.status);
    });

    it('Deve aceitar solicitação de amizade', async () => {
        const amizade = await prisma.amizade.findFirst({
            where: { solicitanteId: idUserA, destinatarioId: idUserB }
        });

        if (!amizade) throw new Error("Solicitação de amizade não encontrada no banco");

        const res = await request(app)
            .post(`/amigos/${amizade.id}/aceitar`)
            .set('Authorization', `Bearer ${tokenUserB}`); // B aceita

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("aceita");
    });

    it('Deve listar amigos corretamente', async () => {
        const res = await request(app)
            .get('/amigos')
            .set('Authorization', `Bearer ${tokenUserA}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].destinatario.nome).toBe("Social B");
    });

    it('Deve enviar mensagem com sucesso (agora que são amigos)', async () => {
        const res = await request(app)
            .post('/mensagens')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .send({ 
                destinatarioId: idUserB,
                conteudo: "Agora somos amigos!"
            });

        expect(res.status).toBe(201);
    });

    it('Deve listar mensagens trocadas', async () => {
        const res = await request(app)
            .get('/mensagens')
            .set('Authorization', `Bearer ${tokenUserB}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].conteudo).toBe("Agora somos amigos!");
    });
});