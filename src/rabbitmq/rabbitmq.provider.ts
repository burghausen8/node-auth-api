import { Provider } from '@nestjs/common';
import { connect } from 'amqplib';

import { RABBITMQ_CHANNEL } from './rabbitmq.constants';

export const RabbitMQProvider: Provider = {
  provide: RABBITMQ_CHANNEL,

  useFactory: async () => {
    const connection = await connect('amqp://guest:guest@localhost:5672');

    const channel = await connection.createChannel();

    await channel.assertQueue('payment.confirmed', {
      durable: true,
    });

    console.log('RabbitMQ Connected');

    return channel;
  },
};
