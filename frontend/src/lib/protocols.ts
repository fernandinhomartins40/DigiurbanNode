import { APIClient } from './APIClient'
import { BaseEntity, StatusBase, StatusProcesso, PrioridadePadrao } from "@/types/common"

export interface CategoriaServicoPadrao extends BaseEntity {
  nome: string
  icone: string
  cor: string
  descricao: string
  status: StatusBase
  ordem_exibicao: number
}

export interface ServicoMunicipalPadrao extends BaseEntity {
  codigo_servico: string
  nome: string
  descricao: string
  categoria_id: string
  secretaria_id: string
  setor_id: string | null
  prazo_resposta_dias: number
  requer_documentos: boolean
  documentos_necessarios: string[]
  requer_localizacao: boolean
  taxa_servico: number
  status: StatusBase
  publico_externo: boolean
  formulario_campos: any
  instrucoes_preenchimento: string
  // Relacionamentos
  categoria?: Pick<CategoriaServicoPadrao, 'id' | 'nome' | 'icone'>
  secretaria?: any
  setor?: any
}

export interface ProtocoloPadrao extends BaseEntity {
  numero_protocolo: string
  solicitante_id: string
  servico_id: string
  secretaria_id: string
  setor_id: string | null
  responsavel_id: string | null
  titulo: string
  descricao: string
  dados_formulario: any
  localizacao_referencia: any
  data_abertura: string
  data_prazo: string
  data_conclusao: string | null
  status: 'aberto' | 'em_andamento' | 'aguardando_documentos' | 'aguardando_aprovacao' | 'aprovado' | 'rejeitado' | 'concluido' | 'cancelado'
  prioridade: PrioridadePadrao
  avaliacao: number | null
  comentario_avaliacao: string | null
  data_avaliacao: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  servico?: Pick<ServicoMunicipalPadrao, 'id' | 'nome' | 'codigo_servico'>
  solicitante?: any
  responsavel?: any
  secretaria?: any
  historico?: ProtocoloHistoricoPadrao[]
  anexos?: ProtocoloAnexoPadrao[]
}

export interface ProtocoloHistoricoPadrao extends BaseEntity {
  protocolo_id: string
  usuario_id: string
  acao: string
  status_anterior: string | null
  status_novo: string | null
  observacoes: string | null
  usuario?: any
}

export interface ProtocoloAnexoPadrao extends BaseEntity {
  protocolo_id: string
  usuario_id: string
  nome_arquivo: string
  tipo_arquivo: string
  tamanho_bytes: number
  url_arquivo: string
  descricao: string | null
}

export interface NotificacaoPadrao extends BaseEntity {
  usuario_id: string
  protocolo_id: string | null
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  protocolo?: Pick<ProtocoloPadrao, 'id' | 'numero_protocolo' | 'titulo'>
}

export const protocolService = {
  // Buscar categorias de serviços
  async getCategorias(): Promise<CategoriaServicoPadrao[]> {
    const { data, error } = await APIClient
      .from('categorias_servicos')
      .select('*')
      .eq('ativo', true)
      .order('ordem')
    
    if (error) throw error
    return data || []
  },

  // Buscar serviços por categoria
  async getServicosByCategoria(categoriaId: string): Promise<ServicoMunicipalPadrao[]> {
    const { data, error } = await APIClient
      .from('servicos_municipais')
      .select(`
        *,
        categoria:categorias_servicos(*),
        secretaria:secretarias(*)
      `)
      .eq('categoria_id', categoriaId)
      .eq('ativo', true)
      .order('nome')
    
    if (error) throw error
    return data || []
  },

  // Buscar todos os serviços públicos
  async getServicosPublicos(): Promise<ServicoMunicipalPadrao[]> {
    const { data, error } = await APIClient
      .from('servicos_municipais')
      .select(`
        *,
        categoria:categorias_servicos(*),
        secretaria:secretarias(*)
      `)
      .eq('ativo', true)
      .order('nome')
    
    if (error) throw error
    return data || []
  },

  // Buscar serviço por ID
  async getServicoById(id: string): Promise<ServicoMunicipalPadrao | null> {
    const { data, error } = await APIClient
      .from('servicos_municipais')
      .select(`
        *,
        categoria:categorias_servicos(*),
        secretaria:secretarias(*),
        setor:setores(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // Criar novo protocolo
  async criarProtocolo(dados: {
    servico_id: string
    titulo: string
    descricao: string
    dados_formulario?: any
    localizacao?: any
  }): Promise<ProtocoloPadrao> {
    const { data: { user } } = await APIClient.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar dados do serviço
    const servico = await this.getServicoById(dados.servico_id)
    if (!servico) throw new Error('Serviço não encontrado')

    const { data, error } = await APIClient
      .from('protocolos_completos')
      .insert([{
        solicitante_id: user.id,
        servico_id: dados.servico_id,
        secretaria_id: servico.secretaria_id,
        setor_id: servico.setor_id,
        titulo: dados.titulo,
        descricao: dados.descricao,
        dados_formulario: dados.dados_formulario,
        localizacao: dados.localizacao,
        status: 'aberto',
        prioridade: 'media'
      }])
      .select(`
        *,
        servico:servicos_municipais(*),
        secretaria:secretarias(*)
      `)
      .single()
    
    if (error) throw error
    
    // Registrar no histórico
    await this.adicionarHistorico(data.id, 'criado', null, 'aberto', 'Protocolo criado pelo cidadão')
    
    return data
  },

  // Buscar protocolos do usuário
  async getProtocolosUsuario(status?: string): Promise<ProtocoloPadrao[]> {
    const { data: { user } } = await APIClient.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    let query = APIClient
      .from('protocolos_completos')
      .select(`
        *,
        servico:servicos_municipais(nome, codigo),
        secretaria:secretarias(nome, sigla)
      `)
      .eq('solicitante_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  // Buscar protocolos para atendimento (servidores)
  async getProtocolosAtendimento(filtros?: {
    status?: string
    secretaria_id?: string
    responsavel_id?: string
  }): Promise<ProtocoloPadrao[]> {
    let query = APIClient
      .from('protocolos_completos')
      .select(`
        *,
        servico:servicos_municipais(nome, codigo),
        solicitante:user_profiles(nome_completo, email),
        responsavel:user_profiles(nome_completo),
        secretaria:secretarias(nome, sigla)
      `)
      .order('created_at', { ascending: false })

    if (filtros?.status) {
      query = query.eq('status', filtros.status)
    }
    if (filtros?.secretaria_id) {
      query = query.eq('secretaria_id', filtros.secretaria_id)
    }
    if (filtros?.responsavel_id) {
      query = query.eq('responsavel_id', filtros.responsavel_id)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  // Buscar protocolo por ID
  async getProtocoloById(id: string): Promise<ProtocoloPadrao | null> {
    const { data, error } = await APIClient
      .from('protocolos_completos')
      .select(`
        *,
        servico:servicos_municipais(*),
        solicitante:user_profiles(nome_completo, email, telefone),
        responsavel:user_profiles(nome_completo, email),
        secretaria:secretarias(nome, sigla)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // Buscar histórico do protocolo
  async getHistoricoProtocolo(protocoloId: string): Promise<ProtocoloHistoricoPadrao[]> {
    const { data, error } = await APIClient
      .from('protocolos_historico')
      .select(`
        *,
        usuario:user_profiles(nome_completo)
      `)
      .eq('protocolo_id', protocoloId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Atualizar status do protocolo
  async atualizarStatus(
    protocoloId: string, 
    novoStatus: string, 
    observacoes?: string,
    responsavelId?: string
  ): Promise<void> {
    const { data: { user } } = await APIClient.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar protocolo atual
    const protocolo = await this.getProtocoloById(protocoloId)
    if (!protocolo) throw new Error('Protocolo não encontrado')

    const updateData: any = {
      status: novoStatus,
      updated_at: new Date().toISOString()
    }

    if (responsavelId) {
      updateData.responsavel_id = responsavelId
    }

    if (novoStatus === 'concluido') {
      updateData.data_conclusao = new Date().toISOString()
    }

    const { error } = await APIClient
      .from('protocolos_completos')
      .update(updateData)
      .eq('id', protocoloId)
    
    if (error) throw error

    // Registrar no histórico
    await this.adicionarHistorico(
      protocoloId, 
      'mudanca_status', 
      protocolo.status, 
      novoStatus, 
      observacoes
    )
  },

  // Assumir responsabilidade por protocolo
  async assumirProtocolo(protocoloId: string, observacoes?: string): Promise<void> {
    const { data: { user } } = await APIClient.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    await this.atualizarStatus(protocoloId, 'em_andamento', observacoes, user.id)
  },

  // Adicionar observação no histórico
  async adicionarHistorico(
    protocoloId: string,
    acao: string,
    statusAnterior?: string | null,
    statusNovo?: string | null,
    observacoes?: string | null
  ): Promise<void> {
    const { data: { user } } = await APIClient.auth.getUser()
    if (!user) return

    const { error } = await APIClient
      .from('protocolos_historico')
      .insert([{
        protocolo_id: protocoloId,
        usuario_id: user.id,
        acao,
        status_anterior: statusAnterior,
        status_novo: statusNovo,
        observacoes
      }])
    
    if (error) throw error
  },

  // Buscar estatísticas de protocolos
  async getEstatisticasUsuario(): Promise<{
    abertos: number
    em_andamento: number
    concluidos: number
    total: number
  }> {
    const { data: { user } } = await APIClient.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await APIClient
      .from('protocolos_completos')
      .select('status')
      .eq('solicitante_id', user.id)
    
    if (error) throw error

    const stats = {
      abertos: 0,
      em_andamento: 0,
      concluidos: 0,
      total: data?.length || 0
    }

    data?.forEach(p => {
      if (['aberto', 'aguardando_documentos', 'aguardando_aprovacao'].includes(p.status)) {
        stats.abertos++
      } else if (['em_andamento', 'aprovado'].includes(p.status)) {
        stats.em_andamento++
      } else if (p.status === 'concluido') {
        stats.concluidos++
      }
    })

    return stats
  },

  // Avaliar protocolo
  async avaliarProtocolo(
    protocoloId: string, 
    avaliacao: number, 
    comentario?: string
  ): Promise<void> {
    const { error } = await APIClient
      .from('protocolos_completos')
      .update({
        avaliacao,
        comentario_avaliacao: comentario,
        data_avaliacao: new Date().toISOString()
      })
      .eq('id', protocoloId)
    
    if (error) throw error

    // Registrar no histórico
    await this.adicionarHistorico(
      protocoloId,
      'avaliado',
      null,
      null,
      `Cidadão avaliou com ${avaliacao} estrela(s)`
    )
  }
}