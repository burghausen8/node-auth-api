import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { CartItemWithProduct } from '../types/cart-item-with-product.type';

@Injectable()
export class CartRepository {
  constructor(private prisma: PrismaService) {}

  addItem(userId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.create({
      data: {
        quantity,
        user: {
          connect: {
            id: userId,
          },
        },
        product: {
          connect: {
            id: productId,
          },
        },
      },
      include: {
        product: true,
      },
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
      include: {
        product: true,
      },
    });
  }
  findItemsByUser(userId: string): Promise<CartItemWithProduct[]> {
    return this.prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        product: true,
      },
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
  findByUserAndProduct(userId: string, productId: string) {
    return this.prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
      },
    });
  }
  updateQuantity(id: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });
  }
}
