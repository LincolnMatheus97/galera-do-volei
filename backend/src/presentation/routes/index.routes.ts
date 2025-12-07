import { Router } from "express";
import jogadorRoutes from './jogador.routes.js';
import partidaRoutes from './partida.routes.js';
import conviteRoutes from './convite.routes.js';
import socialRoutes from './social.routes.js';

const routes = Router();

routes.use(jogadorRoutes);
routes.use(partidaRoutes);
routes.use(conviteRoutes);
routes.use(socialRoutes);

export default routes;