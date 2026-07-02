import { ConsumeMessage } from 'amqplib';
import type { Channel } from 'amqplib';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { RABBITMQ_CHANNEL } from 'src/rabbitmq/rabbitmq.constants';
import { OrderService } from 'src/modules/order/order.service';
import { RabbitMQQueues } from 'src/rabbitmq/queues';

@Injectable()
export class PaymentConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentConsumer.name);

  constructor(
    @Inject(RABBITMQ_CHANNEL)
    private readonly channel: Channel,

    private readonly orderService: OrderService,
  ) {}

  async onModuleInit() {
    await this.channel.consume(
      RabbitMQQueues.PAYMENT_CONFIRMED,
      this.handleMessage.bind(this),
    );

    this.logger.log('Listening payment.confirmed...');
  }

  private async handleMessage(message: ConsumeMessage | null) {
    if (!message) {
      return;
    }

    try {
      const content = JSON.parse(message.content.toString());

      this.logger.log(`Payment received for order ${content.orderId}`);

      await this.orderService.confirmPayment(content.orderId);

      this.channel.ack(message);
    } catch (error) {
      this.logger.error(error);

      this.channel.nack(message, false, false);
    }
  }
}
