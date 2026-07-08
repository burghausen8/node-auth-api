import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PaymentService } from './payment.service';
import { PaymentWebhookDto } from './dtos/payment-webhook.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive payment webhook',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook received successfully',
  })
  receiveWebhook(@Body() dto: PaymentWebhookDto) {
    //TODO: validar o token aqui
    return this.paymentService.receiveWebhook(dto);
  }
}
