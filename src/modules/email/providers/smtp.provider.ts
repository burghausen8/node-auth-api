import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmtpProvider {
  private readonly logger = new Logger(SmtpProvider.name);

  async sendMail(to: string, subject: string, html: string) {
    this.logger.log(`
      Sending email
      To: ${to}
      Subject: ${subject}
    `);

    this.logger.log(html);
  }
}
