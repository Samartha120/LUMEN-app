import { IsString, IsOptional } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  complaintId: string;

  @IsString()
  engineerId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
