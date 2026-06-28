import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderRepository } from './repositories/order.repository';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private readonly cartService: CartService,
  ) {}

  async create(userId: string) {
    const cart = await this.cartService.findItemsByUser(userId);

    if (cart.items.length < 1) {
      throw new BadRequestException('O Carrinho esta vazio');
    }

    const total = cart.items.reduce(
      (acc, item) => acc + item.quantity * Number(item.product.price),
      0,
    );

    const order = await this.orderRepository.checkout(
      userId,
      cart.items,
      total,
    );
    return order;
  }
}
