import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { Prisma } from '@prisma/client';

// Tags que não são tecnologias — ignoradas no cálculo de match
const NON_TECH_TAGS = new Set([
  'clt', 'pj', 'contrato', 'freelance', 'temporário', 'temporario',
  'júnior', 'junior', 'pleno', 'sênior', 'senior', 'estagiário', 'estagiario', 'estagio', 'estágio',
  'especialista', 'trainee', 'analista', 'líder', 'lider', 'coordenador', 'gerente',
  'remoto', 'presencial', 'híbrido', 'hibrido', 'home office', 'remote',
  'vaga', 'vagas', 'emprego', 'trabalho', 'oportunidade',
]);

function calcMatchScore(jobTagNames: string[], userTechs: string[]): number {
  const techTags = jobTagNames.filter(t => !NON_TECH_TAGS.has(t.toLowerCase()));
  if (techTags.length === 0) return 0;
  const userSet = new Set(userTechs.map(t => t.toLowerCase()));
  const matched = techTags.filter(t => userSet.has(t.toLowerCase()));
  return Math.round((matched.length / techTags.length) * 100);
}

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryJobsDto) {
    const { search, level, type, remote, source, tags, ids, period, techs, sort = 'recent', page = 1, limit = 20 } = query;

    const where: Prisma.JobWhereInput = {};

    // Filtro por IDs específicos (favoritos)
    if (ids) {
      const idList = ids.split(',').filter(id => id.trim());
      if (idList.length === 0) {
        // Se passou ids mas está vazio, retorna lista vazia
        return {
          data: [],
          meta: { total: 0, page: 1, limit, totalPages: 0 },
        };
      }
      where.id = { in: idList };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (level) {
      const levels = level.split(',').filter(l => l.trim());
      if (levels.length === 1) {
        where.level = levels[0] as any;
      } else if (levels.length > 1) {
        where.level = { in: levels as any[] };
      }
    }

    if (type) {
      const types = type.split(',').filter(t => t.trim());
      if (types.length === 1) {
        where.type = types[0] as any;
      } else if (types.length > 1) {
        where.type = { in: types as any[] };
      }
    }

    if (remote !== undefined) {
      where.remote = remote;
    }

    if (source) {
      const sources = source.split(',').filter(s => s.trim());
      if (sources.length === 1) {
        where.sourceId = sources[0];
      } else if (sources.length > 1) {
        where.sourceId = { in: sources };
      }
    }

    if (tags) {
      const tagIds = tags.split(',');
      where.tags = {
        some: {
          tagId: { in: tagIds },
        },
      };
    }

    // Filtro por período
    if (period) {
      const now = new Date();
      let dateFilter: Date;

      switch (period) {
        case '24h':
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Usar postedAt se disponível, senão createdAt
      where.AND = [
        ...(where.AND as Prisma.JobWhereInput[] || []),
        {
          OR: [
            { postedAt: { gte: dateFilter } },
            { AND: [{ postedAt: null }, { createdAt: { gte: dateFilter } }] },
          ],
        },
      ];
    }

    const include = {
      source: true,
      tags: { include: { tag: true } },
    };

    // Sort por match: buscar tudo, calcular score, ordenar, paginar manualmente
    const userTechs = techs ? techs.split(',').map(t => t.trim()).filter(Boolean) : [];
    if (sort === 'match' && userTechs.length > 0) {
      const [allJobs, total] = await Promise.all([
        this.prisma.job.findMany({
          where,
          include,
          orderBy: [
            { postedAt: { sort: 'desc', nulls: 'last' } },
            { createdAt: 'desc' },
          ],
        }),
        this.prisma.job.count({ where }),
      ]);

      const scored = allJobs.map(job => ({
        ...job,
        tags: job.tags.map(jt => jt.tag),
        _score: calcMatchScore(job.tags.map(jt => jt.tag.name), userTechs),
      }));

      scored.sort((a, b) => b._score - a._score);

      const paginated = scored.slice((page - 1) * limit, page * limit);

      return {
        data: paginated.map(({ _score, ...job }) => job),
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    // Sort padrão: paginação via Prisma
    const sortDirection = sort === 'oldest' ? 'asc' : 'desc';
    const orderBy: Prisma.JobOrderByWithRelationInput[] = [
      { postedAt: { sort: sortDirection, nulls: 'last' } },
      { createdAt: sortDirection },
    ];

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs.map((job) => ({
        ...job,
        tags: job.tags.map((jt) => jt.tag),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        source: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!job) return null;

    return {
      ...job,
      tags: job.tags.map((jt) => jt.tag),
    };
  }

  async findByUrl(url: string) {
    return this.prisma.job.findUnique({
      where: { url },
    });
  }

  async create(data: CreateJobDto) {
    const { tags, ...jobData } = data;

    return this.prisma.job.create({
      data: {
        ...jobData,
        tags: tags
          ? {
              create: tags.map((tagName) => ({
                tag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              })),
            }
          : undefined,
      },
    });
  }

  async upsertByUrl(data: CreateJobDto) {
    // Verificar duplicata por URL
    const existingByUrl = await this.prisma.job.findUnique({
      where: { url: data.url },
    });

    if (existingByUrl) {
      return null; // Já existe
    }

    // Verificar duplicata por título + empresa (case-insensitive para SQLite)
    const normalizedTitle = data.title.toLowerCase().trim();
    const normalizedCompany = data.company.toLowerCase().trim();

    const candidates = await this.prisma.job.findMany({
      where: {
        company: { contains: data.company.substring(0, 10) }, // Busca parcial para reduzir resultados
      },
      select: { id: true, title: true, company: true },
      take: 100,
    });

    const existingByTitleCompany = candidates.find(
      job =>
        job.title.toLowerCase().trim() === normalizedTitle &&
        job.company.toLowerCase().trim() === normalizedCompany,
    );

    if (existingByTitleCompany) {
      return null; // Já existe com mesmo título e empresa
    }

    return this.create(data);
  }

  async removeDuplicates(): Promise<{ removed: number; duplicates: string[] }> {
    // Encontrar duplicatas por título + empresa (case-insensitive)
    const allJobs = await this.prisma.job.findMany({
      select: {
        id: true,
        title: true,
        company: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }, // Manter o mais antigo
    });

    const seen = new Map<string, string>(); // key -> primeiro id
    const toDelete: string[] = [];
    const duplicateNames: string[] = [];

    for (const job of allJobs) {
      const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;

      if (seen.has(key)) {
        toDelete.push(job.id);
        duplicateNames.push(`${job.title} - ${job.company}`);
      } else {
        seen.set(key, job.id);
      }
    }

    if (toDelete.length > 0) {
      // Primeiro deletar as relações de tags
      await this.prisma.jobTag.deleteMany({
        where: { jobId: { in: toDelete } },
      });

      // Depois deletar os jobs
      await this.prisma.job.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    return { removed: toDelete.length, duplicates: duplicateNames };
  }

  async getStats() {
    const [total, bySource, byLevel, byType, remoteCount] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.groupBy({
        by: ['sourceId'],
        _count: true,
      }),
      this.prisma.job.groupBy({
        by: ['level'],
        _count: true,
      }),
      this.prisma.job.groupBy({
        by: ['type'],
        _count: true,
      }),
      this.prisma.job.count({ where: { remote: true } }),
    ]);

    const sources = await this.prisma.source.findMany();
    const sourceMap = Object.fromEntries(sources.map((s) => [s.id, s.name]));

    return {
      total,
      bySource: bySource.map((s) => ({
        source: sourceMap[s.sourceId] || s.sourceId,
        count: s._count,
      })),
      byLevel: byLevel.map((l) => ({
        level: l.level,
        count: l._count,
      })),
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count,
      })),
      remote: remoteCount,
    };
  }

  async getAnalytics(query: AnalyticsQueryDto) {
    const baseWhere = this.buildAnalyticsWhere(query);

    const [
      totalActive,
      remoteCount,
      topTagResult,
      areaGroupsRaw,
      techGroupsRaw,
      areaData,
      jobsForTrend,
      jobsForModality,
      companyGroups,
    ] = await Promise.all([
      this.prisma.job.count({ where: baseWhere }),
      this.prisma.job.count({ where: { ...baseWhere, remote: true } }),
      this.prisma.jobTag.groupBy({
        by: ['tagId'],
        where: { job: baseWhere },
        _count: { tagId: true },
        orderBy: { _count: { tagId: 'desc' } },
        take: 1,
      }),
      this.prisma.job.groupBy({
        by: ['type'],
        where: baseWhere,
        _count: true,
        orderBy: { _count: { type: 'desc' } },
        take: 1,
      }),
      this.prisma.jobTag.groupBy({
        by: ['tagId'],
        where: { job: baseWhere },
        _count: { tagId: true },
        orderBy: { _count: { tagId: 'desc' } },
        take: 15,
      }),
      this.prisma.job.groupBy({
        by: ['type'],
        where: baseWhere,
        _count: true,
      }),
      this.prisma.job.findMany({
        where: baseWhere,
        select: { type: true, postedAt: true, createdAt: true },
      }),
      this.prisma.job.findMany({
        where: baseWhere,
        select: { remote: true, location: true },
      }),
      this.prisma.job.groupBy({
        by: ['company'],
        where: baseWhere,
        _count: true,
        orderBy: { _count: { company: 'desc' } },
        take: 10,
      }),
    ]);

    // Summary
    const remotePercentage = totalActive > 0
      ? Math.round((remoteCount / totalActive) * 100)
      : 0;

    let topTechnology: string | null = null;
    if (topTagResult.length > 0) {
      const tag = await this.prisma.tag.findUnique({ where: { id: topTagResult[0].tagId } });
      topTechnology = tag?.name ?? null;
    }

    const topArea = areaGroupsRaw.length > 0 ? areaGroupsRaw[0].type : null;

    // Top technologies - resolve tag names
    const tagIds = techGroupsRaw.map(t => t.tagId);
    const tags = tagIds.length > 0
      ? await this.prisma.tag.findMany({ where: { id: { in: tagIds } } })
      : [];
    const tagMap = Object.fromEntries(tags.map(t => [t.id, t.name]));

    const topTechnologies = techGroupsRaw.map(t => ({
      name: tagMap[t.tagId] || t.tagId,
      count: t._count.tagId,
    }));

    // Jobs by area
    const jobsByArea = areaData.map(a => ({
      area: a.type,
      count: a._count,
    }));

    // Temporal trend - bucket by week or month
    const useMonthly = (query.period || '30d') === '90d';
    const buckets = new Map<string, Map<string, number>>();

    for (const job of jobsForTrend) {
      const date = job.postedAt || job.createdAt;
      const key = useMonthly
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : this.getISOWeek(date);

      if (!buckets.has(key)) {
        buckets.set(key, new Map());
      }
      const areaCounts = buckets.get(key)!;
      areaCounts.set(job.type, (areaCounts.get(job.type) || 0) + 1);
    }

    const temporalTrend = Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, counts]) => ({
        period,
        counts: Array.from(counts.entries()).map(([area, count]) => ({ area, count })),
      }));

    // Work modality
    let remoto = 0, presencial = 0, hibrido = 0;
    for (const job of jobsForModality) {
      const loc = (job.location || '').toLowerCase();
      if (loc.includes('híbrido') || loc.includes('hibrido') || loc.includes('hybrid')) {
        hibrido++;
      } else if (job.remote) {
        remoto++;
      } else {
        presencial++;
      }
    }

    const workModality = [
      { modality: 'Remoto', count: remoto },
      { modality: 'Presencial', count: presencial },
      { modality: 'Híbrido', count: hibrido },
    ].filter(m => m.count > 0);

    // Top companies
    const topCompanies = companyGroups.map(c => ({
      company: c.company,
      count: c._count,
    }));

    return {
      summary: { totalActive, remotePercentage, topTechnology, topArea },
      topTechnologies,
      jobsByArea,
      temporalTrend,
      workModality,
      topCompanies,
    };
  }

  private buildAnalyticsWhere(query: AnalyticsQueryDto): Prisma.JobWhereInput {
    const where: Prisma.JobWhereInput = {};

    const period = query.period || '30d';
    const now = new Date();
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const dateFilter = new Date(now.getTime() - daysMap[period] * 24 * 60 * 60 * 1000);

    where.OR = [
      { postedAt: { gte: dateFilter } },
      { AND: [{ postedAt: null }, { createdAt: { gte: dateFilter } }] },
    ];

    if (query.level && query.level !== 'ALL') {
      where.level = query.level;
    }

    return where;
  }

  private getISOWeek(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
    );
    return `${d.getFullYear()}-S${String(weekNum).padStart(2, '0')}`;
  }

  async getSources() {
    return this.prisma.source.findMany();
  }

  async getTags() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Lista de empresas conhecidas para vagas em destaque
  private readonly featuredCompanies = [
    'CI&T', 'CIT', 'Santander', 'Itaú', 'Itau', 'Nubank', 'iFood', 'Ifood',
    'Magazine Luiza', 'Magalu', 'Mercado Livre', 'Stone', 'PicPay',
    'Carrefour', 'Ambev', 'Bradesco', 'XP', 'BTG', 'Totvs', 'Locaweb',
    'Globo', 'B3', 'Raízen', 'Raizen', 'Vivo', 'Claro', 'TIM',
    'Porto Seguro', 'Natura', 'Boticário', 'Boticario', 'Americanas',
    'Rede', 'Cielo', 'PagSeguro', 'Pagseguro', 'Inter', 'C6 Bank', 'C6Bank',
    'Banco Pan', 'Original', 'Neon', 'Will Bank', 'Agibank', 'Safra',
    'Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'IBM', 'Oracle',
    'SAP', 'Accenture', 'Deloitte', 'KPMG', 'EY', 'PwC', 'McKinsey',
    'Bain', 'BCG', 'Thoughtworks', 'ThoughtWorks', 'ZUP', 'Zup',
  ];

  /**
   * Verifica se o nome da empresa corresponde a uma empresa featured
   * Usa word boundary para evitar falsos positivos (ex: "Inter" não deve dar match em "Intersolid")
   */
  private isFeaturedCompany(companyName: string): boolean {
    const normalized = companyName.toLowerCase();
    return this.featuredCompanies.some(featured => {
      const regex = new RegExp(`(^|\\s|-)${featured.toLowerCase()}($|\\s|-)`, 'i');
      return regex.test(normalized);
    });
  }

  async getFeaturedJobs(limit: number = 10) {
    // Buscar vagas de empresas conhecidas, ordenadas por data
    // Nota: buscamos mais do que o limit porque vamos filtrar depois
    const jobs = await this.prisma.job.findMany({
      where: {
        OR: this.featuredCompanies.map(company => ({
          company: { contains: company },
        })),
      },
      distinct: ['id'],
      include: {
        source: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { postedAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      take: limit * 3, // Busca mais para compensar filtros
    });

    // Filtrar apenas empresas que são realmente featured (word boundary)
    const featuredJobs = jobs.filter(job => this.isFeaturedCompany(job.company));

    // Filtrar duplicatas por título + empresa
    const seen = new Set<string>();
    const uniqueJobs = featuredJobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniqueJobs.slice(0, limit).map((job) => ({
      ...job,
      tags: job.tags.map((jt) => jt.tag),
    }));
  }

  async getOrCreateSource(name: string, url: string) {
    return this.prisma.source.upsert({
      where: { name },
      create: { name, url },
      update: { url },
    });
  }

  async cleanupOldJobs(daysOld: number = 45): Promise<{ deleted: number; jobs: string[] }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Buscar vagas antigas para logar
    const oldJobs = await this.prisma.job.findMany({
      where: {
        OR: [
          { postedAt: { lt: cutoffDate } },
          { AND: [{ postedAt: null }, { createdAt: { lt: cutoffDate } }] },
        ],
      },
      select: { id: true, title: true, company: true },
    });

    if (oldJobs.length === 0) {
      return { deleted: 0, jobs: [] };
    }

    const jobIds = oldJobs.map(j => j.id);
    const jobNames = oldJobs.map(j => `${j.title} - ${j.company}`);

    // Deletar tags associadas primeiro (relação many-to-many)
    await this.prisma.jobTag.deleteMany({
      where: { jobId: { in: jobIds } },
    });

    // Deletar as vagas
    await this.prisma.job.deleteMany({
      where: { id: { in: jobIds } },
    });

    return { deleted: oldJobs.length, jobs: jobNames };
  }
}
