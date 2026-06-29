import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCartItemDto } from './dto /update-cart-item.dto';
import { CartRepository } from './repositories/cart.repository';
import { AddItemToCartDto } from './dto /add-item-to-cart.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CartService {
  constructor(
    private repository: CartRepository,
    private readonly httpService: HttpService,
  ) {}

  async addItem(userId: string, dto: AddItemToCartDto) {
    const cartItem = await this.repository.findByUserAndProduct(userId, dto.id);

    if (cartItem) {
      return this.repository.updateQuantity(
        cartItem.id,
        cartItem.quantity + dto.quantity,
      );
    }

    return this.repository.addItem(userId, dto.id, dto.quantity);
  }

  async findAll(userId: string, page: number, limit: number) {
    page = page ?? 1;
    limit = limit ?? 10;
    const skip = (page - 1) * limit;
    console.log({
      userId,
      skip,
      limit,
    });
    const [items, total] = await Promise.all([
      this.repository.findMany(userId, skip, limit),
      this.repository.count(userId),
    ]);

    return {
      items: items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        quantity: item.quantity,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findItemsByUser(userId: string) {
    const items = await this.repository.findItemsByUser(userId);

    return {
      items,
    };
  }

  async update(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.repository.findById(itemId);

    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.repository.update(itemId, dto);
  }

  async testFromExternalApi() {
    const { data } = await firstValueFrom(
      this.httpService.get('https://fakestoreapi.com/products'),
    );

    return data;
  }
}
