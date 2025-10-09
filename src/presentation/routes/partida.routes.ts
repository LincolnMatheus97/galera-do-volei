import { Router } from "express";
import { partidaController } from "../controllers/partida.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get('/partidas', partidaController.listarPartidas);
router.get('/partidas/:id/inscricoes', partidaController.listarInscricoes);
router.post('/partidas', authMiddleware, partidaController.criarPartida);
router.delete('/partidas/:id', authMiddleware, partidaController.deletar);
router.patch('/partidas/:id', authMiddleware, partidaController.atualizarDados);
router.post('/partidas/:id/inscricoes', authMiddleware, partidaController.criarInscricao);
router.post('/inscricoes/:id/aceitar', authMiddleware, partidaController.aceitarInscricao);
router.post('/inscricoes/:id/recusar', authMiddleware, partidaController.recusarInscricao);
router.post('/partidas/:id/avaliacoes', authMiddleware, partidaController.criarAvaliacao);

export default router;