import { Router } from "express";
import { jogadorController } from "../controllers/jogador.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get('/jogadores', jogadorController.listar);
router.post('/jogadores', authMiddleware, jogadorController.criar);
router.delete('/jogadores/:id', authMiddleware, jogadorController.deletar);
router.patch('/jogadores/:id', authMiddleware, jogadorController.atualizarDados);
router.patch('/jogadores/:id/moderador', authMiddleware, jogadorController.atualizarModerador);

export default router;