import { Router } from "express";
import { criarJogadorSchema, edtDadosBasicosJogadorSchema, edtModeracaoJogadorSchema, jogadorController, loginSchema } from "../controllers/jogador.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validationMiddleware } from "../middleware/validation.middleware.js";

const router = Router();
router.post('/login', validationMiddleware(loginSchema), jogadorController.login);
router.post('/jogadores', validationMiddleware(criarJogadorSchema), jogadorController.criar);
router.get('/jogadores', authMiddleware, jogadorController.listar);
router.delete('/jogadores/:id', authMiddleware, jogadorController.deletar);
router.patch('/jogadores/:id', authMiddleware, validationMiddleware(edtDadosBasicosJogadorSchema), jogadorController.atualizarDados);
router.patch('/jogadores/:id/moderador', authMiddleware, validationMiddleware(edtModeracaoJogadorSchema), jogadorController.atualizarModerador);

export default router;