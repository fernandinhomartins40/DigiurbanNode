# 📦 DigiUrban Database Migrations

## Estrutura Organizada de Migrations

Este diretório contém todas as migrations do DigiUrban organizadas sequencialmente com nomenclatura padronizada para garantir execução na ordem correta.

### Nomenclatura

- **Formato**: `A{NN}_{description}.sql`
- **Ordem de execução**: A01 → A02 → A03 → A04 → A05
- **Garantia**: Execução sequencial determinística

## Migrations Disponíveis

### A01_create_core_tables.sql
**Descrição**: Criação das tabelas principais do sistema
- Tabelas: `tenants`, `users`, `permissions`, `user_permissions`, `user_sessions`, `user_tokens`, `activity_logs`, `system_config`
- Índices básicos para performance
- Triggers para atualização de timestamps
- Constraints e validações

### A02_setup_role_hierarchy.sql
**Descrição**: Sistema hierárquico de roles
- Tabela `role_hierarchy` com 6 níveis de acesso
- Roles: guest → user → coordinator → manager → admin → super_admin
- Migração de dados existentes
- Índices para consultas hierárquicas

### A03_optimize_performance.sql
**Descrição**: Otimizações avançadas de performance
- Índices compostos para queries complexas
- Índices parciais para economia de espaço
- Tabelas de auditoria (`audit_trail`)
- Cache de permissões e estatísticas
- Rate limiting otimizado
- Triggers para manutenção automática

### A04_fix_deterministic_schema.sql
**Descrição**: Correção de problemas determinísticos
- Remove uso não-determinístico de `datetime()`
- Substitui por `unixepoch()` determinístico
- Views otimizadas sem problemas de SQLite
- Sistema de timestamps de referência
- Triggers para manutenção de referências

### A05_add_email_system.sql
**Descrição**: Sistema completo de e-mail transacional
- Tabela `email_logs` para controle de envios
- Tokens de recuperação de senha (`password_reset_tokens`)
- Tokens de verificação de e-mail (`email_verification_tokens`)
- Rate limiting e retry automático
- Limpeza automática de dados antigos
- View de estatísticas de e-mail

## Como Executar

### Via Migration Runner
```bash
# No backend
npm run db:migrate
```

### Execução Manual
```bash
# Para cada migration em ordem
sqlite3 database.db < migrations/A01_create_core_tables.sql
sqlite3 database.db < migrations/A02_setup_role_hierarchy.sql
sqlite3 database.db < migrations/A03_optimize_performance.sql
sqlite3 database.db < migrations/A04_fix_deterministic_schema.sql
sqlite3 database.db < migrations/A05_add_email_system.sql
```

## Controle de Versão

Cada migration atualiza a chave `schema_version` na tabela `system_config`:
- A01 → schema_version = 'A01'
- A02 → schema_version = 'A02'
- A03 → schema_version = 'A03'
- A04 → schema_version = 'A04'
- A05 → schema_version = 'A05'

## Verificação de Integridade

Para verificar se todas as migrations foram aplicadas:

```sql
SELECT key, value FROM system_config 
WHERE key LIKE 'migration_A%_applied_at' 
ORDER BY key;
```

Para verificar a versão atual do schema:

```sql
SELECT value FROM system_config WHERE key = 'schema_version';
```

## Rollback e Backup

⚠️ **IMPORTANTE**: Sempre faça backup antes de executar migrations em produção.

```bash
# Backup antes da migração
cp database.db database_backup_$(date +%Y%m%d_%H%M%S).db

# Verificar integridade após migração
sqlite3 database.db "PRAGMA integrity_check;"
```

## Deploy Automático

O sistema de deploy executa automaticamente todas as migrations na ordem correta durante o processo de deployment.

### Configuração no Deploy
- ✅ Migrations executadas automaticamente
- ✅ Verificação de integridade
- ✅ Logs detalhados
- ✅ Rollback em caso de erro

## Troubleshooting

### Migration já aplicada
Se uma migration já foi aplicada, ela será ignorada devido aos comandos `IF NOT EXISTS` e `OR REPLACE`.

### Erro de execução
1. Verifique logs do sistema
2. Confirme integridade do banco
3. Execute manualmente cada migration
4. Verifique dependências

### Performance após migrations
Execute `ANALYZE` após todas as migrations:
```sql
ANALYZE;
```

## Estrutura de Dados Final

Após todas as migrations, o banco terá:
- **12 tabelas principais**: Core system tables
- **3 tabelas de cache**: Performance optimization
- **2 tabelas de auditoria**: Tracking and compliance
- **6 views**: Optimized queries
- **45+ índices**: Performance tuning
- **12 triggers**: Automated maintenance