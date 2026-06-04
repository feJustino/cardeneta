-- Script SQL para criação das tabelas no PostgreSQL
-- Execute este script no seu banco de dados antes de iniciar a aplicação
-- Ou use: npx prisma db push

-- As tabelas Account, Session, User e VerificationToken são gerenciadas pelo Prisma/NextAuth
-- O Prisma criará automaticamente todas as tabelas ao executar:
--   npx prisma db push

-- Exemplo de inserção manual de dados de teste:
-- INSERT INTO "Customer" (name, phone) VALUES ('José da Silva', '(11) 99999-9999');
-- INSERT INTO "Transaction" ("customerId", type, amount, description, date) VALUES (1, 'credit', 50.00, 'Compras diversas', NOW());
-- INSERT INTO "Transaction" ("customerId", type, amount, description, date) VALUES (1, 'payment', 20.00, 'Pagamento', NOW());
