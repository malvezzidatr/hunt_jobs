# Migracao Supabase + Auth + Stripe + Features

## Contexto

O Hunt Jobs atualmente roda com SQLite (arquivo local), sem autenticacao, sem pagamento, e dados de usuario (favoritos, tech profile) vivem apenas em localStorage. Para adicionar um tracker de candidaturas, assinatura, e features premium, precisamos de: banco PostgreSQL gerenciado (Supabase), sistema de auth, integracao Stripe, e novos modulos de usuario.

## Decisoes de arquitetura

- **Banco**: Supabase PostgreSQL (free tier 500MB, gerenciado, backups automaticos)
- **Auth**: Supabase Auth (email/senha + OAuth Google/GitHub) — JWT verificado no NestJS via guard
- **Pagamento**: Stripe Checkout (redirect) + Customer Portal + Webhooks
- **Modelo freemium**: Free = 3 usos AI/mes + localStorage | Pro = ilimitado + tracker + cloud + cover letter

---

## Variaveis de ambiente novas

### Backend (`apps/api/.env`)
```env
# Substituir SQLite
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Supabase Auth
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
FRONTEND_URL=https://hunt-jobs-web.vercel.app
```

### Frontend (`apps/web/.env`)
```env
VITE_SUPABASE_URL=https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## Prisma Schema completo (PostgreSQL)

`apps/api/prisma/schema.prisma` — reescrita completa:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum JobLevel { ESTAGIO  JUNIOR  PLENO }
enum JobType { FRONTEND  BACKEND  FULLSTACK  MOBILE }
enum SubscriptionStatus { ACTIVE  CANCELED  PAST_DUE  TRIALING }
enum ApplicationStatus { SAVED  APPLIED  INTERVIEW  TECHNICAL_TEST  OFFER  REJECTED  WITHDRAWN }

model Job {
  id          String        @id @default(cuid())
  title       String
  company     String
  location    String?
  description String        @db.Text
  url         String        @unique
  salary      String?
  level       JobLevel
  type        JobType
  remote      Boolean       @default(false)
  source      Source        @relation(fields: [sourceId], references: [id])
  sourceId    String
  tags        JobTag[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  postedAt    DateTime?
  applications Application[]
  favorites    Favorite[]
  @@index([level])
  @@index([type])
  @@index([sourceId])
  @@index([postedAt])
}

model Source {
  id   String @id @default(cuid())
  name String @unique
  url  String
  jobs Job[]
}

model Tag {
  id   String   @id @default(cuid())
  name String   @unique
  jobs JobTag[]
}

model JobTag {
  job   Job    @relation(fields: [jobId], references: [id], onDelete: Cascade)
  jobId String
  tag   Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId String
  @@id([jobId, tagId])
  @@index([tagId])
}

model UserProfile {
  id                  String             @id @default(cuid())
  supabaseUserId      String             @unique
  email               String             @unique
  name                String?
  techs               String[]           @default([])
  stripeCustomerId    String?            @unique
  subscriptionStatus  SubscriptionStatus @default(ACTIVE)
  subscriptionId      String?            @unique
  planType            String             @default("free") // "free" | "pro"
  subscriptionEndDate DateTime?
  aiUsageCount        Int                @default(0)
  aiUsageResetDate    DateTime           @default(now())
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
  favorites           Favorite[]
  applications        Application[]
  coverLetters        CoverLetter[]
  @@index([supabaseUserId])
}

model Favorite {
  id        String      @id @default(cuid())
  user      UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  job       Job         @relation(fields: [jobId], references: [id], onDelete: Cascade)
  jobId     String
  createdAt DateTime    @default(now())
  @@unique([userId, jobId])
  @@index([userId])
}

model Application {
  id        String            @id @default(cuid())
  user      UserProfile       @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  job       Job               @relation(fields: [jobId], references: [id], onDelete: Cascade)
  jobId     String
  status    ApplicationStatus @default(SAVED)
  notes     String?           @db.Text
  appliedAt DateTime?
  nextStep  String?
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
  @@unique([userId, jobId])
  @@index([userId])
  @@index([status])
}

model CoverLetter {
  id        String      @id @default(cuid())
  user      UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  jobId     String
  jobTitle  String
  company   String
  content   String      @db.Text
  createdAt DateTime    @default(now())
  @@index([userId])
}
```

---

## FASE 1: Supabase + Migracao PostgreSQL

### Passos manuais
1. Criar projeto no Supabase Dashboard
2. Copiar: Project URL, Anon Key, Service Role Key, JWT Secret, Connection Strings

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `apps/api/prisma/schema.prisma` | Reescrita completa (ver acima) |
| `apps/api/package.json` | `npm i @supabase/supabase-js @nestjs/config stripe` |
| `apps/api/src/app.module.ts` | Adicionar `ConfigModule.forRoot({ isGlobal: true })` |
| `apps/api/src/jobs/jobs.service.ts` | Adicionar `mode: 'insensitive'` em todos `contains` (PostgreSQL e case-sensitive) |
| `apps/api/Dockerfile` | Remover `mkdir /app/data` e `DATABASE_URL=file:...` |
| `docker-compose.yml` | Remover volume `api-data`, adicionar novas env vars |

### Arquivos novos

| Arquivo | Descricao |
|---------|-----------|
| `apps/api/src/config/env.validation.ts` | Validacao de env vars obrigatorias no startup |
| `apps/api/src/scripts/migrate-to-supabase.ts` | Script para copiar dados SQLite → PostgreSQL |

### Mudancas em jobs.service.ts
- Todos os `{ contains: search }` viram `{ contains: search, mode: 'insensitive' }`
- O metodo `upsertByUrl` que faz comparacao case-insensitive manual pode usar `mode: 'insensitive'` nativo
- Enums `level`/`type` agora sao nativos do PostgreSQL (Prisma cuida da conversao)

### Verificacao
- `npx prisma db push` no Supabase sem erros
- Rodar script de migracao, verificar contagem de dados
- Todos os endpoints existentes funcionam: GET /jobs, GET /jobs/stats, POST /jobs/sync
- Frontend carrega normalmente

---

## FASE 2: Sistema de Autenticacao

### Passos manuais Supabase
1. Ativar Email/Password no dashboard
2. Ativar OAuth Google (Client ID/Secret do Google Cloud Console)
3. Ativar OAuth GitHub (Client ID/Secret do GitHub Developer Settings)
4. Configurar redirect URLs: `http://localhost:5173/auth/callback`, `https://[prod]/auth/callback`
5. Customizar email templates em portugues

### Arquivos novos (Backend)

| Arquivo | Descricao |
|---------|-----------|
| `apps/api/src/auth/auth.module.ts` | Modulo de auth, exporta guards e services |
| `apps/api/src/auth/auth.types.ts` | Interface `AuthUser { id, email, profileId? }` |
| `apps/api/src/auth/supabase.service.ts` | Client admin Supabase, metodo `verifyToken(jwt)` |
| `apps/api/src/auth/supabase-auth.guard.ts` | Guard que extrai Bearer token, valida, seta `req.user` |
| `apps/api/src/auth/optional-auth.guard.ts` | Variante que NAO joga erro se nao tem token (seta `req.user = null`) |
| `apps/api/src/auth/current-user.decorator.ts` | Decorator `@CurrentUser()` para extrair user do request |

### Arquivos novos (Frontend)

| Arquivo | Descricao |
|---------|-----------|
| `apps/web/src/shared/lib/supabase.ts` | Client Supabase (`createClient(url, anonKey)`) |
| `apps/web/src/features/auth/contexts/AuthContext.tsx` | Context com `session`, `user`, `signIn`, `signUp`, `signInWithOAuth`, `signOut` |
| `apps/web/src/features/auth/hooks/useAuth.ts` | Hook `useContext(AuthContext)` |
| `apps/web/src/features/auth/components/ProtectedRoute.tsx` | Redireciona para `/login` se nao autenticado |
| `apps/web/src/features/auth/index.ts` | Barrel exports |
| `apps/web/src/pages/Login/Login.tsx` + `useLogin.ts` | Pagina de login (email/senha + OAuth) |
| `apps/web/src/pages/Register/Register.tsx` + `useRegister.ts` | Pagina de registro |
| `apps/web/src/pages/AuthCallback/AuthCallback.tsx` | Handler do redirect OAuth |
| `apps/web/src/pages/ResetPassword/ResetPassword.tsx` | Reset de senha |

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `apps/web/package.json` | `npm i @supabase/supabase-js` |
| `apps/web/src/main.tsx` | Wrap com `<AuthProvider>` |
| `apps/web/src/App.tsx` | Novas rotas `/login`, `/register`, `/auth/callback`, `/reset-password`, `/profile`, `/tracker` |
| `apps/web/src/App.tsx` | Navbar: mostrar "Login" ou "Perfil"/"Tracker"/"Sair" conforme auth |
| `apps/web/src/shared/services/api.ts` | `fetchAPI` injeta `Authorization: Bearer <token>` automaticamente |
| `apps/web/src/features/resume-analyzer/services/resumeApi.ts` | Injetar auth token no FormData fetch |
| `apps/api/src/app.module.ts` | Adicionar `AuthModule` |
| `apps/api/src/main.ts` | Adicionar `allowedHeaders: ['Content-Type', 'Authorization']` no CORS |

### Verificacao
- Registro por email + confirmacao
- Login email/senha, Google OAuth, GitHub OAuth
- Rotas protegidas redirecionam para /login
- Rotas publicas (/, /mercado, /job/:id) continuam acessiveis sem auth
- Token Bearer enviado automaticamente nas chamadas API

---

## FASE 3: Modelos de Usuario + Cloud Features

### Arquivos novos (Backend)

| Arquivo | Descricao |
|---------|-----------|
| `apps/api/src/user/user.module.ts` | Modulo User |
| `apps/api/src/user/user.controller.ts` | `GET /user/profile`, `PUT /user/profile`, `PUT /user/techs` |
| `apps/api/src/user/user.service.ts` | `findOrCreate()`, `getProfile()`, `updateTechs()` |
| `apps/api/src/user/dto/update-profile.dto.ts` | DTO de atualizacao |
| `apps/api/src/favorites/favorites.module.ts` | Modulo Favorites |
| `apps/api/src/favorites/favorites.controller.ts` | CRUD: `GET/POST/DELETE /favorites`, `POST /favorites/sync` |
| `apps/api/src/favorites/favorites.service.ts` | Service com logica de favoritos |

### Arquivos modificados (Frontend)

| Arquivo | Mudanca |
|---------|---------|
| `apps/web/src/features/favorites/hooks/useFavorites.ts` | **Hibrido**: localStorage se anonimo, API se logado. Migracao automatica no primeiro login |
| `apps/web/src/features/tech-profile/hooks/useTechProfile.ts` | **Hibrido**: mesmo pattern. `PUT /user/techs` quando logado |

### Arquivos novos (Frontend)

| Arquivo | Descricao |
|---------|-----------|
| `apps/web/src/pages/Profile/Profile.tsx` + `useProfile.ts` + `Profile.types.ts` | Pagina de perfil (info, techs, assinatura, stats) |

### Pattern hibrido (favoritos como exemplo)
```typescript
function useFavorites() {
  const { isAuthenticated } = useAuth()
  const cloudFavorites = useQuery({ queryKey: ['favorites'], enabled: isAuthenticated })
  const [localFavorites, setLocalFavorites] = useLocalStorage('huntjobs_favorites')

  // Migracao: primeiro login com favoritos locais → sync para cloud
  useEffect(() => {
    if (isAuthenticated && localFavorites.length > 0) {
      syncToCloud(localFavorites).then(() => clearLocal())
    }
  }, [isAuthenticated])

  return isAuthenticated ? cloudFavorites : localFavorites
}
```

### Verificacao
- Criar conta, perfil criado no banco
- Favoritar logado → persiste no banco
- Deslogar → favoritos localStorage voltam a funcionar
- Logar com favoritos locais → migracao automatica
- Tech profile sincroniza com banco

---

## FASE 4: Integracao Stripe

### Passos manuais Stripe
1. Criar conta Stripe, criar produto "Hunt Jobs Pro" com preco mensal
2. Configurar Customer Portal
3. Criar webhook endpoint → `https://[api-url]/stripe/webhook`
4. Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### Arquivos novos (Backend)

| Arquivo | Descricao |
|---------|-----------|
| `apps/api/src/stripe/stripe.module.ts` | Modulo Stripe |
| `apps/api/src/stripe/stripe.service.ts` | `createCheckoutSession()`, `createPortalSession()`, `handleWebhookEvent()` |
| `apps/api/src/stripe/stripe.controller.ts` | `POST /stripe/checkout` (auth), `POST /stripe/portal` (auth) |
| `apps/api/src/stripe/stripe-webhook.controller.ts` | `POST /stripe/webhook` (raw body, sem auth) |
| `apps/api/src/auth/usage-limit.guard.ts` | Checa `aiUsageCount < 3` para free, passa direto para pro |
| `apps/api/src/auth/increment-usage.interceptor.ts` | Incrementa `aiUsageCount` apos sucesso da chamada AI |
| `apps/api/src/auth/plan.guard.ts` | Bloqueia se `planType !== 'pro'` (para features exclusivas) |

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `apps/api/src/main.ts` | Raw body parser para rota `/stripe/webhook` (verificacao de assinatura) |
| `apps/api/src/resume/resume.controller.ts` | Adicionar `@UseGuards(SupabaseAuthGuard, UsageLimitGuard)` + `@UseInterceptors(IncrementUsageInterceptor)` |
| `apps/api/src/learning-path/learning-path.controller.ts` | Mesmos guards do resume |
| `apps/api/src/app.module.ts` | Adicionar `StripeModule` |

### Arquivos novos (Frontend)

| Arquivo | Descricao |
|---------|-----------|
| `apps/web/src/pages/Pricing/Pricing.tsx` + `usePricing.ts` | Pagina de precos (Free vs Pro) |
| `apps/web/src/pages/Pricing/PricingSuccess.tsx` | Pagina pos-checkout |
| `apps/web/src/features/auth/components/UpgradeModal.tsx` | Modal "limite atingido, faca upgrade" |

### Arquivos modificados (Frontend)

| Arquivo | Mudanca |
|---------|---------|
| `apps/web/src/App.tsx` | Rota `/pricing` e `/pricing/success` |
| `apps/web/src/features/resume-analyzer/components/ResumeAnalyzer/useResumeAnalyzer.ts` | Detectar 403 USAGE_LIMIT_EXCEEDED, mostrar UpgradeModal |
| `apps/web/src/features/learning-path/components/LearningPath/useLearningPath.ts` | Mesmo tratamento |

### Fluxo de pagamento
1. Usuario clica "Upgrade" → frontend chama `POST /stripe/checkout`
2. Backend cria Checkout Session com `metadata: { userId }`, retorna URL
3. Frontend redireciona para URL do Stripe
4. Usuario paga → Stripe envia webhook `checkout.session.completed`
5. Backend atualiza `planType = "pro"` na UserProfile
6. Frontend redireciona para `/pricing/success`

### Verificacao
- Free user usa AI 3x, na 4a recebe modal de upgrade
- Clicar upgrade → Stripe Checkout → pagar → volta para app como Pro
- Pro user usa AI sem limite
- Cancelar via Customer Portal → webhook atualiza para free
- `invoice.payment_failed` → status PAST_DUE

---

## FASE 5: Tracker de Candidaturas (Pro only)

### Arquivos novos (Backend)

| Arquivo | Descricao |
|---------|-----------|
| `apps/api/src/applications/applications.module.ts` | Modulo |
| `apps/api/src/applications/applications.controller.ts` | CRUD com `@UseGuards(SupabaseAuthGuard, ProPlanGuard)` |
| `apps/api/src/applications/applications.service.ts` | Service |
| `apps/api/src/applications/dto/*.dto.ts` | DTOs create, update, query |

Endpoints:
```
GET    /applications          — listar com filtros e paginacao
GET    /applications/stats    — contagem por status
POST   /applications          — criar (jobId, status, notes)
PATCH  /applications/:id      — atualizar status, notas
DELETE /applications/:id      — remover
```

### Arquivos novos (Frontend)

| Arquivo | Descricao |
|---------|-----------|
| `apps/web/src/features/tracker/` | types, services, hooks |
| `apps/web/src/pages/Tracker/Tracker.tsx` + hook + types | Pagina Kanban: colunas por status, cards com job info |

### Arquivo modificado

| Arquivo | Mudanca |
|---------|---------|
| `apps/web/src/pages/JobDetail.tsx` | Botao "Acompanhar Candidatura" (pro only) |
| `apps/web/src/App.tsx` | Rota `/tracker` protegida |

### Verificacao
- Pro user cria, edita, deleta candidaturas
- Free user ve modal de upgrade
- Kanban exibe corretamente por status
- Stats refletem contagens

---

## FASE 6: Gerador de Carta de Apresentacao (Pro only)

### Arquivos novos (Backend)

| Arquivo | Descricao |
|---------|-----------|
| `apps/api/src/cover-letter/cover-letter.module.ts` | Modulo |
| `apps/api/src/cover-letter/cover-letter.controller.ts` | `POST /cover-letter/generate` (auth + pro), `GET /cover-letter` (listar), `DELETE` |
| `apps/api/src/cover-letter/cover-letter.service.ts` | Gera carta via Groq, salva no banco |
| `apps/api/src/cover-letter/dto/generate-cover-letter.dto.ts` | DTO |

### Arquivos novos (Frontend)

| Arquivo | Descricao |
|---------|-----------|
| `apps/web/src/features/cover-letter/` | types, services, components |
| `apps/web/src/features/cover-letter/components/CoverLetterGenerator/` | Modal: upload CV opcional → gerar → copiar |

### Arquivo modificado

| Arquivo | Mudanca |
|---------|---------|
| `apps/web/src/pages/JobDetail.tsx` | Botao "Gerar Carta" ao lado dos outros AI buttons |

---

## Resumo de impacto

| | Criar | Modificar |
|---|---|---|
| Backend | ~25 arquivos | ~8 arquivos |
| Frontend | ~30 arquivos | ~10 arquivos |
| Infra | — | 3 arquivos (Dockerfile, docker-compose, nginx) |

## Ordem de execucao

| Fase | Dependencia | Estimativa |
|------|-------------|------------|
| 1. Supabase + PostgreSQL | Nenhuma | Base de tudo |
| 2. Auth | Fase 1 | Precisa do banco |
| 3. User + Cloud | Fase 2 | Precisa de auth |
| 4. Stripe | Fase 2+3 | Precisa de UserProfile |
| 5. Tracker | Fase 4 | Precisa de ProPlanGuard |
| 6. Cover Letter | Fase 4 | Precisa de ProPlanGuard |

## Verificacao final

1. `npm run build` passa em ambos apps
2. Fluxo completo: registro → login → favoritar → analisar CV (3x free) → upgrade → ilimitado → tracker → cover letter
3. OAuth Google e GitHub funcionam
4. Webhook Stripe atualiza plano corretamente
5. Dados antigos migrados do SQLite
