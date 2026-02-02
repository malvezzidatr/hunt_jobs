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

interface LinkedinSearchConfig {
  url: string;
  name: string;
  type: string;
}

interface LinkedinJob {
  title: string;
  company: string;
  location: string;
  url: string;
  postedAt: string | null;
}

@Injectable()
export class LinkedinScraper {
  private readonly logger = new Logger(LinkedinScraper.name);

  // Delay entre requests para evitar bloqueio (ms)
  private readonly REQUEST_DELAY = 1500;

  private readonly searchUrls: LinkedinSearchConfig[] = [
    {
      url: 'https://br.linkedin.com/jobs/desenvolvedor-j%C3%BAnior-vagas',
      name: 'Desenvolvedor Júnior',
      type: JobType.FULLSTACK,
    },
    {
      url: 'https://br.linkedin.com/jobs/desenvolvedor-web-j%C3%BAnior-vagas',
      name: 'Desenvolvedor Web Júnior',
      type: JobType.FULLSTACK,
    },
    {
      url: 'https://br.linkedin.com/jobs/estagio-desenvolvimento-vagas',
      name: 'Estágio Desenvolvimento',
      type: JobType.FULLSTACK,
    },
    {
      url: 'https://br.linkedin.com/jobs/desenvolvedor-frontend-junior-vagas',
      name: 'Frontend Junior',
      type: JobType.FRONTEND,
    },
    {
      url: 'https://br.linkedin.com/jobs/desenvolvedor-backend-junior-vagas',
      name: 'Backend Junior',
      type: JobType.BACKEND,
    },
  ];

  private readonly techKeywords = [
    'react', 'reactjs', 'react.js',
    'vue', 'vuejs', 'vue.js',
    'angular',
    'node', 'nodejs', 'node.js',
    'typescript', 'ts',
    'javascript', 'js',
    'python',
    'java',
    'c#', 'csharp',
    '.net', 'dotnet',
    'php',
    'ruby',
    'go', 'golang',
    'rust',
    'kotlin',
    'swift',
    'flutter',
    'react native',
    'docker',
    'kubernetes', 'k8s',
    'aws', 'amazon web services',
    'azure',
    'gcp', 'google cloud',
    'mongodb', 'mongo',
    'postgresql', 'postgres',
    'mysql',
    'redis',
    'graphql',
    'rest', 'restful',
    'nextjs', 'next.js',
    'nestjs', 'nest.js',
    'express',
    'fastify',
    'django',
    'flask',
    'spring', 'spring boot',
    'laravel',
    'rails', 'ruby on rails',
    'html', 'css', 'sass', 'scss',
    'tailwind', 'tailwindcss',
    'bootstrap',
    'git',
    'linux',
    'sql',
    'nosql',
    'api',
    'microservices',
    'ci/cd',
    'agile', 'scrum',
  ];

  constructor(private readonly jobsService: JobsService) {}

  async scrape(): Promise<ScraperResult> {
    const result: ScraperResult = {
      source: 'LinkedIn',
      jobsFound: 0,
      jobsAdded: 0,
      errors: [],
    };

    const source = await this.jobsService.getOrCreateSource(
      'LinkedIn',
      'https://br.linkedin.com/jobs',
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
    config: LinkedinSearchConfig,
    sourceId: string,
  ): Promise<{ found: number; added: number }> {
    this.logger.log(`Buscando vagas: ${config.name}`);

    const html = await this.fetchWithRetry(config.url);
    const $ = cheerio.load(html);

    const jobs: LinkedinJob[] = [];

    // LinkedIn usa diferentes seletores em diferentes páginas
    const selectors = [
      '.jobs-search__results-list li',
      '.job-search-card',
      '.base-card',
      '[data-tracking-control-name="public_jobs_jserp-result"]',
    ];

    for (const selector of selectors) {
      $(selector).each((_, element) => {
        const $el = $(element);

        const title =
          $el.find('.base-search-card__title').text().trim() ||
          $el.find('.job-search-card__title').text().trim() ||
          $el.find('h3').text().trim();

        const company =
          $el.find('.base-search-card__subtitle').text().trim() ||
          $el.find('.job-search-card__company-name').text().trim() ||
          $el.find('h4').text().trim();

        const location =
          $el.find('.job-search-card__location').text().trim() ||
          $el.find('.base-search-card__metadata').text().trim();

        const url =
          $el.find('a.base-card__full-link').attr('href') ||
          $el.find('a').first().attr('href');

        const timeElement = $el.find('time');
        const postedAt = timeElement.attr('datetime') || null;

        if (title && company && url) {
          jobs.push({ title, company, location, url, postedAt });
        }
      });

      if (jobs.length > 0) break;
    }

    this.logger.log(`Encontradas ${jobs.length} vagas em ${config.name}`);

    let added = 0;

    for (const job of jobs) {
      // Filtrar apenas junior/estágio
      const level = this.detectLevel(job.title);
      if (!level) continue;

      // Verificar se já existe no banco
      const fullUrl = job.url.startsWith('http')
        ? job.url
        : `https://br.linkedin.com${job.url}`;

      const existingJob = await this.jobsService.findByUrl(fullUrl);
      if (existingJob) {
        continue; // Já existe, pular
      }

      // Buscar detalhes da vaga individual
      let description = 'Vaga encontrada no LinkedIn. Acesse o link para mais detalhes.';
      let tags: string[] = this.extractTags(job.title);

      try {
        this.logger.debug(`Buscando detalhes: ${job.title}`);
        await this.delay(this.REQUEST_DELAY);

        const jobDetails = await this.fetchJobDetails(fullUrl);
        if (jobDetails.description) {
          description = jobDetails.description;
          // Extrair tags da descrição completa
          const descriptionTags = this.extractTags(jobDetails.description);
          tags = [...new Set([...tags, ...descriptionTags])];
        }
      } catch (error) {
        this.logger.warn(`Erro ao buscar detalhes de "${job.title}": ${error.message}`);
      }

      const remote = this.detectRemote(job.title, job.location, description);

      try {
        const savedJob = await this.jobsService.upsertByUrl({
          title: job.title,
          company: job.company,
          location: job.location || undefined,
          description: description.substring(0, 5000), // Limitar tamanho
          url: fullUrl,
          level,
          type: this.detectType(job.title, description) || config.type,
          remote,
          sourceId,
          tags: tags.slice(0, 15), // Máximo 15 tags
          postedAt: job.postedAt ? new Date(job.postedAt) : undefined,
        });

        if (savedJob) added++;
      } catch (error) {
        this.logger.warn(`Erro ao salvar vaga LinkedIn: ${error.message}`);
      }
    }

    return { found: jobs.length, added };
  }

  private async fetchJobDetails(url: string): Promise<{ description: string | null }> {
    try {
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      // Tentar múltiplos seletores para descrição
      const descriptionSelectors = [
        '.description__text',
        '.show-more-less-html__markup',
        '.jobs-description__content',
        '.jobs-box__html-content',
        '[data-job-description]',
        '.job-view-layout .description',
      ];

      let description: string | null = null;

      for (const selector of descriptionSelectors) {
        const $element = $(selector);
        if ($element.length > 0) {
          // Preservar formatação: adicionar quebras de linha para elementos de bloco
          $element.find('br').replaceWith('\n');
          $element.find('p, div, li, h1, h2, h3, h4, h5, h6').each((_, el) => {
            $(el).prepend('\n\n');
          });
          $element.find('li').each((_, el) => {
            $(el).prepend('• ');
          });

          let text = $element.text();

          // Limpar múltiplas quebras de linha e espaços
          text = text
            .replace(/\n{3,}/g, '\n\n')  // Máximo 2 quebras de linha seguidas
            .replace(/[ \t]+/g, ' ')      // Múltiplos espaços para um só
            .replace(/\n /g, '\n')        // Espaço após quebra de linha
            .trim();

          if (text.length > 50) {
            description = text;
            break;
          }
        }
      }

      // Se ainda não encontrou boa formatação, tentar detectar seções comuns
      if (description) {
        description = this.formatDescription(description);
      }

      return { description };
    } catch (error) {
      return { description: null };
    }
  }

  private formatDescription(text: string): string {
    // Padrões comuns de seções em descrições de vagas
    const sectionPatterns = [
      /(?<!\n)(Sobre (?:nós|a empresa|a área|o time))/gi,
      /(?<!\n)(O Que (?:Procuramos|Buscamos|Esperamos))/gi,
      /(?<!\n)(Requisitos|Pré-requisitos|Requirements)/gi,
      /(?<!\n)(Responsabilidades|Atividades|O que você vai fazer)/gi,
      /(?<!\n)(Benefícios|Benefits|O que oferecemos)/gi,
      /(?<!\n)(Diferenciais|Nice to have|Desejável)/gi,
      /(?<!\n)(Etapas do Processo|Processo Seletivo)/gi,
      /(?<!\n)(Modelo de Trabalho|Local de Trabalho)/gi,
      /(?<!\n)(Sobre a vaga|Descrição da vaga)/gi,
      /(?<!\n)(Qualificações|Habilidades)/gi,
    ];

    let formatted = text;

    for (const pattern of sectionPatterns) {
      formatted = formatted.replace(pattern, '\n\n$1');
    }

    // Limpar novamente múltiplas quebras
    formatted = formatted.replace(/\n{3,}/g, '\n\n').trim();

    return formatted;
  }

  private detectLevel(title: string): string | null {
    const text = title.toLowerCase();

    if (
      text.includes('estágio') ||
      text.includes('estagio') ||
      text.includes('estagiário') ||
      text.includes('estagiario') ||
      text.includes('intern')
    ) {
      return JobLevel.ESTAGIO;
    }

    if (
      text.includes('junior') ||
      text.includes('júnior') ||
      text.includes('jr') ||
      text.includes('entry')
    ) {
      return JobLevel.JUNIOR;
    }

    return null;
  }

  private detectType(title: string, description: string): string | null {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('fullstack') || text.includes('full stack') || text.includes('full-stack')) {
      return JobType.FULLSTACK;
    }

    const frontendScore =
      (text.includes('frontend') ? 2 : 0) +
      (text.includes('front-end') ? 2 : 0) +
      (text.includes('react') ? 1 : 0) +
      (text.includes('vue') ? 1 : 0) +
      (text.includes('angular') ? 1 : 0) +
      (text.includes('css') ? 1 : 0);

    const backendScore =
      (text.includes('backend') ? 2 : 0) +
      (text.includes('back-end') ? 2 : 0) +
      (text.includes('node') ? 1 : 0) +
      (text.includes('java') && !text.includes('javascript') ? 1 : 0) +
      (text.includes('python') ? 1 : 0) +
      (text.includes('.net') ? 1 : 0) +
      (text.includes('sql') ? 1 : 0);

    const mobileScore =
      (text.includes('mobile') ? 2 : 0) +
      (text.includes('android') ? 2 : 0) +
      (text.includes('ios') ? 2 : 0) +
      (text.includes('flutter') ? 2 : 0) +
      (text.includes('react native') ? 2 : 0) +
      (text.includes('kotlin') ? 1 : 0) +
      (text.includes('swift') ? 1 : 0);

    if (mobileScore >= 2) return JobType.MOBILE;
    if (frontendScore > backendScore && frontendScore >= 2) return JobType.FRONTEND;
    if (backendScore > frontendScore && backendScore >= 2) return JobType.BACKEND;

    return null;
  }

  private detectRemote(title: string, location: string, description: string = ''): boolean {
    const text = `${title} ${location} ${description}`.toLowerCase();
    return (
      text.includes('remoto') ||
      text.includes('remote') ||
      text.includes('home office') ||
      text.includes('anywhere') ||
      text.includes('100% remoto') ||
      text.includes('trabalho remoto')
    );
  }

  private extractTags(text: string): string[] {
    const normalizedText = text.toLowerCase();
    const tags: string[] = [];

    for (const keyword of this.techKeywords) {
      // Usar word boundary para evitar matches parciais
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalizedText)) {
        // Normalizar nome da tag
        const normalizedTag = this.normalizeTagName(keyword);
        if (!tags.includes(normalizedTag)) {
          tags.push(normalizedTag);
        }
      }
    }

    return tags;
  }

  private normalizeTagName(tag: string): string {
    const normalizations: Record<string, string> = {
      'reactjs': 'react',
      'react.js': 'react',
      'vuejs': 'vue',
      'vue.js': 'vue',
      'nodejs': 'node',
      'node.js': 'node',
      'ts': 'typescript',
      'js': 'javascript',
      'csharp': 'c#',
      'dotnet': '.net',
      'golang': 'go',
      'k8s': 'kubernetes',
      'amazon web services': 'aws',
      'google cloud': 'gcp',
      'mongo': 'mongodb',
      'postgres': 'postgresql',
      'nextjs': 'next.js',
      'next.js': 'nextjs',
      'nestjs': 'nest.js',
      'nest.js': 'nestjs',
      'tailwindcss': 'tailwind',
      'ruby on rails': 'rails',
      'spring boot': 'spring',
      'restful': 'rest',
    };

    return normalizations[tag.toLowerCase()] || tag.toLowerCase();
  }
}
