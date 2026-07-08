import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Headers,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PaymentService } from './payment.service';
import { PaymentWebhookDto } from './dtos/payment-webhook.dto';
import { PaymentSignatureService } from './signatures/payment.signature.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly signatureService: PaymentSignatureService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive payment webhook',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook received successfully',
  })
  receiveWebhook(
    @Body() dto: PaymentWebhookDto,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string,
  ) {
    this.signatureService.validate(signature, requestId, dto.data.id);
    return this.paymentService.receiveWebhook(dto);
  }
}
