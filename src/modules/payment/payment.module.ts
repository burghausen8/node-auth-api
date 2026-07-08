import { Module } from '@nestjs/common';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentPublisher } from './publishers/payment.publisher';
import { PaymentConsumer } from './consumer/payment.consumer';
import { MercadoPagoProvider } from './providers/mercado-pago.provider';
import { PAYMENT_PROVIDER } from './constants/payment.constants';
import { OrderModule } from '../order/order.module';
import { PaymentReceivedHandler } from './handler/payment-received.handler';
import { PaymentSignatureService } from './signatures/payment.signature.service';

@Module({
  imports: [OrderModule],
  controllers: [PaymentController],
  providers: [
    PaymentReceivedHandler,
    PaymentService,
    PaymentPublisher,
    PaymentConsumer,
    PaymentSignatureService,
    MercadoPagoProvider,
    {
      provide: PAYMENT_PROVIDER,
      useClass: MercadoPagoProvider,
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
