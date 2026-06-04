# Cardeneta - Empório Justino

Sistema de controle de contas pendentes (fiado) para a mercearia Empório Justino.

## Stack

- **Frontend/Backend**: Next.js 16 (App Router) + React 19
- **Banco de dados**: PostgreSQL + Prisma ORM
- **Autenticação**: NextAuth.js v4 com Google Provider
- **Estilização**: Tailwind CSS v4
- **Notificações**: Sonner

## Pré-requisitos

- Node.js 20+
- pnpm
- PostgreSQL (ou conta no [Neon](https://neon.tech))
- Conta no [Google Cloud Console](https://console.cloud.google.com)

## Setup local

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd cardeneta
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e edite:

```bash
cp .env.example .env
```

Preencha as variáveis:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexão do PostgreSQL | `postgresql://user:pass@localhost:5432/cardeneta` |
| `NEXTAUTH_URL` | URL da aplicação | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Chave secreta para JWT | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth | — |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth | — |
| `ADMIN_EMAIL` | Email Google autorizado a acessar | `seu-email@gmail.com` |

### 4. Configure o Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto ou selecione um existente
3. Vá em **APIs e Serviços > Credenciais**
4. Crie uma **Credencial OAuth 2.0** (tipo: Aplicativo Web)
5. Adicione os URIs de redirecionamento:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://seu-site.vercel.app/api/auth/callback/google` (produção)
6. Copie o Client ID e Client Secret para o `.env`

### 5. Configure o banco de dados

```bash
# Cria as tabelas no banco
npx prisma db push

# (Opcional) Abre o Prisma Studio para visualizar dados
npx prisma studio
```

### 6. Execute o servidor de desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy

### Banco de dados (Neon)

1. Crie uma conta em [Neon](https://neon.tech)
2. Crie um projeto e copie a `DATABASE_URL` (conexão pooled)
3. Coloque a URL no arquivo `.env` ou nas variáveis de ambiente da Vercel

### Aplicação (Vercel)

1. Faça deploy pelo GitHub:
   - Conecte seu repositório na [Vercel](https://vercel.com)
   - Configure as variáveis de ambiente no painel da Vercel
   - Faça deploy

2. Ou via CLI:
   ```bash
   pnpm i -g vercel
   vercel --prod
   ```

3. Atualize o Google OAuth com a URL de produção:
   - `https://seu-site.vercel.app/api/auth/callback/google`

## Estrutura do projeto

```
cardeneta/
├── app/
│   ├── (auth)/              # Rotas protegidas (requer login)
│   │   ├── page.tsx          # Dashboard
│   │   ├── customers/        # CRUD clientes
│   │   ├── transactions/     # Compras no fiado
│   │   └── payments/         # Pagamentos
│   ├── login/                # Página de login
│   ├── api/                  # Rotas de API
│   │   ├── auth/             # NextAuth
│   │   ├── customers/        # API de clientes
│   │   ├── transactions/     # API de compras
│   │   └── payments/         # API de pagamentos
│   ├── providers.tsx         # SessionProvider + Toaster
│   └── layout.tsx
├── components/
│   ├── ui/                   # Componentes base (Button, Input, Card)
│   ├── Navbar.tsx
│   ├── CustomerSearch.tsx    # Autocomplete de clientes
│   ├── CustomerForm.tsx
│   ├── TransactionForm.tsx
│   └── PaymentForm.tsx
├── lib/
│   ├── auth.ts               # Config NextAuth
│   └── prisma.ts             # Cliente Prisma singleton
├── prisma/
│   └── schema.prisma         # Modelo de dados
├── scripts/
│   └── seed.sql              # Script SQL de exemplo
└── .env.example
```

## Modelo de dados

- **Customer**: id, name, phone, createdAt, updatedAt
- **Transaction**: id, customerId, type (credit|payment), amount, description, date, createdAt
- Saldo do cliente = soma(compras) - soma(pagamentos), calculado dinamicamente

## Uso

1. Faça login com sua conta Google
2. Cadastre clientes em **Clientes > Novo Cliente**
3. Registre compras em **Nova Compra**
4. Registre pagamentos em **Novo Pagamento**
5. Acompanhe os saldos no **Dashboard** ou na ficha de cada cliente
