import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OrderRepository } from './repositories/order.repository';
import { CartService } from '../cart/cart.service';
import { OrderStatus } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';
import { PaymentWebhookDataDto } from '../payment/dtos/payment-webhook.dto';
import { PaymentDetails } from '../payment/interfaces/payment-gateway.interface';

@Injectable()
export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  private readonly logger = new Logger(OrderService.name);

  create(userId: string, items: any[], total: number) {
    return this.orderRepository.checkout(userId, items, total);
  }

  async processPayment(data: PaymentDetails) {
    const order = await this.orderRepository.findById(data.externalReference);
    this.logger.log('Init Payment process');

    if (order !== undefined && data.status === 'approved') {
      this.logger.log(`Payment processes for order ${data.id}`);
      return this.orderRepository.updateStatus(order!.id, OrderStatus.PAID);
    }
  }

  async updatePaymentId(orderId: string, paymentId: string) {
    return this.orderRepository.updatePaymentId(orderId, paymentId);
  }
}
