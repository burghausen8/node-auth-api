import { Optional } from '@nestjs/common';
import { IsString, MinLength, IsInt, Min } from 'class-validator';

export class AddItemToCartDto {
  @IsString()
  @MinLength(2)
  id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
