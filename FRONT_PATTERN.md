# Arquitetura Hook-View Pattern

Este projeto utiliza o **Hook-View Pattern** (também conhecido como Smart Hook + Dumb Component), uma evolução natural do Container/Presentational para a era dos React Hooks.

## Conceito

- **Hook (Smart)**: Gerencia estado, lógica de negócio e side effects
- **View (Dumb)**: Apenas renderiza JSX, zero lógica

É essencialmente o "MVVM sem o M" — o Model já existe externamente (`types/`, `services/`, `hooks/`).

## Estrutura de Pastas

```
ComponentName/
├── index.ts                    # Re-export público
├── ComponentName.tsx           # View - componente visual
├── useComponentName.ts         # Hook - lógica e estado
├── ComponentName.types.ts      # Tipos locais
└── utils/                      # Funções puras auxiliares (opcional)
    └── formatters.ts
```

## Camadas

### View (`ComponentName.tsx`)

Componente **"burro"** que:
- Apenas renderiza JSX
- Não contém lógica de negócio
- Consome o hook internamente
- Recebe dados já transformados para exibição

```tsx
import { useFeaturedJobs } from './useFeaturedJobs'

export function FeaturedJobs({ limit = 10 }: FeaturedJobsProps) {
  const vm = useFeaturedJobs(limit)

  if (vm.isLoading) return <LoadingState />
  if (vm.hasError || vm.isEmpty) return null

  return (
    <div className="featured-jobs">
      {vm.jobs.map(job => (
        <JobSlide key={job.id} job={job} onJobClick={vm.onJobClick} />
      ))}
    </div>
  )
}
```

### Hook (`useComponentName.ts`)

Hook customizado que:
- Gerencia estado e efeitos
- Transforma dados da API para formato da View
- Expõe ações (callbacks) para a View
- Encapsula toda a lógica de negócio

```tsx
export function useFeaturedJobs(limit: number): FeaturedJobsState & FeaturedJobsActions {
  const { jobs: rawJobs, loading, error } = useFeaturedJobsQuery(limit)

  // Transforma dados da API para formato da View
  const jobs: FeaturedJobCard[] = rawJobs.map(job => ({
    id: job.id,
    title: job.title,
    colors: getCompanyColors(job.company),
  }))

  return {
    jobs,
    isLoading: loading,
    isEmpty: jobs.length === 0,
    hasError: !!error,
    onJobClick,
  }
}
```

### Types (`ComponentName.types.ts`)

Tipos **locais** de apresentação:

```tsx
// Props da View
export interface FeaturedJobsProps {
  limit?: number
}

// Estado exposto pelo Hook
export interface FeaturedJobsState {
  jobs: FeaturedJobCard[]
  isLoading: boolean
  isEmpty: boolean
  hasError: boolean
}

// Ações expostas pelo Hook
export interface FeaturedJobsActions {
  onJobClick: (jobId: string) => void
}
```

### Utils (`utils/*.ts`)

Funções **puras** auxiliares:
- Sem side effects
- Facilmente testáveis
- Reutilizáveis

```tsx
// formatters.ts
export function formatFileSize(bytes: number): string

// companyBranding.ts
export function getCompanyColors(company: string): CompanyColors
```

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│  Model (externo ao componente)                          │
│  src/types/ + src/services/ + src/hooks/                │
└─────────────────────┬───────────────────────────────────┘
                      │ dados brutos da API
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Hook (useComponentName.ts)                             │
│  - Busca dados via hooks externos                       │
│  - Transforma para formato de apresentação              │
│  - Gerencia estado derivado (loading, error, empty)     │
│  - Define ações (onClick, onSubmit, etc)                │
└─────────────────────┬───────────────────────────────────┘
                      │ State & Actions
                      ▼
┌─────────────────────────────────────────────────────────┐
│  View (ComponentName.tsx)                               │
│  - Renderiza baseado no estado                          │
│  - Chama ações em resposta a eventos                    │
│  - Zero lógica de negócio                               │
└─────────────────────────────────────────────────────────┘
```

## Quando Usar

**Use este pattern para componentes que:**
- Têm lógica de negócio significativa
- Transformam dados da API
- Gerenciam múltiplos estados
- Precisam de alta testabilidade

**Não use para:**
- Componentes simples (botões, inputs, cards estáticos)
- Componentes puramente visuais

## Comparação com Outros Patterns

| Pattern | Descrição | Quando surgiu |
|---------|-----------|---------------|
| Container/Presentational | Container (componente) passa props para Presentational | 2015 |
| **Hook-View** | Hook gerencia lógica, View renderiza | 2019+ |
| MVVM | Model-View-ViewModel (mais comum em mobile/desktop) | - |
| Headless Hooks | Mesmo conceito, usado em libs como React Table | 2019+ |

O Hook-View é a evolução natural do Container/Presentational — o Container virou um Hook.

---

# TODO: Refatoração Pendente

## Renomear arquivos para nova convenção

### FeaturedJobs/
- [ ] `FeaturedJobs.view.tsx` → `FeaturedJobs.tsx`
- [ ] `FeaturedJobs.viewModel.ts` → `useFeaturedJobs.ts`
- [ ] Atualizar imports internos

### LearningPath/
- [ ] `LearningPath.view.tsx` → `LearningPath.tsx`
- [ ] `LearningPath.viewModel.ts` → `useLearningPath.ts`
- [ ] Atualizar imports internos

### ResumeAnalyzer/
- [ ] `ResumeAnalyzer.view.tsx` → `ResumeAnalyzer.tsx`
- [ ] `ResumeAnalyzer.viewModel.ts` → `useResumeAnalyzer.ts`
- [ ] Atualizar imports internos

## Criar index.ts faltantes

- [ ] `LearningPath/index.ts` - criar re-export
- [ ] `ResumeAnalyzer/index.ts` - criar re-export

## Avaliar pages para Hook-View

### JobDetail.tsx
- [ ] Avaliar se precisa do pattern (tem bastante lógica)
- [ ] Se sim: criar `JobDetail/`, `useJobDetail.ts`, etc.

### Home.tsx
- [ ] Avaliar se precisa do pattern
- [ ] Se sim: criar `Home/`, `useHome.ts`, etc.

## Migração para Feature-based Structure

### Por que Feature-based?

A estrutura atual organiza por **tipo técnico**:
```
src/
├── components/    # Todos os componentes juntos
├── hooks/         # Todos os hooks juntos
├── services/      # Todos os services juntos
├── pages/         # Todas as páginas juntas
└── types/         # Todos os tipos juntos
```

**Problema:** Para mexer em "Learning Path", você precisa navegar em 5 pastas diferentes.

A estrutura **Feature-based** organiza por **domínio de negócio**:
```
src/
├── features/
│   ├── jobs/
│   │   ├── components/
│   │   │   ├── JobCard/
│   │   │   ├── JobList/
│   │   │   ├── JobFilters/
│   │   │   └── FeaturedJobs/
│   │   ├── hooks/
│   │   │   ├── useJobs.ts
│   │   │   └── useFeaturedJobs.ts
│   │   ├── services/
│   │   │   └── jobsApi.ts
│   │   ├── types/
│   │   │   └── job.types.ts
│   │   └── index.ts
│   │
│   ├── learning-path/
│   │   ├── components/
│   │   │   ├── LearningPath/
│   │   │   └── TechCard/
│   │   ├── hooks/
│   │   │   └── useLearningPath.ts
│   │   ├── services/
│   │   │   └── learningPathApi.ts
│   │   ├── types/
│   │   │   └── learningPath.types.ts
│   │   └── index.ts
│   │
│   ├── resume-analyzer/
│   │   ├── components/
│   │   │   └── ResumeAnalyzer/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── favorites/
│       ├── hooks/
│       │   └── useFavorites.ts
│       └── index.ts
│
├── shared/                    # Código compartilhado entre features
│   ├── components/            # Componentes genéricos (Button, Modal, etc.)
│   ├── hooks/                 # Hooks utilitários
│   ├── utils/                 # Funções utilitárias
│   └── types/                 # Tipos globais
│
├── pages/                     # Apenas roteamento, importa de features
│   ├── Home.tsx
│   └── JobDetail.tsx
│
└── app/                       # Configuração da aplicação
    ├── App.tsx
    ├── routes.tsx
    └── providers.tsx
```

### Vantagens

| Benefício | Descrição |
|-----------|-----------|
| **Colocation** | Tudo relacionado a uma feature fica junto |
| **Deletabilidade** | Remove a pasta e a feature some |
| **Escalabilidade** | Funciona bem com times grandes |
| **Code Splitting** | Facilita lazy loading por feature |
| **Onboarding** | Novo dev entende o domínio rapidamente |
| **Ownership** | Fácil atribuir donos por feature |

### Regras

1. **Features não importam de outras features diretamente**
   - Use `shared/` para código comum
   - Ou exponha via `index.ts` da feature

2. **Pages são finas**
   - Apenas composição de componentes de features
   - Roteamento e layout

3. **Shared é genérico**
   - Não contém lógica de negócio específica
   - Componentes de UI reutilizáveis

4. **Cada feature tem seu index.ts**
   ```ts
   // features/learning-path/index.ts
   export { LearningPath } from './components/LearningPath'
   export { useLearningPath } from './hooks/useLearningPath'
   export type { LearningPathResponse } from './types/learningPath.types'
   ```

### TODO: Migração para Feature-based

- [ ] Criar estrutura `src/features/`
- [ ] Migrar `jobs/` (components, hooks, services, types relacionados)
- [ ] Migrar `learning-path/`
- [ ] Migrar `resume-analyzer/`
- [ ] Migrar `favorites/`
- [ ] Criar `src/shared/` para componentes/hooks genéricos
- [ ] Atualizar imports em `pages/`
- [ ] Atualizar imports em `App.tsx`

---

## Configuração

### Logo.dev API

O componente FeaturedJobs usa [logo.dev](https://www.logo.dev) para buscar logos de empresas.

1. Acesse https://www.logo.dev/dashboard
2. Crie uma conta e obtenha sua API key
3. Crie o arquivo `apps/web/.env`:

```env
VITE_LOGO_DEV_TOKEN=seu_token_aqui
```

Se o token não estiver configurado, será usado um fallback com iniciais da empresa.
