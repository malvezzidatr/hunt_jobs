# Próximas Funcionalidades

Lista de melhorias planejadas para o Hunt Jobs.

---

## Funcionalidades para Usuário

### 1. Favoritos ✅
- [x] Salvar vagas interessantes no localStorage
- [x] Página/seção de vagas favoritas (filtro na Home)
- [x] Botão de favoritar na página de detalhes

### 2. Filtro por Data ✅
- [x] Opções: "Últimas 24h", "Última semana", "Último mês"
- [x] Adicionar ao query params da API

### 3. Ordenação ✅
- [x] Mais recentes primeiro (padrão)
- [x] Mais antigas primeiro
- [x] Dropdown de ordenação na interface

### 4. Compartilhar Vaga ✅
- [x] Botão para copiar link da vaga
- [x] Feedback visual ao copiar

---

## Qualidade dos Dados

### 5. Limpeza Automática ✅
- [x] Remover vagas com mais de 45 dias
- [x] Executar junto com o cron de sync
- [x] Log de vagas removidas

### 6. Mais Fontes de Vagas ✅
- [x] Programathor (scraper adicionado)
- [x] Vagas.com.br (scraper adicionado)
- [ ] ~Indeed Brasil~ (anti-bot muito agressivo)
- [ ] ~Glassdoor~ (requer login, anti-scraping estrito)
- [ ] Catho
- [ ] Trampos.co

### 7. Corrigir Gupy ✅
- [x] Investigar erro HTTP 400
- [x] Ajustar headers/params da requisição
- [x] Testar com diferentes endpoints
- **Causa**: Endpoint mudou de `/api/v1/jobs` para `/api/job`

---

## Técnico / DevOps

### 8. Testes Automatizados
- [ ] Testes unitários nos scrapers
- [ ] Testes de integração na API
- [ ] Testes de componentes no frontend

### 9. Docker
- [ ] Dockerfile para o backend
- [ ] Dockerfile para o frontend
- [ ] docker-compose para desenvolvimento local

### 10. Health Check
- [ ] Endpoint `/health` no backend
- [ ] Verificar conexão com banco
- [ ] Retornar status dos scrapers

### 11. Logs Estruturados
- [ ] Implementar logger com níveis (info, warn, error)
- [ ] Formato JSON para produção
- [ ] Contexto de request em cada log

---

## UX / Interface

### 12. Contador de Vagas Novas ✅
- [x] Salvar timestamp da última visita no localStorage
- [x] Badge mostrando quantidade de vagas novas
- [x] Destacar visualmente vagas novas na lista

---

## Novas Features Planejadas

### 13. Dashboard de Mercado
Página de analytics mostrando tendências do mercado de vagas júnior/estágio.

**Estrutura:**
- Filtro de período (7d, 30d, 90d, 1 ano)
- Cards de resumo (total vagas, crescimento %)
- Gráficos:
  - Tecnologias mais pedidas (bar chart horizontal)
  - Vagas por área (pie/donut chart)
  - Tendência temporal (line chart)
  - Remoto vs Presencial (donut)
  - Top empresas contratando (bar chart)
- Tabela de salários médios por área/nível

**Backend:** Novo endpoint `GET /jobs/analytics?period=30d`

**Dependências:** Recharts (biblioteca de gráficos)

### 14. Análise de Currículo com IA (ATS Checker)
- [ ] Upload de currículo (PDF) na página de detalhes da vaga
- [ ] Integração com Google Gemini (gratuito)
- [ ] Score de compatibilidade (0-100)
- [ ] Pontos fortes e sugestões de melhoria
- [ ] Keywords faltando no currículo

### 15. Outras Ideias
- [ ] Alertas de vagas (notificações por email/push)
- [ ] Histórico de vagas visitadas
- [ ] Notas pessoais em cada vaga
- [ ] Status de candidatura (Aplicado, Entrevista, Rejeitado)
- [ ] Comparador de vagas lado a lado
- [ ] Reviews de empresas
- [ ] Compartilhar vaga (LinkedIn/WhatsApp)
- [ ] Mapa de vagas presenciais
- [ ] Exportar favoritos (CSV/PDF)

---

## Prioridade Sugerida

1. ~~**Alta**: Filtro por data, Ordenação, Favoritos~~ ✅ CONCLUÍDO
2. **Média**: ~~Limpeza automática~~ ✅, Health check, ~~Contador de vagas novas~~ ✅, ~~Compartilhar vaga~~ ✅
3. **Baixa**: ~~Mais fontes~~ ✅, Docker, Testes, Logs estruturados

---

## Como Contribuir

Para implementar uma feature:
1. Marcar o checkbox como em progresso
2. Criar branch: `feature/nome-da-feature`
3. Implementar e testar
4. Atualizar este arquivo marcando como concluído
