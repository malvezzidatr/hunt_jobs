# Hunt Jobs - Agregador de Vagas Jr/Estágio

Sistema para agregar vagas de desenvolvimento (júnior/estágio) de múltiplas fontes, com dashboard web para visualização, filtros, análise de compatibilidade com currículo e trilha de aprendizado personalizada usando IA.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Backend** | NestJS + TypeScript |
| **Frontend** | React + Vite + TypeScript |
| **Design System** | @malvezzidatr/zev-react, zev-tokens, zev-core (v0.6.0) |
| **Banco de Dados** | SQLite (desenvolvimento) / PostgreSQL (produção) |
| **ORM** | Prisma |
| **Cache** | React Query (@tanstack/react-query) |
| **Scheduler** | @nestjs/schedule (cron a cada 6 horas) |
| **Scraping** | Cheerio + Fetch (LinkedIn, Vagas.com, ProgramaThor), Octokit (GitHub) |
| **IA** | Groq API (LLaMA 3.3 70B) - Análise CV + Trilha de Aprendizado |
| **PDF Parsing** | pdf-parse (v1.1.1) |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Frontend (React + Vite)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐   │
│  │ Navbar   │  │ Filtros  │  │ JobCards │  │ Paginação             │   │
│  │ Footer   │  │ Stats    │  │ Detail   │  │ React Query           │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────────┘   │
│  ┌──────────────────────────┐  ┌────────────────────────────────────┐  │
│  │ ResumeAnalyzer (Modal)   │  │ LearningPath (Cards + Recursos)    │  │
│  │ Upload PDF + Score       │  │ Trilha IA + Projetos + Estratégia  │  │
│  └──────────────────────────┘  └────────────────────────────────────┘  │
│  ┌──────────────────────────┐                                          │
│  │ FeaturedJobs (Destaque)  │                                          │
│  └──────────────────────────┘                                          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ REST API (fetch)
┌─────────────────────────────────▼───────────────────────────────────────┐
│                         Backend (NestJS)                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐    │
│  │ Jobs API     │  │ Scrapers     │  │ Scheduler (cron 6h)        │    │
│  │ Controller   │  │ Service      │  │ Sync automático            │    │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Resume Module (PDF Parse + Groq AI)                             │    │
│  │ Análise de compatibilidade currículo x vaga                     │    │
│  └────────────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ LearningPath Module (Groq AI + Recursos Curados)                │    │
│  │ Trilha personalizada + Projetos + Estratégia de estudo          │    │
│  └────────────────────────────────────────────────────────────────┘    │
│         │                  │                                            │
│  ┌──────▼──────────────────▼────────────────────────────────────┐      │
│  │                    Prisma ORM                                 │      │
│  └───────────────────────────┬──────────────────────────────────┘      │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                      SQLite / PostgreSQL                                 │
│  jobs, sources, tags, job_tags                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Pastas

```
hunt-jobs/
├── package.json              # Workspace root (npm workspaces)
├── context.md                # Este arquivo
│
├── apps/
│   ├── api/                  # Backend NestJS
│   │   ├── src/
│   │   │   ├── main.ts                    # Entry point
│   │   │   ├── app.module.ts              # Root module
│   │   │   │
│   │   │   ├── jobs/                      # Módulo de vagas
│   │   │   │   ├── jobs.module.ts
│   │   │   │   ├── jobs.controller.ts     # REST endpoints
│   │   │   │   ├── jobs.service.ts        # Business logic
│   │   │   │   └── dto/
│   │   │   │       ├── query-jobs.dto.ts
│   │   │   │       └── create-job.dto.ts
│   │   │   │
│   │   │   ├── resume/                    # Módulo de análise de CV
│   │   │   │   ├── resume.module.ts
│   │   │   │   ├── resume.controller.ts   # POST /resume/analyze
│   │   │   │   ├── resume.service.ts      # Extração de texto PDF
│   │   │   │   ├── gemini.service.ts      # Integração Groq AI
│   │   │   │   └── dto/
│   │   │   │       └── analyze-resume.dto.ts
│   │   │   │
│   │   │   ├── learning-path/             # Módulo de trilha de aprendizado
│   │   │   │   ├── learning-path.module.ts
│   │   │   │   ├── learning-path.controller.ts  # POST /learning-path/generate
│   │   │   │   ├── learning-path.service.ts     # Geração com Groq AI
│   │   │   │   ├── curated-resources.ts         # Recursos verificados (50+ techs)
│   │   │   │   └── dto/
│   │   │   │       └── learning-path.dto.ts
│   │   │   │
│   │   │   ├── scrapers/                  # Módulo de scrapers
│   │   │   │   ├── scrapers.module.ts
│   │   │   │   ├── scrapers.service.ts    # Orquestra scrapers
│   │   │   │   ├── github.scraper.ts      # GitHub Issues API
│   │   │   │   ├── linkedin.scraper.ts    # LinkedIn páginas públicas
│   │   │   │   ├── vagas.scraper.ts       # Vagas.com
│   │   │   │   ├── programathor.scraper.ts # ProgramaThor
│   │   │   │   └── gupy.scraper.ts        # Gupy API (instável)
│   │   │   │
│   │   │   ├── scheduler/                 # Módulo de agendamento
│   │   │   │   ├── scheduler.module.ts
│   │   │   │   └── scheduler.service.ts   # Cron job (6h)
│   │   │   │
│   │   │   ├── prisma/                    # Prisma service
│   │   │   │   ├── prisma.module.ts
│   │   │   │   └── prisma.service.ts
│   │   │   │
│   │   │   └── scripts/
│   │   │       └── sync.ts                # Script de sync manual
│   │   │
│   │   ├── prisma/
│   │   │   └── schema.prisma              # Schema do banco
│   │   │
│   │   └── package.json
│   │
│   └── web/                  # Frontend React
│       ├── src/
│       │   ├── main.tsx                   # Entry + QueryClient
│       │   ├── App.tsx                    # Router + Layout
│       │   ├── index.css                  # Estilos globais
│       │   ├── vite-env.d.ts              # Type declarations
│       │   │
│       │   ├── pages/
│       │   │   ├── Home.tsx               # Lista de vagas + filtros
│       │   │   └── JobDetail.tsx          # Detalhes + análise CV + trilha
│       │   │
│       │   ├── components/
│       │   │   ├── ResumeAnalyzer.tsx     # Modal de análise de CV
│       │   │   │
│       │   │   ├── LearningPath/          # Trilha de aprendizado
│       │   │   │   ├── LearningPath.tsx       # Componente principal
│       │   │   │   ├── TechCard.tsx           # Card de tecnologia
│       │   │   │   └── LearningPath.types.ts  # TypeScript types
│       │   │   │
│       │   │   └── FeaturedJobs/          # Vagas em destaque
│       │   │       ├── index.ts
│       │   │       ├── FeaturedJobs.view.tsx
│       │   │       ├── FeaturedJobs.viewModel.ts
│       │   │       ├── FeaturedJobs.types.ts
│       │   │       └── utils/
│       │   │           ├── jobFormatters.ts
│       │   │           └── companyBranding.ts
│       │   │
│       │   ├── hooks/
│       │   │   ├── useJobs.ts             # React Query hooks
│       │   │   ├── useFavorites.ts        # Favoritos (localStorage)
│       │   │   └── useNewJobs.ts          # Indicador de novas vagas
│       │   │
│       │   ├── services/
│       │   │   └── api.ts                 # Funções de fetch
│       │   │
│       │   └── types/
│       │       └── job.ts                 # TypeScript types
│       │
│       ├── index.html
│       └── package.json
│
└── node_modules/             # Dependências hoisted
```

---

## Modelo de Dados (Prisma)

```prisma
model Job {
  id          String    @id @default(cuid())
  title       String
  company     String
  location    String?
  description String
  url         String    @unique      # Chave para deduplicação
  salary      String?
  level       String                 # ESTAGIO | JUNIOR | PLENO
  type        String                 # FRONTEND | BACKEND | FULLSTACK | MOBILE
  remote      Boolean   @default(false)
  source      Source    @relation(...)
  sourceId    String
  tags        JobTag[]               # Relação N:N com Tag
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  postedAt    DateTime?
}

model Source {
  id   String @id @default(cuid())
  name String @unique               # "GitHub - Backend BR", "LinkedIn"
  url  String
  jobs Job[]
}

model Tag {
  id   String   @id @default(cuid())
  name String   @unique             # "react", "typescript", "node"
  jobs JobTag[]
}

model JobTag {
  jobId String
  tagId String
  @@id([jobId, tagId])              # Chave composta
}
```

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/jobs` | Lista vagas com filtros e paginação |
| `GET` | `/jobs/:id` | Detalhes de uma vaga |
| `GET` | `/jobs/stats` | Estatísticas (total, por fonte, etc.) |
| `GET` | `/jobs/sources` | Lista fontes disponíveis |
| `GET` | `/jobs/tags` | Lista tags/tecnologias |
| `POST` | `/jobs/sync` | Força sincronização manual |
| `POST` | `/resume/analyze` | Analisa compatibilidade CV x Vaga |
| `POST` | `/learning-path/generate` | Gera trilha de aprendizado personalizada |

### Query params para `/jobs`:

| Param | Tipo | Descrição |
|-------|------|-----------|
| `search` | string | Busca por texto (título, empresa, descrição) |
| `level` | string | ESTAGIO, JUNIOR (separados por vírgula) |
| `type` | string | FRONTEND, BACKEND, FULLSTACK, MOBILE |
| `remote` | boolean | true/false |
| `source` | string | ID da fonte |
| `tags` | string | IDs das tags (separados por vírgula) |
| `page` | number | Página atual (default: 1) |
| `limit` | number | Itens por página (default: 20) |

### POST `/resume/analyze`:

**Request:** `multipart/form-data`
- `file`: PDF do currículo (max 5MB)
- `jobId`: ID da vaga para comparação

**Response:**
```typescript
interface AnalysisResult {
  score: number;              // 0-100
  summary: string;            // Resumo da compatibilidade
  strengths: string[];        // Pontos fortes
  improvements: string[];     // Sugestões de melhoria
  missingKeywords: string[];  // Keywords ausentes no CV
  recommendation: 'APLICAR' | 'MELHORAR' | 'NAO_RECOMENDADO';
}
```

### POST `/learning-path/generate`:

**Request:** `application/json`
```json
{ "jobId": "clxxx123" }
```

**Response:**
```typescript
interface LearningPathResponse {
  technologies: TechPath[];
  projectIdeas: ProjectIdea[];
  studyStrategy: StudyStrategy;
  generalTips: string[];
  estimatedStudyTime: string;  // "2-4 meses"
}

interface TechPath {
  name: string;              // "React"
  icon: string;              // "react"
  priority: 'essencial' | 'importante' | 'diferencial';
  whyNeeded: string;         // Por que esta vaga precisa
  whatToFocus: string;       // O que focar no estudo
  resources: Resource[];     // Links curados para estudo
}

interface Resource {
  title: string;
  url: string;
  type: 'docs' | 'video' | 'course' | 'article' | 'practice';
  free: boolean;
}

interface ProjectIdea {
  title: string;
  description: string;
  technologies: string[];
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
}

interface StudyStrategy {
  order: string;       // Ordem sugerida de estudo
  dailyHours: string;  // "2-3 horas"
  approach: string;    // Dica de abordagem
}
```

---

## Trilha de Aprendizado (Learning Path)

### Visão Geral

Funcionalidade que usa IA para analisar a descrição de uma vaga e gerar uma trilha de aprendizado personalizada, com:
- **Tecnologias priorizadas** (essencial, importante, diferencial)
- **Recursos curados** de estudo (prioritariamente em português)
- **Ideias de projetos** para praticar
- **Estratégia de estudo** (ordem, horas diárias, abordagem)
- **Dicas gerais** para a preparação

### Fluxo

```
1. Usuário clica "Gerar Trilha de Aprendizado" na página de detalhes
   ↓
2. Frontend mostra skeleton loading (4 cards placeholder)
   ↓
3. Backend busca dados da vaga no banco
   ↓
4. Groq AI (LLaMA 3.3 70B) analisa descrição e gera JSON
   ↓
5. Backend mapeia tecnologias para recursos curados verificados
   ↓
6. Frontend exibe cards expansíveis por tecnologia
   ↓
7. Seções adicionais: Como Estudar, Projetos, Dicas Gerais
```

### Recursos Curados (`curated-resources.ts`)

Base de dados com **50+ tecnologias** e recursos verificados:

**Categorias:**
- Frontend: React, JavaScript, TypeScript, HTML, CSS, Tailwind, Next.js, Vue, Angular
- Backend: Node.js, NestJS, Express, Python, Django, Java, Spring, C#, .NET, PHP, Ruby, Go
- Mobile: React Native, Flutter, Kotlin, Swift
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQL
- DevOps: Docker, Kubernetes, AWS, Azure, Linux, Git, GitHub
- Testes: Jest, Cypress, Vitest
- Conceitos: Algoritmos, Data Structures, Agile

**Prioridade para conteúdo em português:**
- Rocketseat, Curso em Vídeo, Loiane Training
- Rafaella Ballerini, Fernanda Kipper, Código Fonte TV
- LINUXtips, Diolinux, Balta.io
- Django Girls PT-BR, documentações oficiais em PT-BR

**Sistema de aliases:**
Normaliza nomes genéricos para tecnologias específicas:
```typescript
'desenvolvimento mobile' → 'react native'
'banco de dados relacional' → 'postgresql'
'testes automatizados' → 'jest'
'cloud computing' → 'aws'
```

### UI Components

| Componente | Descrição |
|------------|-----------|
| `LearningPath.tsx` | Container principal com estados (vazio, loading, loaded) |
| `TechCard.tsx` | Card expansível por tecnologia com recursos |
| Skeleton Loading | 4 cards placeholder usando ZevLoader |
| Study Strategy | Seção com ordem, horas e abordagem |
| Project Ideas | Grid de cards com projetos sugeridos |
| General Tips | Lista de dicas práticas |

---

## Análise de Currículo (Resume Analyzer)

### Fluxo

```
1. Usuário clica "Analisar Compatibilidade" na página de detalhes
   ↓
2. Modal abre com ZevFileUpload para upload de PDF
   ↓
3. Frontend envia arquivo + jobId via multipart/form-data
   ↓
4. Backend extrai texto do PDF (pdf-parse)
   ↓
5. Groq AI (LLaMA 3.3 70B) analisa compatibilidade
   ↓
6. Retorna score, pontos fortes, sugestões e keywords
   ↓
7. Modal exibe resultado com ZevProgressBar
```

### Arquivos Envolvidos

| Arquivo | Função |
|---------|--------|
| `resume.controller.ts` | Recebe upload, valida PDF |
| `resume.service.ts` | Extrai texto com pdf-parse |
| `gemini.service.ts` | Envia para Groq, parseia JSON |
| `ResumeAnalyzer.tsx` | UI do modal (upload + resultado) |
| `api.ts` | Função `analyzeResume()` |

### Modelo de IA

- **Provider**: Groq (gratuito, rápido)
- **Modelo**: `llama-3.3-70b-versatile`
- **Temperatura**: 0.3 (análise CV) / 0.4 (trilha aprendizado)
- **Max Tokens**: 1024 (CV) / 2048 (trilha)

---

## Fontes de Vagas (Scrapers)

### 1. GitHub Scraper (`github.scraper.ts`)
- **Repositórios**: backend-br/vagas, frontendbr/vagas, react-brasil/vagas
- **Método**: GitHub Issues API via Octokit
- **Parsing**: Extrai empresa do título `[Empresa] Título`, detecta level/type/remote do texto
- **Autenticação**: `GITHUB_TOKEN` (opcional, aumenta rate limit)

### 2. LinkedIn Scraper (`linkedin.scraper.ts`)
- **URLs**: Páginas públicas de busca (não requer login)
- **Método**: Fetch + Cheerio para parsing HTML
- **Seletores**: Tenta múltiplos seletores para compatibilidade
- **Limitação**: Descrição vem genérica, link leva ao original

### 3. Vagas.com Scraper (`vagas.scraper.ts`)
- **URLs**: Busca por vagas de tecnologia júnior/estágio
- **Método**: Fetch + Cheerio
- **Dados**: Título, empresa, localização, descrição

### 4. ProgramaThor Scraper (`programathor.scraper.ts`)
- **URLs**: Vagas de tecnologia
- **Método**: Fetch + Cheerio
- **Foco**: Vagas de desenvolvimento

### 5. Gupy Scraper (`gupy.scraper.ts`)
- **Status**: Instável (API retornando HTTP 400)
- **Método**: API de busca da Gupy
- **Nota**: Pode precisar de ajustes

---

## Scheduler (Cron Job)

```typescript
// scheduler.service.ts
@Cron('0 */6 * * *')  // A cada 6 horas
async handleCron() {
  await this.scrapersService.syncAll();
}
```

Executa todos os scrapers em paralelo e registra logs.

---

## Frontend - Funcionalidades

### Cache com React Query

```typescript
// main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutos
      gcTime: 30 * 60 * 1000,        // 30 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Hooks disponíveis:

| Hook | Descrição | Armazenamento |
|------|-----------|---------------|
| `useJobs(query)` | Lista paginada com filtros | React Query |
| `useJob(id)` | Vaga individual | React Query |
| `useSources()` | Lista de fontes | React Query |
| `useTags()` | Lista de tags | React Query |
| `useStats()` | Estatísticas | React Query |
| `useFavorites()` | Gerencia favoritos | localStorage |
| `useNewJobs()` | Indicador de novas vagas | localStorage |

### Sistema de Favoritos (`useFavorites.ts`)

```typescript
const { favorites, isFavorite, toggleFavorite } = useFavorites();

// Armazena IDs das vagas em localStorage
// Persiste entre sessões
```

### Indicador de Novas Vagas (`useNewJobs.ts`)

```typescript
const { isNewJob, countNewJobs, markAsVisited } = useNewJobs();

// Rastreia última visita em localStorage
// Vagas postadas após última visita são "novas"
// Primeira visita: considera últimas 24h
```

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js >= 18
- npm

### 1. Instalar dependências

```bash
cd hunt-jobs
npm install
```

### 2. Configurar banco de dados

```bash
# Criar arquivo .env na pasta apps/api
echo "DATABASE_URL=\"file:./dev.db\"" > apps/api/.env

# Gerar cliente Prisma e criar banco
cd apps/api
npx prisma db push
npx prisma generate
```

### 3. Configurar APIs externas

```bash
# Adicionar ao apps/api/.env

# GitHub (opcional - aumenta rate limit)
GITHUB_TOKEN="ghp_seu_token_aqui"

# Groq (obrigatório para análise de CV e trilha)
GROQ_API_KEY="gsk_sua_chave_aqui"
```

Para obter chave Groq: https://console.groq.com/keys

### 4. Rodar Backend

```bash
# Da raiz do projeto
npm run dev:api

# OU
cd apps/api
npm run dev
```

Backend roda em `http://localhost:3000`

### 5. Rodar Frontend

```bash
# Em outro terminal, da raiz do projeto
npm run dev:web

# OU
cd apps/web
npm run dev
```

Frontend roda em `http://localhost:5173`

### 6. Popular o banco (primeira vez)

```bash
# Forçar sincronização inicial
curl -X POST http://localhost:3000/jobs/sync

# OU via npm script
npm run sync
```

---

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Roda API e Web em paralelo |
| `npm run dev:api` | Roda apenas o backend |
| `npm run dev:web` | Roda apenas o frontend |
| `npm run build` | Build de produção (API + Web) |
| `npm run sync` | Força sincronização de vagas |
| `npm run db:studio` | Abre Prisma Studio (GUI do banco) |

### Comandos do Backend (`apps/api`):

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Modo watch |
| `npm run build` | Build produção |
| `npm run start:prod` | Roda build |
| `npm run db:push` | Push schema para banco |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:studio` | GUI do banco |

### Comandos do Frontend (`apps/web`):

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build produção |
| `npm run preview` | Preview do build |

---

## Variáveis de Ambiente

### Backend (`apps/api/.env`)

```env
# Obrigatório
DATABASE_URL="file:./dev.db"     # SQLite local
# OU para PostgreSQL:
# DATABASE_URL="postgresql://user:pass@host:5432/db"

# Opcional (aumenta rate limit GitHub)
GITHUB_TOKEN="ghp_xxx"

# Obrigatório para análise de CV e trilha de aprendizado
GROQ_API_KEY="gsk_xxx"

# Opcional
PORT=3000                        # Porta do servidor
```

### Frontend (`apps/web/.env`)

```env
VITE_API_URL="http://localhost:3000"   # URL da API
```

---

## Design System (Zev) v0.6.0

O frontend usa o design system custom `@malvezzidatr/zev-*`:

### Componentes utilizados:

| Componente | Uso |
|------------|-----|
| `ZevNavbar` | Navegação superior |
| `ZevFooter` | Rodapé |
| `ZevThemeToggle` | Alternar tema claro/escuro |
| `ZevSectionHeader` | Títulos de seção |
| `ZevJobCard` | Card de vaga na lista |
| `ZevInput` | Campo de busca |
| `ZevSelect` | Dropdowns de filtro |
| `ZevButton` | Botões |
| `ZevTag` | Tags de tecnologia |
| `ZevBadge` | Badges de status |
| `ZevPagination` | Paginação |
| `ZevLoader` | Spinner e skeleton loading |
| `ZevEmptyState` | Estado vazio |
| `ZevModal` | Modais (análise CV) |
| `ZevFileUpload` | Upload de arquivos |
| `ZevProgressBar` | Barra de progresso |

### Documentação:
- Storybook: https://malvezzidatr.github.io/zev/

### Eventos (Web Components):

```typescript
// ZevModal
<ZevModal open={isOpen} onModalClose={handleClose} title="..." />

// ZevFileUpload
<ZevFileUpload
  onFileSelect={(e: CustomEvent<{ files: File[] }>) => {...}}
  onFileError={(e: CustomEvent<{ errors: string[] }>) => {...}}
/>

// ZevProgressBar
<ZevProgressBar value={score} variant="success" | "warning" | "error" />

// ZevInput (IMPORTANTE: usa detail.value, não detail.values)
<ZevInput
  onInputChange={(e: CustomEvent<{ value: string }>) => {...}}
/>

// ZevSelect (usa detail.values para multi-select)
<ZevSelect
  onSelectionChange={(e: CustomEvent<{ values: string[] }>) => {...}}
/>
```

---

## Fluxo de Dados

```
1. Scraper busca vagas da fonte externa
   ↓
2. Parser extrai: título, empresa, level, type, tags, etc.
   ↓
3. upsertByUrl() verifica se URL já existe (deduplicação)
   ↓
4. Se nova, salva no banco com tags relacionadas
   ↓
5. Frontend faz GET /jobs com filtros
   ↓
6. React Query cacheia resposta
   ↓
7. Componentes renderizam com Zev Design System
   ↓
8. Usuário pode:
   - Favoritar vaga (localStorage)
   - Analisar CV (Groq AI)
   - Gerar trilha de aprendizado (Groq AI + recursos curados)
```

---

## Considerações de Produção

1. **Banco de dados**: Migrar de SQLite para PostgreSQL
2. **Rate Limiting**: Implementar no NestJS para proteger API
3. **CORS**: Configurar origens permitidas
4. **Logging**: Adicionar logging estruturado
5. **Monitoramento**: Health checks e métricas
6. **CI/CD**: GitHub Actions para deploy automático
7. **Secrets**: Usar variáveis de ambiente seguras (não commitar .env)
8. **Cache de trilhas**: Considerar salvar trilhas geradas no banco para reutilizar

---

## Troubleshooting

### "Nenhuma vaga encontrada"
- Rode `npm run sync` para popular o banco
- Verifique se o backend está rodando

### "GITHUB_TOKEN não configurado"
- Funciona sem token, mas com rate limit baixo
- Crie um Personal Access Token no GitHub

### "Gupy retornando erro"
- A API da Gupy é instável
- Outras fontes (GitHub, LinkedIn, Vagas.com, ProgramaThor) continuam funcionando

### "Erro de CORS"
- Verifique se o backend está em `localhost:3000`
- Configure CORS no NestJS se necessário

### "Erro ao analisar currículo"
- Verifique se `GROQ_API_KEY` está configurado no `.env`
- Certifique-se que o PDF não é apenas imagens (precisa ter texto)
- Reinicie o backend após alterar `.env`

### "Modelo não encontrado (Groq)"
- Modelos podem ser descontinuados
- Verifique modelos disponíveis em https://console.groq.com/docs/models
- Atualize em `gemini.service.ts` e `learning-path.service.ts` se necessário

### "Trilha de aprendizado sem recursos"
- Verifique se o nome da tecnologia está nos aliases em `curated-resources.ts`
- A IA pode gerar nomes genéricos que não têm match

### "Input de busca não funciona"
- Verifique se está usando `detail.value` (não `detail.values`) para ZevInput
- ZevInput emite CustomEvent com `{ value: string }`, não `{ values: string }`
