# Bootcamp Treinos

Aplicação web para gerenciamento de treinos com assistente de inteligência artificial integrado. O usuário pode criar planos de treino semanais personalizados, registrar sessões de treino e acompanhar sua evolução por meio de estatísticas detalhadas — tudo isso com o auxílio de um personal trainer virtual alimentado por IA generativa.

**Acesse a aplicação:** [bootcamp-treinos.tiagolopes.bio](https://bootcamp-treinos.tiagolopes.bio)

**Documentação da API:** [bootcamp-treinos-api.tiagolopes.bio/docs](https://bootcamp-treinos-api.tiagolopes.bio/docs)

---

## Funcionalidades

- **Autenticação** — Login via Google com sessões seguras gerenciadas pelo BetterAuth.
- **Onboarding com IA** — Ao entrar pela primeira vez, o usuário é guiado por um chat com um personal trainer virtual que coleta dados físicos (peso, altura, idade, percentual de gordura) e cria um plano de treino semanal personalizado automaticamente.
- **Planos de treino** — Criação e visualização de planos de treino semanais com dias de treino e dias de descanso. Cada dia de treino contém exercícios com séries, repetições e tempo de descanso configuráveis.
- **Registro de sessões** — Iniciar e concluir sessões de treino por dia, com rastreamento de início e término.
- **Estatísticas** — Painel com métricas de desempenho: sequência de treinos (streak), taxa de conclusão, total de treinos concluídos, tempo total treinado e mapa de consistência por dia.
- **Chat com personal trainer** — Assistente de IA disponível em qualquer tela para tirar dúvidas, atualizar dados físicos ou criar novos planos de treino via conversa natural.

---

## Stack

### Backend (`apps/api`)

| Tecnologia | Uso |
|---|---|
| Node.js 24 | Runtime |
| TypeScript | Linguagem |
| Fastify | Framework HTTP |
| Prisma ORM | Acesso ao banco de dados |
| PostgreSQL | Banco de dados relacional |
| BetterAuth | Autenticação (OAuth Google) |
| Zod v4 | Validação de schemas |
| Google Gemini 2.5 Flash | Modelo de linguagem para o chat de IA |
| AI SDK (Vercel) | Integração com LLMs e streaming |
| Swagger / OpenAPI | Documentação da API |

### Frontend (`apps/web`)

| Tecnologia | Uso |
|---|---|
| Next.js 16 (App Router) | Framework React |
| React 19 | UI |
| TypeScript | Linguagem |
| Tailwind CSS v4 | Estilização |
| shadcn/ui | Componentes de UI |
| React Hook Form + Zod | Formulários e validação |
| BetterAuth | Autenticação no cliente |
| Orval + TanStack Query | Geração de cliente HTTP e data fetching |
| dayjs | Manipulação e formatação de datas |

### Monorepo

| Tecnologia | Uso |
|---|---|
| pnpm | Gerenciador de pacotes |
| Turborepo | Orquestração de builds e tarefas |
| Biome | Linting e formatação |

---

## Arquitetura

O projeto é um **monorepo pnpm + Turborepo** composto por dois apps e um pacote compartilhado:

```
bootcamp-treinos/
├── apps/
│   ├── api/          # API REST com Fastify
│   └── web/          # Frontend com Next.js
└── packages/
    └── typescript-config/  # Configurações TypeScript compartilhadas
```

### API — Padrão Route → Use Case

- **Routes** (`src/routes/`) — Responsáveis apenas por receber a requisição HTTP, validar dados com Zod, verificar autenticação e delegar para um use case. Sem lógica de negócio.
- **Use Cases** (`src/use-cases/`) — Contêm toda a lógica de negócio. São classes com um método `execute(dto)` que chamam o Prisma diretamente e lançam erros customizados quando necessário.
- **Schemas** (`src/schemas/`) — Schemas Zod reutilizados entre rotas para validação de request/response.
- **Errors** (`src/errors/`) — Classes de erro customizadas do domínio.

### Frontend — Server-first com App Router

- **Server Components** são preferidos para busca de dados via funções geradas pelo Orval (`src/lib/api/fetch-generated/`).
- **Client Components** usam hooks do TanStack Query (também gerados pelo Orval) para data fetching reativo.
- **Autenticação** é verificada diretamente nas páginas via `authClient.useSession()`, sem uso de middleware.

---

## Banco de dados

Principais entidades gerenciadas pelo Prisma:

- `User` — Usuário autenticado.
- `UserTrainData` — Dados físicos do usuário (peso, altura, idade, % de gordura).
- `WorkoutPlan` — Plano de treino semanal (um ativo por usuário por vez).
- `WorkoutDay` — Dia de treino dentro de um plano, associado a um dia da semana.
- `WorkoutExercice` — Exercício dentro de um dia de treino (séries, repetições, descanso).
- `WorkoutSession` — Sessão de treino registrada (início e conclusão).

---

## Rodando localmente

### Pré-requisitos

- Node.js 24+
- pnpm 10+
- PostgreSQL

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Executar migrations do banco
cd apps/api && pnpm prisma migrate dev

# Iniciar todos os apps em modo dev
pnpm dev
```

A API estará disponível em `http://localhost:8080` e o frontend em `http://localhost:3000`.

A documentação interativa da API (Swagger) estará disponível em `http://localhost:8080/docs`.
