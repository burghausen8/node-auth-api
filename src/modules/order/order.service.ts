import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OrderRepository } from './repositories/order.repository';
import { CartService } from '../cart/cart.service';
import { OrderStatus } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';
import {
  PaymentStatus,
  PaymentWebhookDataDto,
} from '../payment/dtos/payment-webhook.dto';

@Injectable()
export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  private readonly logger = new Logger(OrderService.name);

  create(userId: string, items: any[], total: number) {
    return this.orderRepository.checkout(userId, items, total);
  }

  async processPayment(data: PaymentWebhookDataDto) {
    if (data.status === PaymentStatus.PROCESSED) {
      this.logger.log(`Payment processes for order ${data.id}`);
      return this.orderRepository.updateStatus(data.id, OrderStatus.PAID);
    }
  }

  async updatePaymentId(orderId: string, paymentId: string) {
    return this.orderRepository.updatePaymentId(orderId, paymentId);
  }
}
