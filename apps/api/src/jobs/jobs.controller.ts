import { Controller, Get, Param, Query, Post, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { ScrapersService } from '../scrapers/scrapers.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly scrapersService: ScrapersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as vagas com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de vagas' })
  async findAll(@Query() query: QueryJobsDto) {
    return this.jobsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Retorna vagas em destaque de empresas conhecidas' })
  @ApiResponse({ status: 200, description: 'Lista de vagas em destaque' })
  async getFeatured(@Query('limit') limit?: string) {
    return this.jobsService.getFeaturedJobs(limit ? parseInt(limit, 10) : 10);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Retorna estatísticas das vagas' })
  async getStats() {
    return this.jobsService.getStats();
  }

  @Get('sources')
  @ApiOperation({ summary: 'Lista todas as fontes de vagas' })
  async getSources() {
    return this.jobsService.getSources();
  }

  @Get('tags')
  @ApiOperation({ summary: 'Lista todas as tags/tecnologias' })
  async getTags() {
    return this.jobsService.getTags();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Retorna analytics do mercado de vagas' })
  @ApiResponse({ status: 200, description: 'Dados analíticos do mercado' })
  async getAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.jobsService.getAnalytics(query);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Força sincronização manual de todas as fontes' })
  async sync() {
    if (this.scrapersService.getIsSyncing()) {
      return { message: 'Sincronização já em andamento' };
    }

    // Fire-and-forget: retorna imediato, sync roda em background
    this.scrapersService.syncAll().catch((error) =>
      this.logger.error(`Erro no sync manual: ${error.message}`),
    );

    return { message: 'Sincronização iniciada em background' };
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Remove vagas antigas (mais de 45 dias)' })
  async cleanup() {
    const result = await this.jobsService.cleanupOldJobs(45);
    return {
      message: `Limpeza concluída: ${result.deleted} vagas removidas`,
      ...result,
    };
  }

  @Post('remove-duplicates')
  @ApiOperation({ summary: 'Remove vagas duplicadas (mesmo título + empresa)' })
  async removeDuplicates() {
    const result = await this.jobsService.removeDuplicates();
    return {
      message: `${result.removed} vagas duplicadas removidas`,
      ...result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna detalhes de uma vaga específica' })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
}
