import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
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
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  priority?: Priority;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  imageUrl: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}
