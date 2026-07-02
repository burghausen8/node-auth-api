import type { Channel, ConsumeMessage } from 'amqplib';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { EmailService } from '../services/email.service';
import { UserRegisteredEvent } from '../dto/user-registered.event';

@Injectable()
export class EmailConsumer implements OnModuleInit {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(
    @Inject('RABBITMQ_CHANNEL')
    private readonly channel: Channel,

    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.channel.consume(
      'user.registered',
      this.handleMessage.bind(this),
    );

    this.logger.log('Listening queue user.registered');
  }

  private async handleMessage(message: ConsumeMessage | null) {
    if (!message) {
      return;
    }

    try {
      const payload: UserRegisteredEvent = JSON.parse(
        message.content.toString(),
      );

      await this.emailService.sendVerificationEmail(
        payload.email,
        payload.verificationCode,
      );

      this.channel.ack(message);
    } catch (error) {
      this.logger.error(error);

      this.channel.nack(message);
    }
  }
}
