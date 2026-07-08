import { Injectable } from '@nestjs/common';
import { OrderService } from '../../order/order.service';
import { PaymentWebhookDataDto } from '../dtos/payment-webhook.dto';
import { PaymentDetails } from '../interfaces/payment-gateway.interface';

@Injectable()
export class PaymentReceivedHandler {
  constructor(private readonly orderService: OrderService) {}

  async execute(data: PaymentDetails) {
    return this.orderService.processPayment(data);
  }
}
