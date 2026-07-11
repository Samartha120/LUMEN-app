import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssignmentStatus } from '@prisma/client';

export class UpdateAssignmentDto {
  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;

  @IsString()
  @IsOptional()
  notes?: string;
  
  @IsString()
  @IsOptional()
  photoUrl?: string;
}
