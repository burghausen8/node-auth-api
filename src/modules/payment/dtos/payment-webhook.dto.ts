import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum PaymentStatus {
  PROCESSED = 'processed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export class PaymentWebhookDataDto {
  @ApiProperty({
    example: 'ext_ref_1234',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.PROCESSED,
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}

export class PaymentWebhookDto {
  @ApiProperty({
    type: PaymentWebhookDataDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentWebhookDataDto)
  data: PaymentWebhookDataDto;
}
