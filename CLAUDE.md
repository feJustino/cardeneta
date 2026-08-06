# CLAUDE.md — Guia de Contexto Global do Repositório

## 1. Objetivo do Projeto

**Cardeneta** é uma aplicação web de controle de contas pendentes ("fiado") desenvolvida para o Empório Justino, uma mercearia de bairro. O sistema permite ao proprietário cadastrar clientes, registrar compras a prazo e pagamentos, e consultar saldos e históricos de transações de forma centralizada e segura, substituindo o controle manual em papel.

---

## 2. Stack Tecnológico e Arquitetura

### Linguagens e Frameworks

| Camada | Tecnologia |
|---|---|
| Framework full-stack | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS v4 |
| Banco de dados | PostgreSQL via Prisma ORM 6 |
| Autenticação | NextAuth.js v4 (`next-auth`) + Google OAuth Provider |
| Adapter de sessão | `@auth/prisma-adapter` |
| Toasts/Notificações | `sonner` |
| Package manager | `pnpm` (com `pnpm-workspace.yaml`) |

### Padrão Arquitetural

O projeto segue o padrão **Colocation por feature dentro do App Router do Next.js**, com separação de camadas entre lógica de negócio (pasta `lib/`) e apresentação (pasta `components/`). Não há um framework externo de camadas — a estrutura é intencional e simples.

### Estrutura de Pastas

```
cardeneta/
├── app/
│   ├── (auth)/             # Grupo de rotas protegidas (layout verifica sessão)
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── customers/      # Páginas de clientes (listagem, detalhe, novo)
│   │   ├── transactions/   # Página de registro de compras no fiado
│   │   └── payments/       # Página de registro de pagamentos
│   ├── api/                # Route Handlers (API REST interna)
│   │   ├── auth/           # NextAuth handler ([...nextauth])
│   │   ├── customers/      # CRUD de clientes
│   │   ├── transactions/   # Registro de compras
│   │   └── payments/       # Registro de pagamentos
│   ├── login/              # Página pública de login
│   └── layout.tsx          # Root layout com SessionProvider
├── components/
│   ├── ui/                 # Componentes de UI reutilizáveis (Card, etc.)
│   ├── CustomerForm.tsx    # Formulário de cadastro/edição de cliente
│   ├── CustomerSearch.tsx  # Autocomplete de busca de clientes
│   ├── TransactionForm.tsx # Formulário de registro de compra
│   └── PaymentForm.tsx     # Formulário de registro de pagamento
├── lib/
│   ├── auth.ts             # Configuração do NextAuth (authOptions)
│   ├── prisma.ts           # Singleton do PrismaClient
│   ├── api.ts              # Helpers de API: classes de erro + handleApiError
│   ├── balance.ts          # Lógica de cálculo de saldo (calculateBalance)
│   ├── constants.ts        # Constantes globais (TRANSACTION_TYPE, etc.)
│   └── types.ts            # Tipos TypeScript compartilhados
└── prisma/
    └── schema.prisma       # Schema do banco de dados
```

---

## 3. Comandos de Desenvolvimento

> **Pré-requisito:** ter `pnpm` instalado globalmente (`npm install -g pnpm`).

```bash
# Instalar dependências (também executa `prisma generate` via postinstall)
pnpm install

# Rodar o servidor de desenvolvimento local (porta 3000)
pnpm dev

# Aplicar migrações no banco de dados (necessário após alterar schema.prisma)
pnpm dlx prisma migrate dev --name <nome_da_migration>

# Sincronizar schema sem criar arquivo de migration (uso em desenvolvimento/prototipagem)
pnpm dlx prisma db push

# Abrir o Prisma Studio (GUI para inspecionar o banco)
pnpm dlx prisma studio

# Executar o linter
pnpm lint

# Build de produção
pnpm build

# Iniciar servidor em modo produção (após build)
pnpm start
```

> **Nota:** Não há suíte de testes configurada no projeto atualmente.

---

## 4. Convenções de Código e Estilo

### Nomenclatura

- **Componentes React:** `PascalCase` (ex: `CustomerForm.tsx`, `TransactionForm.tsx`)
- **Arquivos de utilitário/lib:** `camelCase` (ex: `auth.ts`, `balance.ts`)
- **Variáveis e funções:** `camelCase`
- **Constantes de valor fixo:** `SCREAMING_SNAKE_CASE` agrupadas em objetos `as const` (ex: `TRANSACTION_TYPE.CREDIT`)
- **Tipos e Interfaces TypeScript:** `PascalCase` (ex: `TransactionData`, `CustomerWithBalance`)
- **Rotas de API:** seguem a convenção de diretórios do Next.js App Router (`route.ts`)

### Formatação e Linting

- **ESLint** configurado via `eslint.config.mjs` com as configs `eslint-config-next/core-web-vitals` e `eslint-config-next/typescript`.
- Sem Prettier configurado explicitamente — seguir as regras do ESLint do Next.js.
- Usar aspas duplas (`"`) para strings em TypeScript/TSX (convenção observada no código).

### Tratamento de Erros (API Routes)

Todas as Route Handlers seguem o padrão centralizado definido em `lib/api.ts`:

```typescript
// Padrão obrigatório em todo Route Handler
export async function GET(request: Request) {
  try {
    await getSessionOrThrow() // autenticação
    // ... lógica de negócio
    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error) // centraliza mapeamento de erros para HTTP
  }
}
```

**Classes de erro disponíveis em `lib/api.ts`:**

| Classe | Status HTTP |
|---|---|
| `AuthError` | 401 |
| `ValidationError` | 400 |
| `NotFoundError` | 404 |
| Erros genéricos | 500 |

Nunca retorne respostas de erro manualmente — sempre lance (`throw`) uma das classes acima e deixe `handleApiError` tratar.

### Cálculo de Saldo

O saldo **nunca é armazenado** no banco. É **sempre calculado dinamicamente** pela função `calculateBalance(transactions)` de `lib/balance.ts`, a partir das transações do tipo `"credit"` (débito do cliente) e `"payment"` (pagamento).

### Acesso ao Banco de Dados

- Usar **exclusivamente o singleton** `prisma` importado de `@/lib/prisma`. Nunca instanciar `PrismaClient` diretamente em outros módulos.
- O acesso ao banco ocorre apenas em **Server Components** e **Route Handlers** (nunca no cliente).

### Autenticação

- A verificação de sessão em Route Handlers é feita via `getSessionOrThrow()` de `lib/api.ts`.
- Em Server Components, usar `getServerSession(authOptions)` diretamente.
- O acesso é restrito a um único e-mail definido em `ADMIN_EMAIL` — verificado no callback `signIn` do NextAuth.

### Componentes

- Componentes de UI puros (sem lógica de negócio) ficam em `components/ui/`.
- Componentes de feature (com estado e chamadas de API) ficam direto em `components/`.
- Páginas e layouts ficam em `app/`.

---

## 5. Infraestrutura e Variáveis de Ambiente

### Banco de Dados

- **PostgreSQL** (qualquer provider: local, Neon, Supabase, Railway).
- O schema é gerenciado pelo **Prisma Migrate**.
- Em dev com pnpm, `lib/prisma.ts` cria um symlink automático para `.prisma` dentro do diretório pnpm para resolver o client gerado.

### Variáveis de Ambiente (`.env`)

Criar um arquivo `.env` na raiz do projeto (`cardeneta/`) com as seguintes chaves. Referência: `.env.example`.

| Variável | Descrição | Obrigatória |
|---|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL. Ex: `postgresql://user:pass@localhost:5432/cardeneta` | Sim |
| `NEXTAUTH_URL` | URL base da aplicação. Ex: `http://localhost:3000` | Sim |
| `NEXTAUTH_SECRET` | Secret aleatório para assinar sessões JWT. Gerar com `openssl rand -base64 32` | Sim |
| `GOOGLE_CLIENT_ID` | Client ID do projeto no Google Cloud Console | Sim |
| `GOOGLE_CLIENT_SECRET` | Client Secret do projeto no Google Cloud Console | Sim |
| `ADMIN_EMAIL` | E-mail Google autorizado a fazer login no sistema | Sim |

### Setup do Google OAuth

1. Acessar [console.cloud.google.com](https://console.cloud.google.com).
2. Criar um projeto e habilitar a API "Google+ API" ou "Google Identity".
3. Em **Credenciais > Criar credenciais > ID do cliente OAuth 2.0**.
4. Tipo: **Aplicativo da Web**.
5. Adicionar URI de redirecionamento autorizado: `http://localhost:3000/api/auth/callback/google` (dev) e o equivalente de produção.
