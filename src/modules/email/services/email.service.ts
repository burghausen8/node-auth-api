import { Injectable } from '@nestjs/common';

import { SmtpProvider } from '../providers/mail.provider';

@Injectable()
export class EmailService {
  constructor(private readonly smtpProvider: SmtpProvider) {}

  async sendVerificationEmail(email: string, code: string) {
    await this.smtpProvider.sendMail(
      email,
      'Confirmação de cadastro',
      this.buildVerificationTemplate(code),
    );
  }

  private buildVerificationTemplate(code: string): string {
    return ` <!DOCTYPE html> <html lang="pt-BR"> <head> <meta charset="UTF-8" /> <title>Código de Verificação</title> </head> <body style=" margin:0; padding:40px 20px; background:#f5f7fb; font-family:Arial, Helvetica, sans-serif; " > <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;" > <tr> <td style=" background:#ffffff; border-radius:12px; padding:48px 40px; box-shadow:0 4px 12px rgba(0,0,0,.08); " > <h1 style=" margin:0; text-align:center; color:#1f2937; font-size:28px; " > Confirme seu cadastro </h1> <p style=" margin:24px 0 0; font-size:16px; line-height:26px; color:#4b5563; text-align:center; " > Seja bem-vindo! </p> <p style=" margin:12px 0 32px; font-size:16px; line-height:26px; color:#4b5563; text-align:center; " > Utilize o código abaixo para concluir seu cadastro. </p> <div style=" background:#eff6ff; border:2px solid #2563eb; border-radius:10px; padding:20px; text-align:center; " > <span style=" font-size:38px; font-weight:bold; color:#2563eb; letter-spacing:10px; " > ${code} </span> </div> <p style=" margin:32px 0 0; text-align:center; color:#4b5563; font-size:15px; line-height:24px; " > Este código é válido por <strong>15 minutos</strong>. </p> <p style=" margin:16px 0 0; text-align:center; color:#6b7280; font-size:14px; line-height:22px; " > Se você não solicitou este cadastro, basta ignorar este e-mail. </p> <hr style=" margin:40px 0 24px; border:none; border-top:1px solid #e5e7eb; " /> <p style=" margin:0; text-align:center; color:#9ca3af; font-size:12px; " > © ${new Date().getFullYear()} • Todos os direitos reservados. </p> </td> </tr> </table> </body> </html> `;
  }
}
