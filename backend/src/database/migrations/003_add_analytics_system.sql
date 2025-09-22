-- ====================================================================
-- 📋 MIGRATION 003: ADD ANALYTICS SYSTEM
-- ====================================================================
-- Adiciona tabelas do sistema de analytics e relatórios
-- Sistema completo de métricas e dashboards
-- ====================================================================

-- Habilitar foreign keys
PRAGMA foreign_keys = ON;

-- ====================================================================
-- TABELAS DO SISTEMA DE ANALYTICS
-- ====================================================================

-- Tabela de eventos de analytics
CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    user_id TEXT,
    event_name TEXT NOT NULL,
    event_category TEXT,
    event_data TEXT, -- JSON com dados do evento
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    recorded_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de métricas agregadas
CREATE TABLE IF NOT EXISTS analytics_metrics (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    metric_unit TEXT,
    dimensions TEXT, -- JSON com dimensões
    aggregation_period TEXT, -- daily, weekly, monthly, yearly
    period_start INTEGER NOT NULL,
    period_end INTEGER NOT NULL,
    calculated_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela de dashboards personalizados
CREATE TABLE IF NOT EXISTS analytics_dashboards (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    user_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    config TEXT NOT NULL, -- JSON com configuração do dashboard
    is_public INTEGER DEFAULT 0,
    is_default INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de widgets dos dashboards
CREATE TABLE IF NOT EXISTS analytics_widgets (
    id TEXT PRIMARY KEY,
    dashboard_id TEXT NOT NULL,
    widget_type TEXT NOT NULL, -- chart, metric, table, etc
    title TEXT NOT NULL,
    config TEXT NOT NULL, -- JSON com configuração do widget
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (dashboard_id) REFERENCES analytics_dashboards(id) ON DELETE CASCADE
);

-- Tabela de relatórios agendados
CREATE TABLE IF NOT EXISTS analytics_reports (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    user_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL,
    config TEXT NOT NULL, -- JSON com configuração do relatório
    schedule_cron TEXT,
    last_run_at INTEGER,
    next_run_at INTEGER,
    recipients TEXT, -- JSON com lista de emails
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de execuções de relatórios
CREATE TABLE IF NOT EXISTS analytics_report_runs (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, running, completed, failed
    started_at INTEGER,
    completed_at INTEGER,
    file_path TEXT,
    error_message TEXT,
    metadata TEXT, -- JSON com dados da execução
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (report_id) REFERENCES analytics_reports(id) ON DELETE CASCADE
);

-- Tabela de segmentos de usuários
CREATE TABLE IF NOT EXISTS analytics_segments (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    criteria TEXT NOT NULL, -- JSON com critérios de segmentação
    user_count INTEGER DEFAULT 0,
    last_calculated_at INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela de metas e KPIs
CREATE TABLE IF NOT EXISTS analytics_goals (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    metric_name TEXT NOT NULL,
    target_value REAL NOT NULL,
    current_value REAL DEFAULT 0,
    goal_type TEXT DEFAULT 'target', -- target, minimum, maximum
    period_type TEXT DEFAULT 'monthly', -- daily, weekly, monthly, quarterly, yearly
    is_active INTEGER DEFAULT 1,
    achieved_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- ====================================================================
-- ÍNDICES PARA ANALYTICS
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_id ON analytics_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_recorded_at ON analytics_events(recorded_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_metrics_tenant_id ON analytics_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_metric_name ON analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_period ON analytics_metrics(aggregation_period, period_start);

CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_tenant_id ON analytics_dashboards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_user_id ON analytics_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_public ON analytics_dashboards(is_public);

CREATE INDEX IF NOT EXISTS idx_analytics_widgets_dashboard_id ON analytics_widgets(dashboard_id);

CREATE INDEX IF NOT EXISTS idx_analytics_reports_tenant_id ON analytics_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_user_id ON analytics_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_active ON analytics_reports(is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_next_run ON analytics_reports(next_run_at);

CREATE INDEX IF NOT EXISTS idx_analytics_report_runs_report_id ON analytics_report_runs(report_id);
CREATE INDEX IF NOT EXISTS idx_analytics_report_runs_status ON analytics_report_runs(status);

CREATE INDEX IF NOT EXISTS idx_analytics_segments_tenant_id ON analytics_segments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_segments_active ON analytics_segments(is_active);

CREATE INDEX IF NOT EXISTS idx_analytics_goals_tenant_id ON analytics_goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_goals_active ON analytics_goals(is_active);

-- ====================================================================
-- DADOS INICIAIS DO ANALYTICS
-- ====================================================================

-- Dashboard padrão do sistema
INSERT OR IGNORE INTO analytics_dashboards (id, name, description, config, is_public, is_default) VALUES
('dashboard_system_default', 'Dashboard Padrão', 'Dashboard padrão do sistema com métricas principais',
 '{"widgets":["users_total","tenants_total","activity_summary","top_events"]}', 1, 1);

-- Widgets padrão
INSERT OR IGNORE INTO analytics_widgets (id, dashboard_id, widget_type, title, config, position_x, position_y, width, height) VALUES
('widget_users_total', 'dashboard_system_default', 'metric', 'Total de Usuários',
 '{"metric":"users_count","aggregation":"count","timeframe":"all"}', 0, 0, 1, 1),
('widget_tenants_total', 'dashboard_system_default', 'metric', 'Total de Tenants',
 '{"metric":"tenants_count","aggregation":"count","timeframe":"all"}', 1, 0, 1, 1),
('widget_activity_summary', 'dashboard_system_default', 'chart', 'Atividade Recente',
 '{"chart_type":"line","metric":"activity_logs","aggregation":"count","timeframe":"30d"}', 0, 1, 2, 1),
('widget_top_events', 'dashboard_system_default', 'table', 'Principais Eventos',
 '{"metric":"analytics_events","aggregation":"count","group_by":"event_name","timeframe":"7d","limit":10}', 0, 2, 2, 1);

-- Metas padrão do sistema
INSERT OR IGNORE INTO analytics_goals (id, name, description, metric_name, target_value, goal_type, period_type) VALUES
('goal_monthly_users', 'Usuários Ativos Mensais', 'Meta de usuários ativos por mês', 'active_users_monthly', 1000, 'target', 'monthly'),
('goal_system_uptime', 'Disponibilidade do Sistema', 'Meta de uptime do sistema', 'system_uptime', 99.9, 'minimum', 'monthly');

-- ====================================================================
-- MIGRATION 003 CONCLUÍDA
-- ====================================================================