import type { Channel } from 'amqplib';
import { Inject, Injectable } from '@nestjs/common';
import { RABBITMQ_CHANNEL } from 'src/rabbitmq/rabbitmq.constants';
import { PaymentWebhookDto } from '../dtos/payment-webhook.dto';
import { RabbitMQQueues } from 'src/rabbitmq/queues';

@Injectable()
export class PaymentPublisher {
  constructor(
    @Inject(RABBITMQ_CHANNEL)
    private readonly channel: Channel,
  ) {}

  async publish(dto: PaymentWebhookDto) {
    this.channel.sendToQueue(
      RabbitMQQueues.PAYMENT_CONFIRMED,

      Buffer.from(JSON.stringify(dto)),

      {
        persistent: true,
      },
    );
  }
}
