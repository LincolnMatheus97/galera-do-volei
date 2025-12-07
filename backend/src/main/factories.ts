import { JogadorService } from "../application/service/jogador.service.js";
import { PartidaService } from "../application/service/partida.service.js";
import { ConviteService } from "../application/service/convite.service.js";
import { SocialService } from "../application/service/social.service.js";

import { jogadorRepository } from "../persistence/repositories/PrismaJogadorRepository.js";
import { partidaRepository } from "../persistence/repositories/PrismaPartidaRepository.js";
import { conviteRepository } from "../persistence/repositories/PrismaConviteRepository.js";
import { socialRepository } from "../persistence/repositories/PrismaSocialRepository.js";

export const makeJogadorService = new JogadorService(jogadorRepository);

export const makePartidaService = new PartidaService(partidaRepository, jogadorRepository);

export const makeConviteService = new ConviteService(conviteRepository, jogadorRepository, partidaRepository);

export const makeSocialService = new SocialService(socialRepository, jogadorRepository);