import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../order/order.service';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
  ) {}

  private readonly logger = new Logger(CheckoutService.name);

  async checkout(userId: string) {
    this.logger.log(`Starting checkout for user ${userId}`);

    const cart = await this.cartService.findItemsByUser(userId);

    if (cart.items.length < 1) {
      throw new BadRequestException('O Carrinho esta vazio');
    }

    const total = cart.items.reduce(
      (acc, item) => acc + item.quantity * Number(item.product.price),
      0,
    );

    const order = await this.orderService.create(userId, cart.items, total);

    const checkout = await this.paymentService.createCheckout(cart.items);

    await this.orderService.updatePaymentId(order.id, checkout.preferenceId);

    return {
      order,
      checkout,
    };
  }
}
