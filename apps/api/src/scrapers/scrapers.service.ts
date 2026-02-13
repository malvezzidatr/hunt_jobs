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
  private isSyncing = false;

  constructor(
    private readonly githubScraper: GithubScraper,
    private readonly linkedinScraper: LinkedinScraper,
    private readonly gupyScraper: GupyScraper,
    private readonly programathorScraper: ProgramathorScraper,
    private readonly vagasScraper: VagasScraper,
  ) {}

  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  async syncAll(): Promise<ScraperResult[]> {
    if (this.isSyncing) {
      this.logger.warn('Sincronização já em andamento, ignorando chamada duplicada');
      return [];
    }

    this.isSyncing = true;
    this.logger.log('Iniciando sincronização de todas as fontes...');

    const results: ScraperResult[] = [];

    const scrapers = [
      { name: 'GitHub', scraper: this.githubScraper },
      { name: 'LinkedIn', scraper: this.linkedinScraper },
      { name: 'Gupy', scraper: this.gupyScraper },
      { name: 'Programathor', scraper: this.programathorScraper },
      { name: 'Vagas.com.br', scraper: this.vagasScraper },
    ];

    try {
      // Executar scrapers sequencialmente para evitar contencao de lock no SQLite
      for (const { name, scraper } of scrapers) {
        try {
          this.logger.log(`Executando scraper: ${name}`);
          const result = await scraper.scrape();
          this.logger.log(`${name}: ${result.jobsAdded} novas vagas adicionadas`);
          results.push(result);
        } catch (error) {
          this.logger.error(`Erro no scraper ${name}: ${error.message}`);
          results.push({
            source: name,
            jobsFound: 0,
            jobsAdded: 0,
            errors: [error.message],
          });
        }
      }
    } finally {
      this.isSyncing = false;
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
