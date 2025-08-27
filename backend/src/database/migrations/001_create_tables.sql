-- ====================================================================
-- 📦 MIGRAÇÃO 001: CRIAÇÃO DE TABELAS PRINCIPAIS
-- ====================================================================
-- Sistema completo de autenticação DigiUrban
-- SQLite3 optimizado para performance e segurança
-- ====================================================================

-- Tabela de Tenants (Prefeituras)
CREATE TABLE tenants (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários
CREATE TABLE users (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Tabela de Permissões
CREATE TABLE permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Permissões por Usuário
CREATE TABLE user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(user_id, permission_id)
);

-- Tabela de Sessões JWT
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Tokens de Ativação/Reset
CREATE TABLE user_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    token_type TEXT CHECK(token_type IN ('activation', 'password_reset', 'email_change')) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Log de Atividades
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    tenant_id TEXT,
    action TEXT NOT NULL,
    resource TEXT,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Tabela de Configurações do Sistema
CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================================================

-- Índices para tabela users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_ultimo_login ON users(ultimo_login);

-- Índices para tabela tenants
CREATE INDEX idx_tenants_codigo ON tenants(tenant_code);
CREATE INDEX idx_tenants_cnpj ON tenants(cnpj);
CREATE INDEX idx_tenants_status ON tenants(status);

-- Índices para tabela sessions
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_sessions_token_hash ON user_sessions(token_hash);

-- Índices para tabela permissions
CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_permissions_resource ON permissions(resource);

-- Índices para tabela user_permissions
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission ON user_permissions(permission_id);

-- Índices para tabela user_tokens
CREATE INDEX idx_user_tokens_user ON user_tokens(user_id);
CREATE INDEX idx_user_tokens_type ON user_tokens(token_type);
CREATE INDEX idx_user_tokens_expires ON user_tokens(expires_at);
CREATE INDEX idx_user_tokens_hash ON user_tokens(token_hash);

-- Índices para tabela activity_logs
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_tenant ON activity_logs(tenant_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_created ON activity_logs(created_at);

-- ====================================================================
-- TRIGGERS PARA UPDATED_AT
-- ====================================================================

-- Trigger para atualizar updated_at em tenants
CREATE TRIGGER update_tenants_updated_at
    AFTER UPDATE ON tenants
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE tenants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para atualizar updated_at em users
CREATE TRIGGER update_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para atualizar updated_at em system_config
CREATE TRIGGER update_system_config_updated_at
    AFTER UPDATE ON system_config
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE system_config SET updated_at = CURRENT_TIMESTAMP WHERE key = NEW.key;
END;

-- ====================================================================
-- VIEWS PARA CONSULTAS OTIMIZADAS
-- ====================================================================

-- View de usuários com informações do tenant
CREATE VIEW user_profiles AS
SELECT 
    u.id,
    u.tenant_id,
    u.nome_completo,
    u.email,
    u.role,
    u.status,
    u.avatar_url,
    u.ultimo_login,
    u.email_verified,
    u.created_at,
    u.updated_at,
    t.nome as tenant_name,
    t.cidade as tenant_cidade,
    t.estado as tenant_estado,
    t.plano as tenant_plano,
    t.status as tenant_status
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id;

-- View de permissões de usuário
CREATE VIEW user_permissions_view AS
SELECT 
    u.id as user_id,
    u.nome_completo,
    u.email,
    u.role,
    p.code as permission_code,
    p.resource,
    p.action,
    p.description as permission_description,
    up.granted_by,
    up.created_at as permission_granted_at
FROM users u
JOIN user_permissions up ON u.id = up.user_id
JOIN permissions p ON up.permission_id = p.id
WHERE u.status = 'ativo';

-- View de sessões ativas
CREATE VIEW active_sessions AS
SELECT 
    s.id,
    s.user_id,
    u.nome_completo,
    u.email,
    u.role,
    s.ip_address,
    s.user_agent,
    s.created_at,
    s.expires_at
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = TRUE 
  AND s.expires_at > CURRENT_TIMESTAMP
  AND u.status = 'ativo';

-- ====================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ====================================================================

-- Tabela tenants: Armazena informações das prefeituras/organizações
-- Tabela users: Usuários do sistema com hierarquia de 6 níveis
-- Tabela permissions: Permissões específicas do sistema
-- Tabela user_permissions: Relacionamento N:N entre usuários e permissões
-- Tabela user_sessions: Controle de sessões JWT ativas
-- Tabela user_tokens: Tokens para ativação de conta e reset de senha
-- Tabela activity_logs: Log completo de atividades do sistema
-- Tabela system_config: Configurações globais do sistema