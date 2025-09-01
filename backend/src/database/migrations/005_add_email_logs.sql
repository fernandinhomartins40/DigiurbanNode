-- ====================================================================
-- 📧 MIGRAÇÃO 005: SISTEMA DE LOGS DE E-MAIL
-- ====================================================================
-- Adiciona tabela para controle de envio de e-mails transacionais
-- Inclui rate limiting, templates e logs de atividade de e-mail
-- ====================================================================

-- ====================================================================
-- 1. TABELA DE LOGS DE E-MAIL
-- ====================================================================

CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Informações básicas do e-mail
    to_email TEXT NOT NULL,
    from_email TEXT,
    subject TEXT NOT NULL,
    template TEXT, -- nome do template usado
    
    -- Status e controle
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'queued')) DEFAULT 'queued',
    message_id TEXT, -- ID retornado pelo provedor (Resend)
    
    -- Informações de erro
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    
    -- Metadados
    details TEXT, -- JSON com dados extras
    
    -- Relacionamentos opcionais
    user_id TEXT, -- usuário relacionado, se aplicável
    tenant_id TEXT, -- tenant relacionado, se aplicável
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    sent_at INTEGER, -- quando foi efetivamente enviado
    
    -- Chaves estrangeiras
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- ====================================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ====================================================================

-- Índice para consultas por destinatário (rate limiting)
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_date 
ON email_logs(to_email, created_at);

-- Índice para consultas por status
CREATE INDEX IF NOT EXISTS idx_email_logs_status 
ON email_logs(status, created_at);

-- Índice para consultas por template
CREATE INDEX IF NOT EXISTS idx_email_logs_template 
ON email_logs(template, created_at);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS idx_email_logs_user 
ON email_logs(user_id, created_at);

-- Índice para consultas por tenant
CREATE INDEX IF NOT EXISTS idx_email_logs_tenant 
ON email_logs(tenant_id, created_at);

-- ====================================================================
-- 3. TABELA DE TOKENS DE RECUPERAÇÃO DE SENHA
-- ====================================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    used_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    
    -- Metadados de segurança
    ip_address TEXT,
    user_agent TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
ON password_reset_tokens(token);

-- Índice para cleanup de tokens expirados
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires 
ON password_reset_tokens(expires_at);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user 
ON password_reset_tokens(user_id, created_at);

-- ====================================================================
-- 4. TABELA DE TOKENS DE VERIFICAÇÃO DE E-MAIL
-- ====================================================================

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    verified_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    
    -- Metadados de segurança
    ip_address TEXT,
    user_agent TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token 
ON email_verification_tokens(token);

-- Índice para cleanup de tokens expirados
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires 
ON email_verification_tokens(expires_at);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user 
ON email_verification_tokens(user_id, created_at);

-- ====================================================================
-- 5. CONFIGURAÇÕES DO SISTEMA DE E-MAIL
-- ====================================================================

-- Configurações específicas para o sistema de e-mail
INSERT OR REPLACE INTO system_config (key, value, description) VALUES
('email_service_enabled', 'false', 'Se o serviço de e-mail está habilitado'),
('email_rate_limit_per_hour', '100', 'Limite de e-mails por destinatário por hora'),
('email_rate_limit_per_day', '1000', 'Limite de e-mails por destinatário por dia'),
('email_retry_max_attempts', '3', 'Número máximo de tentativas de reenvio'),
('email_retry_delay_ms', '1000', 'Delay entre tentativas em milissegundos'),
('password_reset_token_lifetime', '3600000', 'Tempo de vida do token de recuperação (1 hora em ms)'),
('email_verification_token_lifetime', '86400000', 'Tempo de vida do token de verificação (24 horas em ms)');

-- ====================================================================
-- 6. TRIGGERS PARA LIMPEZA AUTOMÁTICA
-- ====================================================================

-- Trigger para limpar tokens de recuperação expirados
CREATE TRIGGER IF NOT EXISTS cleanup_expired_password_tokens
    AFTER INSERT ON password_reset_tokens
    FOR EACH ROW
    WHEN (unixepoch() * 1000) % 3600000 < 1000 -- Execute aproximadamente a cada hora
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < (unixepoch() * 1000);
END;

-- Trigger para limpar tokens de verificação expirados
CREATE TRIGGER IF NOT EXISTS cleanup_expired_verification_tokens
    AFTER INSERT ON email_verification_tokens
    FOR EACH ROW
    WHEN (unixepoch() * 1000) % 3600000 < 1000 -- Execute aproximadamente a cada hora
BEGIN
    DELETE FROM email_verification_tokens 
    WHERE expires_at < (unixepoch() * 1000);
END;

-- Trigger para limpar logs antigos de e-mail (90 dias)
CREATE TRIGGER IF NOT EXISTS cleanup_old_email_logs
    AFTER INSERT ON email_logs
    FOR EACH ROW
    WHEN (unixepoch() * 1000) % 86400000 < 1000 -- Execute aproximadamente a cada dia
BEGIN
    DELETE FROM email_logs 
    WHERE created_at < (unixepoch() * 1000 - 7776000000); -- 90 dias em ms
END;

-- ====================================================================
-- 7. VIEW PARA ESTATÍSTICAS DE E-MAIL
-- ====================================================================

CREATE VIEW email_stats AS
SELECT 
    'emails_sent_today' as metric,
    COUNT(*) as value
FROM email_logs 
WHERE status = 'sent' 
AND sent_at > (unixepoch() * 1000 - 86400000) -- últimas 24 horas

UNION ALL

SELECT 
    'emails_failed_today' as metric,
    COUNT(*) as value
FROM email_logs 
WHERE status = 'failed' 
AND created_at > (unixepoch() * 1000 - 86400000) -- últimas 24 horas

UNION ALL

SELECT 
    'emails_queued' as metric,
    COUNT(*) as value
FROM email_logs 
WHERE status = 'queued'

UNION ALL

SELECT 
    'password_resets_pending' as metric,
    COUNT(*) as value
FROM password_reset_tokens 
WHERE used_at IS NULL 
AND expires_at > (unixepoch() * 1000)

UNION ALL

SELECT 
    'email_verifications_pending' as metric,
    COUNT(*) as value
FROM email_verification_tokens 
WHERE verified_at IS NULL 
AND expires_at > (unixepoch() * 1000);

-- ====================================================================
-- 8. ATUALIZAÇÃO DE CONTROLE DE MIGRAÇÃO
-- ====================================================================

-- Registrar que a migração foi aplicada
INSERT OR REPLACE INTO system_config (key, value, description) VALUES
('schema_version', '005', 'Versão atual do schema com sistema de e-mail'),
('migration_005_applied_at', unixepoch() * 1000, 'Quando a migração 005 foi aplicada'),
('email_system_installed', 'TRUE', 'Sistema de e-mail transacional instalado'),
('migration_005_changelog', 
 'Adicionado sistema completo de e-mail: logs, tokens de recuperação/verificação, configurações e limpeza automática', 
 'Log de mudanças da migração 005');

-- ====================================================================
-- RESUMO DA MIGRAÇÃO:
-- ====================================================================
-- ✅ Tabela email_logs para controle de envios
-- ✅ Tabela password_reset_tokens para recuperação de senha
-- ✅ Tabela email_verification_tokens para verificação de e-mail
-- ✅ Índices otimizados para performance
-- ✅ Configurações do sistema de e-mail
-- ✅ Triggers para limpeza automática
-- ✅ View de estatísticas de e-mail
-- ✅ Sistema pronto para Resend.com