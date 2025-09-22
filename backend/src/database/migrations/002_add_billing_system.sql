-- ====================================================================
-- 📋 MIGRATION 002: ADD BILLING SYSTEM
-- ====================================================================
-- Adiciona tabelas do sistema de billing e faturamento
-- Sistema completo de cobrança e métricas de uso
-- ====================================================================

-- Habilitar foreign keys
PRAGMA foreign_keys = ON;

-- ====================================================================
-- TABELAS DO SISTEMA DE BILLING
-- ====================================================================

-- Tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL, -- em centavos
    price_yearly INTEGER, -- em centavos
    features TEXT, -- JSON com features
    max_users INTEGER,
    max_tenants INTEGER,
    max_storage INTEGER, -- em bytes
    active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Tabela de assinaturas dos tenants
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, cancelled, expired, suspended
    started_at INTEGER NOT NULL,
    expires_at INTEGER,
    cancelled_at INTEGER,
    trial_ends_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- Tabela de faturas
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    subscription_id TEXT,
    invoice_number TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- em centavos
    tax_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT DEFAULT 'pending', -- pending, paid, failed, cancelled
    due_date INTEGER NOT NULL,
    paid_at INTEGER,
    payment_method TEXT,
    payment_reference TEXT,
    billing_period_start INTEGER NOT NULL,
    billing_period_end INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES tenant_subscriptions(id)
);

-- Tabela de itens da fatura
CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price INTEGER NOT NULL, -- em centavos
    total_price INTEGER NOT NULL,
    metadata TEXT, -- JSON com dados extras
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Tabela de métricas de uso
CREATE TABLE IF NOT EXISTS usage_metrics (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value INTEGER NOT NULL,
    recorded_at INTEGER NOT NULL,
    billing_period TEXT,
    metadata TEXT, -- JSON com dados extras
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela de histórico de billing
CREATE TABLE IF NOT EXISTS billing_history (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- subscription_created, payment_received, etc
    description TEXT,
    amount INTEGER,
    reference_id TEXT, -- ID da invoice, subscription, etc
    metadata TEXT, -- JSON com dados do evento
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- ====================================================================
-- ÍNDICES PARA BILLING
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(active);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_plan_id ON tenant_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_tenant_id ON usage_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_recorded_at ON usage_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_metric_name ON usage_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_billing_history_tenant_id ON billing_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_event_type ON billing_history(event_type);

-- ====================================================================
-- DADOS INICIAIS DO BILLING
-- ====================================================================

-- Planos padrão
INSERT OR IGNORE INTO subscription_plans (id, name, description, price_monthly, price_yearly, max_users, max_tenants, active) VALUES
('plan_basic', 'Básico', 'Plano básico para pequenas prefeituras', 19900, 199000, 10, 1, 1),
('plan_standard', 'Padrão', 'Plano padrão para prefeituras médias', 49900, 499000, 50, 5, 1),
('plan_premium', 'Premium', 'Plano premium para grandes prefeituras', 99900, 999000, 200, 20, 1),
('plan_enterprise', 'Enterprise', 'Plano empresarial com recursos ilimitados', 199900, 1999000, -1, -1, 1);

-- ====================================================================
-- MIGRATION 002 CONCLUÍDA
-- ====================================================================