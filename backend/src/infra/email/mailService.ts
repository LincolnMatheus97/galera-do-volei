export class MailService {
    async enviarEmail(destinatario: string, assunto: string, corpo: string): Promise<void> {
        // Em um sistema real, aqui usariamos Nodemailer ou AWS SES
        console.log(`[INFRA-MAIL] Enviando email para ${destinatario}`);
        console.log(`[INFRA-MAIL] Assunto: ${assunto}`);
        // Simulação de delay de rede
        await new Promise(r => setTimeout(r, 100));
    }
}

export const mailService = new MailService();