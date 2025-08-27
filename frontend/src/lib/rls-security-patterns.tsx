// =====================================================
// PADRÕES UNIFICADOS PARA RLS E SEGURANÇA
// =====================================================

import { TipoPermissao, PermissaoPadrao } from "@/types/common";

// =====================================================
// TIPOS PARA SISTEMA DE PERMISSÕES
// =====================================================

export type TipoUsuario = 
  | 'super_admin'
  | 'admin_municipal' 
  | 'gestor_secretaria'
  | 'funcionario'
  | 'cidadao';

export type ModuloSistema = 
  | 'saude'
  | 'educacao'
  | 'assistencia_social'
  | 'agricultura'
  | 'cultura'
  | 'esportes'
  | 'habitacao'
  | 'meio_ambiente'
  | 'obras_publicas'
  | 'planejamento_urbano'
  | 'seguranca_publica'
  | 'servicos_publicos'
  | 'turismo'
  | 'gabinete'
  | 'administracao';

export type AcaoPermissao = 
  | 'create'
  | 'read'
  | 'update' 
  | 'delete'
  | 'approve'
  | 'export'
  | 'import'
  | 'report'
  | 'admin';

// =====================================================
// INTERFACE PARA CONTEXTO DE SEGURANÇA
// =====================================================

export interface ContextoSeguranca {
  usuario_id: string;
  tipo_usuario: TipoUsuario;
  tenant_id?: string;
  secretaria_id?: string;
  unidade_id?: string;
  permissoes: PermissaoPadrao[];
  grupos: string[];
  metadata: {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    last_activity?: string;
  };
}

// =====================================================
// INTERFACE PARA POLÍTICAS RLS
// =====================================================

export interface PoliticaRLS {
  nome: string;
  tabela: string;
  operacao: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  condicao: string;
  roles: string[];
  ativa: boolean;
  descricao?: string;
}

// =====================================================
// POLÍTICAS RLS PADRONIZADAS
// =====================================================

export const POLITICAS_RLS_PADRAO: Record<string, PoliticaRLS[]> = {
  // Políticas para tabelas de Saúde
  'pacientes': [
    {
      nome: 'pacientes_select_policy',
      tabela: 'pacientes',
      operacao: 'SELECT',
      condicao: `
        (auth.jwt() ->> 'user_role' = 'super_admin') OR
        (auth.jwt() ->> 'user_role' = 'admin_municipal') OR
        (
          auth.jwt() ->> 'user_role' IN ('gestor_secretaria', 'funcionario') AND
          EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.secretaria_id IN (
              SELECT s.id FROM secretarias s WHERE s.area = 'saude'
            )
          )
        ) OR
        (
          auth.jwt() ->> 'user_role' = 'cidadao' AND
          id = auth.uid()
        )
      `,
      roles: ['authenticated'],
      ativa: true,
      descricao: 'Permite acesso aos pacientes baseado no papel do usuário'
    },
    {
      nome: 'pacientes_insert_policy', 
      tabela: 'pacientes',
      operacao: 'INSERT',
      condicao: `
        (auth.jwt() ->> 'user_role' IN ('super_admin', 'admin_municipal')) OR
        (
          auth.jwt() ->> 'user_role' IN ('gestor_secretaria', 'funcionario') AND
          EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.secretaria_id IN (
              SELECT s.id FROM secretarias s WHERE s.area = 'saude'
            )
          )
        )
      `,
      roles: ['authenticated'],
      ativa: true,
      descricao: 'Permite criação de pacientes para usuários autorizados'
    },
    {
      nome: 'pacientes_update_policy',
      tabela: 'pacientes', 
      operacao: 'UPDATE',
      condicao: `
        (auth.jwt() ->> 'user_role' IN ('super_admin', 'admin_municipal')) OR
        (
          auth.jwt() ->> 'user_role' IN ('gestor_secretaria', 'funcionario') AND
          EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.secretaria_id IN (
              SELECT s.id FROM secretarias s WHERE s.area = 'saude'
            )
          )
        ) OR
        (
          auth.jwt() ->> 'user_role' = 'cidadao' AND
          id = auth.uid()
        )
      `,
      roles: ['authenticated'],
      ativa: true,
      descricao: 'Permite atualização de pacientes para usuários autorizados'
    }
  ],

  // Políticas para tabelas de Educação
  'alunos': [
    {
      nome: 'alunos_select_policy',
      tabela: 'alunos',
      operacao: 'SELECT', 
      condicao: `
        (auth.jwt() ->> 'user_role' = 'super_admin') OR
        (auth.jwt() ->> 'user_role' = 'admin_municipal') OR
        (
          auth.jwt() ->> 'user_role' IN ('gestor_secretaria', 'funcionario') AND
          EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.secretaria_id IN (
              SELECT s.id FROM secretarias s WHERE s.area = 'educacao'
            )
          )
        ) OR
        (
          auth.jwt() ->> 'user_role' = 'cidadao' AND
          EXISTS (
            SELECT 1 FROM responsaveis_alunos ra 
            WHERE ra.aluno_id = alunos.id 
            AND ra.responsavel_id = auth.uid()
          )
        )
      `,
      roles: ['authenticated'],
      ativa: true,
      descricao: 'Permite acesso aos alunos baseado no papel do usuário'
    }
  ],

  // Políticas para tabelas de Assistência Social
  'familias': [
    {
      nome: 'familias_select_policy',
      tabela: 'familias',
      operacao: 'SELECT',
      condicao: `
        (auth.jwt() ->> 'user_role' = 'super_admin') OR
        (auth.jwt() ->> 'user_role' = 'admin_municipal') OR
        (
          auth.jwt() ->> 'user_role' IN ('gestor_secretaria', 'funcionario') AND
          EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.secretaria_id IN (
              SELECT s.id FROM secretarias s WHERE s.area = 'assistencia_social'
            )
          )
        ) OR
        (
          auth.jwt() ->> 'user_role' = 'cidadao' AND
          responsavel_familiar ->> 'id' = auth.uid()::text
        )
      `,
      roles: ['authenticated'],
      ativa: true,
      descricao: 'Permite acesso às famílias baseado no papel do usuário'
    }
  ],

  // Políticas genéricas para todas as tabelas
  'generic_tables': [
    {
      nome: 'tenant_isolation_policy',
      tabela: '*',
      operacao: 'SELECT',
      condicao: `
        (tenant_id IS NULL) OR 
        (tenant_id = auth.jwt() ->> 'tenant_id') OR
        (auth.jwt() ->> 'user_role' = 'super_admin')
      `,
      roles: ['authenticated'],
      ativa: true,
      descricao: 'Isolamento por tenant para multi-tenancy'
    },
    {
      nome: 'soft_delete_policy',
      tabela: '*',
      operacao: 'SELECT',
      condicao: `deleted_at IS NULL`,
      roles: ['authenticated'],
      ativa: true,
      descricao: 'Filtra registros marcados como deletados'
    }
  ]
};

// =====================================================
// MATRIZ DE PERMISSÕES PADRÃO
// =====================================================

export const MATRIZ_PERMISSOES: Record<TipoUsuario, Record<ModuloSistema, AcaoPermissao[]>> = {
  super_admin: {
    saude: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    educacao: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    assistencia_social: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    agricultura: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    cultura: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    esportes: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    habitacao: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    meio_ambiente: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    obras_publicas: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    planejamento_urbano: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    seguranca_publica: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    servicos_publicos: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    turismo: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    gabinete: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
    administracao: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'],
  },

  admin_municipal: {
    saude: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    educacao: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    assistencia_social: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    agricultura: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    cultura: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    esportes: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    habitacao: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    meio_ambiente: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    obras_publicas: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    planejamento_urbano: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    seguranca_publica: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    servicos_publicos: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    turismo: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    gabinete: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
    administracao: ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report'],
  },

  gestor_secretaria: {
    saude: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    educacao: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    assistencia_social: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    agricultura: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    cultura: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    esportes: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    habitacao: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    meio_ambiente: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    obras_publicas: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    planejamento_urbano: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    seguranca_publica: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    servicos_publicos: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    turismo: ['create', 'read', 'update', 'delete', 'approve', 'export', 'report'],
    gabinete: ['read'],
    administracao: ['read'],
  },

  funcionario: {
    saude: ['create', 'read', 'update', 'export'],
    educacao: ['create', 'read', 'update', 'export'],
    assistencia_social: ['create', 'read', 'update', 'export'],
    agricultura: ['create', 'read', 'update', 'export'],
    cultura: ['create', 'read', 'update', 'export'],
    esportes: ['create', 'read', 'update', 'export'],
    habitacao: ['create', 'read', 'update', 'export'],
    meio_ambiente: ['create', 'read', 'update', 'export'],
    obras_publicas: ['create', 'read', 'update', 'export'],
    planejamento_urbano: ['create', 'read', 'update', 'export'],
    seguranca_publica: ['create', 'read', 'update', 'export'],
    servicos_publicos: ['create', 'read', 'update', 'export'],
    turismo: ['create', 'read', 'update', 'export'],
    gabinete: [],
    administracao: [],
  },

  cidadao: {
    saude: ['read'],
    educacao: ['read'],
    assistencia_social: ['read'],
    agricultura: ['read'],
    cultura: ['read'],
    esportes: ['read'],
    habitacao: ['read'],
    meio_ambiente: ['read'],
    obras_publicas: ['read'],
    planejamento_urbano: ['read'],
    seguranca_publica: ['read'],
    servicos_publicos: ['read'],
    turismo: ['read'],
    gabinete: [],
    administracao: [],
  },
};

// =====================================================
// FUNÇÕES PARA VERIFICAÇÃO DE PERMISSÕES
// =====================================================

export class GerenciadorPermissoes {
  private contexto: ContextoSeguranca;

  constructor(contexto: ContextoSeguranca) {
    this.contexto = contexto;
  }

  /**
   * Verifica se o usuário tem permissão para uma ação específica
   */
  verificarPermissao(modulo: ModuloSistema, acao: AcaoPermissao, recursoId?: string): boolean {
    try {
      // Super admin tem acesso total
      if (this.contexto.tipo_usuario === 'super_admin') {
        return true;
      }

      // Verificar permissões na matriz padrão
      const permissoesModulo = MATRIZ_PERMISSOES[this.contexto.tipo_usuario]?.[modulo];
      if (!permissoesModulo || !permissoesModulo.includes(acao)) {
        return false;
      }

      // Verificar permissões específicas do usuário
      const temPermissaoEspecifica = this.contexto.permissoes.some(p => 
        p.modulo === modulo && 
        p.acao === acao &&
        (!p.recurso || p.recurso === recursoId)
      );

      return temPermissaoEspecifica || permissoesModulo.includes(acao);

    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }

  /**
   * Verifica se o usuário pode acessar uma secretaria específica
   */
  verificarAcessoSecretaria(secretariaId: string): boolean {
    if (this.contexto.tipo_usuario === 'super_admin') {
      return true;
    }

    if (this.contexto.tipo_usuario === 'admin_municipal') {
      return true;
    }

    return this.contexto.secretaria_id === secretariaId;
  }

  /**
   * Verifica se o usuário pode acessar uma unidade específica
   */
  verificarAcessoUnidade(unidadeId: string): boolean {
    if (this.contexto.tipo_usuario === 'super_admin') {
      return true;
    }

    if (this.contexto.tipo_usuario === 'admin_municipal') {
      return true;
    }

    return this.contexto.unidade_id === unidadeId;
  }

  /**
   * Verifica se o usuário pode acessar dados de um tenant específico
   */
  verificarAcessoTenant(tenantId: string): boolean {
    if (this.contexto.tipo_usuario === 'super_admin') {
      return true;
    }

    return this.contexto.tenant_id === tenantId;
  }

  /**
   * Obtém todas as permissões do usuário para um módulo
   */
  obterPermissoesModulo(modulo: ModuloSistema): AcaoPermissao[] {
    if (this.contexto.tipo_usuario === 'super_admin') {
      return ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'report', 'admin'];
    }

    return MATRIZ_PERMISSOES[this.contexto.tipo_usuario]?.[modulo] || [];
  }

  /**
   * Gera condições SQL para RLS baseadas no contexto do usuário
   */
  gerarCondicaoRLS(tabela: string, operacao: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'): string {
    const politicas = POLITICAS_RLS_PADRAO[tabela] || POLITICAS_RLS_PADRAO['generic_tables'];
    
    const politicaOperacao = politicas.find(p => 
      p.operacao === operacao && 
      p.ativa && 
      p.roles.includes('authenticated')
    );

    if (!politicaOperacao) {
      return 'FALSE'; // Negar acesso se não há política definida
    }

    return politicaOperacao.condicao;
  }
}

// =====================================================
// FUNÇÕES UTILITÁRIAS PARA SEGURANÇA
// =====================================================

/**
 * Sanitiza entrada do usuário para prevenir SQL injection
 */
export const sanitizarEntrada = (entrada: string): string => {
  if (!entrada || typeof entrada !== 'string') {
    return '';
  }

  return entrada
    .replace(/['"]/g, '') // Remove aspas
    .replace(/[;]/g, '') // Remove ponto e vírgula
    .replace(/--/g, '') // Remove comentários SQL
    .replace(/\/\*/g, '') // Remove início de comentário em bloco
    .replace(/\*\//g, '') // Remove fim de comentário em bloco
    .trim();
};

/**
 * Valida se um UUID é válido
 */
export const validarUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Gera um hash para auditoria de dados sensíveis
 */
export const gerarHashAuditoria = async (dados: Record<string, unknown>): Promise<string> => {
  const dadosString = JSON.stringify(dados);
  const encoder = new TextEncoder();
  const data = encoder.encode(dadosString);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Máscara dados sensíveis para logs
 */
export const mascaraDadosSensiveis = (dados: Record<string, unknown>): any => {
  const dadosCopiados = JSON.parse(JSON.stringify(dados));
  
  const camposSensiveis = ['cpf', 'rg', 'senha', 'password', 'email', 'telefone', 'cns'];
  
  const mascarar = (obj: any) => {
    for (const [chave, valor] of Object.entries(obj)) {
      if (camposSensiveis.includes(chave.toLowerCase())) {
        obj[chave] = '***MASKED***';
      } else if (typeof valor === 'object' && valor !== null) {
        mascarar(valor);
      }
    }
  };

  mascarar(dadosCopiados);
  return dadosCopiados;
};

// =====================================================
// HOOK PARA CONTEXTO DE SEGURANÇA
// =====================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';

const ContextoSegurancaContext = createContext<{
  contexto: ContextoSeguranca | null;
  gerenciador: GerenciadorPermissoes | null;
  loading: boolean;
  atualizarContexto: () => Promise<void>;
}>({
  contexto: null,
  gerenciador: null,
  loading: true,
  atualizarContexto: async () => {},
});

export const ProviderContextoSeguranca = ({ children }: { children: ReactNode }) => {
  const [contexto, setContexto] = useState<ContextoSeguranca | null>(null);
  const [gerenciador, setGerenciador] = useState<GerenciadorPermissoes | null>(null);
  const [loading, setLoading] = useState(true);

  const atualizarContexto = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setContexto(null);
        setGerenciador(null);
        return;
      }

      // Buscar dados do perfil do usuário
      const { data: perfil } = await supabase
        .from('user_profiles')
        .select(`
          *,
          secretaria:secretarias(id, nome, area),
          permissoes:user_permissions(
            modulo,
            acao,
            recurso,
            condicoes
          )
        `)
        .eq('id', user.id)
        .single();

      if (!perfil) {
        throw new Error('Perfil de usuário não encontrado');
      }

      const novoContexto: ContextoSeguranca = {
        usuario_id: user.id,
        tipo_usuario: perfil.tipo_usuario || 'cidadao',
        tenant_id: perfil.tenant_id,
        secretaria_id: perfil.secretaria_id,
        unidade_id: perfil.unidade_id,
        permissoes: perfil.permissoes || [],
        grupos: perfil.grupos || [],
        metadata: {
          session_id: user.id, // Simplificado
          last_activity: new Date().toISOString(),
        },
      };

      setContexto(novoContexto);
      setGerenciador(new GerenciadorPermissoes(novoContexto));

    } catch (error) {
      console.error('Erro ao atualizar contexto de segurança:', error);
      setContexto(null);
      setGerenciador(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    atualizarContexto();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await atualizarContexto();
      } else if (event === 'SIGNED_OUT') {
        setContexto(null);
        setGerenciador(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ContextoSegurancaContext.Provider value={{
      contexto,
      gerenciador,
      loading,
      atualizarContexto,
    }}>
      {children}
    </ContextoSegurancaContext.Provider>
  );
};

export const useContextoSeguranca = () => {
  const context = useContext(ContextoSegurancaContext);
  if (!context) {
    throw new Error('useContextoSeguranca deve ser usado dentro do ProviderContextoSeguranca');
  }
  return context;
};