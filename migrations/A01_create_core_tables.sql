-- ====================================================================
-- 📦 MIGRAÇÃO A01: CRIAÇÃO DE TABELAS PRINCIPAIS
-- ====================================================================
-- Sistema completo de autenticação DigiUrban
-- SQLite3 sem DEFAULT CURRENT_TIMESTAMP problemático
-- ====================================================================

-- Tabela de Tenants (Prefeituras)
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    tenant_code TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    plano TEXT CHECK(plano IN ('basico', 'premium', 'enterprise')) DEFAULT 'basico',
    status TEXT CHECK(status IN ('ativo', 'inativo', 'suspenso')) DEFAULT 'ativo',
    populacao INTEGER,
    endereco TEXT,
    responsavel_nome TEXT,
    responsavel_email TEXT,
    responsavel_telefone TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

-- Tabela de Usuários (SEM DEFAULT CURRENT_TIMESTAMP)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    nome_completo TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('guest', 'user', 'coordinator', 'manager', 'admin', 'super_admin')) DEFAULT 'user',
    status TEXT CHECK(status IN ('ativo', 'inativo', 'pendente', 'bloqueado')) DEFAULT 'pendente',
    avatar_url TEXT,
    ultimo_login DATETIME,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Tabela de Permissões
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at DATETIME
);

-- Tabela de Permissões por Usuário
CREATE TABLE IF NOT EXISTS user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_by TEXT,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(user_id, permission_id)
);

-- Tabela de Sessões JWT
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Tokens de Ativação/Reset
CREATE TABLE IF NOT EXISTS user_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    token_type TEXT CHECK(token_type IN ('activation', 'password_reset', 'email_change')) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Log de Atividades (SEM ÍNDICE EM created_at)
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    tenant_id TEXT,
    action TEXT NOT NULL,
    resource TEXT,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

-- ====================================================================
-- ÍNDICES PARA PERFORMANCE (SEM COLUNAS DE TIMESTAMP)
-- ====================================================================

-- Índices para tabela users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_ultimo_login ON users(ultimo_login);

-- Índices para tabela tenants
CREATE INDEX IF NOT EXISTS idx_tenants_codigo ON tenants(tenant_code);
CREATE INDEX IF NOT EXISTS idx_tenants_cnpj ON tenants(cnpj);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- Índices para tabela sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON user_sessions(token_hash);

-- Índices para tabela permissions
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);

-- Índices para tabela user_permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission_id);

-- Índices para tabela user_tokens
CREATE INDEX IF NOT EXISTS idx_user_tokens_user ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_type ON user_tokens(token_type);
CREATE INDEX IF NOT EXISTS idx_user_tokens_expires ON user_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_tokens_hash ON user_tokens(token_hash);

-- Índices para tabela activity_logs (SEM created_at)
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_tenant ON activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_logs(action);

-- ====================================================================
-- TRIGGERS SIMPLES (SEM COMPARAÇÕES COMPLEXAS)
-- ====================================================================

-- Trigger simples para atualizar updated_at em tenants (usando timestamp determinístico)
CREATE TRIGGER IF NOT EXISTS update_tenants_timestamp
    AFTER UPDATE ON tenants
    FOR EACH ROW
BEGIN
    UPDATE tenants SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = NEW.id;
END;

-- Trigger simples para atualizar updated_at em users (usando timestamp determinístico)
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = NEW.id;
END;

-- Trigger simples para atualizar updated_at em system_config (usando timestamp determinístico)
CREATE TRIGGER IF NOT EXISTS update_system_config_timestamp
    AFTER UPDATE ON system_config
    FOR EACH ROW
BEGIN
    UPDATE system_config SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE key = NEW.key;
END;