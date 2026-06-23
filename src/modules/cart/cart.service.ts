import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCartItemDto } from './dto /update-cart-item.dto';
import { CartRepository } from './repositories/cart.repository';
import { CreateCartItemDto } from './dto /create-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private repository: CartRepository) {}

  async create(userId: string, dto: CreateCartItemDto) {
    return this.repository.create({
      ...dto,
      user: {
        connect: {
          id: userId,
        },
      },
    });
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
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
}
