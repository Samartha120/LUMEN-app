import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { AI_PROCESSING_QUEUE, AI_JOB_NAMES } from '../ai.constants';

@Injectable()
export class AiQueueService {
  private readonly logger = new Logger(AiQueueService.name);

  constructor(@InjectQueue(AI_PROCESSING_QUEUE) private readonly aiQueue: Queue) {}

  async queueVideoPrediction(complaintId: string, videoUrl: string) {
    this.logger.log(`Queueing video prediction for complaint: ${complaintId}`);
    
    await this.aiQueue.add(
      AI_JOB_NAMES.PREDICT_VIDEO,
      { complaintId, videoUrl },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }
}
