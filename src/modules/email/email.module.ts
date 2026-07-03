import { Module } from '@nestjs/common';

import { EmailConsumer } from './consumers/email.consumer';
import { SmtpProvider } from './providers/mail.provider';
import { EmailService } from './services/email.service';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [EmailConsumer, EmailService, SmtpProvider],
})
export class EmailModule {}
