import { Module } from '@nestjs/common';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentPublisher } from './publishers/payment.publisher';
import { PaymentConsumer } from './consumer/payment.consumer';
import { OrderModule } from '../order/order.module';
import { MercadoPagoProvider } from './providers/mercado-pago.provider';
import { PAYMENT_PROVIDER } from './constants/payment.constants';

@Module({
  imports: [OrderModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentPublisher,
    PaymentConsumer,
    MercadoPagoProvider,
    {
      provide: PAYMENT_PROVIDER,
      useClass: MercadoPagoProvider,
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
