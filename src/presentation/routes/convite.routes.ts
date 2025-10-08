import { Router } from "express";
import { conviteController } from "../controllers/convite.controller.js";

const router = Router();

router.get('/convites', conviteController.listar);
router.post('/convites', conviteController.criar);
router.delete('/convites/:id', conviteController.excluir);
router.post('/convites/:id/aceitar', conviteController.aceitar);
router.post('/convites/:id/rejeitar', conviteController.recusar);

export default router;