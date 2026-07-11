import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateComplaintDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
