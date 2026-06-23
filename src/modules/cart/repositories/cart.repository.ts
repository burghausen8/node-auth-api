import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartRepository {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.CartItemCreateInput) {
    return this.prisma.cartItem.create({
      data,
    });
  }

  findMany(userId: string, skip: number, take: number) {
    return this.prisma.cartItem.findMany({
      where: {
        userId,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  count(userId: string) {
    return this.prisma.cartItem.count({
      where: {
        userId,
      },
    });
  }

  findById(id: string) {
    return this.prisma.cartItem.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, data: Prisma.CartItemUpdateInput) {
    return this.prisma.cartItem.update({
      where: {
        id,
      },
      data,
    });
  }
}
