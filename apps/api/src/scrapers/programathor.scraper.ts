import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { JobsService } from '../jobs/jobs.service';
import { ScraperResult } from './scrapers.service';

const JobLevel = {
  ESTAGIO: 'ESTAGIO',
  JUNIOR: 'JUNIOR',
  PLENO: 'PLENO',
} as const;

const JobType = {
  FRONTEND: 'FRONTEND',
  BACKEND: 'BACKEND',
  FULLSTACK: 'FULLSTACK',
  MOBILE: 'MOBILE',
} as const;

interface ProgramathorSearchConfig {
  url: string;
  name: string;
}

@Injectable()
export class ProgramathorScraper {
  private readonly logger = new Logger(ProgramathorScraper.name);
  private readonly REQUEST_DELAY = 1500;

  private readonly searchUrls: ProgramathorSearchConfig[] = [
    {
      url: 'https://programathor.com.br/jobs?expertise=junior',
      name: 'Vagas Júnior',
    },
    {
      url: 'https://programathor.com.br/jobs?expertise=estagio',
      name: 'Vagas Estágio',
    },
  ];

  private readonly techKeywords = [
    'react', 'vue', 'angular', 'node', 'nodejs', 'typescript', 'javascript',
    'python', 'java', 'c#', '.net', 'php', 'ruby', 'go', 'kotlin', 'swift',
    'flutter', 'react native', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'mongodb', 'postgresql', 'mysql', 'redis', 'graphql', 'nextjs', 'nestjs',
    'django', 'flask', 'spring', 'laravel', 'rails', 'html', 'css', 'sass',
    'tailwind', 'git', 'linux', 'sql', 'api', 'microservices',
  ];

  constructor(private readonly jobsService: JobsService) {}

  async scrape(): Promise<ScraperResult> {
    const result: ScraperResult = {
      source: 'Programathor',
      jobsFound: 0,
      jobsAdded: 0,
      errors: [],
    };

    const source = await this.jobsService.getOrCreateSource(
      'Programathor',
      'https://programathor.com.br',
    );

    for (const searchConfig of this.searchUrls) {
      try {
        const searchResult = await this.scrapeSearchPage(searchConfig, source.id);
        result.jobsFound += searchResult.found;
        result.jobsAdded += searchResult.added;
      } catch (error) {
        const errorMsg = `Erro ao processar ${searchConfig.name}: ${error.message}`;
        this.logger.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    return result;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, retries = 2): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.text();
      } catch (error) {
        if (attempt === retries) throw error;
        await this.delay(this.REQUEST_DELAY * (attempt + 1));
      }
    }
    throw new Error('Max retries reached');
  }

  private async scrapeSearchPage(
    config: ProgramathorSearchConfig,
    sourceId: string,
  ): Promise<{ found: number; added: number }> {
    this.logger.log(`Buscando vagas: ${config.name}`);

    const html = await this.fetchWithRetry(config.url);
    const $ = cheerio.load(html);

    const jobs: {
      title: string;
      company: string;
      location: string;
      url: string;
      tags: string[];
      remote: boolean;
    }[] = [];

    // Programathor usa cards de vagas
    $('.cell-list').each((_, element) => {
      const $el = $(element);

      const title = $el.find('h3, .card-title, [class*="title"]').first().text().trim();
      const company = $el.find('.company-name, [class*="company"]').first().text().trim();
      const location = $el.find('.location, [class*="location"]').first().text().trim();
      const urlPath = $el.find('a').first().attr('href');
      const url = urlPath?.startsWith('http') ? urlPath : `https://programathor.com.br${urlPath}`;

      // Extrair tags das tecnologias listadas
      const tags: string[] = [];
      $el.find('.tag, .skill, [class*="tech"], [class*="skill"]').each((_, tagEl) => {
        const tag = $(tagEl).text().trim().toLowerCase();
        if (tag && !tags.includes(tag)) {
          tags.push(tag);
        }
      });

      const text = $el.text().toLowerCase();
      const remote = text.includes('remoto') || text.includes('remote') || text.includes('home office');

      if (title && url) {
        jobs.push({ title, company: company || 'Não informada', location, url, tags, remote });
      }
    });

    // Seletor alternativo
    if (jobs.length === 0) {
      $('a[href*="/jobs/"]').each((_, element) => {
        const $el = $(element);
        const $card = $el.closest('.card, .job-card, [class*="job"]');

        const title = $card.find('h3, h4, .title').first().text().trim() || $el.text().trim();
        const company = $card.find('.company, [class*="company"]').first().text().trim();
        const location = $card.find('.location, [class*="location"]').first().text().trim();
        const url = $el.attr('href');
        const fullUrl = url?.startsWith('http') ? url : `https://programathor.com.br${url}`;

        if (title && fullUrl && !jobs.some(j => j.url === fullUrl)) {
          const text = $card.text().toLowerCase();
          jobs.push({
            title,
            company: company || 'Não informada',
            location,
            url: fullUrl,
            tags: [],
            remote: text.includes('remoto') || text.includes('remote'),
          });
        }
      });
    }

    this.logger.log(`Encontradas ${jobs.length} vagas em ${config.name}`);

    let added = 0;

    for (const job of jobs) {
      const level = this.detectLevel(job.title, config.name);
      if (!level) continue;

      const existingJob = await this.jobsService.findByUrl(job.url);
      if (existingJob) continue;

      let description = 'Vaga encontrada no Programathor. Acesse o link para mais detalhes.';
      let tags = [...job.tags];

      try {
        await this.delay(this.REQUEST_DELAY);
        const details = await this.fetchJobDetails(job.url);
        if (details.description) {
          description = details.description;
          const descTags = this.extractTags(details.description);
          tags = [...new Set([...tags, ...descTags])];
        }
      } catch (error) {
        this.logger.warn(`Erro ao buscar detalhes de "${job.title}": ${error.message}`);
      }

      const type = this.detectType(job.title, description);

      try {
        const savedJob = await this.jobsService.upsertByUrl({
          title: job.title,
          company: job.company,
          location: job.location || undefined,
          description: description.substring(0, 5000),
          url: job.url,
          level,
          type,
          remote: job.remote || this.detectRemote(description),
          sourceId,
          tags: tags.slice(0, 15),
        });

        if (savedJob) added++;
      } catch (error) {
        this.logger.warn(`Erro ao salvar vaga: ${error.message}`);
      }
    }

    return { found: jobs.length, added };
  }

  private async fetchJobDetails(url: string): Promise<{ description: string | null }> {
    try {
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      const selectors = [
        '.job-description',
        '.description',
        '[class*="description"]',
        '.content',
        'article',
      ];

      for (const selector of selectors) {
        const $el = $(selector);
        if ($el.length > 0) {
          $el.find('br').replaceWith('\n');
          $el.find('p, div, li').each((_, el) => { $(el).prepend('\n'); });
          $el.find('li').each((_, el) => { $(el).prepend('• '); });

          let text = $el.text()
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .trim();

          if (text.length > 100) {
            return { description: text };
          }
        }
      }

      return { description: null };
    } catch {
      return { description: null };
    }
  }

  private detectLevel(title: string, searchName: string): string | null {
    const text = `${title} ${searchName}`.toLowerCase();

    if (text.includes('estágio') || text.includes('estagio') || text.includes('estagiário')) {
      return JobLevel.ESTAGIO;
    }

    if (text.includes('junior') || text.includes('júnior') || text.includes('jr')) {
      return JobLevel.JUNIOR;
    }

    return JobLevel.JUNIOR;
  }

  private detectType(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('fullstack') || text.includes('full stack')) return JobType.FULLSTACK;
    if (text.includes('frontend') || text.includes('front-end') || text.includes('react') || text.includes('vue') || text.includes('angular')) return JobType.FRONTEND;
    if (text.includes('backend') || text.includes('back-end') || text.includes('node') || text.includes('java') || text.includes('python')) return JobType.BACKEND;
    if (text.includes('mobile') || text.includes('android') || text.includes('ios') || text.includes('flutter')) return JobType.MOBILE;

    return JobType.FULLSTACK;
  }

  private detectRemote(text: string): boolean {
    const lower = text.toLowerCase();
    return lower.includes('remoto') || lower.includes('remote') || lower.includes('home office');
  }

  private extractTags(text: string): string[] {
    const normalizedText = text.toLowerCase();
    const tags: string[] = [];

    for (const keyword of this.techKeywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalizedText) && !tags.includes(keyword)) {
        tags.push(keyword);
      }
    }

    return tags;
  }
}
