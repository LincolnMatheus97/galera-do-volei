export interface IJogadorRepository {
    criar(data: any): Promise<any>;
    buscarPorEmail(email: string): Promise<any>;
    buscarPorId(id: number): Promise<any>;
    listarTodos(): Promise<any[]>;
    excluir(id: number): Promise<void>;
    atualizar(id: number, data: any): Promise<any>;
}

export interface IPartidaRepository {
    criar(data: any): Promise<any>;
    listarTodas(): Promise<any[]>;
    buscarPorId(id: number): Promise<any>;
    excluir(id: number): Promise<void>;
    atualizar(id: number, data: any): Promise<any>;
    
    // Métodos específicos
    buscarInscricoesPorPartida(partidaId: number): Promise<any[]>;
    verificarInscricaoExistente(partidaId: number, jogadorId: number): Promise<boolean>;
    adicionarInscricao(data: any): Promise<any>;
    atualizarInscricao(id: number, status: string): Promise<void>;
    buscarInscricaoPorId(id: number): Promise<any>;
    adicionarAvaliacao(data: any): Promise<any>;
}

export interface IConviteRepository {
    criar(data: any): Promise<any>;
    listarPorUsuario(usuarioId: number): Promise<any[]>;
    buscarPorId(id: number): Promise<any>;
    atualizarStatus(id: number, status: string): Promise<void>;
    excluir(id: number): Promise<void>;
    verificarDuplicidade(remetenteId: number, destinatarioId: number, partidaId: number): Promise<boolean>;
}