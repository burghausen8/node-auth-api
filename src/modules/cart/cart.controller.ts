import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { PaginationDto } from './dto /pagination.dto';
import { CreateCartItemDto } from './dto /create-cart-item.dto';
import { UpdateCartItemDto } from './dto /update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  findAll(@Req() req, @Query() query: PaginationDto) {
    return this.service.findAll(req.user.id, query.page, query.limit);
  }

  @Post()
  create(@Req() req, @Body() dto: CreateCartItemDto) {
    return this.service.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.service.update(req.user.id, id, dto);
  }

  @Get('external')
  getExternal() {
    return this.service.testFromExternalApi();
  }
}
