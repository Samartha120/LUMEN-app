import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async analyzeComplaintText(description: string) {
    const text = description.toLowerCase();
    
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

    await new Promise(resolve => setTimeout(resolve, 500));

    this.logger.log(`AI Analysis complete for description: ${description.substring(0, 20)}...`);
    
    return {
      suggestedPriority,
      suggestedCategory,
      confidenceScore: 0.85 + (Math.random() * 0.1),
    };
  }
}
