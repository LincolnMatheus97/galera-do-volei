import { Router } from "express";
import jogadorRoutes from './jogador.routes.js';
import partidaRoutes from './partida.routes.js';

const routes = Router();

routes.use(jogadorRoutes);
routes.use(partidaRoutes);

export default routes;