import { Router } from "express";
import { partidaController } from "../controllers/partida.controller.js";

const router = Router();

router.get('/partidas', partidaController.listarPartidas);
router.post('/partidas', partidaController.criarPartida);
router.delete('/partidas/:id', partidaController.deletar);
router.patch('/partidas/:id', partidaController.atualizarDados);
router.get('/partidas/:id/inscricoes', partidaController.listarInscricoes);
router.post('/partidas/:id/inscricoes', partidaController.criarInscricao);
router.post('/inscricoes/:id/aceitar', partidaController.aceitarInscricao);
router.post('/inscricoes/:id/recusar', partidaController.recusarInscricao);
router.post('/partidas/:id/avaliacoes', partidaController.criarAvaliacao);

export default router;