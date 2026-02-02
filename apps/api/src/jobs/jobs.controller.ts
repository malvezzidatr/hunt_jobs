import { Controller, Get, Param, Query, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { ScrapersService } from '../scrapers/scrapers.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
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

  @Post('sync')
  @ApiOperation({ summary: 'Força sincronização manual de todas as fontes' })
  async sync() {
    const results = await this.scrapersService.syncAll();
    return {
      message: 'Sincronização concluída',
      results,
    };
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
