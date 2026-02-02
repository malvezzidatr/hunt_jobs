import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ScrapersService } from '../scrapers/scrapers.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const scrapersService = app.get(ScrapersService);

  console.log('🔄 Iniciando sincronização manual...\n');

  const results = await scrapersService.syncAll();

  console.log('\n📊 Resultados:');
  console.log('─'.repeat(50));

  for (const result of results) {
    console.log(`\n${result.source}:`);
    console.log(`  Vagas encontradas: ${result.jobsFound}`);
    console.log(`  Novas vagas: ${result.jobsAdded}`);
    if (result.errors.length > 0) {
      console.log(`  Erros: ${result.errors.join(', ')}`);
    }
  }

  const totalFound = results.reduce((acc, r) => acc + r.jobsFound, 0);
  const totalAdded = results.reduce((acc, r) => acc + r.jobsAdded, 0);

  console.log('\n' + '─'.repeat(50));
  console.log(`Total: ${totalFound} encontradas, ${totalAdded} novas`);
  console.log('\n✅ Sincronização concluída!');

  await app.close();
}

bootstrap().catch((error) => {
  console.error('❌ Erro na sincronização:', error);
  process.exit(1);
});
