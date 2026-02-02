import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ScrapersModule } from '../scrapers/scrapers.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [ScrapersModule, JobsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
