import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentPublisher } from './publishers/payment.publisher';
import { PaymentWebhookDto } from './dtos/payment-webhook.dto';
import { PAYMENT_PROVIDER } from './constants/payment.constants';
import type {
  CheckoutItem,
  PaymentProvider,
} from './interfaces/payment-gateway.interface';
import { OrderRepository } from '../order/repositories/order.repository';
import { Order } from '@prisma/client';
import { CartItemWithProduct } from '../cart/types/cart-item-with-product.type';

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

  async createCheckout(order: Order, items: CartItemWithProduct[]) {
    const itemsCheckout: CheckoutItem[] = items.map((item) => ({
      id: item.id,
      title: item.product.name,
      quantity: item.quantity,
      unitPrice: Number(item.product.price),
    }));

    const checkout = await this.provider.createCheckout({
      externalReference: order.id,
      items: itemsCheckout,
    });

    // Quando adicionarmos o campo preferenceId na Order,
    // podemos salvar aqui:
    //
    // await this.orderRepository.updatePreferenceId(
    //   order.id,
    //   checkout.preferenceId,
    // );

    return checkout;
  }

  getPayment(paymentId: string) {
    return this.provider.getPayment(paymentId);
  }

  cancel(paymentId: string) {
    return this.provider.cancel(paymentId);
  }
}
