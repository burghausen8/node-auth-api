import { IsString, MinLength, IsInt, Min } from 'class-validator';

export class CreateCartItemDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
