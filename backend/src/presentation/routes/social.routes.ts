import { Router } from "express";
import { socialController } from "../controllers/social.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/amigos/solicitar', authMiddleware, socialController.solicitarAmizade);
router.post('/amigos/:id/aceitar', authMiddleware, socialController.aceitarAmizade);
router.get('/amigos', authMiddleware, socialController.listarAmigos);

router.post('/mensagens', authMiddleware, socialController.enviarMensagem);
router.get('/mensagens', authMiddleware, socialController.listarMensagens);

export default router;