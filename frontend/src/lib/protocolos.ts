import { APIClient } from '@/auth/utils/httpInterceptor';
import { ServicoMunicipal, Secretaria } from './services';
import { withProtocolRetry, withUploadRetry, withNotificationRetry } from './retry';
import { measureSupabaseOperation, measureUpload } from './performance';

// =====================================================
// TIPOS DE DADOS
// =====================================================

export type StatusProtocolo = 
  | 'aberto'
  | 'em_andamento'
  | 'aguardando_documentos'
  | 'aguardando_aprovacao'
  | 'aprovado'
  | 'rejeitado'
  | 'concluido'
  | 'cancelado';

export type PrioridadeProtocolo = 'baixa' | 'media' | 'alta' | 'urgente';

export interface DadosSolicitante {
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  };
}

export interface EnderecoReferencia {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  latitude?: number;
  longitude?: number;
  ponto_referencia?: string;
}

export interface Protocolo {
  id: string;
  numero_protocolo: string;
  servico_id: string;
  solicitante_id: string;
  dados_solicitante: DadosSolicitante;
  titulo: string;
  descricao: string;
  dados_especificos: Record<string, any>;
  endereco_referencia?: EnderecoReferencia;
  secretaria_id: string;
  setor_id?: string;
  responsavel_atual_id?: string;
  status: StatusProtocolo;
  prioridade: PrioridadeProtocolo;
  prazo_resposta?: string;
  prazo_resolucao?: string;
  data_primeira_resposta?: string;
  data_conclusao?: string;
  requer_aprovacao: boolean;
  aprovado?: boolean;
  aprovado_por?: string;
  aprovado_em?: string;
  observacoes_aprovacao?: string;
  avaliacao_nota?: number;
  avaliacao_comentario?: string;
  avaliado_em?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  servico?: ServicoMunicipal;
  secretaria?: Secretaria;
  solicitante?: any;
  responsavel_atual?: any;
}

export interface ProtocoloHistorico {
  id: string;
  protocolo_id: string;
  acao: string;
  status_anterior?: string;
  status_novo?: string;
  dados_anteriores?: any;
  dados_novos?: any;
  observacoes?: string;
  usuario_id?: string;
  usuario_nome: string;
  usuario_tipo: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ProtocoloAnexo {
  id: string;
  protocolo_id: string;
  nome_arquivo: string;
  tipo_arquivo?: string;
  tamanho_bytes?: number;
  url_storage: string;
  hash_arquivo?: string;
  tipo_anexo: 'documento' | 'comprovante' | 'foto' | 'outro';
  obrigatorio: boolean;
  uploaded_by?: string;
  created_at: string;
}

export interface ProtocoloComentario {
  id: string;
  protocolo_id: string;
  comentario: string;
  tipo: 'observacao' | 'resposta_oficial' | 'solicitacao_documentos';
  visivel_cidadao: boolean;
  autor_id?: string;
  autor_nome: string;
  autor_cargo?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// DADOS PARA CRIAÇÃO DE PROTOCOLO
// =====================================================

export interface CriarProtocoloData {
  servico_id: string;
  titulo: string;
  descricao: string;
  dados_especificos?: Record<string, any>;
  endereco_referencia?: EnderecoReferencia;
}

export interface AtualizarProtocoloData {
  titulo?: string;
  descricao?: string;
  dados_especificos?: Record<string, any>;
  endereco_referencia?: EnderecoReferencia;
  status?: StatusProtocolo;
  prioridade?: PrioridadeProtocolo;
  responsavel_atual_id?: string;
  observacoes_aprovacao?: string;
}

// =====================================================
// SERVIÇO DE PROTOCOLOS
// =====================================================

export const protocolosService = {
  // Gerar número único de protocolo
  async gerarNumeroProtocolo(): Promise<string> {
    return withProtocolRetry(async () => {
      return measureSupabaseOperation('gerar_numero_protocolo', async () => {
        const data = await APIClient.post("/rpc/'gerar_numero_protocolo');
        
        if (error) throw error;
        return data;
      });
    });
  },

  // Criar novo protocolo (cidadãos)
  async criar(dadosProtocolo: CriarProtocoloData): Promise<Protocolo> {
    return withProtocolRetry(async () => {
      const { data: user } = await APIClient.get("/auth/me");
      
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados do usuário
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (!profile) {
        throw new Error('Perfil do usuário não encontrado');
      }

      // Buscar dados do serviço
      const { data: servico } = await supabase
        .from('servicos_municipais')
        .select('*, secretaria:secretarias(*)')
        .eq('id', dadosProtocolo.servico_id)
        .single();

      if (!servico) {
        throw new Error('Serviço não encontrado');
      }

      // Preparar dados do solicitante
      const dadosSolicitante: DadosSolicitante = {
        nome_completo: profile.nome_completo,
        cpf: profile.cpf || '',
        email: profile.email,
        telefone: profile.telefone || '',
        endereco: profile.endereco
      };

      // Calcular prazos
      const now = new Date();
      const prazoResposta = new Date(now);
      prazoResposta.setDate(now.getDate() + servico.prazo_resposta_dias);
      
      const prazoResolucao = new Date(now);
      prazoResolucao.setDate(now.getDate() + servico.prazo_resolucao_dias);

      // Criar protocolo
      const data = await supabase
        .from('protocolos_completos')
        .insert({
          servico_id: dadosProtocolo.servico_id,
          solicitante_id: user.user.id,
          dados_solicitante: dadosSolicitante,
          titulo: dadosProtocolo.titulo,
          descricao: dadosProtocolo.descricao,
          dados_especificos: dadosProtocolo.dados_especificos || {},
          endereco_referencia: dadosProtocolo.endereco_referencia,
          secretaria_id: servico.secretaria_responsavel_id,
          setor_id: servico.setor_responsavel_id,
          prazo_resposta: prazoResposta.toISOString(),
          prazo_resolucao: prazoResolucao.toISOString(),
          requer_aprovacao: servico.requer_aprovacao_admin
        })
        .select(`
          *,
          servico:servicos_municipais(*),
          secretaria:secretarias(*)
        `)
        .single();

      if (error) throw error;

      // Criar notificação para a secretaria responsável (com retry separado)
      try {
        await withNotificationRetry(() => 
          this.criarNotificacao(
            servico.secretaria_responsavel_id,
            'Novo Protocolo Recebido',
            `Novo protocolo ${data.numero_protocolo}: ${dadosProtocolo.titulo}`,
            'protocolo',
            data.id
          )
        );
      } catch (notificationError) {
        // Log do erro mas não falha a criação do protocolo
        console.warn('Falha ao enviar notificação:', notificationError);
      }

      return data;
    });
  },

  // Listar protocolos do usuário atual
  async listarMeus(status?: StatusProtocolo): Promise<Protocolo[]> {
    const { data: user } = await APIClient.get("/auth/me");
    
    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('protocolos_completos')
      .select(`
        *,
        servico:servicos_municipais(*),
        secretaria:secretarias(*)
      `)
      .eq('solicitante_id', user.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const data = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Listar protocolos da secretaria (servidores)
  async listarPorSecretaria(secretariaId: string, status?: StatusProtocolo): Promise<Protocolo[]> {
    let query = supabase
      .from('protocolos_completos')
      .select(`
        *,
        servico:servicos_municipais(*),
        secretaria:secretarias(*)
      `)
      .eq('secretaria_id', secretariaId);

    if (status) {
      query = query.eq('status', status);
    }

    const data = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Buscar protocolo por ID
  async buscarPorId(id: string): Promise<Protocolo | null> {
    const data = await supabase
      .from('protocolos_completos')
      .select(`
        *,
        servico:servicos_municipais(*),
        secretaria:secretarias(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Buscar protocolo por número
  async buscarPorNumero(numero: string): Promise<Protocolo | null> {
    const data = await supabase
      .from('protocolos_completos')
      .select(`
        *,
        servico:servicos_municipais(*),
        secretaria:secretarias(*)
      `)
      .eq('numero_protocolo', numero)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Atualizar protocolo
  async atualizar(id: string, dadosProtocolo: AtualizarProtocoloData): Promise<Protocolo> {
    const data = await supabase
      .from('protocolos_completos')
      .update(dadosProtocolo)
      .eq('id', id)
      .select(`
        *,
        servico:servicos_municipais(*),
        secretaria:secretarias(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar status do protocolo
  async atualizarStatus(
    id: string, 
    novoStatus: StatusProtocolo, 
    observacoes?: string
  ): Promise<Protocolo> {
    const updates: any = { status: novoStatus };
    
    // Definir datas baseadas no status
    if (novoStatus === 'em_andamento' && !await this.jaTemPrimeiraResposta(id)) {
      updates.data_primeira_resposta = new Date().toISOString();
    }
    
    if (novoStatus === 'concluido') {
      updates.data_conclusao = new Date().toISOString();
    }

    const data = await supabase
      .from('protocolos_completos')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        servico:servicos_municipais(*),
        secretaria:secretarias(*)
      `)
      .single();

    if (error) throw error;

    // Adicionar comentário se fornecido
    if (observacoes) {
      await this.adicionarComentario(id, observacoes, 'resposta_oficial', true);
    }

    // Notificar solicitante sobre mudança de status
    await this.criarNotificacao(
      data.solicitante_id,
      'Status do Protocolo Atualizado',
      `Seu protocolo ${data.numero_protocolo} foi atualizado para: ${this.formatarStatus(novoStatus)}`,
      'protocolo',
      id
    );

    return data;
  },

  // Aprovar protocolo (admins)
  async aprovar(id: string, observacoes?: string): Promise<Protocolo> {
    const { data: user } = await APIClient.get("/auth/me");
    
    const data = await supabase
      .from('protocolos_completos')
      .update({
        aprovado: true,
        aprovado_por: user.user?.id,
        aprovado_em: new Date().toISOString(),
        observacoes_aprovacao: observacoes,
        status: 'aprovado' as StatusProtocolo
      })
      .eq('id', id)
      .select(`
        *,
        servico:servicos_municipais(*),
        secretaria:secretarias(*)
      `)
      .single();

    if (error) throw error;

    // Notificar solicitante
    await this.criarNotificacao(
      data.solicitante_id,
      'Protocolo Aprovado',
      `Seu protocolo ${data.numero_protocolo} foi aprovado pela administração`,
      'protocolo',
      id
    );

    return data;
  },

  // Rejeitar protocolo (admins)
  async rejeitar(id: string, motivo: string): Promise<Protocolo> {
    const { data: user } = await APIClient.get("/auth/me");
    
    const data = await supabase
      .from('protocolos_completos')
      .update({
        aprovado: false,
        aprovado_por: user.user?.id,
        aprovado_em: new Date().toISOString(),
        observacoes_aprovacao: motivo,
        status: 'rejeitado' as StatusProtocolo
      })
      .eq('id', id)
      .select(`
        *,
        servico:servicos_municipais(*),
        secretaria:secretarias(*)
      `)
      .single();

    if (error) throw error;

    // Notificar solicitante
    await this.criarNotificacao(
      data.solicitante_id,
      'Protocolo Rejeitado',
      `Seu protocolo ${data.numero_protocolo} foi rejeitado. Motivo: ${motivo}`,
      'protocolo',
      id
    );

    return data;
  },

  // Avaliar protocolo (cidadãos)
  async avaliar(id: string, nota: number, comentario?: string): Promise<Protocolo> {
    const data = await supabase
      .from('protocolos_completos')
      .update({
        avaliacao_nota: nota,
        avaliacao_comentario: comentario,
        avaliado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        servico:servicos_municipais(*),
        secretaria:secretarias(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Verificar se já tem primeira resposta
  async jaTemPrimeiraResposta(protocoloId: string): Promise<boolean> {
    const { data } = await supabase
      .from('protocolos_completos')
      .select('data_primeira_resposta')
      .eq('id', protocoloId)
      .single();

    return !!data?.data_primeira_resposta;
  },

  // Buscar histórico do protocolo
  async buscarHistorico(protocoloId: string): Promise<ProtocoloHistorico[]> {
    const data = await supabase
      .from('protocolos_historico')
      .select('*')
      .eq('protocolo_id', protocoloId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Buscar comentários do protocolo
  async buscarComentarios(protocoloId: string): Promise<ProtocoloComentario[]> {
    const data = await supabase
      .from('protocolos_comentarios')
      .select('*')
      .eq('protocolo_id', protocoloId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Adicionar comentário
  async adicionarComentario(
    protocoloId: string,
    comentario: string,
    tipo: 'observacao' | 'resposta_oficial' | 'solicitacao_documentos' = 'observacao',
    visivelCidadao: boolean = true
  ): Promise<ProtocoloComentario> {
    const { data: user } = await APIClient.get("/auth/me");
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('nome_completo, cargo, tipo_usuario')
      .eq('id', user.user?.id)
      .single();

    const data = await supabase
      .from('protocolos_comentarios')
      .insert({
        protocolo_id: protocoloId,
        comentario,
        tipo,
        visivel_cidadao: visivelCidadao,
        autor_id: user.user?.id,
        autor_nome: profile?.nome_completo || 'Usuário',
        autor_cargo: profile?.cargo
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar anexos do protocolo
  async buscarAnexos(protocoloId: string): Promise<ProtocoloAnexo[]> {
    const data = await supabase
      .from('protocolos_anexos')
      .select('*')
      .eq('protocolo_id', protocoloId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Adicionar anexo
  async adicionarAnexo(
    protocoloId: string,
    arquivo: File,
    tipoAnexo: 'documento' | 'comprovante' | 'foto' | 'outro' = 'documento',
    obrigatorio: boolean = false
  ): Promise<ProtocoloAnexo> {
    return withUploadRetry(async () => {
      const { data: user } = await APIClient.get("/auth/me");
      
      // Upload do arquivo para Supabase Storage
      const nomeArquivo = `${protocoloId}/${Date.now()}-${arquivo.name}`;
      const { data: uploadData, error: uploadError } = await APIClient.storage
        .from('protocolos-anexos')
        .upload(nomeArquivo, arquivo);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = APIClient.storage
        .from('protocolos-anexos')
        .getPublicUrl(nomeArquivo);

      // Salvar metadados no banco
      const data = await supabase
        .from('protocolos_anexos')
        .insert({
          protocolo_id: protocoloId,
          nome_arquivo: arquivo.name,
          tipo_arquivo: arquivo.type,
          tamanho_bytes: arquivo.size,
          url_storage: urlData.publicUrl,
          tipo_anexo: tipoAnexo,
          obrigatorio,
          uploaded_by: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  },

  // Criar notificação
  async criarNotificacao(
    usuarioId: string,
    titulo: string,
    mensagem: string,
    tipo: 'info' | 'sucesso' | 'aviso' | 'erro' | 'protocolo' = 'info',
    referenciaId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('notificacoes')
      .insert({
        usuario_id: usuarioId,
        titulo,
        mensagem,
        tipo,
        referencia_tipo: referenciaId ? 'protocolo' : null,
        referencia_id: referenciaId
      });

    if (error) throw error;
  },

  // Formatar status para exibição
  formatarStatus(status: StatusProtocolo): string {
    const statusMap: Record<StatusProtocolo, string> = {
      'aberto': 'Aberto',
      'em_andamento': 'Em Andamento',
      'aguardando_documentos': 'Aguardando Documentos',
      'aguardando_aprovacao': 'Aguardando Aprovação',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    
    return statusMap[status] || status;
  },

  // Formatar prioridade para exibição
  formatarPrioridade(prioridade: PrioridadeProtocolo): string {
    const prioridadeMap: Record<PrioridadeProtocolo, string> = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    
    return prioridadeMap[prioridade] || prioridade;
  }
};

// =====================================================
// HOOK PARA INTEGRAÇÃO COM REACT
// =====================================================

import { useState, useEffect } from 'react';
import { useAuth } from '@/auth';

export const useProtocolos = (status?: StatusProtocolo) => {
  const { profile: user } = useAuth();
  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarProtocolos = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        
        let data: Protocolo[];
        
        if (profile.tipo_usuario === 'cidadao') {
          data = await protocolosService.listarMeus(status);
        } else if (profile.secretaria_id) {
          data = await protocolosService.listarPorSecretaria(profile.secretaria_id, status);
        } else {
          data = [];
        }
        
        setProtocolos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar protocolos');
      } finally {
        setLoading(false);
      }
    };

    carregarProtocolos();
  }, [user, profile, status]);

  const recarregar = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      setError(null);
      
      let data: Protocolo[];
      
      if (profile.tipo_usuario === 'cidadao') {
        data = await protocolosService.listarMeus(status);
      } else if (profile.secretaria_id) {
        data = await protocolosService.listarPorSecretaria(profile.secretaria_id, status);
      } else {
        data = [];
      }
      
      setProtocolos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar protocolos');
    } finally {
      setLoading(false);
    }
  };

  return {
    protocolos,
    loading,
    error,
    recarregar
  };
};

export const useProtocolo = (id: string) => {
  const [protocolo, setProtocolo] = useState<Protocolo | null>(null);
  const [historico, setHistorico] = useState<ProtocoloHistorico[]>([]);
  const [comentarios, setComentarios] = useState<ProtocoloComentario[]>([]);
  const [anexos, setAnexos] = useState<ProtocoloAnexo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [protocoloData, historicoData, comentariosData, anexosData] = await Promise.all([
          protocolosService.buscarPorId(id),
          protocolosService.buscarHistorico(id),
          protocolosService.buscarComentarios(id),
          protocolosService.buscarAnexos(id)
        ]);
        
        setProtocolo(protocoloData);
        setHistorico(historicoData);
        setComentarios(comentariosData);
        setAnexos(anexosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar protocolo');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      carregarDados();
    }
  }, [id]);

  const recarregar = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      const [protocoloData, historicoData, comentariosData, anexosData] = await Promise.all([
        protocolosService.buscarPorId(id),
        protocolosService.buscarHistorico(id),
        protocolosService.buscarComentarios(id),
        protocolosService.buscarAnexos(id)
      ]);
      
      setProtocolo(protocoloData);
      setHistorico(historicoData);
      setComentarios(comentariosData);
      setAnexos(anexosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar protocolo');
    } finally {
      setLoading(false);
    }
  };

  return {
    protocolo,
    historico,
    comentarios,
    anexos,
    loading,
    error,
    recarregar
  };
};