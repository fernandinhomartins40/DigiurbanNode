-- ====================================================================
-- 📦 MIGRAÇÃO 002: ATUALIZAÇÃO DE ROLES COMPLETOS
-- ====================================================================
-- Sistema hierárquico com 6 níveis de acesso
-- guest -> user -> coordinator -> manager -> admin -> super_admin
-- ====================================================================

-- SQLite não suporta ALTER CONSTRAINT, então vamos usar uma abordagem compatível
-- Os novos roles serão validados via aplicação

-- Criar tabela de níveis hierárquicos para consulta
CREATE TABLE IF NOT EXISTS role_hierarchy (
    role TEXT PRIMARY KEY,
    level INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);

-- Inserir dados da hierarquia
INSERT OR REPLACE INTO role_hierarchy (role, level, name, description) VALUES
('guest', 0, 'Visitante', 'Cidadão com acesso público aos serviços municipais'),
('user', 1, 'Funcionário', 'Atendente/Funcionário com operações básicas'),
('coordinator', 2, 'Coordenador', 'Coordenador de equipes e supervisor de operações'),
('manager', 3, 'Gestor de Secretaria', 'Secretário/Diretor com gestão completa da secretaria'),
('admin', 4, 'Administrador Municipal', 'Prefeito/Vice-Prefeito com gestão municipal completa'),
('super_admin', 5, 'Super Administrador', 'Desenvolvedor/Suporte com acesso sistêmico total');

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_level ON role_hierarchy(level);

-- Atualizar usuários existentes se necessário (preservar dados atuais)
-- Não alterar usuários que já têm roles válidos
UPDATE users 
SET role = 'user' 
WHERE role NOT IN ('guest', 'user', 'coordinator', 'manager', 'admin', 'super_admin');