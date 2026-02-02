import { Injectable, Logger } from '@nestjs/common';
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

interface GupyJob {
  id: number;
  name: string;
  description: string;
  careerPageName: string;
  careerPageLogo: string;
  type: string;
  publishedDate: string;
  applicationDeadline: string | null;
  isRemoteWork: boolean;
  city: string;
  state: string;
  country: string;
  jobUrl: string;
  badges: { friendlyBadge?: string } | { friendlyBadgeName: string }[];
  disabilities: boolean;
  workplaceType?: string;
}

interface GupyResponse {
  data: GupyJob[];
  total: number;
}

@Injectable()
export class GupyScraper {
  private readonly logger = new Logger(GupyScraper.name);
  private readonly REQUEST_DELAY = 1500; // 1.5s entre requisições

  // Termos de busca - foco em junior/estágio de desenvolvimento
  private readonly searchTerms = [
    // Estágios em tech
    'estagio desenvolvimento',
    'estagio ti',
    'estagio programacao',
    'estagio software',
    // Junior
    'desenvolvedor junior',
    'programador junior',
    'desenvolvedor jr',
    // Genéricos (filtro de nível aplicado depois)
    'desenvolvedor',
    'programador',
    'software developer',
    'frontend',
    'backend',
    'fullstack',
  ];

  constructor(private readonly jobsService: JobsService) {}

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrape(): Promise<ScraperResult> {
    const result: ScraperResult = {
      source: 'Gupy',
      jobsFound: 0,
      jobsAdded: 0,
      errors: [],
    };

    const source = await this.jobsService.getOrCreateSource(
      'Gupy',
      'https://www.gupy.io',
    );

    const seenUrls = new Set<string>();

    for (let i = 0; i < this.searchTerms.length; i++) {
      const searchTerm = this.searchTerms[i];

      // Delay entre requisições para evitar rate limiting
      if (i > 0) {
        await this.delay(this.REQUEST_DELAY);
      }

      try {
        const searchResult = await this.searchJobs(searchTerm, source.id, seenUrls);
        result.jobsFound += searchResult.found;
        result.jobsAdded += searchResult.added;
      } catch (error) {
        const errorMsg = `Erro ao buscar "${searchTerm}": ${error.message}`;
        this.logger.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    return result;
  }

  private async searchJobs(
    searchTerm: string,
    sourceId: string,
    seenUrls: Set<string>,
  ): Promise<{ found: number; added: number }> {
    this.logger.log(`Buscando vagas Gupy: ${searchTerm}`);

    // Endpoint v1 com ordenação por data
    const apiUrl = new URL('https://portal.api.gupy.io/api/v1/jobs');
    apiUrl.searchParams.set('jobName', searchTerm);
    apiUrl.searchParams.set('limit', '100');
    apiUrl.searchParams.set('offset', '0');
    apiUrl.searchParams.set('orderBy', 'publishedDate');
    apiUrl.searchParams.set('orderType', 'DESC');

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: GupyResponse = await response.json();

    this.logger.log(`Encontradas ${data.data.length} vagas para "${searchTerm}"`);

    let added = 0;

    const maxAgeDays = 45;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    for (const job of data.data) {
      // Evitar duplicatas na mesma execução
      if (seenUrls.has(job.jobUrl)) continue;
      seenUrls.add(job.jobUrl);

      // Ignorar vagas muito antigas (mais de 45 dias)
      if (job.publishedDate) {
        const postedDate = new Date(job.publishedDate);
        if (postedDate < cutoffDate) continue;
      }

      // Filtrar apenas junior/estágio
      const level = this.detectLevel(job.name, job.type);
      if (!level) continue;

      // Filtrar apenas vagas de tecnologia
      if (!this.isTechJob(job.name, job.description || '')) {
        continue;
      }

      const type = this.detectType(job.name, job.description || '');
      const tags = this.extractTags(job.name, job.description || '');

      const location =
        job.city && job.state ? `${job.city}, ${job.state}` : job.city || job.state;

      // Detectar remoto: usar isRemoteWork ou workplaceType
      const isRemote = job.isRemoteWork || job.workplaceType === 'remote';

      try {
        const savedJob = await this.jobsService.upsertByUrl({
          title: job.name,
          company: job.careerPageName,
          location: location || undefined,
          description: this.cleanDescription(job.description || ''),
          url: job.jobUrl,
          level,
          type,
          remote: isRemote,
          sourceId,
          tags,
          postedAt: job.publishedDate ? new Date(job.publishedDate) : undefined,
        });

        if (savedJob) added++;
      } catch (error) {
        this.logger.warn(`Erro ao salvar vaga Gupy ${job.id}: ${error.message}`);
      }
    }

    return { found: data.data.length, added };
  }

  private normalizeText(text: string): string {
    // Remove acentos para facilitar comparação
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private detectLevel(title: string, type: string): string | null {
    const text = this.normalizeText(`${title} ${type}`);

    // Verifica estágio/estagiário (sem acentos após normalização)
    if (
      text.includes('estagio') ||
      text.includes('estagiario') ||
      text.includes('intern') ||
      text.includes('trainee')
    ) {
      return JobLevel.ESTAGIO;
    }

    // Verifica junior (sem acentos após normalização)
    if (
      text.includes('junior') ||
      text.includes('jr.') ||
      text.includes(' jr ') ||
      text.includes(' jr') || // "Desenvolvedor Jr" no final
      text.includes('entry level') ||
      text.includes('nivel 1')
    ) {
      return JobLevel.JUNIOR;
    }

    return null;
  }

  private isTechJob(title: string, description: string): boolean {
    const text = this.normalizeText(`${title} ${description}`);

    // Palavras-chave de tech/desenvolvimento
    const techKeywords = [
      'desenvolvedor',
      'developer',
      'programador',
      'programacao',
      'software',
      'sistema',
      'frontend',
      'front-end',
      'backend',
      'back-end',
      'fullstack',
      'full stack',
      'mobile',
      'web',
      'aplicativo',
      'app',
      'codigo',
      'code',
      'ti ',
      ' ti',
      'tecnologia da informacao',
      'react',
      'angular',
      'vue',
      'node',
      'javascript',
      'typescript',
      'python',
      'java',
      'c#',
      '.net',
      'php',
      'ruby',
      'go ',
      'kotlin',
      'swift',
      'flutter',
      'android',
      'ios',
      'sql',
      'banco de dados',
      'database',
      'api',
      'devops',
      'cloud',
      'aws',
      'azure',
      'docker',
      'git',
    ];

    return techKeywords.some(keyword => text.includes(keyword));
  }

  private detectType(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('fullstack') || text.includes('full stack')) {
      return JobType.FULLSTACK;
    }

    if (
      text.includes('frontend') ||
      text.includes('front-end') ||
      text.includes('react') ||
      text.includes('vue') ||
      text.includes('angular')
    ) {
      return JobType.FRONTEND;
    }

    if (
      text.includes('backend') ||
      text.includes('back-end') ||
      text.includes('node') ||
      text.includes('java') ||
      text.includes('python') ||
      text.includes('.net')
    ) {
      return JobType.BACKEND;
    }

    if (
      text.includes('mobile') ||
      text.includes('android') ||
      text.includes('ios') ||
      text.includes('flutter')
    ) {
      return JobType.MOBILE;
    }

    return JobType.FULLSTACK;
  }

  private extractTags(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const tags: string[] = [];

    const techKeywords = [
      'react',
      'vue',
      'angular',
      'node',
      'nodejs',
      'typescript',
      'javascript',
      'python',
      'java',
      'c#',
      '.net',
      'php',
      'ruby',
      'go',
      'kotlin',
      'swift',
      'flutter',
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'mongodb',
      'postgresql',
      'mysql',
      'graphql',
      'nextjs',
      'nestjs',
    ];

    for (const keyword of techKeywords) {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    }

    return [...new Set(tags)].slice(0, 10);
  }

  private cleanDescription(html: string): string {
    // Remove tags HTML básicas
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000);
  }
}
