import { Injectable } from '@nestjs/common';
import { MailtrapClient } from 'mailtrap';

@Injectable()
export class SmtpProvider {
  private readonly client = new MailtrapClient({
    token: process.env.MAILTRAP_API_TOKEN!,
  });

  async sendMail(to: string, subject: string, html: string) {
    await this.client.send({
      from: {
        email: process.env.MAIL_FROM_EMAIL!,
        name: process.env.MAIL_FROM_NAME!,
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      html,
      category: 'User Registration',
    });
  }
}
