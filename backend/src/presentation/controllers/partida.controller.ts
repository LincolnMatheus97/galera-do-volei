import { type Request, type Response } from 'express';
import z from 'zod';
import { makePartidaService as partidaService } from '../../main/factories.js';
import { HttpException } from '../middleware/HttpException.middleware.js';
import PDFDocument from 'pdfkit';

// Schemas
export const criarPartidaSchema = z.object({
    tipo: z.string({ message: "O tipo da partida é obrigatória." }),
    titulo: z.string().optional(),
    preco: z.number().optional(),
    pixChave: z.string().optional(),
    limiteCheckin: z.number().optional(),
    bannerUrl: z.string().url().optional(),
});

export const edtDadosBasicosPartidaSchema = z.object({
    situacao: z.string().optional(),
    titulo: z.string().optional(),
    descricao: z.string().optional(),
    data: z.string().optional(), // Recebe ISO string
    local: z.string().optional(),
    preco: z.number().optional(),
    pixChave: z.string().optional(),
    limiteCheckin: z.number().optional(),
    bannerUrl: z.string().url().optional(),
});

export const addInscricaoPartidaSchema = z.object({
    nome_jogador: z.string({ message: "O nome do jogador é obrigatório para inscrição." })
});

export const checkInSchema = z.object({
    qrCode: z.string({ message: "O código QR é obrigatório." })
});

export const addAvaliacaoSchema = z.object({
    nome_jogador: z.string({ message: "O nome do jogador é obrigatório para avaliação." }),
    nota: z.number().min(0).max(10),
    comentario: z.string()
});

class PartidaController {
    async listarPartidas(req: Request, res: Response) {
        const todasAsPartidas = await partidaService.listarPartidas();
        res.status(200).json(todasAsPartidas);
    }

    async buscarPorId(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const id = parseInt(idParam, 10);

        if (isNaN(id)) {
            throw new HttpException("ID inválido.", 400);
        }

        const partida = await partidaService.buscarPorId(id);
        return res.status(200).json(partida);
    }

    async criarPartida(req: Request, res: Response) {
        const idUsuarioLogado = parseInt(req.headers['user-id'] as string, 10);
        if (isNaN(idUsuarioLogado)) throw new HttpException("Token inválido.", 401);

        const novaPartida = await partidaService.criarPartida(idUsuarioLogado, req.body);
        res.status(201).json(novaPartida);
    }

    async deletar(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaDeletar = parseInt(idParam, 10);
        if (isNaN(idParaDeletar)) throw new HttpException("ID inválido.", 400);

        await partidaService.excluirPartida(idParaDeletar);
        return res.status(204).send();
    }

    async atualizarDados(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAtualizar = parseInt(idParam, 10);
        if (isNaN(idParaAtualizar)) throw new HttpException("ID inválido.", 400);
        const partidaAtualizada = await partidaService.atualizarDados(idParaAtualizar, req.body);
        return res.status(200).json(partidaAtualizada);
    }

    async listarInscricoes(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaListar = parseInt(idParam, 10);
        if (isNaN(idParaListar)) throw new HttpException("ID inválido.", 400);

        const todasAsInscricoes = await partidaService.listarInscricoes(idParaListar);
        res.status(200).json(todasAsInscricoes);
    }

    async exportarInscritos(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idPartida = parseInt(idParam, 10);
        if (isNaN(idPartida)) throw new HttpException("ID inválido.", 400);

        const csvData = await partidaService.exportarListaInscritos(idPartida);

        res.header('Content-Type', 'text/csv');
        res.attachment(`inscritos_partida_${idPartida}.csv`);
        return res.send(csvData);
    }

    async gerarCertificado(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idPartida = parseInt(idParam, 10);
        const idUsuario = parseInt(req.headers['user-id'] as string, 10);

        if (isNaN(idPartida) || isNaN(idUsuario)) throw new HttpException("Dados inválidos.", 400);

        const dados = await partidaService.gerarDadosCertificado(idPartida, idUsuario);

        const doc = new PDFDocument({ layout: 'landscape' }); // Deitado fica mais bonito
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificado_${idUsuario}.pdf`);

        doc.pipe(res);
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke(); // Borda
        doc.moveDown(2);
        doc.font('Helvetica-Bold').fontSize(30).text('CERTIFICADO DE PARTICIPAÇÃO 🏐', { align: 'center' });
        doc.moveDown();
        doc.font('Helvetica').fontSize(16).text('Certificamos que', { align: 'center' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(22).text(dados.participante, { align: 'center' });
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(16).text('participou com êxito do evento', { align: 'center' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(22).text(dados.evento, { align: 'center' });
        doc.moveDown();
        
        const dataFormatada = new Date(dados.data).toLocaleDateString('pt-BR');
        doc.font('Helvetica').fontSize(14).text(`Realizado em: ${dataFormatada}`, { align: 'center' });
        doc.moveDown(4);
        doc.fillColor('grey').fontSize(10).text(`Código de Validação: ${dados.codigoValidacao}`, { align: 'center' });
        doc.text('EventSync Oficial', { align: 'center' }).fillColor('black');

        doc.end();
    }

    async criarInscricao(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAdd = parseInt(idParam, 10);
        if (isNaN(idParaAdd)) throw new HttpException("ID inválido.", 400);

        const novaInscricao = await partidaService.adicionarInscricao(idParaAdd, { nome: req.body.nome_jogador });
        return res.status(200).json(novaInscricao);
    }

    async aceitarInscricao(req: Request, res: Response) {
        const idInscricao = parseInt(req.params.id || '', 10);
        if (isNaN(idInscricao)) throw new HttpException("ID inválido.", 400);

        await partidaService.aceitarInscricao(idInscricao);
        return res.status(200).json({ message: 'Inscrição Aceita' });
    }

    async recusarInscricao(req: Request, res: Response) {
        const idInscricao = parseInt(req.params.id || '', 10);
        if (isNaN(idInscricao)) throw new HttpException("ID inválido.", 400);

        await partidaService.recusarInscricao(idInscricao);
        return res.status(200).json({ message: 'Inscrição Recusada' });
    }

    async confirmarPagamento(req: Request, res: Response) {
        const idInscricao = parseInt(req.params.id || '', 10);
        if (isNaN(idInscricao)) throw new HttpException("ID inválido.", 400);

        await partidaService.confirmarPagamento(idInscricao);
        return res.status(200).json({ message: 'Pagamento Confirmado' });
    }

    async realizarCheckIn(req: Request, res: Response) {
        const idPartida = parseInt(req.params.id || '', 10);
        if (isNaN(idPartida)) throw new HttpException("ID da partida inválido.", 400);

        const { qrCode } = checkInSchema.parse(req.body);

        const resultado = await partidaService.realizarCheckIn(qrCode, idPartida);
        return res.status(200).json(resultado);
    }

    async criarAvaliacao(req: Request, res: Response) {
        const idParam = req.params.id ?? '';
        const idParaAdd = parseInt(idParam, 10);
        if (isNaN(idParaAdd)) throw new HttpException("ID inválido.", 400);

        const novaAvaliacao = await partidaService.adicionarAvaliacao(idParaAdd, req.body.nota, req.body.comentario, { nome: req.body.nome_jogador });
        res.status(201).json(novaAvaliacao);
    }
}

export const partidaController = new PartidaController();