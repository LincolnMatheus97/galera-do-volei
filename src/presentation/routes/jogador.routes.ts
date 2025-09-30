import { Router } from "express";
import * as jogadorController from '../controllers/jogador.controller.js';

const router = Router();

router.get('/jogadores', jogadorController.listar);
router.post('/jogadores', jogadorController.criar);
router.delete('/jogadores', jogadorController.deletar);
router.patch('/jogadores/:id', jogadorController.atualizarDados);
router.patch('jogadores/:id/moderador', jogadorController.atualizarModerador);

export default router;