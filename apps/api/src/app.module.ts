import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';
import { ScrapersModule } from './scrapers/scrapers.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ResumeModule } from './resume/resume.module';
import { LearningPathModule } from './learning-path/learning-path.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    JobsModule,
    ScrapersModule,
    SchedulerModule,
    ResumeModule,
    LearningPathModule,
  ],
})
export class AppModule {}
