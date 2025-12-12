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
    buscarInscricoesPorPartida(partidaId: number): Promise<any[]>;
    verificarInscricaoExistente(partidaId: number, jogadorId: number): Promise<boolean>;
    buscarInscricaoPorQrCode(qrCode: string): Promise<any>;
    adicionarInscricao(data: any): Promise<any>;
    atualizarInscricao(id: number, data: any): Promise<void>;
    buscarInscricaoPorId(id: number): Promise<any>;
    adicionarAvaliacao(data: any): Promise<any>;
    realizarCheckIn(inscricaoId: number): Promise<void>;
}

export interface IConviteRepository {
    criar(data: any): Promise<any>;
    listarPorUsuario(usuarioId: number): Promise<any[]>;
    buscarPorId(id: number): Promise<any>;
    atualizarStatus(id: number, status: string): Promise<void>;
    excluir(id: number): Promise<void>;
    verificarDuplicidade(remetenteId: number, destinatarioId: number, partidaId: number): Promise<boolean>;
}

export interface ISocialRepository {
    solicitarAmizade(solicitanteId: number, destinatarioId: number): Promise<any>;
    aceitarAmizade(id: number): Promise<void>;
    listarAmigos(usuarioId: number): Promise<any[]>;
    buscarAmizade(id: number): Promise<any>;
    buscarRelacao(userA: number, userB: number): Promise<any>; 
    enviarMensagem(remetenteId: number, destinatarioId: number, conteudo: string): Promise<any>;
    listarMensagens(usuarioId: number): Promise<any[]>;
    verificarAmizade(userA: number, userB: number): Promise<boolean>;
}