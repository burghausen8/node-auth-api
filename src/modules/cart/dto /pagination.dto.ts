import { Transform, Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value ?? 1)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => value ?? 10)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
