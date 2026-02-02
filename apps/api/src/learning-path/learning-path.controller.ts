import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { LearningPathService } from './learning-path.service';
import { GenerateLearningPathDto } from './dto/learning-path.dto';

@Controller('learning-path')
export class LearningPathController {
  constructor(private learningPathService: LearningPathService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateLearningPathDto) {
    if (!dto.jobId) {
      throw new BadRequestException('jobId é obrigatório');
    }
    return this.learningPathService.generate(dto.jobId);
  }
}
