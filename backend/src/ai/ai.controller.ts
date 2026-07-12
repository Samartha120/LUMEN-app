import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiProperty,
} from '@nestjs/swagger';

class AnalyzeTextDto {
  @ApiProperty({ description: 'The text of the complaint to analyze' })
  description: string;
}

@ApiTags('AI / ML Integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-complaint')
  @ApiOperation({
    summary: 'Analyze complaint text using AI to suggest category and priority',
  })
  analyzeComplaint(@Body() body: AnalyzeTextDto) {
    return this.aiService.analyzeComplaintText(body.description);
  }
}
