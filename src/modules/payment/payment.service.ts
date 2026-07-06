import { Inject, Injectable } from '@nestjs/common';
import { PaymentPublisher } from './publishers/payment.publisher';
import { PaymentWebhookDto } from './dtos/payment-webhook.dto';
import { PAYMENT_PROVIDER } from './constants/payment.constants';
import type { PaymentProvider } from './interfaces/payment-gateway.interface';

@Injectable()
export class PaymentService {
  constructor(
    private readonly publisher: PaymentPublisher,
    @Inject(PAYMENT_PROVIDER)
    private readonly provider: PaymentProvider,
  ) {}

  async receiveWebhook(dto: PaymentWebhookDto) {
    await this.publisher.publish(dto);

    return {
      success: true,
      message: 'Webhook received successfully',
    };
  }

  createCheckout(orderId: string) {
    return this.provider.createCheckout(orderId);
  }

  getPayment(paymentId: string) {
    return this.provider.getPayment(paymentId);
  }

  cancel(paymentId: string) {
    return this.provider.cancel(paymentId);
  }
}
