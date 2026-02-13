import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    // WAL mode permite leituras concorrentes durante escritas (scrapers nao bloqueiam a API)
    await this.$queryRawUnsafe('PRAGMA journal_mode=WAL');
    // Timeout de 5s para operacoes concorrentes em vez de falhar imediatamente
    await this.$queryRawUnsafe('PRAGMA busy_timeout=5000');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
