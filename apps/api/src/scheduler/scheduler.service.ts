import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ScrapersService } from '../scrapers/scrapers.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
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

  // Executar ao iniciar a aplicação (apenas em produção)
  async onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log('Ambiente de desenvolvimento - sync automático desabilitado');
      return;
    }

    this.logger.log('Executando sincronização inicial em background...');
    // Fire-and-forget: nao bloqueia o startup do servidor
    this.scrapersService.syncAll()
      .then(() => this.logger.log('Sincronização inicial concluída!'))
      .catch((error) => this.logger.error(`Erro na sincronização inicial: ${error.message}`));
  }
}
