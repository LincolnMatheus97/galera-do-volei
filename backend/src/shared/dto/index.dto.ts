export type CriarJogadorDTO = {
    nome: string;
    email: string;
    senha: string;
    sexo: string;
    categoria: string;
};

export type LoginDTO = {
    email: string;
    senha: string;
};

export type AtualizarJogadorDTO = {
    nome?: string;
    sexo?: string;
    categoria?: string;
};

export type CriarPartidaDTO = {
    tipo: string;
    titulo?: string;
    descricao?: string;
    data?: string | Date;
    local?: string;
    preco?: number;
    pixChave?: string;
    limiteCheckin?: number;
    bannerUrl?: string;
    cargaHoraria?: number;
};

export type AtualizarPartidaDTO = {
    situacao?: string;
    titulo?: string;
    descricao?: string;
    // outros campos atualizáveis...
};

export type CriarAvaliacaoDTO = {
    nota: number;
    comentario: string;
};