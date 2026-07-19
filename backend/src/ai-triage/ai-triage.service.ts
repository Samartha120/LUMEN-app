import { Injectable, Logger } from '@nestjs/common';
import { AnalyzeComplaintDto } from './dto/analyze-complaint.dto';

@Injectable()
export class AiTriageService {
  private readonly logger = new Logger(AiTriageService.name);

  async analyze(dto: AnalyzeComplaintDto) {
    this.logger.log(`Analyzing complaint with AI Triage...`);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    const text = dto.description.toLowerCase();
    
    let department = 'SANITATION';
    let priority = 'MEDIUM';
    let category = 'General Issue';
    let confidenceScore = 0.85;

    // Simple keyword-based mock model
    if (text.includes('pipe') || text.includes('water') || text.includes('leak')) {
      department = 'WATER';
      category = 'Water Leak';
      priority = text.includes('burst') ? 'HIGH' : 'MEDIUM';
      confidenceScore = 0.92;
    } else if (text.includes('road') || text.includes('pothole') || text.includes('street')) {
      department = 'ROADS';
      category = 'Road Damage';
      priority = text.includes('large') || text.includes('accident') ? 'HIGH' : 'MEDIUM';
      confidenceScore = 0.88;
    } else if (text.includes('light') || text.includes('electricity') || text.includes('power')) {
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
        aiSummary: `AI analyzed the text and categorized it as ${category} with ${(confidenceScore*100).toFixed(0)}% confidence, routed to ${department}.`,
      }
    };
  }
}
