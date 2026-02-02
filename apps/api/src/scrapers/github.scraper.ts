import { Injectable, Logger } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { JobsService } from '../jobs/jobs.service';
import { ScraperResult } from './scrapers.service';

// Constantes para level e type (SQLite não suporta enums)
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


interface GithubRepo {
  owner: string;
  repo: string;
  name: string;
}

@Injectable()
export class GithubScraper {
  private readonly logger = new Logger(GithubScraper.name);
  private octokit: Octokit;

  private readonly repos: GithubRepo[] = [
    { owner: 'backend-br', repo: 'vagas', name: 'Backend BR' },
    { owner: 'frontendbr', repo: 'vagas', name: 'Frontend BR' },
    { owner: 'react-brasil', repo: 'vagas', name: 'React Brasil' },
  ];

  constructor(private readonly jobsService: JobsService) {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || undefined,
    });
  }

  async scrape(): Promise<ScraperResult> {
    const result: ScraperResult = {
      source: 'GitHub',
      jobsFound: 0,
      jobsAdded: 0,
      errors: [],
    };

    for (const repoConfig of this.repos) {
      try {
        const repoResult = await this.scrapeRepo(repoConfig);
        result.jobsFound += repoResult.found;
        result.jobsAdded += repoResult.added;
      } catch (error) {
        const errorMsg = `Erro ao processar ${repoConfig.owner}/${repoConfig.repo}: ${error.message}`;
        this.logger.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    return result;
  }

  private async scrapeRepo(
    repoConfig: GithubRepo,
  ): Promise<{ found: number; added: number }> {
    const { owner, repo, name } = repoConfig;

    const source = await this.jobsService.getOrCreateSource(
      `GitHub - ${name}`,
      `https://github.com/${owner}/${repo}`,
    );

    const issues = await this.octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 100,
    });

    let added = 0;

    for (const issue of issues.data) {
      // Pular pull requests
      if (issue.pull_request) continue;

      const jobData = this.parseIssue(issue, source.id);
      if (!jobData) continue;

      try {
        const job = await this.jobsService.upsertByUrl(jobData);
        if (job) added++;
      } catch (error) {
        this.logger.warn(`Erro ao salvar vaga ${issue.number}: ${error.message}`);
      }
    }

    return { found: issues.data.length, added };
  }

  private parseIssue(issue: any, sourceId: string) {
    const title = issue.title;
    const body = issue.body || '';
    const url = issue.html_url;
    const labels = issue.labels.map((l: any) =>
      typeof l === 'string' ? l : l.name,
    );

    // Detectar nível
    const level = this.detectLevel(title, body, labels);
    if (!level) return null; // Ignorar se não for junior/estágio

    // Detectar tipo
    const type = this.detectType(title, body, labels);

    // Detectar se é remoto
    const remote = this.detectRemote(title, body, labels);

    // Extrair empresa do título (formato comum: "[Empresa] Título da vaga")
    const companyMatch = title.match(/^\[([^\]]+)\]/);
    const company = companyMatch ? companyMatch[1] : 'Não informada';

    // Extrair tags/tecnologias
    const tags = this.extractTags(title, body, labels);

    // Extrair localização
    const location = this.extractLocation(title, body);

    // Extrair salário
    const salary = this.extractSalary(body);

    return {
      title: title.replace(/^\[[^\]]+\]\s*/, ''), // Remove [Empresa] do título
      company,
      location,
      description: body.substring(0, 5000), // Limitar descrição
      url,
      salary,
      level,
      type,
      remote,
      sourceId,
      tags,
      postedAt: new Date(issue.created_at),
    };
  }

  private detectLevel(
    title: string,
    body: string,
    labels: string[],
  ): string | null {
    const text = `${title} ${body} ${labels.join(' ')}`.toLowerCase();

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
      text.includes('entry level') ||
      text.includes('entry-level')
    ) {
      return JobLevel.JUNIOR;
    }

    // Se não detectar, assume junior para repos de vagas
    return JobLevel.JUNIOR;
  }

  private detectType(title: string, body: string, labels: string[]): string {
    const text = `${title} ${body} ${labels.join(' ')}`.toLowerCase();

    if (text.includes('fullstack') || text.includes('full stack') || text.includes('full-stack')) {
      return JobType.FULLSTACK;
    }

    if (
      text.includes('frontend') ||
      text.includes('front-end') ||
      text.includes('front end') ||
      text.includes('react') ||
      text.includes('vue') ||
      text.includes('angular')
    ) {
      return JobType.FRONTEND;
    }

    if (
      text.includes('backend') ||
      text.includes('back-end') ||
      text.includes('back end') ||
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
      text.includes('flutter') ||
      text.includes('react native')
    ) {
      return JobType.MOBILE;
    }

    return JobType.FULLSTACK;
  }

  private detectRemote(title: string, body: string, labels: string[]): boolean {
    const text = `${title} ${body} ${labels.join(' ')}`.toLowerCase();
    return (
      text.includes('remoto') ||
      text.includes('remote') ||
      text.includes('home office') ||
      text.includes('anywhere') ||
      text.includes('100% remoto')
    );
  }

  private extractTags(title: string, body: string, labels: string[]): string[] {
    const text = `${title} ${body}`.toLowerCase();
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
      'csharp',
      '.net',
      'dotnet',
      'php',
      'ruby',
      'go',
      'golang',
      'rust',
      'kotlin',
      'swift',
      'flutter',
      'react native',
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'gcp',
      'mongodb',
      'postgresql',
      'mysql',
      'redis',
      'graphql',
      'rest',
      'api',
      'nextjs',
      'nestjs',
      'express',
      'fastify',
      'django',
      'flask',
      'spring',
      'laravel',
      'rails',
    ];

    for (const keyword of techKeywords) {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    }

    // Adicionar labels relevantes
    for (const label of labels) {
      const normalizedLabel = label.toLowerCase();
      if (
        !tags.includes(normalizedLabel) &&
        !['remoto', 'remote', 'presencial', 'híbrido'].includes(normalizedLabel)
      ) {
        tags.push(normalizedLabel);
      }
    }

    return [...new Set(tags)].slice(0, 10); // Máximo 10 tags
  }

  private extractLocation(title: string, body: string): string | undefined {
    const text = `${title} ${body}`;

    // Procurar padrões comuns de localização
    const locationPatterns = [
      /(?:local|localização|location|cidade|city)[\s:]+([^,\n]+)/i,
      /(?:são paulo|rio de janeiro|belo horizonte|curitiba|porto alegre|brasília|salvador|fortaleza|recife|campinas)/i,
      /\b(sp|rj|mg|pr|rs|df|ba|ce|pe)\b/i,
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return undefined;
  }

  private extractSalary(body: string): string | undefined {
    const salaryPatterns = [
      /(?:salário|salary|remuneração|faixa salarial)[\s:]+([^\n]+)/i,
      /R\$\s*[\d.,]+(?:\s*(?:a|até|-)\s*R?\$?\s*[\d.,]+)?/i,
      /(?:CLT|PJ)[\s:]+R?\$?\s*[\d.,]+/i,
    ];

    for (const pattern of salaryPatterns) {
      const match = body.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }

    return undefined;
  }
}
