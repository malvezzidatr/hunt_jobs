import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { JobsModule } from './jobs/jobs.module';
import { ScrapersModule } from './scrapers/scrapers.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ResumeModule } from './resume/resume.module';
import { LearningPathModule } from './learning-path/learning-path.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ProfileModule,
    ApplicationsModule,
    JobsModule,
    ScrapersModule,
    SchedulerModule,
    ResumeModule,
    LearningPathModule,
  ],
})
export class AppModule {}
