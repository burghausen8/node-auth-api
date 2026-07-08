import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { CartItem, OrderStatus, Prisma } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { CartItemWithProduct } from 'src/modules/cart/types/cart-item-with-product.type';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private prisma: PrismaService) {}

  private async createOrder(
    tx: Prisma.TransactionClient,
    userId: string,
    total: number,
  ) {
    return tx.order.create({
      data: {
        total,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  private async createOrderItem(
    tx: Prisma.TransactionClient,
    data: {
      orderId: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    },
  ) {
    return tx.orderItem.create({
      data: {
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice: data.totalPrice,
        order: {
          connect: {
            id: data.orderId,
          },
        },
        product: {
          connect: {
            id: data.productId,
          },
        },
      },
    });
  }

  async checkout(userId: string, items: CartItemWithProduct[], total: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await this.createOrder(tx, userId, total);

      for (const item of items) {
        await this.createOrderItem(tx, {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.product.price),
          totalPrice: item.quantity * Number(item.product.price),
        });
      }

      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return order;
    });
  }

  async updateStatus(orderID: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: {
        id: orderID,
      },
      data: {
        status,
      },
    });
  }

  async updatePaymentId(orderId: string, paymentId: string) {
    return this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentId,
      },
    });
  }

  async findById(orderId) {
    return this.prisma.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
