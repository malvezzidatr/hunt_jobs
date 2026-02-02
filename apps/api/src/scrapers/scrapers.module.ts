import { Module, forwardRef } from '@nestjs/common';
import { ScrapersService } from './scrapers.service';
import { GithubScraper } from './github.scraper';
import { LinkedinScraper } from './linkedin.scraper';
import { GupyScraper } from './gupy.scraper';
import { ProgramathorScraper } from './programathor.scraper';
import { VagasScraper } from './vagas.scraper';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [forwardRef(() => JobsModule)],
  providers: [
    ScrapersService,
    GithubScraper,
    LinkedinScraper,
    GupyScraper,
    ProgramathorScraper,
    VagasScraper,
  ],
  exports: [ScrapersService],
})
export class ScrapersModule {}
