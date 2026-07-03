import { Provider } from '@nestjs/common';
import { connect } from 'amqplib';

import { RABBITMQ_CHANNEL } from './rabbitmq.constants';
import { RabbitMQQueues } from './queues';

export const RabbitMQProvider: Provider = {
  provide: RABBITMQ_CHANNEL,

  useFactory: async () => {
    const connection = await connect(process.env.RABBITMQ_URL!);

    const channel = await connection.createChannel();

    await channel.assertQueue(RabbitMQQueues.PAYMENT_CONFIRMED, {
      durable: true,
    });

    await channel.assertQueue(RabbitMQQueues.USER_REGISTERED, {
      durable: true,
    });

    console.log('RabbitMQ Connected');

    return channel;
  },
};
