import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderService } from '../order/order.service';
import { CheckoutService } from './checkout.service';

@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('/create')
  create(@Req() req) {
    return this.checkoutService.checkout(req.user.id);
  }
}
