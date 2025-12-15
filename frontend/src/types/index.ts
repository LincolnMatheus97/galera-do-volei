export interface Usuario {
    id: number;
    nome: string;
    email: string;
    moderador: boolean;
    visibilidade?: boolean;
}

export interface AuthResponse {
    token: string;
    usuario: Usuario;
}

export interface Avaliacao {
    id: number;
    nota: number;
    comentario: string;
    nome_jogador: string;
    jogadorId: number;
}

export interface Partida {
    id: number;
    titulo: string;
    descricao?: string;
    tipo: string;
    data: string;
    local?: string;
    situacao: 'Aberta' | 'Fechada' | 'Finalizada';
    preco: number;
    pixChave?: string;
    limiteCheckin: number;
    bannerUrl?: string;
    moderador?: {
        id: number;
        nome: string;
        email?: string;
    };
    inscricoes?: Inscricao[];
    avaliacoes?: Avaliacao[];
}

export interface Inscricao {
    id: number;
    status: 'pendente' | 'aceita' | 'recusada' | 'confirmada';
    data: string;
    qrCode?: string;
    checkInCount: number;
    statusPagamento: 'aguardando' | 'pago' | 'gratis';
    jogadorId: number;
    jogador?: {
        nome: string;
        email: string;
    }
}

export interface Convite {
    id: number;
    status: 'pendente' | 'aceita' | 'rejeitada';
    remetente: { id: number; nome: string };
    destinatario: { id: number; nome: string };
    partida: { id: number; titulo: string };
}

export interface LoginInput {
    email: string;
    senha: string;
}

export interface CadastroInput {
    nome: string;
    email: string;
    senha: string;
    sexo: string;
    categoria: string;
}