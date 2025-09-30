import express, { type Request, type Response } from 'express';
import { z } from 'zod';
import routes from './presentation/routes/index.routes.js';

const app = express();
app.use(express.json());

app.use(routes);

let partidas: Partida[] = [
    { 
        id: 1, 
        tipo: "Amador", 
        data: new Date, 
        situacao: "Aberta", 
        moderador: {id_moderador: 1, nome_moderador: "Thalisson"}, 
        participantes: [], 
        inscricoes: [{ id_inscricao: 1, id_jogador: 3, nome_jogador: "Marcos", status: "pendente", data: new Date }],
        avaliacoes: []
    }
];

let convites: Convite[] = [
    { id: 1, status: "pendente", remetente: {id_remetente: 1, nome_remetente: "Thalisson"}, 
    destinatario: {id_destinatario: 2, nome_destinatario: "Natiele"}, id_partida: 1}
];

// --- EndPoints ---



// [GET] /convites - Listar convites
app.get('/convites', (req: Request, res: Response) => {
    res.status(200).json(convites);
});

// [POST] /convites - Criar convite (com verificação)
const criarConviteSchema = z.object({
    nome_remetente: z.string(),
    nome_destinatario: z.string()
});

app.post('/convites', (req: Request, res: Response) => {
    try {
        const data = criarConviteSchema.parse(req.body);

        const remetenteIndex = jogadores.findIndex(jog => jog.nome === data.nome_remetente);
        const destinatarioIndex = jogadores.findIndex(jog => jog.nome === data.nome_destinatario);
        const partidaIndex = partidas.findIndex(part => part.moderador.nome_moderador === data.nome_remetente);

        if(jogadores[remetenteIndex]?.moderador != true) {
            return res.status(400).json({ message: "Não pode enviar solicitação de convite se não for moderador de uma partida!" });
        }

        if (remetenteIndex === -1 || !jogadores[remetenteIndex]) {
            return res.status(404).json({ message: "Remetente não encontrado." });
        }

        if (destinatarioIndex === -1 || !jogadores[destinatarioIndex]) {
            return res.status(404).json({ message: "Destinatario não encontrado." });
        }

        const novoConvite = {
            id: convites.length + 1,
            status: "pendente",
            remetente: {
                id_remetente: jogadores[remetenteIndex].id,
                nome_remetente: data.nome_remetente
            },
            destinatario: {
                id_destinatario: jogadores[destinatarioIndex].id,
                nome_destinatario: data.nome_destinatario
            },
            id_partida: partidaIndex + 1
        };

        convites.push(novoConvite);
        res.status(201).json(novoConvite);
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// [POST] /convites/:id/aceitar - Aceitar convite para partida (com verificação)
app.post('/convites/:id/aceitar', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idConvite = parseInt(idParam, 10);

    if (isNaN(idConvite)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    };

    try {
        const convite = convites.find(conv => conv.id === idConvite);

        if (!convite) {
            return res.status(404).json({ message: "Convite não encontrado." });
        }

        const partidaDoConvite = partidas.find(part => part.id === convite.id_partida);

        if (!partidaDoConvite) {
            return res.status(404).json({ message: "A partida associada a este convite não foi encontrada." });
        }

        if (convite.status !== "pendente") {
            return res.status(400).json({ message: "Este convite não está mais pendente." });
        }

        convite.status = "aceita";
        
        const novoParticipante = {
            id_jogador: convite.destinatario.id_destinatario,
            nome_jogador: convite.destinatario.nome_destinatario
        }

        partidaDoConvite.participantes.push(novoParticipante);
        res.status(200).json({ message: `Jogador ${convite.destinatario.nome_destinatario} aceito na partida!` });
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// [POST] /convites/:id/rejeitar - Rejeitar convite para partida (com verificação)
app.post('/convites/:id/rejeitar', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idConvite = parseInt(idParam, 10);

    if (isNaN(idConvite)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    try {
        const convite = convites.find(conv => conv.id === idConvite);

        if (!convite) {
            return res.status(404).json({ message: "Convite não encontrada." });
        }

        if (convite.status !== "pendente") {
            return res.status(400).json({ message: "Este convite não está mais pendente." });
        }

        convite.status = "rejeitada";

        res.status(200).json({ message: `Convite foi rejeitado.`});
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// [DELETE] /convites/:id - Deletar um convite
app.delete('/convites/:id', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaDeletar = parseInt(idParam, 10);

    if (isNaN(idParaDeletar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    };

    const conviteIndex = convites.findIndex(conv => conv.id === idParaDeletar);

    if (conviteIndex === -1) {
        return res.status(404).json({message: "Convite não encontrado!"});
    };

    convites.splice(conviteIndex, 1);
    console.log(`Convite com id ${idParaDeletar} deletado`);
    res.status(204).send();
});

// [GET] /partidas - Listar partidas
app.get('/partidas', (req: Request, res: Response) => {
    res.status(200).json(partidas);
});

// [POST] /partidas - Criar uma partida (com validação)
const criarPartidaSchema = z.object({
    tipo: z.string(),
    nome_moderador: z.string()
});

app.post('/partidas', (req: Request, res: Response) => {
    try {
        const data = criarPartidaSchema.parse(req.body);

        const moderadorIndex = jogadores.findIndex(jog => jog.nome === data.nome_moderador);

        if (moderadorIndex === -1 || !jogadores[moderadorIndex]) {
            return res.status(400).json({ message: "Moderador não encontrado." });
        }

        const novaPartida = {
            id: partidas.length + 1,
            tipo: data.tipo,
            data: new Date,
            situacao: "Aberta",
            moderador: {
                id_moderador: jogadores[moderadorIndex].id,
                nome_moderador: data.nome_moderador
            },
            participantes: [],
            inscricoes:[],
            avaliacoes: []
        };

        partidas.push(novaPartida);
        res.status(201).json(novaPartida);

    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// [DELETE] /partidas/:id - Deletar uma partida
app.delete('/partidas/:id', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaDeletar = parseInt(idParam, 10);

    if (isNaN(idParaDeletar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    };

    const partidaIndex = partidas.findIndex(part => part.id === idParaDeletar);

    if (partidaIndex === -1) {
        return res.status(404).json({message: "Partida não encontrada!"});
    };

    partidas.splice(partidaIndex, 1);
    console.log(`Partida de id ${partidaIndex} deletada!`);
    res.status(204).send();
});

// [POST] /partidas/:id/participantes - Adicionar um jogador na partida (com validação)
const addJogadorNaPartidaSchema = z.object({
    nome_jogador: z.string()
});

app.post('/partidas/:id/participantes', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAdd = parseInt(idParam, 10);

    if (isNaN(idParaAdd)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    };

    const partidaIndex = partidas.findIndex(part => part.id === idParaAdd);

    if (partidaIndex === -1) {
        return res.status(404).json({message: "Partida não encontrada!"});
    };

    try {
        const data = addJogadorNaPartidaSchema.parse(req.body);

        const conviteIndex = convites.findIndex(conv => 
            (conv.remetente.id_remetente === partidas[partidaIndex]?.moderador.id_moderador) 
            && 
            (conv.destinatario.nome_destinatario === data.nome_jogador)
        );

        if (conviteIndex === -1) {
            return res.status(404).json({message: `Convite para o jogador (${data.nome_jogador}) não existe`});
        };

        const jogadorConvidadoIndex = jogadores.findIndex(jog => 
            jog.id === convites[conviteIndex]?.destinatario.id_destinatario
        );

        if (jogadorConvidadoIndex === -1 || !jogadores[jogadorConvidadoIndex]) {
             return res.status(404).json({message: `O jogador convidado não encontrado`});
        }

        if (jogadores[jogadorConvidadoIndex]?.categoria != partidas[partidaIndex]?.tipo) {
            return res.status(400).json(
                {message: `O jogador (${data.nome_jogador}) podera ser participar da partida pois não possui a mesma categoria da partida`}
            );
        };

        const novoParticipante = {
            id_jogador: jogadores[jogadorConvidadoIndex].id,
            nome_jogador: data.nome_jogador
        };

        partidas[partidaIndex]?.participantes.push(novoParticipante);
        res.status(201).json(partidas[partidaIndex]);

    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// [PATCH] /partidas/:id - Atualizar os dados da partida (com validação)
const edtDadosBasicosPartidaSchema = z.object({
    situacao: z.string()
});

app.patch('/partidas/:id', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAtualizar = parseInt(idParam, 10);

    if (isNaN(idParaAtualizar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    };

    const partidaIndex = partidas.findIndex(part => part.id === idParaAtualizar);

    if (partidaIndex === -1) {
        return res.status(404).json({message: "Partida não encontrada!"});
    };

    try {
        const data = edtDadosBasicosPartidaSchema.parse(req.body);

        const partidaAtualizada = partidas[partidaIndex]!;

        partidaAtualizada.situacao = data.situacao;

        res.status(200).json(partidaAtualizada);
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// [GET] /partidas/:id/inscricoes -- Listar inscrições das partidas
app.get('/partidas/:id/inscricoes', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaVerificar = parseInt(idParam, 10);

    if (isNaN(idParaVerificar)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    };

    const partidaIndex = partidas.findIndex(part => part.id === idParaVerificar);

    if (partidaIndex === -1) {
        return res.status(404).json({message: "Partida não encontrada!"});
    };

    try {
        res.status(200).json(partidas[partidaIndex]?.inscricoes);
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// [POST] /partidas/:id/inscricoes - Adicionar uma inscrição a uma partida (com validação)
const addInscricaoPartidaSchema = z.object({
    nome_jogador: z.string()
});

app.post('/partidas/:id/inscricoes', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAdd = parseInt(idParam, 10);

    if (isNaN(idParaAdd)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    const partidaIndex = partidas.findIndex(part => part.id === idParaAdd);

    if (partidaIndex === -1) {
        return res.status(404).json({message: "Partida não encontrada!"});
    }

    try {
        const data = addInscricaoPartidaSchema.parse(req.body);
        const partida = partidas[partidaIndex]!;
        
        const jogadorIndex = jogadores.findIndex(jog => jog.nome === data.nome_jogador);

        if (jogadorIndex === -1 || !jogadores[jogadorIndex]) {
            return res.status(404).json({ message: "Jogador não encontrado." });
        }

        const jaParticipa = partida.participantes.some(p => p.nome_jogador === data.nome_jogador);
        if (jaParticipa) {
            return res.status(409).json({ message: "Este jogador já está participando da partida!" });
        }

        const jaInscrito = partida.inscricoes.some(i => i.nome_jogador === data.nome_jogador && i.status === 'pendente');
        if (jaInscrito) {
            return res.status(409).json({ message: "Você já enviou uma solicitação de inscrição para esta partida!" });
        }

        const novaInscricao = {
            id_inscricao: partida.inscricoes.length + 1,
            id_jogador: jogadores[jogadorIndex].id,
            nome_jogador: data.nome_jogador,
            status: "pendente",
            data: new Date
        }

        partida.inscricoes.push(novaInscricao);
        res.status(201).json(novaInscricao);
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// [POST] /inscricoes/:id/aceitar - Aceitar uma inscrição de jogador a partida (com verificação)
app.post('/inscricoes/:id/aceitar', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idInscricao = parseInt(idParam, 10);

    if (isNaN(idInscricao)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    };

    try {
        let partidaDaInscricao: Partida | undefined;
        let inscricao: Inscricao | undefined;

        for (let i = 0; i < partidas.length; i++) {
            const partidaEncontrada = partidas[i];
            const inscricaoEncontrada = partidaEncontrada?.inscricoes.find(ins => ins.id_inscricao === idInscricao);
            if (inscricaoEncontrada) {
                partidaDaInscricao = partidaEncontrada;
                inscricao = inscricaoEncontrada;
                break;
            }
        }

        if (!partidaDaInscricao || !inscricao) {
            return res.status(404).json({ message: "Inscrição não encontrada." });
        }

        if (inscricao.status !== "pendente") {
            return res.status(400).json({ message: "Esta inscrição não está mais pendente." });
        }

        inscricao.status = "aceita";
        
        const novoParticipante = {
            id_jogador: inscricao.id_jogador,
            nome_jogador: inscricao.nome_jogador
        }

        partidaDaInscricao.participantes.push(novoParticipante);
        res.status(200).json({ message: `Jogador ${inscricao.nome_jogador} aceito na partida!` });
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// [POST] /inscricoes/:id/rejeitar - Rejeitar uma inscrição de jogador a partida (com verificação)
app.post('/inscricoes/:id/rejeitar', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idInscricao = parseInt(idParam, 10);

    if (isNaN(idInscricao)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    try {
        let inscricao: Inscricao | undefined;

        for (let i = 0; i < partidas.length; i++) {
            const partidaProcurada = partidas[i];
            const inscricaoEncontrada = partidaProcurada?.inscricoes.find(ins => ins.id_inscricao === idInscricao);
            if (inscricaoEncontrada) {
                inscricao = inscricaoEncontrada;
                break;
            }
        }

        if (!inscricao) {
            return res.status(404).json({ message: "Inscrição não encontrada." });
        }

        if (inscricao.status !== "pendente") {
            return res.status(400).json({ message: "Esta inscrição não está mais pendente." });
        }

        inscricao.status = "rejeitada";

        res.status(200).json({ message: `Inscrição de ${inscricao.nome_jogador} foi rejeitada.`});
    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// [POST] /partidas/:id/avaliacoes - Adicionar avaliação do jogadores para a partida (com validação)
const addavaliacaoSchema = z.object({
    nome_jogador: z.string(),
    nota: z.number().min(0).max(10),
    comentario: z.string()
});

app.post('/partidas/:id/avaliacoes', (req: Request, res: Response) => {
    const idParam = req.params.id ?? '';
    const idParaAdd = parseInt(idParam, 10);

    if (isNaN(idParaAdd)) {
        return res.status(400).json({message: "ID inválido. Por favor digite um ID válido"});
    }

    const partidaIndex = partidas.findIndex(part => part.id === idParaAdd);

    if (partidaIndex === -1) {
        return res.status(404).json({message: "Partida não encontrada!"});
    }

    try {
        const data = addavaliacaoSchema.parse(req.body);
        const partida = partidas[partidaIndex]!;

        const jogadorIndex = jogadores.findIndex(jog => jog.nome === data.nome_jogador);

        if (jogadorIndex === -1 || !jogadores[jogadorIndex]) {
            return res.status(404).json({ message: "Jogador não encontrado." });
        }

        const jaParticipa = partida.participantes.some(p => p.nome_jogador === data.nome_jogador);
        if (!jaParticipa) {
            return res.status(409).json({ message: "Este jogador não está participando da partida!" });
        } 

        const novaAvaliação = {
            id: partida.avaliacoes.length + 1,
            id_jogador: jogadores[jogadorIndex].id,
            nome_jogador: data.nome_jogador,
            nota: data.nota,
            comentario: data.comentario
        }

        partida.avaliacoes.push(novaAvaliação);
        res.status(201).json(novaAvaliação);

    } catch (error) {
        res.status(400).json({message: "Dados inválidos", erros: error});
    }
});

// --- Inicialização do Servidor ---
const PORT = 3333;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});