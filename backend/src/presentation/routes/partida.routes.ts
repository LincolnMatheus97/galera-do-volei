import { Router } from "express";
import { addAvaliacaoSchema, addInscricaoPartidaSchema, checkInSchema, criarPartidaSchema, edtDadosBasicosPartidaSchema, partidaController } from "../controllers/partida.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validationMiddleware } from "../middleware/validation.middleware.js";

const router = Router();

router.get('/partidas', partidaController.listarPartidas);
router.get('/partidas/:id/inscricoes', partidaController.listarInscricoes);
router.get('/partidas/:id/export', authMiddleware, partidaController.exportarInscritos);
router.get('/partidas/:id/certificado', authMiddleware, partidaController.gerarCertificado);
router.post('/partidas', authMiddleware, validationMiddleware(criarPartidaSchema), partidaController.criarPartida);
router.delete('/partidas/:id', authMiddleware, partidaController.deletar);
router.patch('/partidas/:id', authMiddleware, validationMiddleware(edtDadosBasicosPartidaSchema), partidaController.atualizarDados);
router.post('/partidas/:id/inscricoes', validationMiddleware(addInscricaoPartidaSchema), authMiddleware, partidaController.criarInscricao);
router.post('/inscricoes/:id/aceitar', authMiddleware, partidaController.aceitarInscricao);
router.post('/inscricoes/:id/recusar', authMiddleware, partidaController.recusarInscricao);
router.post('/inscricoes/:id/pagamento', authMiddleware, partidaController.confirmarPagamento);
router.post('/partidas/:id/checkin', authMiddleware, validationMiddleware(checkInSchema), partidaController.realizarCheckIn);
router.post('/partidas/:id/avaliacoes', validationMiddleware(addAvaliacaoSchema), authMiddleware, partidaController.criarAvaliacao);

export default router;