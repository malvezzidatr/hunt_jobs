import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { GeminiService } from './gemini.service';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [JobsModule],
  controllers: [ResumeController],
  providers: [ResumeService, GeminiService],
})
export class ResumeModule {}
