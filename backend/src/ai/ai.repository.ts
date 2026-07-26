import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { AI_PREDICTION_STATUS } from './ai.constants';

@Injectable()
export class AiRepository {
  private readonly logger = new Logger(AiRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdatePrediction(dto: CreatePredictionDto) {
    this.logger.log(`Upserting AI prediction for complaint: ${dto.complaintId}`);

    return this.prisma.aiPrediction.upsert({
      where: { complaintId: dto.complaintId },
      update: {
        damageClass: dto.damageClass,
        confidenceScore: dto.confidenceScore,
        boundingBoxes: dto.boundingBoxes as any,
        metadata: dto.metadata as any,
        status: dto.status,
      },
      create: {
        complaintId: dto.complaintId,
        damageClass: dto.damageClass,
        confidenceScore: dto.confidenceScore,
        boundingBoxes: dto.boundingBoxes as any,
        metadata: dto.metadata as any,
        status: dto.status,
      },
    });
  }

  async getPredictionByComplaintId(complaintId: string) {
    return this.prisma.aiPrediction.findUnique({
      where: { complaintId },
    });
  }

  async markPredictionAsFailed(complaintId: string, reason: string) {
    return this.prisma.aiPrediction.upsert({
      where: { complaintId },
      update: {
        status: AI_PREDICTION_STATUS.FAILED,
        metadata: { error: reason },
      },
      create: {
        complaintId,
        damageClass: 'UNKNOWN',
        confidenceScore: 0,
        boundingBoxes: [],
        metadata: { error: reason },
        status: AI_PREDICTION_STATUS.FAILED,
      },
    });
  }
}
