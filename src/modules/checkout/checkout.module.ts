import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { PaymentModule } from '../payment/payment.module';
import { CartModule } from '../cart/cart.module';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';

@Module({
  controllers: [CheckoutController],
  imports: [OrderModule, PaymentModule, CartModule],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
