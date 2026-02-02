import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryJobsDto) {
    const { search, level, type, remote, source, tags, ids, period, sort = 'recent', page = 1, limit = 20 } = query;

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

    // Ordenação - usar postedAt (data de publicação) com fallback para createdAt
    const sortDirection = sort === 'recent' ? 'desc' : 'asc';
    const orderBy: Prisma.JobOrderByWithRelationInput[] = [
      { postedAt: { sort: sortDirection, nulls: 'last' } },
      { createdAt: sortDirection },
    ];

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          source: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
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
