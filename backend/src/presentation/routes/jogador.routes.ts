import { Router } from "express";
import { criarJogadorSchema, edtDadosBasicosJogadorSchema, edtModeracaoJogadorSchema, jogadorController } from "../controllers/jogador.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validationMiddleware } from "../middleware/validation.middleware.js";

const router = Router();

router.get('/jogadores', jogadorController.listar);
router.post('/jogadores', authMiddleware, validationMiddleware(criarJogadorSchema), jogadorController.criar);
router.delete('/jogadores/:id', authMiddleware, jogadorController.deletar);
router.patch('/jogadores/:id', authMiddleware, validationMiddleware(edtDadosBasicosJogadorSchema), jogadorController.atualizarDados);
router.patch('/jogadores/:id/moderador', authMiddleware, validationMiddleware(edtModeracaoJogadorSchema), jogadorController.atualizarModerador);

export default router;