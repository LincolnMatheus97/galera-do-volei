import { Router } from "express";
import { conviteController } from "../controllers/convite.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get('/convites', conviteController.listar);
router.post('/convites', authMiddleware, conviteController.criar);
router.delete('/convites/:id', authMiddleware, conviteController.excluir);
router.post('/convites/:id/aceitar', authMiddleware, conviteController.aceitar);
router.post('/convites/:id/rejeitar', authMiddleware, conviteController.recusar);

export default router;