import { Module } from '@nestjs/common';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentPublisher } from './publishers/payment.publisher';
import { PaymentConsumer } from './consumer/payment.consumer';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [OrderModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentPublisher, PaymentConsumer],
})
export class PaymentModule {}
