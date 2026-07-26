import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AiRepository } from './ai.repository';
import { AiQueueService } from './queue/ai.queue';
import { FastApiPredictionResponse } from './ai.interface';
import { AI_PREDICTION_STATUS } from './ai.constants';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly aiRepository: AiRepository,
    private readonly aiQueueService: AiQueueService,
  ) {}

  async analyzeComplaintText(description: string) {
    const text = description.toLowerCase();

    const inferenceUrl = this.configService.get<string>('FASTAPI_INFERENCE_URL');
    const apiKey = this.configService.get<string>('FASTAPI_API_KEY');

    if (inferenceUrl) {
      try {
        const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
        const response = await firstValueFrom(
          this.httpService.post(`${inferenceUrl}/analyze`, { description }, { headers, timeout: 5000 })
        );

        const data = response.data;
        if (data && data.category) {
          this.logger.log(`Received successful text analysis from FastAPI service.`);
          return {
            suggestedPriority: data.priority || 'MEDIUM',
            suggestedCategory: data.category || 'GENERAL',
            confidenceScore: data.confidenceScore || 0.85,
          };
        }
      } catch (error) {
        this.logger.error(`Failed to call FastAPI for text analysis: ${error.message}. Falling back to mock model.`);
      }
    }

    // Fallback logic
    let suggestedPriority = 'MEDIUM';
    let suggestedCategory = 'GENERAL';

    if (text.includes('urgent') || text.includes('danger') || text.includes('fire') || text.includes('crash')) {
      suggestedPriority = 'CRITICAL';
    } else if (text.includes('broken') || text.includes('leak') || text.includes('pothole')) {
      suggestedPriority = 'HIGH';
    } else if (text.includes('noise') || text.includes('litter')) {
      suggestedPriority = 'LOW';
    }

    if (text.includes('water') || text.includes('leak') || text.includes('pipe')) {
      suggestedCategory = 'WATER_SUPPLY';
    } else if (text.includes('road') || text.includes('pothole') || text.includes('street')) {
      suggestedCategory = 'ROADS_AND_TRAFFIC';
    } else if (text.includes('light') || text.includes('electricity') || text.includes('power')) {
      suggestedCategory = 'ELECTRICITY';
    } else if (text.includes('trash') || text.includes('garbage') || text.includes('litter')) {
      suggestedCategory = 'WASTE_MANAGEMENT';
    }

    this.logger.log(`[Fallback] AI Analysis complete for description: ${description.substring(0, 20)}...`);

    return {
      suggestedPriority,
      suggestedCategory,
      confidenceScore: 0.85 + Math.random() * 0.1,
    };
  }

  async processImagePrediction(complaintId: string, imageUrl: string) {
    this.logger.log(`Processing image prediction for complaint: ${complaintId}`);
    
    // First save as PENDING
    await this.aiRepository.createOrUpdatePrediction({
      complaintId,
      damageClass: 'UNKNOWN',
      confidenceScore: 0,
      boundingBoxes: [],
      metadata: { processingTimeMs: 0, device: 'unknown', type: 'image' },
      status: AI_PREDICTION_STATUS.PENDING
    });

    const inferenceUrl = this.configService.get<string>('FASTAPI_INFERENCE_URL');
    const apiKey = this.configService.get<string>('FASTAPI_API_KEY');

    try {
      const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
      const response = await firstValueFrom(
        this.httpService.post<FastApiPredictionResponse>(`${inferenceUrl}/detect/image`, { url: imageUrl }, { headers })
      );

      return this.aiRepository.createOrUpdatePrediction({
        complaintId,
        damageClass: response.data.damageClass,
        confidenceScore: response.data.confidenceScore,
        boundingBoxes: response.data.boundingBoxes,
        metadata: response.data.metadata,
        status: AI_PREDICTION_STATUS.COMPLETED
      });
    } catch (error) {
      this.logger.error(`Failed image inference for ${complaintId}: ${error.message}`);
      return this.aiRepository.markPredictionAsFailed(complaintId, error.message);
    }
  }

  async queueVideoPrediction(complaintId: string, videoUrl: string) {
    await this.aiRepository.createOrUpdatePrediction({
      complaintId,
      damageClass: 'UNKNOWN',
      confidenceScore: 0,
      boundingBoxes: [],
      metadata: { processingTimeMs: 0, device: 'unknown', type: 'video' },
      status: AI_PREDICTION_STATUS.PENDING
    });
    
    await this.aiQueueService.queueVideoPrediction(complaintId, videoUrl);
    return { status: AI_PREDICTION_STATUS.PENDING, message: 'Video queued for analysis' };
  }

  async processVideoPrediction(complaintId: string, videoUrl: string) {
    this.logger.log(`Processing video prediction for complaint: ${complaintId}`);
    
    const inferenceUrl = this.configService.get<string>('FASTAPI_INFERENCE_URL');
    const apiKey = this.configService.get<string>('FASTAPI_API_KEY');

    const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    const response = await firstValueFrom(
      this.httpService.post<FastApiPredictionResponse>(`${inferenceUrl}/detect/video`, { url: videoUrl }, { headers })
    );

    await this.aiRepository.createOrUpdatePrediction({
      complaintId,
      damageClass: response.data.damageClass,
      confidenceScore: response.data.confidenceScore,
      boundingBoxes: response.data.boundingBoxes,
      metadata: response.data.metadata,
      status: AI_PREDICTION_STATUS.COMPLETED
    });
  }

  async markPredictionFailed(complaintId: string, reason: string) {
    return this.aiRepository.markPredictionAsFailed(complaintId, reason);
  }

  async getPrediction(complaintId: string) {
    return this.aiRepository.getPredictionByComplaintId(complaintId);
  }
}
