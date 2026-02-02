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

interface VagasSearchConfig {
  url: string;
  name: string;
  level: string;
}

@Injectable()
export class VagasScraper {
  private readonly logger = new Logger(VagasScraper.name);
  private readonly REQUEST_DELAY = 2000;

  private readonly searchUrls: VagasSearchConfig[] = [
    {
      url: 'https://www.vagas.com.br/vagas-de-desenvolvedor-junior',
      name: 'Desenvolvedor Júnior',
      level: JobLevel.JUNIOR,
    },
    {
      url: 'https://www.vagas.com.br/vagas-de-desenvolvedor-estagio',
      name: 'Desenvolvedor Estágio',
      level: JobLevel.ESTAGIO,
    },
    {
      url: 'https://www.vagas.com.br/vagas-de-programador-junior',
      name: 'Programador Júnior',
      level: JobLevel.JUNIOR,
    },
    {
      url: 'https://www.vagas.com.br/vagas-de-frontend-junior',
      name: 'Frontend Júnior',
      level: JobLevel.JUNIOR,
    },
    {
      url: 'https://www.vagas.com.br/vagas-de-backend-junior',
      name: 'Backend Júnior',
      level: JobLevel.JUNIOR,
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
      source: 'Vagas.com.br',
      jobsFound: 0,
      jobsAdded: 0,
      errors: [],
    };

    const source = await this.jobsService.getOrCreateSource(
      'Vagas.com.br',
      'https://www.vagas.com.br',
    );

    const seenUrls = new Set<string>();

    for (const searchConfig of this.searchUrls) {
      try {
        const searchResult = await this.scrapeSearchPage(searchConfig, source.id, seenUrls);
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
            'Cache-Control': 'no-cache',
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
    config: VagasSearchConfig,
    sourceId: string,
    seenUrls: Set<string>,
  ): Promise<{ found: number; added: number }> {
    this.logger.log(`Buscando vagas: ${config.name}`);

    await this.delay(this.REQUEST_DELAY);
    const html = await this.fetchWithRetry(config.url);
    const $ = cheerio.load(html);

    const jobs: {
      title: string;
      company: string;
      location: string;
      url: string;
      description: string;
    }[] = [];

    // Vagas.com.br usa lista de vagas com links
    $('a.link-detalhes-vaga, .vaga, [class*="vaga"]').each((_, element) => {
      const $el = $(element);

      const title = $el.find('h2, .cargo, [class*="cargo"]').first().text().trim() ||
                    $el.find('a').first().text().trim() ||
                    $el.text().split('\n')[0].trim();

      const company = $el.find('.empresa, [class*="empresa"]').first().text().trim();
      const location = $el.find('.local, [class*="local"]').first().text().trim();
      const description = $el.find('.detalhes, .descricao, [class*="descricao"]').first().text().trim();

      let url = $el.attr('href') || $el.find('a').first().attr('href');
      if (url && !url.startsWith('http')) {
        url = `https://www.vagas.com.br${url}`;
      }

      if (title && url && !seenUrls.has(url)) {
        seenUrls.add(url);
        jobs.push({
          title,
          company: company || 'Não informada',
          location,
          url,
          description,
        });
      }
    });

    // Seletor alternativo - lista de resultados
    if (jobs.length === 0) {
      $('.listagem-vagas li, .resultado-busca-item').each((_, element) => {
        const $el = $(element);

        const title = $el.find('h2, h3, .titulo, [class*="titulo"]').first().text().trim();
        const company = $el.find('.empresa, [class*="empresa"]').first().text().trim();
        const location = $el.find('.local, [class*="local"]').first().text().trim();
        const description = $el.find('.descricao, [class*="descricao"]').first().text().trim();

        let url = $el.find('a').first().attr('href');
        if (url && !url.startsWith('http')) {
          url = `https://www.vagas.com.br${url}`;
        }

        if (title && url && !seenUrls.has(url)) {
          seenUrls.add(url);
          jobs.push({
            title,
            company: company || 'Não informada',
            location,
            url,
            description,
          });
        }
      });
    }

    this.logger.log(`Encontradas ${jobs.length} vagas em ${config.name}`);

    let added = 0;

    for (const job of jobs) {
      // Verificar se contém palavras-chave de dev
      const isDevJob = this.isDevJob(job.title, job.description);
      if (!isDevJob) continue;

      const existingJob = await this.jobsService.findByUrl(job.url);
      if (existingJob) continue;

      let fullDescription = job.description || 'Vaga encontrada no Vagas.com.br. Acesse o link para mais detalhes.';
      let tags: string[] = this.extractTags(job.title + ' ' + job.description);

      // Buscar detalhes completos
      try {
        await this.delay(this.REQUEST_DELAY);
        const details = await this.fetchJobDetails(job.url);
        if (details.description) {
          fullDescription = details.description;
          tags = [...new Set([...tags, ...this.extractTags(details.description)])];
        }
      } catch (error) {
        this.logger.warn(`Erro ao buscar detalhes de "${job.title}": ${error.message}`);
      }

      const level = this.detectLevel(job.title, fullDescription) || config.level;
      const type = this.detectType(job.title, fullDescription);
      const remote = this.detectRemote(job.title, job.location, fullDescription);

      try {
        const savedJob = await this.jobsService.upsertByUrl({
          title: job.title,
          company: job.company,
          location: job.location || undefined,
          description: fullDescription.substring(0, 5000),
          url: job.url,
          level,
          type,
          remote,
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
        '.descricao-vaga',
        '.informacoes-vaga',
        '[class*="descricao"]',
        '.conteudo-vaga',
        'article',
        '.job-details',
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

  private isDevJob(title: string, description: string): boolean {
    const text = `${title} ${description}`.toLowerCase();
    const devKeywords = [
      'desenvolvedor', 'developer', 'programador', 'programmer',
      'frontend', 'backend', 'fullstack', 'mobile', 'software',
      'web', 'react', 'node', 'java', 'python', '.net', 'php',
    ];

    return devKeywords.some(keyword => text.includes(keyword));
  }

  private detectLevel(title: string, description: string): string | null {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('estágio') || text.includes('estagio') || text.includes('estagiário')) {
      return JobLevel.ESTAGIO;
    }

    if (text.includes('junior') || text.includes('júnior') || text.includes(' jr') || text.includes('jr ')) {
      return JobLevel.JUNIOR;
    }

    return null;
  }

  private detectType(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('fullstack') || text.includes('full stack') || text.includes('full-stack')) {
      return JobType.FULLSTACK;
    }

    if (text.includes('frontend') || text.includes('front-end') || text.includes('react') || text.includes('vue') || text.includes('angular')) {
      return JobType.FRONTEND;
    }

    if (text.includes('backend') || text.includes('back-end') || text.includes('node') || text.includes('java') || text.includes('python') || text.includes('.net')) {
      return JobType.BACKEND;
    }

    if (text.includes('mobile') || text.includes('android') || text.includes('ios') || text.includes('flutter') || text.includes('react native')) {
      return JobType.MOBILE;
    }

    return JobType.FULLSTACK;
  }

  private detectRemote(title: string, location: string, description: string): boolean {
    const text = `${title} ${location} ${description}`.toLowerCase();
    return text.includes('remoto') || text.includes('remote') || text.includes('home office') || text.includes('trabalho remoto');
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
