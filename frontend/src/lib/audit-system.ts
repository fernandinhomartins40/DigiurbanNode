// =====================================================
// SISTEMA DE AUDITORIA UNIFICADO
// =====================================================

import { APIClient } from '@/auth/utils/httpInterceptor';
import { LogAuditoriaPadrao, LogSistemaPadrao, BaseEntity } from "@/types/common";
import { mascaraDadosSensiveis, gerarHashAuditoria } from './rls-security-patterns';

// =====================================================
// INTERFACES PARA SISTEMA DE AUDITORIA
// =====================================================

export interface ConfiguracaoAuditoria {
  habilitarAuditoria: boolean;
  habilitarLogsDetalhados: boolean;
  mascarDadosSensiveis: boolean;
  manterLogsPorDias: number;
  compressaoLogs: boolean;
  nivelLogMinimo: 'debug' | 'info' | 'warning' | 'error' | 'critical';
}

export interface EventoAuditoria {
  acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'APPROVE' | 'REJECT';
  tabela: string;
  registroId: string;
  dadosAnteriores?: any;
  dadosNovos?: any;
  metadata?: {
    ip_origem?: string;
    user_agent?: string;
    session_id?: string;
    referrer?: string;
    duracao_operacao?: number;
    tamanho_dados?: number;
  };
  observacoes?: string;
  nivel_sensibilidade?: 'baixo' | 'medio' | 'alto' | 'critico';
}

export interface FiltrosAuditoria {
  usuario_id?: string;
  tabela?: string;
  acao?: string[];
  data_inicio?: string;
  data_fim?: string;
  nivel_sensibilidade?: string[];
  ip_origem?: string;
  session_id?: string;
  registroId?: string;
  page?: number;
  limit?: number;
}

// =====================================================
// CLASSE PRINCIPAL DO SISTEMA DE AUDITORIA
// =====================================================

export class SistemaAuditoria {
  private configuracao: ConfiguracaoAuditoria;
  private filaEventos: EventoAuditoria[] = [];
  private processandoFila = false;

  constructor(configuracao: ConfiguracaoAuditoria) {
    this.configuracao = configuracao;
    this.inicializarProcessamentoFila();
  }

  /**
   * Registra um evento de auditoria
   */
  async registrarEvento(evento: EventoAuditoria): Promise<void> {
    if (!this.configuracao.habilitarAuditoria) {
      return;
    }

    try {
      const { data: { user } } = await APIClient.get("/auth/me");
      if (!user) {
        console.warn('Tentativa de auditoria sem usuário autenticado');
        return;
      }

      // Obter informações do perfil do usuário
      const { data: perfil } = await supabase
        .from('user_profiles')
        .select('nome, tipo_usuario, secretaria_id, tenant_id')
        .eq('id', user.id)
        .single();

      const dadosAuditoria: Omit<LogAuditoriaPadrao, 'id' | 'created_at' | 'updated_at'> = {
        acao: evento.acao,
        tabela_origem: evento.tabela,
        registro_id: evento.registroId,
        dados_anteriores: this.configuracao.mascarDadosSensiveis 
          ? mascaraDadosSensiveis(evento.dadosAnteriores)
          : evento.dadosAnteriores,
        dados_novos: this.configuracao.mascarDadosSensiveis 
          ? mascaraDadosSensiveis(evento.dadosNovos)
          : evento.dadosNovos,
        usuario_id: user.id,
        usuario_nome: perfil?.nome || 'Usuário não identificado',
        ip_origem: evento.metadata?.ip_origem || 'N/A',
        user_agent: evento.metadata?.user_agent,
        observacoes: evento.observacoes,
        deleted_at: undefined,
      };

      // Adicionar à fila para processamento assíncrono
      this.filaEventos.push({
        ...evento,
        metadata: {
          ...evento.metadata,
          usuario_nome: perfil?.nome,
          tipo_usuario: perfil?.tipo_usuario,
          secretaria_id: perfil?.secretaria_id,
          tenant_id: perfil?.tenant_id,
        }
      });

      // Se a fila está grande, processar imediatamente
      if (this.filaEventos.length >= 10) {
        await this.processarFilaEventos();
      }

    } catch (error) {
      console.error('Erro ao registrar evento de auditoria:', error);
      await this.registrarLogSistema({
        nivel: 'error',
        categoria: 'auditoria',
        mensagem: 'Falha ao registrar evento de auditoria',
        contexto: { evento, error: error.message },
      });
    }
  }

  /**
   * Processa a fila de eventos de auditoria
   */
  private async processarFilaEventos(): Promise<void> {
    if (this.processandoFila || this.filaEventos.length === 0) {
      return;
    }

    this.processandoFila = true;

    try {
      const eventos = [...this.filaEventos];
      this.filaEventos = [];

      const dadosParaInserir = await Promise.all(
        eventos.map(async (evento) => {
          const { data: { user } } = await APIClient.get("/auth/me");
          
          return {
            acao: evento.acao,
            tabela_origem: evento.tabela,
            registro_id: evento.registroId,
            dados_anteriores: evento.dadosAnteriores,
            dados_novos: evento.dadosNovos,
            usuario_id: user?.id || 'sistema',
            usuario_nome: evento.metadata?.usuario_nome || 'Sistema',
            ip_origem: evento.metadata?.ip_origem || 'N/A',
            user_agent: evento.metadata?.user_agent,
            observacoes: evento.observacoes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        })
      );

      const { error } = await supabase
        .from('logs_auditoria')
        .insert(dadosParaInserir);

      if (error) {
        throw error;
      }

      if (this.configuracao.habilitarLogsDetalhados) {
        console.log(`${eventos.length} eventos de auditoria processados com sucesso`);
      }

    } catch (error) {
      console.error('Erro ao processar fila de eventos:', error);
      
      // Recolocar eventos na fila se houver erro
      this.filaEventos.unshift(...this.filaEventos);
      
      await this.registrarLogSistema({
        nivel: 'error',
        categoria: 'auditoria',
        mensagem: 'Falha ao processar fila de eventos de auditoria',
        contexto: { error: error.message, quantidadeEventos: this.filaEventos.length },
      });
    } finally {
      this.processandoFila = false;
    }
  }

  /**
   * Inicializa processamento periódico da fila
   */
  private inicializarProcessamentoFila(): void {
    // Processar fila a cada 5 segundos
    setInterval(async () => {
      await this.processarFilaEventos();
    }, 5000);

    // Processar fila antes de fechar a página
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', async () => {
        await this.processarFilaEventos();
      });
    }
  }

  /**
   * Registra um log de sistema
   */
  async registrarLogSistema(log: {
    nivel: 'debug' | 'info' | 'warning' | 'error' | 'critical';
    categoria: string;
    mensagem: string;
    contexto?: any;
    usuario_id?: string;
    tenant_id?: string;
    ip_origem?: string;
    request_id?: string;
    stack_trace?: string;
  }): Promise<void> {
    try {
      // Verificar se deve registrar baseado no nível mínimo
      const niveis = ['debug', 'info', 'warning', 'error', 'critical'];
      const nivelAtual = niveis.indexOf(log.nivel);
      const nivelMinimo = niveis.indexOf(this.configuracao.nivelLogMinimo);

      if (nivelAtual < nivelMinimo) {
        return;
      }

      const { data: { user } } = await APIClient.get("/auth/me");

      const dadosLog: Omit<LogSistemaPadrao, 'id' | 'created_at' | 'updated_at'> = {
        nivel: log.nivel,
        categoria: log.categoria,
        mensagem: log.mensagem,
        contexto: this.configuracao.mascarDadosSensiveis 
          ? mascaraDadosSensiveis(log.contexto)
          : log.contexto,
        usuario_id: log.usuario_id || user?.id,
        tenant_id: log.tenant_id,
        ip_origem: log.ip_origem,
        request_id: log.request_id,
        stack_trace: log.stack_trace,
        deleted_at: undefined,
      };

      const { error } = await supabase
        .from('logs_sistema')
        .insert([{
          ...dadosLog,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error('Erro ao registrar log de sistema:', error);
      }

    } catch (error) {
      console.error('Erro crítico no sistema de logs:', error);
    }
  }

  /**
   * Busca logs de auditoria com filtros
   */
  async buscarLogsAuditoria(filtros: FiltrosAuditoria = {}): Promise<{
    logs: LogAuditoriaPadrao[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      let query = supabase
        .from('logs_auditoria')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.usuario_id) {
        query = query.eq('usuario_id', filtros.usuario_id);
      }

      if (filtros.tabela) {
        query = query.eq('tabela_origem', filtros.tabela);
      }

      if (filtros.acao && filtros.acao.length > 0) {
        query = query.in('acao', filtros.acao);
      }

      if (filtros.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
      }

      if (filtros.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
      }

      if (filtros.ip_origem) {
        query = query.eq('ip_origem', filtros.ip_origem);
      }

      if (filtros.registroId) {
        query = query.eq('registro_id', filtros.registroId);
      }

      // Paginação
      const page = filtros.page || 1;
      const limit = Math.min(filtros.limit || 50, 100);
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        logs: data || [],
        total: count || 0,
        page,
        limit,
      };

    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      throw error;
    }
  }

  /**
   * Obtém histórico de uma entidade específica
   */
  async obterHistoricoEntidade(tabela: string, registroId: string): Promise<LogAuditoriaPadrao[]> {
    try {
      const { data, error } = await supabase
        .from('logs_auditoria')
        .select('*')
        .eq('tabela_origem', tabela)
        .eq('registro_id', registroId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Erro ao obter histórico da entidade:', error);
      throw error;
    }
  }

  /**
   * Gera relatório de auditoria
   */
  async gerarRelatorioAuditoria(filtros: FiltrosAuditoria & {
    incluirEstatisticas?: boolean;
    incluirTendencias?: boolean;
    formato?: 'json' | 'csv' | 'excel';
  } = {}): Promise<{
    logs: LogAuditoriaPadrao[];
    estatisticas?: {
      totalEventos: number;
      eventosPorAcao: Record<string, number>;
      eventosPorTabela: Record<string, number>;
      eventosPorUsuario: Record<string, number>;
      eventosPorDia: Record<string, number>;
    };
    tendencias?: {
      acessosPorHora: Record<string, number>;
      operacoesMaisFrequentes: Array<{ acao: string; tabela: string; count: number }>;
      usuariosMaisAtivos: Array<{ usuario_nome: string; count: number }>;
    };
  }> {
    try {
      const resultado = await this.buscarLogsAuditoria(filtros);

      const resposta: any = {
        logs: resultado.logs,
      };

      if (filtros.incluirEstatisticas) {
        resposta.estatisticas = await this.calcularEstatisticasAuditoria(filtros);
      }

      if (filtros.incluirTendencias) {
        resposta.tendencias = await this.calcularTendenciasAuditoria(filtros);
      }

      return resposta;

    } catch (error) {
      console.error('Erro ao gerar relatório de auditoria:', error);
      throw error;
    }
  }

  /**
   * Calcula estatísticas de auditoria
   */
  private async calcularEstatisticasAuditoria(filtros: FiltrosAuditoria): Promise<any> {
    try {
      let query = supabase
        .from('logs_auditoria')
        .select('acao, tabela_origem, usuario_nome, created_at');

      // Aplicar mesmos filtros
      if (filtros.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
      }

      if (filtros.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const logs = data || [];

      const estatisticas = {
        totalEventos: logs.length,
        eventosPorAcao: {} as Record<string, number>,
        eventosPorTabela: {} as Record<string, number>,
        eventosPorUsuario: {} as Record<string, number>,
        eventosPorDia: {} as Record<string, number>,
      };

      logs.forEach(log => {
        // Eventos por ação
        estatisticas.eventosPorAcao[log.acao] = (estatisticas.eventosPorAcao[log.acao] || 0) + 1;

        // Eventos por tabela
        estatisticas.eventosPorTabela[log.tabela_origem] = (estatisticas.eventosPorTabela[log.tabela_origem] || 0) + 1;

        // Eventos por usuário
        estatisticas.eventosPorUsuario[log.usuario_nome] = (estatisticas.eventosPorUsuario[log.usuario_nome] || 0) + 1;

        // Eventos por dia
        const dia = log.created_at.split('T')[0];
        estatisticas.eventosPorDia[dia] = (estatisticas.eventosPorDia[dia] || 0) + 1;
      });

      return estatisticas;

    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return null;
    }
  }

  /**
   * Calcula tendências de auditoria
   */
  private async calcularTendenciasAuditoria(filtros: FiltrosAuditoria): Promise<any> {
    // Implementação simplificada - poderia ser expandida
    return {
      acessosPorHora: {},
      operacoesMaisFrequentes: [],
      usuariosMaisAtivos: [],
    };
  }

  /**
   * Limpa logs antigos baseado na configuração
   */
  async limparLogsAntigos(): Promise<void> {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - this.configuracao.manterLogsPorDias);

      const { error: errorAuditoria } = await supabase
        .from('logs_auditoria')
        .delete()
        .lt('created_at', dataLimite.toISOString());

      if (errorAuditoria) {
        throw errorAuditoria;
      }

      const { error: errorSistema } = await supabase
        .from('logs_sistema')
        .delete()
        .lt('created_at', dataLimite.toISOString());

      if (errorSistema) {
        throw errorSistema;
      }

      await this.registrarLogSistema({
        nivel: 'info',
        categoria: 'manutencao',
        mensagem: `Logs anteriores a ${dataLimite.toISOString()} foram removidos`,
      });

    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
      await this.registrarLogSistema({
        nivel: 'error',
        categoria: 'manutencao',
        mensagem: 'Falha ao limpar logs antigos',
        contexto: { error: error.message },
      });
    }
  }
}

// =====================================================
// INSTÂNCIA GLOBAL DO SISTEMA DE AUDITORIA
// =====================================================

const configuracaoPadrao: ConfiguracaoAuditoria = {
  habilitarAuditoria: true,
  habilitarLogsDetalhados: false,
  mascarDadosSensiveis: true,
  manterLogsPorDias: 365,
  compressaoLogs: false,
  nivelLogMinimo: 'info',
};

export const sistemaAuditoria = new SistemaAuditoria(configuracaoPadrao);

// =====================================================
// HOOKS PARA AUDITORIA AUTOMÁTICA
// =====================================================

/**
 * Hook para registrar operações CRUD automaticamente
 */
export const useAuditoriaAutomatica = <T extends BaseEntity>(
  tabela: string,
  nivel_sensibilidade: 'baixo' | 'medio' | 'alto' | 'critico' = 'medio'
) => {
  const registrarCriacao = async (dadosNovos: T) => {
    await sistemaAuditoria.registrarEvento({
      acao: 'CREATE',
      tabela,
      registroId: dadosNovos.id,
      dadosNovos,
      nivel_sensibilidade,
      observacoes: `Novo registro criado na tabela ${tabela}`,
    });
  };

  const registrarAtualizacao = async (dadosAnteriores: T, dadosNovos: T) => {
    await sistemaAuditoria.registrarEvento({
      acao: 'UPDATE',
      tabela,
      registroId: dadosNovos.id,
      dadosAnteriores,
      dadosNovos,
      nivel_sensibilidade,
      observacoes: `Registro atualizado na tabela ${tabela}`,
    });
  };

  const registrarDelecao = async (dadosAnteriores: T) => {
    await sistemaAuditoria.registrarEvento({
      acao: 'DELETE',
      tabela,
      registroId: dadosAnteriores.id,
      dadosAnteriores,
      nivel_sensibilidade,
      observacoes: `Registro deletado da tabela ${tabela}`,
    });
  };

  const registrarVisualizacao = async (registroId: string) => {
    await sistemaAuditoria.registrarEvento({
      acao: 'VIEW',
      tabela,
      registroId,
      nivel_sensibilidade: 'baixo',
      observacoes: `Registro visualizado na tabela ${tabela}`,
    });
  };

  return {
    registrarCriacao,
    registrarAtualizacao,
    registrarDelecao,
    registrarVisualizacao,
  };
};

// =====================================================
// DECORATOR PARA AUDITORIA AUTOMÁTICA
// =====================================================

export const auditoria = (
  tabela: string,
  nivel_sensibilidade: 'baixo' | 'medio' | 'alto' | 'critico' = 'medio'
) => {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args[]) {
      const inicio = Date.now();
      
      try {
        const resultado = await method.apply(this, args);
        
        // Determinar ação baseada no nome do método
        let acao: EventoAuditoria['acao'] = 'VIEW';
        if (propertyName.includes('criar') || propertyName.includes('create')) {
          acao = 'CREATE';
        } else if (propertyName.includes('atualizar') || propertyName.includes('update')) {
          acao = 'UPDATE';
        } else if (propertyName.includes('deletar') || propertyName.includes('delete')) {
          acao = 'DELETE';
        }

        const duracao = Date.now() - inicio;

        await sistemaAuditoria.registrarEvento({
          acao,
          tabela,
          registroId: resultado?.id || 'N/A',
          dadosNovos: resultado,
          nivel_sensibilidade,
          metadata: {
            duracao_operacao: duracao,
          },
          observacoes: `Operação ${acao} executada no método ${propertyName}`,
        });

        return resultado;

      } catch (error) {
        await sistemaAuditoria.registrarLogSistema({
          nivel: 'error',
          categoria: 'operacao',
          mensagem: `Erro na operação ${propertyName} da tabela ${tabela}`,
          contexto: { error: error.message, args },
          stack_trace: error.stack,
        });

        throw error;
      }
    };

    return descriptor;
  };
};