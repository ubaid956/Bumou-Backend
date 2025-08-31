import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFriendsDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 20;
}
