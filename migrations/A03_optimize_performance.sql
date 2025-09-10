-- ====================================================================
-- 📦 MIGRAÇÃO A03: OTIMIZAÇÃO DE PERFORMANCE
-- ====================================================================
-- Performance tuning para SQLite3
-- Índices compostos, particionamento lógico e otimizações
-- ====================================================================

-- ====================================================================
-- 1. OTIMIZAÇÕES DE ÍNDICES COMPOSTOS
-- ====================================================================

-- Índices compostos para queries frequentes
CREATE INDEX IF NOT EXISTS idx_users_tenant_status_role 
ON users(tenant_id, status, role);

CREATE INDEX IF NOT EXISTS idx_users_email_status 
ON users(email, status);

CREATE INDEX IF NOT EXISTS idx_sessions_user_active_expires 
ON user_sessions(user_id, is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_activity_tenant_action_created 
ON activity_logs(tenant_id, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_user_created_desc 
ON activity_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_permissions_resource_action 
ON permissions(resource, action);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_permission 
ON user_permissions(user_id, permission_id);

CREATE INDEX IF NOT EXISTS idx_tokens_user_type_expires 
ON user_tokens(user_id, token_type, expires_at);

-- ====================================================================
-- 2. ÍNDICES PARCIAIS PARA ECONOMIA DE ESPAÇO
-- ====================================================================

-- Índices apenas para registros ativos/relevantes
CREATE INDEX IF NOT EXISTS idx_users_active_email 
ON users(email) WHERE status = 'ativo';

CREATE INDEX IF NOT EXISTS idx_sessions_active_user 
ON user_sessions(user_id) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_tokens_unused 
ON user_tokens(user_id, token_type) WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_active 
ON tenants(tenant_code, nome) WHERE status = 'ativo';

-- ====================================================================
-- 3. TABELAS DE AUDITORIA OTIMIZADAS
-- ====================================================================

-- Tabela de auditoria para mudanças críticas
CREATE TABLE IF NOT EXISTS audit_trail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    user_id TEXT,
    ip_address TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000), -- timestamp em ms
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para audit_trail
CREATE INDEX IF NOT EXISTS idx_audit_table_record 
ON audit_trail(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_user_created 
ON audit_trail(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_created_desc 
ON audit_trail(created_at DESC);

-- ====================================================================
-- 4. TABELA DE RATE LIMITING OTIMIZADA
-- ====================================================================

-- Substituir ou otimizar tabela de rate limiting existente
DROP TABLE IF EXISTS rate_limits_old;

CREATE TABLE IF NOT EXISTS rate_limits_optimized (
    key TEXT PRIMARY KEY,
    hits INTEGER NOT NULL DEFAULT 0,
    window_start INTEGER NOT NULL, -- timestamp em ms
    window_ms INTEGER NOT NULL,
    max_hits INTEGER NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
) WITHOUT ROWID; -- Otimização para chave primária TEXT

-- Índices para rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start 
ON rate_limits_optimized(window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limits_updated_at 
ON rate_limits_optimized(updated_at);

-- ====================================================================
-- 5. TABELAS DE CACHE PARA PERFORMANCE
-- ====================================================================

-- Cache de permissões de usuário para evitar JOINs complexos
CREATE TABLE IF NOT EXISTS user_permissions_cache (
    user_id TEXT NOT NULL,
    permissions TEXT NOT NULL, -- JSON array de permissions
    role TEXT NOT NULL,
    tenant_id TEXT,
    last_updated INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_permissions_cache_updated 
ON user_permissions_cache(last_updated);

-- Cache de estatísticas por tenant
CREATE TABLE IF NOT EXISTS tenant_stats_cache (
    tenant_id TEXT PRIMARY KEY,
    user_count INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    last_activity INTEGER,
    total_actions INTEGER DEFAULT 0,
    last_calculated INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) WITHOUT ROWID;

-- ====================================================================
-- 6. TRIGGERS PARA CACHE E AUDITORIA
-- ====================================================================

-- Trigger para invalidar cache de permissões quando usuário é atualizado
CREATE TRIGGER IF NOT EXISTS invalidate_user_permissions_cache
    AFTER UPDATE OF role, status ON users
    FOR EACH ROW
BEGIN
    DELETE FROM user_permissions_cache WHERE user_id = NEW.id;
END;

-- Trigger para invalidar cache quando permissões mudam
CREATE TRIGGER IF NOT EXISTS invalidate_permissions_cache_on_change
    AFTER INSERT ON user_permissions
    FOR EACH ROW
BEGIN
    DELETE FROM user_permissions_cache WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS invalidate_permissions_cache_on_delete
    AFTER DELETE ON user_permissions
    FOR EACH ROW
BEGIN
    DELETE FROM user_permissions_cache WHERE user_id = OLD.user_id;
END;

-- Trigger para auditoria de mudanças em users
CREATE TRIGGER IF NOT EXISTS audit_users_changes
    AFTER UPDATE ON users
    FOR EACH ROW
    WHEN OLD.role != NEW.role 
      OR OLD.status != NEW.status 
      OR OLD.tenant_id != NEW.tenant_id
BEGIN
    INSERT INTO audit_trail (
        table_name, record_id, operation, 
        old_values, new_values, user_id, created_at
    ) VALUES (
        'users', NEW.id, 'UPDATE',
        json_object(
            'role', OLD.role,
            'status', OLD.status,
            'tenant_id', OLD.tenant_id
        ),
        json_object(
            'role', NEW.role,
            'status', NEW.status,
            'tenant_id', NEW.tenant_id
        ),
        NEW.id,
        unixepoch() * 1000
    );
END;

-- Trigger para auditoria de criação de usuários
CREATE TRIGGER IF NOT EXISTS audit_users_insert
    AFTER INSERT ON users
    FOR EACH ROW
BEGIN
    INSERT INTO audit_trail (
        table_name, record_id, operation, 
        new_values, user_id, created_at
    ) VALUES (
        'users', NEW.id, 'INSERT',
        json_object(
            'nome_completo', NEW.nome_completo,
            'email', NEW.email,
            'role', NEW.role,
            'status', NEW.status,
            'tenant_id', NEW.tenant_id
        ),
        NEW.id,
        unixepoch() * 1000
    );
END;

-- Trigger para atualizar estatísticas de tenant
CREATE TRIGGER IF NOT EXISTS update_tenant_stats_on_user_change
    AFTER INSERT ON users
    FOR EACH ROW
    WHEN NEW.tenant_id IS NOT NULL
BEGIN
    INSERT OR REPLACE INTO tenant_stats_cache (
        tenant_id, user_count, active_users, last_calculated
    ) 
    SELECT 
        NEW.tenant_id,
        (SELECT COUNT(*) FROM users WHERE tenant_id = NEW.tenant_id),
        (SELECT COUNT(*) FROM users WHERE tenant_id = NEW.tenant_id AND status = 'ativo'),
        unixepoch() * 1000;
END;

-- ====================================================================
-- 7. CONFIGURAÇÕES DE MANUTENÇÃO
-- ====================================================================

-- Configurações para tarefas automáticas de manutenção
INSERT OR REPLACE INTO system_config (key, value, description) VALUES
('maintenance_last_vacuum', '0', 'Timestamp do último VACUUM executado'),
('maintenance_last_analyze', '0', 'Timestamp do último ANALYZE executado'),
('maintenance_last_checkpoint', '0', 'Timestamp do último checkpoint WAL'),
('maintenance_vacuum_threshold', '0.25', 'Threshold de fragmentação para VACUUM automático'),
('cache_permissions_ttl', '3600000', 'TTL do cache de permissões em ms (1 hora)'),
('cache_stats_ttl', '300000', 'TTL do cache de estatísticas em ms (5 minutos)'),
('audit_retention_days', '90', 'Dias de retenção para audit_trail'),
('rate_limit_cleanup_hours', '24', 'Horas para limpeza de rate_limits'),
('schema_version', 'A03', 'Versão atual do schema com otimizações de performance'),
('migration_A03_applied_at', strftime('%s', 'now') || '000', 'Timestamp da aplicação da migração A03'),
('performance_optimizations_installed', 'TRUE', 'Otimizações de performance instaladas');