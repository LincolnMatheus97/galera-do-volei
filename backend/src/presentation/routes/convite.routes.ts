import { Router } from "express";
import { conviteController, criarConviteSchema } from "../controllers/convite.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validationMiddleware } from "../middleware/validation.middleware.js";

const router = Router();

router.get('/convites', conviteController.listar);
router.post('/convites', authMiddleware, validationMiddleware(criarConviteSchema), conviteController.criar);
router.delete('/convites/:id', authMiddleware, conviteController.excluir);
router.post('/convites/:id/aceitar', authMiddleware, conviteController.aceitar);
router.post('/convites/:id/rejeitar', authMiddleware, conviteController.recusar);

export default router;