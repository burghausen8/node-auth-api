import { Injectable } from '@nestjs/common';
import { PaymentPublisher } from './publishers/payment.publisher';
import { PaymentWebhookDto } from './dtos/payment-webhook.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly publisher: PaymentPublisher) {}

  async receiveWebhook(dto: PaymentWebhookDto) {
    await this.publisher.publish(dto);

    return {
      success: true,
      message: 'Webhook received successfully',
    };
  }
}
