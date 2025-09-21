-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_code" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "plano" TEXT DEFAULT 'basico',
    "status" TEXT DEFAULT 'ativo',
    "populacao" INTEGER,
    "endereco" TEXT,
    "responsavel_nome" TEXT,
    "responsavel_email" TEXT,
    "responsavel_telefone" TEXT,
    "created_at" DATETIME,
    "updated_at" DATETIME,
    "has_admin" BOOLEAN DEFAULT false,
    "admin_confirmed" BOOLEAN DEFAULT false,
    "admin_first_login" BOOLEAN DEFAULT false,
    "limite_usuarios" INTEGER DEFAULT 50,
    "valor_mensal" REAL DEFAULT 1200,
    "usuarios_ativos" INTEGER DEFAULT 0,
    "protocolos_mes" INTEGER DEFAULT 0,
    "configuracoes" TEXT,
    "metricas" TEXT
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT,
    "nome_completo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "avatar_url" TEXT,
    "ultimo_login" DATETIME,
    "failed_login_attempts" INTEGER DEFAULT 0,
    "locked_until" DATETIME,
    "email_verified" BOOLEAN DEFAULT false,
    "created_at" DATETIME,
    "updated_at" DATETIME,
    "tipo_usuario" TEXT DEFAULT 'operador',
    "telefone" TEXT,
    "ultima_atividade" DATETIME,
    "ativo" BOOLEAN DEFAULT true,
    CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "granted_by" TEXT,
    "created_at" DATETIME,
    CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT,
    "tenant_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resource_id" TEXT,
    "details" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME,
    CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "activity_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "smtp_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "smtp_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "email_domains" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenant_id" TEXT,
    "smtp_user_id" INTEGER NOT NULL,
    "domain_name" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "verified_at" DATETIME,
    "verification_method" TEXT DEFAULT 'dns',
    "dkim_enabled" BOOLEAN NOT NULL DEFAULT true,
    "spf_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "email_domains_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "email_domains_smtp_user_id_fkey" FOREIGN KEY ("smtp_user_id") REFERENCES "smtp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dkim_keys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain_id" INTEGER NOT NULL,
    "selector" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'rsa-sha256',
    "canonicalization" TEXT NOT NULL DEFAULT 'relaxed/relaxed',
    "key_size" INTEGER NOT NULL DEFAULT 2048,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dkim_keys_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "email_domains" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "emails" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message_id" TEXT NOT NULL,
    "domain_id" INTEGER,
    "from_email" TEXT NOT NULL,
    "to_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html_content" TEXT,
    "text_content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "direction" TEXT NOT NULL,
    "sent_at" DATETIME,
    "delivered_at" DATETIME,
    "mx_server" TEXT,
    "error_message" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "emails_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "email_domains" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "smtp_connections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "remote_address" TEXT NOT NULL,
    "hostname" TEXT,
    "server_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reject_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "auth_attempts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "smtp_user_id" INTEGER,
    "username" TEXT NOT NULL,
    "remote_address" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auth_attempts_smtp_user_id_fkey" FOREIGN KEY ("smtp_user_id") REFERENCES "smtp_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "data_criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_vencimento" DATETIME NOT NULL,
    "data_pagamento" DATETIME,
    "metodo_pagamento" TEXT,
    "desconto" REAL NOT NULL DEFAULT 0,
    "taxa_adicional" REAL NOT NULL DEFAULT 0,
    "plano" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valor_unitario" REAL NOT NULL,
    "valor_total" REAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "billing_metrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodo" TEXT NOT NULL,
    "mrr" REAL NOT NULL,
    "arr" REAL NOT NULL,
    "churn_rate" REAL,
    "arpu" REAL,
    "ltv" REAL,
    "cac" REAL,
    "receita_mensal" REAL NOT NULL,
    "faturas_pendentes" INTEGER NOT NULL,
    "valor_pendente" REAL NOT NULL,
    "faturas_vencidas" INTEGER NOT NULL,
    "valor_vencido" REAL NOT NULL,
    "taxa_cobranca" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "analytics_user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" DATETIME,
    "duration_minutes" INTEGER,
    "pages_visited" INTEGER NOT NULL DEFAULT 0,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "analytics_user_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feature_usage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "feature_name" TEXT NOT NULL,
    "feature_category" TEXT NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 1,
    "total_time_minutes" REAL,
    "date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feature_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "feature_usage_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "metric_name" TEXT NOT NULL,
    "metric_value" REAL NOT NULL,
    "metric_unit" TEXT,
    "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "page_path" TEXT NOT NULL,
    "page_title" TEXT,
    "time_spent" INTEGER,
    "session_id" TEXT,
    "referrer" TEXT,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_views_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "module_analytics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenant_id" TEXT,
    "module_name" TEXT NOT NULL,
    "total_users" INTEGER NOT NULL DEFAULT 0,
    "active_users" INTEGER NOT NULL DEFAULT 0,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "total_page_views" INTEGER NOT NULL DEFAULT 0,
    "avg_session_time" REAL,
    "popular_feature" TEXT,
    "period" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "module_analytics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "geographic_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenant_id" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "regiao" TEXT NOT NULL,
    "populacao" INTEGER,
    "total_usuarios" INTEGER NOT NULL DEFAULT 0,
    "usuarios_ativos" INTEGER NOT NULL DEFAULT 0,
    "protocolos_mes" INTEGER NOT NULL DEFAULT 0,
    "satisfacao_media" REAL,
    "period" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "geographic_data_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "automated_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "report_type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT NOT NULL,
    "template" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "automated_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "report_schedules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "report_id" INTEGER NOT NULL,
    "cron_expression" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "next_run" DATETIME NOT NULL,
    "last_run" DATETIME,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_schedules_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "automated_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "report_recipients" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "schedule_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_recipients_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "report_schedules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "report_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "report_id" INTEGER NOT NULL,
    "generated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "file_path" TEXT,
    "file_size" INTEGER,
    "execution_time" INTEGER,
    "error_message" TEXT,
    "sent_to" TEXT,
    "period" TEXT,
    CONSTRAINT "report_history_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "automated_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "satisfaction_surveys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tenant_id" TEXT,
    "survey_type" TEXT NOT NULL,
    "questions" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "target_audience" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "satisfaction_surveys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "satisfaction_surveys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "nps_responses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "survey_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "tenant_id" TEXT,
    "score" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "comment" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "nps_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "satisfaction_surveys" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "nps_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "nps_responses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feedback_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "survey_id" INTEGER,
    "user_id" TEXT,
    "tenant_id" TEXT,
    "feedback_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "category" TEXT,
    "attachments" TEXT,
    "assigned_to" TEXT,
    "resolved_at" DATETIME,
    "resolution" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "feedback_submissions_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "satisfaction_surveys" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "feedback_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "feedback_submissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "feedback_submissions_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_tenant_code_unique" ON "tenants"("tenant_code");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_cnpj_unique" ON "tenants"("cnpj");

-- CreateIndex
CREATE INDEX "idx_tenants_codigo" ON "tenants"("tenant_code");

-- CreateIndex
CREATE INDEX "idx_tenants_cnpj" ON "tenants"("cnpj");

-- CreateIndex
CREATE INDEX "idx_tenants_status" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "idx_tenants_has_admin" ON "tenants"("has_admin");

-- CreateIndex
CREATE INDEX "idx_tenants_plano" ON "tenants"("plano");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_tenant" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_users_status" ON "users"("status");

-- CreateIndex
CREATE INDEX "idx_users_ultimo_login" ON "users"("ultimo_login");

-- CreateIndex
CREATE INDEX "idx_users_tipo_usuario" ON "users"("tipo_usuario");

-- CreateIndex
CREATE INDEX "idx_users_ativo" ON "users"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_unique" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "idx_permissions_code" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "idx_permissions_resource" ON "permissions"("resource");

-- CreateIndex
CREATE INDEX "idx_user_permissions_user" ON "user_permissions"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_permissions_permission" ON "user_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_unique" ON "user_permissions"("user_id", "permission_id");

-- CreateIndex
CREATE INDEX "idx_activity_user" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_activity_tenant" ON "activity_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_activity_action" ON "activity_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "smtp_users_email_key" ON "smtp_users"("email");

-- CreateIndex
CREATE INDEX "smtp_users_email_idx" ON "smtp_users"("email");

-- CreateIndex
CREATE INDEX "idx_smtp_users_active" ON "smtp_users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "email_domains_domain_name_key" ON "email_domains"("domain_name");

-- CreateIndex
CREATE INDEX "email_domains_domain_name_idx" ON "email_domains"("domain_name");

-- CreateIndex
CREATE INDEX "email_domains_is_verified_idx" ON "email_domains"("is_verified");

-- CreateIndex
CREATE INDEX "email_domains_tenant_id_idx" ON "email_domains"("tenant_id");

-- CreateIndex
CREATE INDEX "dkim_keys_is_active_idx" ON "dkim_keys"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "dkim_keys_domain_id_selector_key" ON "dkim_keys"("domain_id", "selector");

-- CreateIndex
CREATE UNIQUE INDEX "emails_message_id_key" ON "emails"("message_id");

-- CreateIndex
CREATE INDEX "emails_message_id_idx" ON "emails"("message_id");

-- CreateIndex
CREATE INDEX "emails_from_email_idx" ON "emails"("from_email");

-- CreateIndex
CREATE INDEX "emails_to_email_idx" ON "emails"("to_email");

-- CreateIndex
CREATE INDEX "emails_status_idx" ON "emails"("status");

-- CreateIndex
CREATE INDEX "emails_direction_idx" ON "emails"("direction");

-- CreateIndex
CREATE INDEX "emails_sent_at_idx" ON "emails"("sent_at");

-- CreateIndex
CREATE INDEX "smtp_connections_remote_address_idx" ON "smtp_connections"("remote_address");

-- CreateIndex
CREATE INDEX "smtp_connections_server_type_idx" ON "smtp_connections"("server_type");

-- CreateIndex
CREATE INDEX "smtp_connections_status_idx" ON "smtp_connections"("status");

-- CreateIndex
CREATE INDEX "smtp_connections_created_at_idx" ON "smtp_connections"("created_at");

-- CreateIndex
CREATE INDEX "auth_attempts_username_idx" ON "auth_attempts"("username");

-- CreateIndex
CREATE INDEX "auth_attempts_remote_address_idx" ON "auth_attempts"("remote_address");

-- CreateIndex
CREATE INDEX "auth_attempts_success_idx" ON "auth_attempts"("success");

-- CreateIndex
CREATE INDEX "auth_attempts_created_at_idx" ON "auth_attempts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_token_idx" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_tokens_token_key" ON "user_tokens"("token");

-- CreateIndex
CREATE INDEX "user_tokens_user_id_idx" ON "user_tokens"("user_id");

-- CreateIndex
CREATE INDEX "user_tokens_token_idx" ON "user_tokens"("token");

-- CreateIndex
CREATE INDEX "user_tokens_type_idx" ON "user_tokens"("type");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "system_config_key_idx" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "system_config_is_active_idx" ON "system_config"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "email_verification_tokens_token_idx" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_expires_at_idx" ON "email_verification_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_numero_key" ON "invoices"("numero");

-- CreateIndex
CREATE INDEX "idx_invoices_tenant" ON "invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_invoices_status" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "idx_invoices_vencimento" ON "invoices"("data_vencimento");

-- CreateIndex
CREATE INDEX "idx_invoices_pagamento" ON "invoices"("data_pagamento");

-- CreateIndex
CREATE INDEX "idx_invoices_plano" ON "invoices"("plano");

-- CreateIndex
CREATE INDEX "idx_invoice_items_invoice" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "idx_invoice_items_tipo" ON "invoice_items"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "billing_metrics_periodo_key" ON "billing_metrics"("periodo");

-- CreateIndex
CREATE INDEX "idx_billing_metrics_periodo" ON "billing_metrics"("periodo");

-- CreateIndex
CREATE INDEX "idx_analytics_sessions_user" ON "analytics_user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_analytics_sessions_tenant" ON "analytics_user_sessions"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_analytics_sessions_started" ON "analytics_user_sessions"("started_at");

-- CreateIndex
CREATE INDEX "idx_feature_usage_user" ON "feature_usage"("user_id");

-- CreateIndex
CREATE INDEX "idx_feature_usage_tenant" ON "feature_usage"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_feature_usage_feature" ON "feature_usage"("feature_name");

-- CreateIndex
CREATE INDEX "idx_feature_usage_date" ON "feature_usage"("date");

-- CreateIndex
CREATE INDEX "idx_system_metrics_name" ON "system_metrics"("metric_name");

-- CreateIndex
CREATE INDEX "idx_system_metrics_recorded" ON "system_metrics"("recorded_at");

-- CreateIndex
CREATE INDEX "idx_page_views_user" ON "page_views"("user_id");

-- CreateIndex
CREATE INDEX "idx_page_views_tenant" ON "page_views"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_page_views_path" ON "page_views"("page_path");

-- CreateIndex
CREATE INDEX "idx_page_views_created" ON "page_views"("created_at");

-- CreateIndex
CREATE INDEX "idx_module_analytics_tenant" ON "module_analytics"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_module_analytics_module" ON "module_analytics"("module_name");

-- CreateIndex
CREATE INDEX "idx_module_analytics_period" ON "module_analytics"("period");

-- CreateIndex
CREATE UNIQUE INDEX "module_analytics_tenant_id_module_name_period_key" ON "module_analytics"("tenant_id", "module_name", "period");

-- CreateIndex
CREATE INDEX "idx_geographic_data_tenant" ON "geographic_data"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_geographic_data_estado" ON "geographic_data"("estado");

-- CreateIndex
CREATE INDEX "idx_geographic_data_regiao" ON "geographic_data"("regiao");

-- CreateIndex
CREATE INDEX "idx_geographic_data_period" ON "geographic_data"("period");

-- CreateIndex
CREATE UNIQUE INDEX "geographic_data_cidade_estado_period_key" ON "geographic_data"("cidade", "estado", "period");

-- CreateIndex
CREATE INDEX "idx_automated_reports_type" ON "automated_reports"("report_type");

-- CreateIndex
CREATE INDEX "idx_automated_reports_frequency" ON "automated_reports"("frequency");

-- CreateIndex
CREATE INDEX "idx_automated_reports_active" ON "automated_reports"("is_active");

-- CreateIndex
CREATE INDEX "idx_report_schedules_report" ON "report_schedules"("report_id");

-- CreateIndex
CREATE INDEX "idx_report_schedules_next_run" ON "report_schedules"("next_run");

-- CreateIndex
CREATE INDEX "idx_report_schedules_active" ON "report_schedules"("is_active");

-- CreateIndex
CREATE INDEX "idx_report_recipients_schedule" ON "report_recipients"("schedule_id");

-- CreateIndex
CREATE INDEX "idx_report_recipients_email" ON "report_recipients"("email");

-- CreateIndex
CREATE INDEX "idx_report_history_report" ON "report_history"("report_id");

-- CreateIndex
CREATE INDEX "idx_report_history_generated" ON "report_history"("generated_at");

-- CreateIndex
CREATE INDEX "idx_report_history_status" ON "report_history"("status");

-- CreateIndex
CREATE INDEX "idx_satisfaction_surveys_tenant" ON "satisfaction_surveys"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_satisfaction_surveys_type" ON "satisfaction_surveys"("survey_type");

-- CreateIndex
CREATE INDEX "idx_satisfaction_surveys_active" ON "satisfaction_surveys"("is_active");

-- CreateIndex
CREATE INDEX "idx_nps_responses_survey" ON "nps_responses"("survey_id");

-- CreateIndex
CREATE INDEX "idx_nps_responses_user" ON "nps_responses"("user_id");

-- CreateIndex
CREATE INDEX "idx_nps_responses_tenant" ON "nps_responses"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_nps_responses_score" ON "nps_responses"("score");

-- CreateIndex
CREATE INDEX "idx_nps_responses_category" ON "nps_responses"("category");

-- CreateIndex
CREATE INDEX "idx_feedback_submissions_survey" ON "feedback_submissions"("survey_id");

-- CreateIndex
CREATE INDEX "idx_feedback_submissions_user" ON "feedback_submissions"("user_id");

-- CreateIndex
CREATE INDEX "idx_feedback_submissions_tenant" ON "feedback_submissions"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_feedback_submissions_type" ON "feedback_submissions"("feedback_type");

-- CreateIndex
CREATE INDEX "idx_feedback_submissions_status" ON "feedback_submissions"("status");

-- CreateIndex
CREATE INDEX "idx_feedback_submissions_priority" ON "feedback_submissions"("priority");
