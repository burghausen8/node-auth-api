import { Injectable } from '@nestjs/common';

import { SmtpProvider } from '../providers/smtp.provider';

@Injectable()
export class EmailService {
  constructor(private readonly smtpProvider: SmtpProvider) {}

  async sendVerificationEmail(email: string, code: string) {
    const subject = 'Confirmação de cadastro';

    const html = `
      <h2>Bem-vindo!</h2>

      <p>Seu código de verificação é:</p>

      <h1>${code}</h1>

      <p>Esse código expira em 15 minutos.</p>
    `;

    await this.smtpProvider.sendMail(email, subject, html);
  }
}
