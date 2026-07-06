import { Injectable } from '@nestjs/common';
import { OrderService } from '../../order/order.service';
import { PaymentWebhookDataDto } from '../dtos/payment-webhook.dto';

@Injectable()
export class PaymentReceivedHandler {
  constructor(private readonly orderService: OrderService) {}

  async execute(data: PaymentWebhookDataDto) {
    return this.orderService.processPayment(data);
  }
}
