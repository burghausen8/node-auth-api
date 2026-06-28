import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderService } from './order.service';

@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Post('/create')
  create(@Req() req) {
    return this.service.create(req.user.id);
  }
}
