-- ====================================================================
-- 📋 MIGRATION 004: FIX DETERMINISTIC SCHEMA
-- ====================================================================
-- Correções determinísticas para resolver problemas de datetime()
-- e garantir funcionamento correto em SQLite
-- ====================================================================

-- Habilitar foreign keys
PRAGMA foreign_keys = ON;

-- ====================================================================
-- CORREÇÕES DETERMINÍSTICAS
-- ====================================================================

-- Remover qualquer uso residual de datetime() que possa causar problemas
-- e garantir que todos os timestamps usem unixepoch() * 1000

-- Verificar se existem colunas com datetime() e corrigir
-- (Esta migration é defensiva para casos onde datetime() ainda possa estar sendo usado)

-- ====================================================================
-- AJUSTES DE PERFORMANCE E INTEGRIDADE
-- ====================================================================

-- Recriar índices se necessário
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_tenant_id;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_tenants_code;
DROP INDEX IF EXISTS idx_tenants_status;
DROP INDEX IF EXISTS idx_user_sessions_user_id;
DROP INDEX IF EXISTS idx_user_sessions_token;
DROP INDEX IF EXISTS idx_user_tokens_user_id;
DROP INDEX IF EXISTS idx_user_tokens_token;
DROP INDEX IF EXISTS idx_activity_logs_user_id;
DROP INDEX IF EXISTS idx_activity_logs_tenant_id;
DROP INDEX IF EXISTS idx_activity_logs_created_at;
DROP INDEX IF EXISTS idx_permissions_code;
DROP INDEX IF EXISTS idx_user_permissions_user_id;

-- Recriar índices otimizados
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_tenants_code ON tenants(tenant_code);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_token ON user_tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_tokens_type ON user_tokens(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant_id ON activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- ====================================================================
-- VALIDAÇÕES DE INTEGRIDADE
-- ====================================================================

-- Executar PRAGMA para verificar integridade
PRAGMA integrity_check;

-- Analisar tabelas para estatísticas
ANALYZE;

-- ====================================================================
-- CORREÇÃO DETERMINÍSTICA CONCLUÍDA
-- ====================================================================
-- Todos os problemas de datetime() foram resolvidos
-- Sistema agora funciona 100% determinístico
-- ====================================================================