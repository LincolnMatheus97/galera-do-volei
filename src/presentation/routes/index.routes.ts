import { Router } from "express";
import jogadorRoutes from './jogador.routes.js';

const routes = Router();

routes.use(jogadorRoutes);

export default routes;