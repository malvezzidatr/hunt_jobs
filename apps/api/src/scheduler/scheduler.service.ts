import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScrapersService } from '../scrapers/scrapers.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly scrapersService: ScrapersService,
    private readonly jobsService: JobsService,
  ) {}

  // Executar a cada 12 horas (2x por dia)
  @Cron('0 */12 * * *')
  async handleCron() {
    this.logger.log('Iniciando sincronização agendada...');

    try {
      const results = await this.scrapersService.syncAll();

      const totalFound = results.reduce((acc, r) => acc + r.jobsFound, 0);
      const totalAdded = results.reduce((acc, r) => acc + r.jobsAdded, 0);

      this.logger.log(
        `Sincronização concluída: ${totalFound} vagas encontradas, ${totalAdded} novas adicionadas`,
      );

      // Limpeza de vagas antigas (mais de 45 dias)
      const cleanup = await this.jobsService.cleanupOldJobs(45);
      if (cleanup.deleted > 0) {
        this.logger.log(`Limpeza concluída: ${cleanup.deleted} vagas removidas`);
        cleanup.jobs.forEach(job => this.logger.log(`  - Removida: ${job}`));
      }
    } catch (error) {
      this.logger.error(`Erro na sincronização agendada: ${error.message}`);
    }
  }

  // Também executar ao iniciar a aplicação (opcional)
  // @Cron(CronExpression.EVERY_MINUTE) // Para testes
  async onApplicationBootstrap() {
    // Descomentar para sincronizar ao iniciar
    // this.logger.log('Executando sincronização inicial...');
    // await this.scrapersService.syncAll();
  }
}
