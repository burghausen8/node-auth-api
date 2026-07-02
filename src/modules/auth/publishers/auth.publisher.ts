import type { Channel } from 'amqplib';
import { Inject, Injectable } from '@nestjs/common';
import { RabbitMQQueues } from 'src/rabbitmq/queues';

@Injectable()
export class AuthPublisher {
  constructor(
    @Inject('RABBITMQ_CHANNEL')
    private readonly channel: Channel,
  ) {}

  publishUserRegistered(data: {
    userId: string;
    email: string;
    verificationCode: string;
  }) {
    this.channel.sendToQueue(
      RabbitMQQueues.USER_REGISTERED,
      Buffer.from(JSON.stringify(data)),
      {
        persistent: true,
      },
    );
  }
}
