import { Module } from '@nestjs/common';

import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './repositories/cart.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService],
  imports: [PrismaModule, AuthModule],
})
export class CartModule {}
