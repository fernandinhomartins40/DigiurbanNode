-- ====================================================================
-- 🧹 MIGRATION 003: LIMPEZA DE DADOS ÓRFÃOS E NORMALIZAÇÃO
-- ====================================================================
-- Remove tenants órfãos, normaliza estrutura e garante consistência
-- Data: 2025-09-21
-- ====================================================================

BEGIN;

-- ====================================================================
-- 1. BACKUP DOS DADOS ÓRFÃOS ANTES DA LIMPEZA
-- ====================================================================

-- Criar tabela de backup dos tenants órfãos
CREATE TABLE IF NOT EXISTS tenants_orphan_backup (
    id TEXT,
    nome TEXT,
    cnpj TEXT,
    status TEXT,
    created_at TIMESTAMP,
    backup_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason TEXT
);

-- Fazer backup dos tenants sem CNPJ ou com dados inconsistentes
INSERT INTO tenants_orphan_backup (id, nome, cnpj, status, created_at, backup_reason)
SELECT
    id,
    nome,
    cnpj,
    status,
    created_at,
    CASE
        WHEN cnpj IS NULL OR cnpj = '' THEN 'CNPJ vazio ou nulo'
        WHEN nome IS NULL OR nome = '' THEN 'Nome vazio ou nulo'
        WHEN id IS NULL OR id = '' THEN 'ID vazio ou nulo'
        ELSE 'Dados inconsistentes'
    END as backup_reason
FROM tenants
WHERE
    cnpj IS NULL
    OR cnpj = ''
    OR nome IS NULL
    OR nome = ''
    OR id IS NULL
    OR id = ''
    OR LENGTH(TRIM(nome)) < 2;

-- ====================================================================
-- 2. LIMPEZA DOS DADOS ÓRFÃOS
-- ====================================================================

-- Remover tenants com CNPJ vazio/nulo
DELETE FROM tenants
WHERE cnpj IS NULL OR cnpj = '';

-- Remover tenants com nome inválido
DELETE FROM tenants
WHERE nome IS NULL OR nome = '' OR LENGTH(TRIM(nome)) < 2;

-- Remover tenants com ID inválido
DELETE FROM tenants
WHERE id IS NULL OR id = '';

-- ====================================================================
-- 3. NORMALIZAÇÃO E VALIDAÇÃO DOS DADOS VÁLIDOS
-- ====================================================================

-- Normalizar status para valores válidos
UPDATE tenants
SET status = 'ativo'
WHERE status NOT IN ('ativo', 'inativo', 'suspenso');

-- Normalizar planos para valores válidos
UPDATE tenants
SET plano = 'basico'
WHERE plano NOT IN ('basico', 'premium', 'enterprise');

-- Limpar e validar CNPJs (remover formatação)
UPDATE tenants
SET cnpj = REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')
WHERE cnpj IS NOT NULL;

-- Remover tenants com CNPJ inválido (não tem 14 dígitos)
DELETE FROM tenants
WHERE LENGTH(cnpj) != 14 OR cnpj !~ '^[0-9]{14}$';

-- ====================================================================
-- 4. GARANTIR UNICIDADE DE CNPJ
-- ====================================================================

-- Encontrar CNPJs duplicados e manter apenas o mais recente
WITH duplicated_cnpj AS (
    SELECT cnpj,
           MIN(created_at) as first_created,
           COUNT(*) as count_duplicates
    FROM tenants
    GROUP BY cnpj
    HAVING COUNT(*) > 1
),
tenants_to_delete AS (
    SELECT t.id
    FROM tenants t
    INNER JOIN duplicated_cnpj d ON t.cnpj = d.cnpj
    WHERE t.created_at != (
        SELECT MAX(t2.created_at)
        FROM tenants t2
        WHERE t2.cnpj = t.cnpj
    )
)
DELETE FROM tenants
WHERE id IN (SELECT id FROM tenants_to_delete);

-- ====================================================================
-- 5. NORMALIZAR CAMPOS OPCIONAIS
-- ====================================================================

-- Garantir que campos numéricos tenham valores padrão
UPDATE tenants
SET populacao = 10000
WHERE populacao IS NULL OR populacao <= 0;

-- Garantir que estado seja sempre maiúsculo e tenha 2 caracteres
UPDATE tenants
SET estado = UPPER(SUBSTR(estado, 1, 2))
WHERE estado IS NOT NULL AND LENGTH(estado) >= 2;

-- Remover tenants com estado inválido
DELETE FROM tenants
WHERE estado IS NULL OR LENGTH(estado) != 2;

-- ====================================================================
-- 6. GARANTIR CAMPOS OBRIGATÓRIOS
-- ====================================================================

-- Garantir que tenant_code existe e é único
UPDATE tenants
SET tenant_code = 'TEN' || LPAD(EXTRACT(EPOCH FROM created_at)::TEXT, 6, '0')
WHERE tenant_code IS NULL OR tenant_code = '';

-- ====================================================================
-- 7. ESTATÍSTICAS FINAIS
-- ====================================================================

-- Criar tabela de estatísticas da limpeza
CREATE TABLE IF NOT EXISTS cleanup_stats (
    migration_version TEXT,
    cleanup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenants_before INTEGER,
    tenants_after INTEGER,
    tenants_removed INTEGER,
    tenants_normalized INTEGER
);

-- Inserir estatísticas (valores serão calculados durante execução)
INSERT INTO cleanup_stats (
    migration_version,
    tenants_before,
    tenants_after,
    tenants_removed,
    tenants_normalized
) VALUES (
    '003_cleanup_orphan_tenants',
    (SELECT COUNT(*) FROM tenants_orphan_backup),
    (SELECT COUNT(*) FROM tenants),
    (SELECT COUNT(*) FROM tenants_orphan_backup),
    (SELECT COUNT(*) FROM tenants)
);

-- ====================================================================
-- 8. VALIDAÇÕES FINAIS
-- ====================================================================

-- Verificar se ainda há dados inconsistentes
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    -- Contar registros inválidos
    SELECT COUNT(*) INTO invalid_count
    FROM tenants
    WHERE
        cnpj IS NULL
        OR cnpj = ''
        OR LENGTH(cnpj) != 14
        OR nome IS NULL
        OR nome = ''
        OR LENGTH(TRIM(nome)) < 2
        OR status NOT IN ('ativo', 'inativo', 'suspenso')
        OR plano NOT IN ('basico', 'premium', 'enterprise');

    -- Se ainda há dados inválidos, abortar
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Ainda existem % registros inválidos após limpeza', invalid_count;
    END IF;

    -- Log de sucesso
    RAISE NOTICE 'Limpeza concluída com sucesso. Todos os % tenants são válidos.', (SELECT COUNT(*) FROM tenants);
END $$;

COMMIT;

-- ====================================================================
-- FIM DA MIGRATION 003
-- ====================================================================