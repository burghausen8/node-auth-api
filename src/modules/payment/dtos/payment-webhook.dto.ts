import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentStatus {
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export class PaymentWebhookDto {
  @ApiProperty({
    example: 'order-123',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    example: 'transaction-abc',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    enum: PaymentStatus,
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
