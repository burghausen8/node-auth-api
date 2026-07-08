import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PaymentWebhookDataDto {
  @ApiProperty({
    example: '123456789',
    description: 'ID do pagamento no Mercado Pago',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class PaymentWebhookDto {
  @ApiProperty({
    example: 'payment.updated',
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    example: 'payment',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    type: PaymentWebhookDataDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentWebhookDataDto)
  data: PaymentWebhookDataDto;
}
