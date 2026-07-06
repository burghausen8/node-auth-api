import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { OrderService } from './order.service';
import { OrderRepository } from './repositories/order.repository';
import { CartModule } from '../cart/cart.module';

@Module({
  providers: [OrderService, OrderRepository],
  imports: [PrismaModule, AuthModule, CartModule],
  exports: [OrderService],
})
export class OrderModule {}
