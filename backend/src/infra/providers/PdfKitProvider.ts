import PDFDocument from 'pdfkit';
import path from 'path';
import type { IPdfProvider } from '../../domain/providers/IPdfProvider.js';

export class PdfKitProvider implements IPdfProvider {
    
    async gerarCertificado(dados: { participante: string; evento: string; data: Date; codigoValidacao: string; }): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ 
                layout: 'landscape', 
                size: 'A4',
                margin: 0
            });

            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            doc.on('error', (err) => {
                reject(err);
            });

            // --- ESTILIZAÇÃO ---
            const blueColor = '#1e40af';   // Azul Institucional
            const orangeColor = '#f97316'; // Laranja Vôlei
            const greyColor = '#4b5563';

            // 1. Fundo Branco
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
            
            // 2. Borda Dupla (Azul Grossa + Laranja Fina)
            doc.lineWidth(20);
            doc.strokeColor(blueColor);
            doc.rect(0, 0, doc.page.width, doc.page.height).stroke();
            
            doc.lineWidth(3);
            doc.strokeColor(orangeColor);
            doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke();

            // 3. Cabeçalho (Logo + Título)
            doc.moveDown(3); // Empurra o conteúdo para baixo
            const titleY = doc.y; // Guarda a altura atual para alinhar a imagem

            // Tenta carregar a imagem da bola
            const logoPath = path.resolve(process.cwd(), 'src', 'assets', 'logo-volei.png');
            try {
                doc.image(logoPath, (doc.page.width / 2) + 280, titleY - 10, { width: 70 }); 
            } catch (e) { 
                console.log("Logo não encontrada, gerando sem imagem.");
            }

            // Título Centralizado
            doc.font('Helvetica-Bold').fontSize(32).fillColor(blueColor)
               .text('CERTIFICADO DE PARTICIPAÇÃO', { align: 'center' });
            
            // Linha decorativa abaixo do título
            doc.moveDown(0.5);
            doc.moveTo((doc.page.width / 2) - 150, doc.y)
               .lineTo((doc.page.width / 2) + 150, doc.y)
               .lineWidth(2)
               .strokeColor(orangeColor)
               .stroke();

            doc.moveDown(2);

            // 4. Texto Principal
            doc.font('Helvetica').fontSize(16).fillColor(greyColor)
               .text('Certificamos para os devidos fins que', { align: 'center' });
            
            doc.moveDown(0.8);
            
            // Nome do Participante (Destaque Gigante)
            doc.font('Helvetica-Bold').fontSize(36).fillColor(blueColor)
               .text(dados.participante, { align: 'center' });

            doc.moveDown(0.8);

            doc.font('Helvetica').fontSize(16).fillColor(greyColor)
               .text('participou com êxito e dedicação do evento', { align: 'center' });
            
            doc.moveDown(0.5);

            // Nome do Evento
            doc.font('Helvetica-Bold').fontSize(24).fillColor(orangeColor)
               .text(dados.evento, { align: 'center' });

            doc.moveDown(1.5);

            // Data formatada
            const dataFormatada = new Date(dados.data).toLocaleDateString('pt-BR', { 
                day: 'numeric', month: 'long', year: 'numeric' 
            });
            doc.font('Helvetica').fontSize(14).fillColor('black')
               .text(`Realizado em: ${dataFormatada}`, { align: 'center' });

            // 5. Rodapé e Assinatura
            doc.moveDown(3);
            const yAssinatura = doc.y;
            
            // Linha da assinatura
            doc.moveTo((doc.page.width / 2) - 100, yAssinatura)
               .lineTo((doc.page.width / 2) + 100, yAssinatura)
               .lineWidth(1)
               .strokeColor('black')
               .stroke();
            
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').fontSize(12).fillColor(blueColor).text('EventSync Oficial', { align: 'center' });
            doc.font('Helvetica').fontSize(10).fillColor(greyColor).text('Organização Esportiva', { align: 'center' });

            // Código de Validação (Hash)
            doc.moveDown(3);
            doc.font('Courier').fontSize(9).fillColor('#9ca3af') // Cinza claro
               .text(`Código de Autenticação: ${dados.codigoValidacao}`, { align: 'center' });

            doc.end();
        });
    }
}