import { Injectable, Logger } from '@nestjs/common';
import { GithubScraper } from './github.scraper';
import { LinkedinScraper } from './linkedin.scraper';
import { GupyScraper } from './gupy.scraper';
import { ProgramathorScraper } from './programathor.scraper';
import { VagasScraper } from './vagas.scraper';

export interface ScraperResult {
  source: string;
  jobsFound: number;
  jobsAdded: number;
  errors: string[];
}

@Injectable()
export class ScrapersService {
  private readonly logger = new Logger(ScrapersService.name);

  constructor(
    private readonly githubScraper: GithubScraper,
    private readonly linkedinScraper: LinkedinScraper,
    private readonly gupyScraper: GupyScraper,
    private readonly programathorScraper: ProgramathorScraper,
    private readonly vagasScraper: VagasScraper,
  ) {}

  async syncAll(): Promise<ScraperResult[]> {
    this.logger.log('Iniciando sincronização de todas as fontes...');

    const results: ScraperResult[] = [];

    // Executar scrapers em paralelo
    const scrapers = [
      { name: 'GitHub', scraper: this.githubScraper },
      { name: 'LinkedIn', scraper: this.linkedinScraper },
      { name: 'Gupy', scraper: this.gupyScraper },
      { name: 'Programathor', scraper: this.programathorScraper },
      { name: 'Vagas.com.br', scraper: this.vagasScraper },
    ];

    const promises = scrapers.map(async ({ name, scraper }) => {
      try {
        this.logger.log(`Executando scraper: ${name}`);
        const result = await scraper.scrape();
        this.logger.log(`${name}: ${result.jobsAdded} novas vagas adicionadas`);
        return result;
      } catch (error) {
        this.logger.error(`Erro no scraper ${name}: ${error.message}`);
        return {
          source: name,
          jobsFound: 0,
          jobsAdded: 0,
          errors: [error.message],
        };
      }
    });

    const settledResults = await Promise.allSettled(promises);

    for (const result of settledResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }

    this.logger.log('Sincronização concluída');
    return results;
  }

  async syncGithub() {
    return this.githubScraper.scrape();
  }

  async syncLinkedin() {
    return this.linkedinScraper.scrape();
  }

  async syncGupy() {
    return this.gupyScraper.scrape();
  }

  async syncProgramathor() {
    return this.programathorScraper.scrape();
  }

  async syncVagas() {
    return this.vagasScraper.scrape();
  }
}
