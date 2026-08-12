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

    const inferenceUrl = this.configService.get<string>(
      'FASTAPI_INFERENCE_URL',
    );
    const apiKey = this.configService.get<string>('FASTAPI_API_KEY');

    if (inferenceUrl) {
      try {
        const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
        const response = await firstValueFrom(
          this.httpService.post(
            `${inferenceUrl}/analyze`,
            { description },
            { headers, timeout: 5000 },
          ),
        );

        const data = response.data;
        if (data && data.category) {
          this.logger.log(
            `Received successful text analysis from FastAPI service.`,
          );
          return {
            suggestedPriority: data.priority || 'MEDIUM',
            suggestedCategory: data.category || 'GENERAL',
            confidenceScore: data.confidenceScore || 0.85,
          };
        }
      } catch (error) {
        this.logger.error(
          `Failed to call FastAPI for text analysis: ${error.message}. Falling back to mock model.`,
        );
      }
    }

    // Fallback logic
    let suggestedPriority = 'MEDIUM';
    let suggestedCategory = 'GENERAL';

    if (
      text.includes('urgent') ||
      text.includes('danger') ||
      text.includes('fire') ||
      text.includes('crash')
    ) {
      suggestedPriority = 'CRITICAL';
    } else if (
      text.includes('broken') ||
      text.includes('leak') ||
      text.includes('pothole')
    ) {
      suggestedPriority = 'HIGH';
    } else if (text.includes('noise') || text.includes('litter')) {
      suggestedPriority = 'LOW';
    }

    if (
      text.includes('water') ||
      text.includes('leak') ||
      text.includes('pipe')
    ) {
      suggestedCategory = 'WATER_SUPPLY';
    } else if (
      text.includes('road') ||
      text.includes('pothole') ||
      text.includes('street')
    ) {
      suggestedCategory = 'ROADS_AND_TRAFFIC';
    } else if (
      text.includes('light') ||
      text.includes('electricity') ||
      text.includes('power')
    ) {
      suggestedCategory = 'ELECTRICITY';
    } else if (
      text.includes('trash') ||
      text.includes('garbage') ||
      text.includes('litter')
    ) {
      suggestedCategory = 'WASTE_MANAGEMENT';
    }

    this.logger.log(
      `[Fallback] AI Analysis complete for description: ${description.substring(0, 20)}...`,
    );

    return {
      suggestedPriority,
      suggestedCategory,
      confidenceScore: 0.85 + Math.random() * 0.1,
    };
  }

  async validateComplaintImageSync(imageUrl: string, category: string): Promise<FastApiPredictionResponse> {
    this.logger.log(`Synchronously validating image for category: ${category}`);

    const inferenceUrl = this.configService.get<string>('FASTAPI_INFERENCE_URL');
    const apiKey = this.configService.get<string>('FASTAPI_API_KEY');
    
    if (!inferenceUrl) {
      this.logger.warn('FASTAPI_INFERENCE_URL not set. Skipping synchronous validation.');
      // Return a dummy successful response if AI is disabled
      return {
        damageClass: 'UNKNOWN',
        confidenceScore: 1.0,
        is_blurry: false,
        blur_score: 100,
        boundingBoxes: [],
        metadata: { processingTimeMs: 0, device: 'none', type: 'image' },
      };
    }

    try {
      const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
      const response = await firstValueFrom(
        this.httpService.post<FastApiPredictionResponse>(
          `${inferenceUrl}/detect/image`,
          { url: imageUrl },
          { headers, timeout: 30000 },
        ),
      );

      const data = response.data;

      // 1. Blur Validation
      if (data.is_blurry) {
        throw new Error('Photo is too blurry. Please capture a clearer photo.');
      }

      // 2. Confidence Validation
      const THRESHOLD = 0.60;
      // UNKNOWN means YOLO found nothing at all. Or if confidence is too low.
      if (data.damageClass === 'UNKNOWN' || data.confidenceScore < THRESHOLD) {
        throw new Error('The issue could not be identified clearly. Please submit a clearer photo.');
      }

      // 3. Category Relevance Validation
      // Map frontend categories to expected YOLO classes roughly
      const normalizedCategory = category.toUpperCase();
      const detected = data.damageClass.toLowerCase();
      
      let isRelevant = false;
      if (normalizedCategory.includes('ROAD') || normalizedCategory.includes('INFRASTRUCTURE')) {
        if (['d00', 'd10', 'd20', 'd40', 'pothole', 'crack'].some(c => detected.includes(c))) isRelevant = true;
      } else if (normalizedCategory.includes('WATER') || normalizedCategory.includes('LEAK')) {
        if (['water', 'leak', 'flood', 'hazard'].some(c => detected.includes(c))) isRelevant = true;
      } else if (normalizedCategory.includes('WASTE') || normalizedCategory.includes('TRASH')) {
        if (['trash', 'garbage', 'litter', 'waste'].some(c => detected.includes(c))) isRelevant = true;
      } else {
        // If it's a category we don't have a specific model for, we might accept it if confidence is high
        isRelevant = true; 
      }

      if (!isRelevant) {
        throw new Error('This photo does not appear to match the selected issue.');
      }

      return data;
    } catch (error) {
      this.logger.error(`Synchronous validation failed: ${error.message}`);
      // Re-throw so ComplaintsService can catch and throw BadRequestException
      throw error;
    }
  }

  async processImagePrediction(complaintId: string, imageUrl: string) {
    this.logger.log(
      `Processing image prediction for complaint: ${complaintId}`,
    );

    // First save as PENDING
    await this.aiRepository.createOrUpdatePrediction({
      complaintId,
      damageClass: 'UNKNOWN',
      confidenceScore: 0,
      boundingBoxes: [],
      metadata: { processingTimeMs: 0, device: 'unknown', type: 'image' },
      status: AI_PREDICTION_STATUS.PENDING,
    });

    const inferenceUrl = this.configService.get<string>(
      'FASTAPI_INFERENCE_URL',
    );
    const apiKey = this.configService.get<string>('FASTAPI_API_KEY');

    try {
      const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
      this.logger.log('Calling FastAPI');
      const response = await firstValueFrom(
        this.httpService.post<FastApiPredictionResponse>(
          `${inferenceUrl}/detect/image`,
          { url: imageUrl },
          { headers },
        ),
      );

      this.logger.log('AI completed');
      await this.aiRepository.updateComplaintWithAiResult(
        complaintId,
        response.data,
      );

      return this.aiRepository.createOrUpdatePrediction({
        complaintId,
        damageClass: response.data.damageClass,
        confidenceScore: response.data.confidenceScore,
        boundingBoxes: response.data.boundingBoxes,
        metadata: response.data.metadata,
        status: AI_PREDICTION_STATUS.COMPLETED,
      });
    } catch (error) {
      this.logger.error(
        `Failed image inference for ${complaintId}: ${error.message}`,
      );
      return this.aiRepository.markPredictionAsFailed(
        complaintId,
        error.message,
      );
    }
  }

  async queueVideoPrediction(complaintId: string, videoUrl: string) {
    await this.aiRepository.createOrUpdatePrediction({
      complaintId,
      damageClass: 'UNKNOWN',
      confidenceScore: 0,
      boundingBoxes: [],
      metadata: { processingTimeMs: 0, device: 'unknown', type: 'video' },
      status: AI_PREDICTION_STATUS.PENDING,
    });

    try {
      await this.aiQueueService.queueVideoPrediction(complaintId, videoUrl);
      return {
        status: AI_PREDICTION_STATUS.PENDING,
        message: 'Video queued for analysis',
      };
    } catch (e) {
      this.logger.warn(
        `Redis offline, running video prediction directly in background for ${complaintId}`,
      );
      this.processVideoPrediction(complaintId, videoUrl).catch((err) =>
        this.logger.error(`Direct video prediction failed: ${err.message}`),
      );
      return {
        status: AI_PREDICTION_STATUS.PENDING,
        message: 'Video analysis started directly',
      };
    }
  }

  async processVideoPrediction(complaintId: string, videoUrl: string) {
    this.logger.log(
      `Processing video prediction for complaint: ${complaintId}`,
    );

    const inferenceUrl = this.configService.get<string>(
      'FASTAPI_INFERENCE_URL',
    );
    const apiKey = this.configService.get<string>('FASTAPI_API_KEY');

    const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    const response = await firstValueFrom(
      this.httpService.post<FastApiPredictionResponse>(
        `${inferenceUrl}/detect/video`,
        { url: videoUrl },
        { headers },
      ),
    );

    await this.aiRepository.updateComplaintWithAiResult(
      complaintId,
      response.data,
    );

    await this.aiRepository.createOrUpdatePrediction({
      complaintId,
      damageClass: response.data.damageClass,
      confidenceScore: response.data.confidenceScore,
      boundingBoxes: response.data.boundingBoxes,
      metadata: response.data.metadata,
      status: AI_PREDICTION_STATUS.COMPLETED,
    });
  }

  async queueImagePrediction(complaintId: string, imageUrl: string) {
    await this.aiRepository.createOrUpdatePrediction({
      complaintId,
      damageClass: 'UNKNOWN',
      confidenceScore: 0,
      boundingBoxes: [],
      metadata: { processingTimeMs: 0, device: 'unknown', type: 'image' },
      status: AI_PREDICTION_STATUS.PENDING,
    });
    try {
      await this.aiQueueService.queueImagePrediction(complaintId, imageUrl);
      return {
        status: AI_PREDICTION_STATUS.PENDING,
        message: 'Image queued for analysis',
      };
    } catch (e) {
      this.logger.warn(
        `Redis offline, running image prediction directly in background for ${complaintId}`,
      );
      this.processImagePrediction(complaintId, imageUrl).catch((err) =>
        this.logger.error(`Direct image prediction failed: ${err.message}`),
      );
      return {
        status: AI_PREDICTION_STATUS.PENDING,
        message: 'Image analysis started directly',
      };
    }
  }

  async queueYoloPrediction(complaintId: string, imageUrl: string) {
    await this.aiRepository.createOrUpdatePrediction({
      complaintId,
      damageClass: 'UNKNOWN',
      confidenceScore: 0,
      boundingBoxes: [],
      metadata: { processingTimeMs: 0, device: 'unknown', type: 'yolo' },
      status: AI_PREDICTION_STATUS.PENDING,
    });
    try {
      await this.aiQueueService.queueYoloPrediction(complaintId, imageUrl);
      return {
        status: AI_PREDICTION_STATUS.PENDING,
        message: 'YOLO prediction queued',
      };
    } catch (e) {
      this.logger.warn(
        `Redis offline, running YOLO prediction directly in background for ${complaintId}`,
      );
      this.processYoloPrediction(complaintId, imageUrl).catch((err) =>
        this.logger.error(`Direct YOLO prediction failed: ${err.message}`),
      );
      return {
        status: AI_PREDICTION_STATUS.PENDING,
        message: 'YOLO analysis started directly',
      };
    }
  }

  async processYoloPrediction(complaintId: string, imageUrl: string) {
    this.logger.log(`Processing YOLO prediction for complaint: ${complaintId}`);
    const inferenceUrl = this.configService.get<string>(
      'FASTAPI_INFERENCE_URL',
    );
    const apiKey = this.configService.get<string>('FASTAPI_API_KEY');

    try {
      const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
      const response = await firstValueFrom(
        this.httpService.post<FastApiPredictionResponse>(
          `${inferenceUrl}/detect/image`,
          { url: imageUrl },
          { headers },
        ),
      );

      await this.aiRepository.updateComplaintWithAiResult(
        complaintId,
        response.data,
      );

      await this.aiRepository.createOrUpdatePrediction({
        complaintId,
        damageClass: response.data.damageClass,
        confidenceScore: response.data.confidenceScore,
        boundingBoxes: response.data.boundingBoxes,
        metadata: response.data.metadata,
        status: AI_PREDICTION_STATUS.COMPLETED,
      });
    } catch (error) {
      this.logger.error(
        `Failed YOLO inference for ${complaintId}: ${error.message}`,
      );
      await this.aiRepository.markPredictionAsFailed(
        complaintId,
        error.message,
      );
    }
  }

  async markPredictionFailed(complaintId: string, reason: string) {
    return this.aiRepository.markPredictionAsFailed(complaintId, reason);
  }

  async getPrediction(complaintId: string) {
    return this.aiRepository.getPredictionByComplaintId(complaintId);
  }
}
