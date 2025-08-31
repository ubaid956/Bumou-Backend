import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
  
  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
