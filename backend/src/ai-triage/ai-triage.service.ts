import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AnalyzeComplaintDto } from './dto/analyze-complaint.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiTriageService {
  private readonly logger = new Logger(AiTriageService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async analyze(dto: AnalyzeComplaintDto) {
    this.logger.log(`Analyzing complaint with AI Triage...`);

    const inferenceUrl = this.configService.get<string>(
      'FASTAPI_INFERENCE_URL',
    );
    const apiKey = this.configService.get<string>('FASTAPI_API_KEY');

    if (inferenceUrl) {
      try {
        const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
        const response = await firstValueFrom(
          this.httpService.post(`${inferenceUrl}/analyze`, dto, {
            headers,
            timeout: 5000,
          }),
        );

        const data = response.data;
        if (data && data.department) {
          this.logger.log(
            `Received successful response from FastAPI inference service.`,
          );
          return {
            success: true,
            triageResult: {
              department: data.department,
              category: data.category,
              priority: data.priority,
              confidenceScore: data.confidenceScore,
              aiSummary:
                data.aiSummary ||
                `AI analyzed the text and image and categorized it as ${data.category}.`,
              detections: data.detections || [],
            },
          };
        }
      } catch (error) {
        this.logger.error(
          `Failed to call FastAPI inference service: ${error.message}. Falling back to mock model.`,
        );
      }
    }

    // Fallback simple keyword-based mock model
    const text = dto.description.toLowerCase();

    let department = 'SANITATION';
    let priority = 'MEDIUM';
    let category = 'General Issue';
    let confidenceScore = 0.85;

    if (
      text.includes('pipe') ||
      text.includes('water') ||
      text.includes('leak')
    ) {
      department = 'WATER';
      category = 'Water Leak';
      priority = text.includes('burst') ? 'HIGH' : 'MEDIUM';
      confidenceScore = 0.92;
    } else if (
      text.includes('road') ||
      text.includes('pothole') ||
      text.includes('street')
    ) {
      department = 'ROADS';
      category = 'Road Damage';
      priority =
        text.includes('large') || text.includes('accident') ? 'HIGH' : 'MEDIUM';
      confidenceScore = 0.88;
    } else if (
      text.includes('light') ||
      text.includes('electricity') ||
      text.includes('power')
    ) {
      department = 'ELECTRICITY';
      category = 'Electrical Outage';
      priority = 'HIGH';
      confidenceScore = 0.95;
    }

    return {
      success: true,
      triageResult: {
        department,
        category,
        priority,
        confidenceScore,
        aiSummary: `[Fallback] AI analyzed the text and categorized it as ${category} with ${(confidenceScore * 100).toFixed(0)}% confidence, routed to ${department}.`,
      },
    };
  }
}
