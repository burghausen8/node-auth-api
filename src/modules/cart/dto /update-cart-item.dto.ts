import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
