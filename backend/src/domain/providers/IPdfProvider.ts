export interface IPdfProvider {
    gerarCertificado(dados: {
        participante: string;
        evento: string;
        data: Date;
        codigoValidacao: string;
    }): Promise<Buffer>;
}