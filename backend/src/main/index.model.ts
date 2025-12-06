export type Jogador = {
    id: number;
    nome: string;
    moderador: boolean;
    sexo: string;
    categoria: string;
};

export type Remetente = {
    id_remetente: number;
    nome_remetente: string;
};

export type Destinatario = {
    id_destinatario: number;
    nome_destinatario: string;
};

export type Convite = {
    id: number;
    status: string;
    remetente: Remetente;
    destinatario: Destinatario;
    id_partida: number;
};

export type Inscricao = {
    id_inscricao: number;
    id_jogador: number;
    nome_jogador: string;
    status: string;
    data: Date;
};

export type Moderador = {
    id_moderador: number;
    nome_moderador: string;
};

export type Avaliacao = {
    id: number;
    id_jogador: number;
    nome_jogador: string;
    nota: number;
    comentario: string;
}

export type Participante = {
    id_jogador: number;
    nome_jogador: string;
}

export type Partida = {
    id: number;
    tipo: string;
    data: Date;
    situacao: string;
    moderador: Moderador;
    participantes: Participante[];
    inscricoes: Inscricao[];
    avaliacoes: Avaliacao[];
}