Você é um desenvolvedor fullstack experiente. Preciso que você desenvolva uma aplicação web completa para controle de contas pendentes (fiado) de uma mercearia de bairro chamada Empório Justino. O sistema deve seguir exatamente as especificações abaixo.

## Contexto do problema
- O estabelecimento controla atualmente as compras a prazo usando comprovantes impressos da máquina de PDV, com anotações manuais do nome do cliente.
- Os comprovantes são armazenados em caixas físicas, causando dificuldade de consulta, risco de perda e falta de histórico organizado.
- A mercearia atende cerca de 200-250 vendas/dia, com aproximadamente 30 clientes que usam o sistema de fiado regularmente.

## Objetivos do sistema
Desenvolver uma aplicação web para auxiliar no registro e controle das contas pendentes, permitindo:
- Cadastro de clientes
- Registro de compras realizadas no fiado
- Visualização das dívidas de cada cliente
- Registro de pagamentos realizados
- Consulta do histórico de transações
- Autenticação segura de usuários

## Tecnologias obrigatórias (conforme relatório)
- **Frontend/Backend**: Next.js (App Router)
- **Banco de dados**: PostgreSQL
- **Autenticação**: OAuth com Google Provider (NextAuth.js ou Auth.js)
- **Hospedagem**: ambiente cloud (pode ser Vercel, Railway ou similar – forneça instruções de deploy)

## Requisitos funcionais detalhados
1. **Autenticação**
   - Login exclusivo via conta Google (apenas um usuário – o proprietário – será autorizado; não precisa de múltiplos perfis).
   - Proteger todas as rotas, redirecionando usuários não autenticados para o login.

2. **Cadastro de clientes**
   - Campos: nome completo, telefone (opcional), data de cadastro (automática).
   - Listar clientes com busca por nome.
   - Editar e excluir cliente (apenas se não tiver dívida ativa? não é obrigatório, mas pode implementar bloqueio).

3. **Registro de compras no fiado**
   - Selecionar cliente (autocomplete ou lista).
   - Campos: data da compra (padrão hoje), descrição (ex: "compras diversas"), valor total da compra.
   - Ao salvar, o sistema deve atualizar automaticamente o saldo devedor do cliente.
   - Cada compra gera um registro no histórico.

4. **Registro de pagamentos**
   - Selecionar cliente.
   - Campos: data do pagamento (padrão hoje), valor pago.
   - O sistema deve abater automaticamente do saldo devedor do cliente.
   - Registrar o pagamento como uma transação separada (para histórico).

5. **Visualização de dívidas e histórico**
   - Para cada cliente: mostrar saldo atual, lista de todas as compras (pendentes e pagas) e todos os pagamentos realizados.
   - Permitir filtrar por período (opcional, mas desejável).
   - Indicar visualmente se o cliente está com saldo devedor ou zerado.

6. **Cálculo automático**
   - O saldo do cliente = soma(compras) - soma(pagamentos). Nunca deve ficar negativo (se pagamento exceder dívida, exibir erro ou sugerir valor correto).

## Modelo de dados (sugestão, você pode ajustar)

**Tabela users** (gerenciada pelo NextAuth)
- id, name, email, image, etc.

**Tabela customers**
- id (serial primary key)
- name (varchar, not null)
- phone (varchar)
- created_at (timestamp)
- (campo balance pode ser calculado via view ou trigger, mas é aceitável calcular dinamicamente nas queries)

**Tabela transactions**
- id (serial primary key)
- customer_id (foreign key)
- type (enum: 'credit' para compra no fiado, 'payment' para pagamento)
- amount (numeric, positivo para crédito, negativo para pagamento? Ou campos separados: credit_amount, payment_amount. Use o que for mais seguro)
- description (text)
- date (timestamp)
- created_at (timestamp)

Ou então duas tabelas separadas: purchases e payments. Você decide a modelagem mais adequada, desde que permita calcular saldo e histórico completo.

## Requisitos não funcionais
- Interface simples, responsiva (mobile-friendly – pois o comerciante pode usar no celular).
- Exibir mensagens de sucesso/erro (toasts ou alerts estilizados).
- Cálculo de saldo deve ser consistente e feito no backend para evitar inconsistências.
- Código bem estruturado, com comentários em português ou inglês simples.

## Entregáveis esperados
1. Código completo do projeto (arquivos e pastas).
2. Script SQL para criação das tabelas no PostgreSQL.
3. Instruções passo a passo para configurar o ambiente (variáveis de ambiente, instalação de dependências, execução local).
4. Instruções para deploy (ex: Vercel + Neon/Supabase).

## Restrições
- Não utilize bibliotecas pagas ou com licenças restritivas.
- Prefira Tailwind CSS para estilização (se possível) ou CSS Modules.
- Use TypeScript (recomendado) ou JavaScript com tipagem via JSDoc.
- A autenticação deve ser implementada com NextAuth.js (Auth.js) e provedor Google.

## Exemplo de fluxo de uso esperado
1. Proprietário acessa o site, faz login com Google.
2. Cadastra cliente "José da Silva".
3. Registra uma compra de R$ 50,00 no nome de José.
4. O sistema mostra José com saldo R$ 50,00.
5. José paga R$ 20,00. Proprietário registra pagamento.
6. Saldo atualizado para R$ 30,00.
7. Proprietário consulta histórico e vê ambas as transações.

Agora, por favor, gere o código completo da aplicação seguindo essas especificações. Inclua também um arquivo README com as instruções de setup e deploy.