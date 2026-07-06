import { ConsumeMessage } from 'amqplib';
import type { Channel } from 'amqplib';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { RABBITMQ_CHANNEL } from 'src/rabbitmq/rabbitmq.constants';
import { RabbitMQQueues } from 'src/rabbitmq/queues';
import { PaymentReceivedHandler } from '../handler/payment-received.handler';
import { PaymentWebhookDto } from '../dtos/payment-webhook.dto';

@Injectable()
export class PaymentConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentConsumer.name);

  constructor(
    @Inject(RABBITMQ_CHANNEL)
    private readonly channel: Channel,

    private readonly handler: PaymentReceivedHandler,
  ) {}

  async onModuleInit() {
    await this.channel.consume(
      RabbitMQQueues.PAYMENT_RECEIVED,
      this.handleMessage.bind(this),
    );

    this.logger.log('Listening payment.received...');
  }

  private async handleMessage(message: ConsumeMessage | null) {
    if (!message) {
      return;
    }

    try {
      const content = JSON.parse(
        message.content.toString(),
      ) as PaymentWebhookDto;

      this.logger.log(`Payment received for order ${content.data.id}`);
      this.logger.log(content);

      await this.handler.execute(content.data);

      this.channel.ack(message);
    } catch (error) {
      this.logger.error(error);

      this.channel.nack(message, false, false);
    }
  }
}
