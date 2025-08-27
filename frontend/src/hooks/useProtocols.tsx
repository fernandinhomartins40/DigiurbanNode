// =====================================================
// HOOK UNIFICADO PARA SISTEMA DE PROTOCOLOS - FASE 3
// Migração para padrões CRUD unificados
// =====================================================

import { useProtocolsUnified } from './useProtocolsUnified'
import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { toast } from 'react-hot-toast'
import type {
  Protocolo,
  CreateProtocoloInput,
  UpdateProtocoloInput,
  ServicoMunicipal
} from './useProtocolsUnified'

// =====================================================
// INTERFACES LEGADAS PARA COMPATIBILIDADE
// =====================================================

// Aliases para manter compatibilidade com código existente
export type ProtocoloCompleto = Protocolo
export type NovoProtocolo = CreateProtocoloInput

export interface HistoricoTramitacao {
  id: string
  protocolo_id: string
  usuario_id: string
  status_anterior?: string
  status_novo?: string
  acao: string
  comentario?: string
  comentario_publico: boolean
  secretaria_origem_id?: string
  secretaria_destino_id?: string
  funcionario_origem_id?: string
  funcionario_destino_id?: string
  anexos?: string[]
  metadados?: any
  created_at: string
  usuario?: {
    nome: string
  }
  secretaria_origem?: {
    nome: string
  }
  secretaria_destino?: {
    nome: string
  }
}

// Exportar interfaces do hook unificado
export { ServicoMunicipal }

export const useProtocols = () => {
  // Hook unificado como base
  const unifiedHook = useProtocolsUnified()
  
  // Estados locais para funcionalidades específicas
  const [protocols, setProtocols] = useState<ProtocoloCompleto[]>([])
  const [protocolHistory, setProtocolHistory] = useState<HistoricoTramitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // CARREGAR DADOS INICIAIS
  // =====================================================

  useEffect(() => {
    loadServices()
    loadMyProtocols()
  }, [])

  // Usar função unificada para carregar serviços
  const loadServices = async () => {
    try {
      const result = await unifiedHook.getServicoList({
        filters: { ativo: true },
        page: 1,
        limit: 1000 // Carregar todos os serviços ativos
      })
      
      if (!result.success && result.message) {
        setError('Erro ao carregar catálogo de serviços')
      }
    } catch (err) {
      console.error('Erro ao carregar serviços:', err)
      setError('Erro ao carregar catálogo de serviços')
    }
  }

  // Usar função unificada para carregar protocolos do usuário
  const loadMyProtocols = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const result = await unifiedHook.getProtocoloList({
        filters: { cidadao_id: user.id },
        page: 1,
        limit: 100
      })
      
      if (!result.success && result.message) {
        console.error('Erro ao carregar meus protocolos')
      }
    } catch (err) {
      console.error('Erro ao carregar meus protocolos:', err)
    }
  }

  const loadProtocolsForFunctionary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar perfil do usuário para verificar secretaria
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('secretaria_id, tipo_usuario')
        .eq('id', user.id)
        .single()

      if (!profile) return

      let filters: any = {}
      
      // Super admin e admin veem todos, outros apenas da sua secretaria ou atribuídos
      if (!['super_admin', 'admin'].includes(profile.role)) {
        filters = {
          $or: [
            { secretaria_id: profile.secretaria_id },
            { funcionario_responsavel_id: user.id }
          ]
        }
      }

      const result = await unifiedHook.getProtocoloList({
        filters,
        page: 1,
        limit: 100
      })

      if (result.success && result.data) {
        setProtocols(result.data)
      }
    } catch (err) {
      console.error('Erro ao carregar protocolos:', err)
    }
  }

  // =====================================================
  // CRIAÇÃO DE PROTOCOLOS - USANDO PADRÕES UNIFICADOS
  // =====================================================

  const createProtocol = async (protocolData: NovoProtocolo): Promise<ProtocoloCompleto | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Usuário não autenticado')
        return null
      }

      // Buscar dados do serviço
      const servico = await unifiedHook.getServicoById(protocolData.servico_id)
      if (!servico) {
        toast.error('Serviço não encontrado')
        return null
      }

      // Usar função unificada para criar protocolo
      const result = await unifiedHook.createProtocolo({
        ...protocolData,
        cidadao_id: user.id
      })

      if (result.success && result.data) {
        // Registrar no histórico
        await addProtocolHistory(
          result.data.id, 
          'Protocolo criado', 
          'Solicitação registrada pelo cidadão', 
          true
        )

        // Recarregar lista usando hook unificado
        await loadMyProtocols()

        toast.success(`Protocolo ${result.data.numero_protocolo} criado com sucesso!`)
        return result.data
      } else {
        toast.error(result.message || 'Erro ao criar protocolo')
        return null
      }
    } catch (err) {
      console.error('Erro ao criar protocolo:', err)
      toast.error('Erro ao criar protocolo')
      return null
    }
  }

  // =====================================================
  // TRAMITAÇÃO DE PROTOCOLOS - USANDO PADRÕES UNIFICADOS
  // =====================================================

  const updateProtocolStatus = async (
    protocolId: string, 
    newStatus: ProtocoloCompleto['status'], 
    comment?: string,
    isPublicComment: boolean = true
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar status atual usando hook unificado
      const currentProtocol = await unifiedHook.getProtocoloById(protocolId)
      if (!currentProtocol) {
        toast.error('Protocolo não encontrado')
        return
      }

      // Usar função especializada do hook unificado
      const result = await unifiedHook.updateProtocoloStatus(protocolId, newStatus, comment)
      
      if (result.success) {
        // Registrar histórico
        await addProtocolHistory(
          protocolId, 
          `Status alterado: ${currentProtocol.status} → ${newStatus}`,
          comment,
          isPublicComment,
          currentProtocol.status,
          newStatus
        )

        // Recarregar listas
        await loadProtocolsForFunctionary()
        await loadMyProtocols()

        toast.success(`Protocolo ${currentProtocol.numero_protocolo} atualizado`)
      } else {
        toast.error(result.message || 'Erro ao atualizar protocolo')
      }
    } catch (err) {
      console.error('Erro ao atualizar protocolo:', err)
      toast.error('Erro ao atualizar protocolo')
    }
  }

  const assignProtocol = async (protocolId: string, functionaryId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const assigneeId = functionaryId || user.id

      // Usar função especializada do hook unificado
      const result = await unifiedHook.assignProtocolo(protocolId, assigneeId)
      
      if (result.success) {
        await addProtocolHistory(
          protocolId,
          'Protocolo assumido',
          functionaryId ? `Protocolo atribuído a outro funcionário` : 'Protocolo assumido pelo funcionário',
          false,
          'aberto',
          'em_andamento'
        )

        toast.success('Protocolo assumido com sucesso')
        await loadProtocolsForFunctionary()
      } else {
        toast.error(result.message || 'Erro ao assumir protocolo')
      }
    } catch (err) {
      console.error('Erro ao assumir protocolo:', err)
      toast.error('Erro ao assumir protocolo')
    }
  }

  const forwardProtocol = async (protocolId: string, targetSecretariaId: string, comment?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar dados atuais
      const { data: currentProtocol } = await supabase
        .from('protocolos_completos')
        .select('secretaria_id, funcionario_responsavel_id')
        .eq('id', protocolId)
        .single()

      if (!currentProtocol) return

      // Atualizar protocolo
      const { error } = await supabase
        .from('protocolos_completos')
        .update({ 
          secretaria_id: targetSecretariaId,
          funcionario_responsavel_id: null // Remove responsável atual
        })
        .eq('id', protocolId)

      if (error) throw error

      // Registrar encaminhamento no histórico
      const { error: historyError } = await supabase
        .from('protocolo_historico')
        .insert([{
          protocolo_id: protocolId,
          usuario_id: user.id,
          acao: 'Protocolo encaminhado',
          comentario: comment,
          comentario_publico: true,
          secretaria_origem_id: currentProtocol.secretaria_id,
          secretaria_destino_id: targetSecretariaId,
          funcionario_origem_id: currentProtocol.funcionario_responsavel_id
        }])

      if (historyError) throw historyError

      toast.success('Protocolo encaminhado com sucesso')
      await loadProtocolsForFunctionary()
    } catch (err) {
      console.error('Erro ao encaminhar protocolo:', err)
      toast.error('Erro ao encaminhar protocolo')
    }
  }

  // =====================================================
  // HISTÓRICO E COMENTÁRIOS
  // =====================================================

  const addProtocolHistory = async (
    protocolId: string,
    action: string,
    comment?: string,
    isPublic: boolean = true,
    oldStatus?: string,
    newStatus?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('protocolo_historico')
        .insert([{
          protocolo_id: protocolId,
          usuario_id: user.id,
          status_anterior: oldStatus,
          status_novo: newStatus,
          acao: action,
          comentario: comment,
          comentario_publico: isPublic
        }])

      if (error) throw error
    } catch (err) {
      console.error('Erro ao adicionar histórico:', err)
    }
  }

  const loadProtocolHistory = async (protocolId: string) => {
    try {
      const { data, error } = await supabase
        .from('protocolo_historico')
        .select(`
          *,
          usuario:user_profiles(nome),
          secretaria_origem:secretarias!secretaria_origem_id(nome),
          secretaria_destino:secretarias!secretaria_destino_id(nome)
        `)
        .eq('protocolo_id', protocolId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setProtocolHistory(data || [])
    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
    }
  }

  const addComment = async (protocolId: string, comment: string, isPublic: boolean = true) => {
    await addProtocolHistory(protocolId, 'Comentário adicionado', comment, isPublic)
    await loadProtocolHistory(protocolId)
  }

  // =====================================================
  // AVALIAÇÃO - USANDO PADRÕES UNIFICADOS
  // =====================================================

  const evaluateProtocol = async (protocolId: string, rating: number, comment?: string) => {
    try {
      // Usar função especializada do hook unificado
      const result = await unifiedHook.evaluateProtocolo(protocolId, rating, comment)
      
      if (result.success) {
        await addProtocolHistory(
          protocolId,
          'Protocolo avaliado',
          `Avaliação: ${rating}/5 estrelas. ${comment || ''}`,
          false
        )

        toast.success('Avaliação registrada com sucesso!')
        await loadMyProtocols()
      } else {
        toast.error(result.message || 'Erro ao avaliar protocolo')
      }
    } catch (err) {
      console.error('Erro ao avaliar protocolo:', err)
      toast.error('Erro ao avaliar protocolo')
    }
  }

  // =====================================================
  // BUSCA E FILTROS - USANDO PADRÕES UNIFICADOS
  // =====================================================

  const searchServices = async (query: string, category?: string) => {
    const filters: any = {}
    if (category && category !== 'all') {
      filters.categoria = category
    }
    
    // Usar função de busca unificada
    const result = await unifiedHook.searchServicos(query, {
      fields: ['nome', 'descricao', 'categoria'],
      filters
    })
    
    return result.success ? result.data : []
  }

  const filterProtocols = async (
    status?: string,
    priority?: string,
    secretaria?: string,
    overdue?: boolean
  ) => {
    const filters: any = {}
    
    if (status && status !== 'all') {
      filters.status = status
    }
    
    if (priority && priority !== 'all') {
      filters.prioridade = priority
    }
    
    if (secretaria && secretaria !== 'all') {
      filters.secretaria_id = secretaria
    }
    
    let result
    if (overdue) {
      result = await unifiedHook.getProtocolosOverdue()
    } else {
      result = await unifiedHook.getProtocoloList({ filters, page: 1, limit: 100 })
    }
    
    return result.success ? result.data : []
  }

  // =====================================================
  // CONSULTA PÚBLICA - USANDO PADRÕES UNIFICADOS
  // =====================================================

  const getProtocolByNumber = async (protocolNumber: string): Promise<ProtocoloCompleto | null> => {
    try {
      // Usar função especializada do hook unificado
      return await unifiedHook.getProtocoloByNumber(protocolNumber)
    } catch (err) {
      console.error('Erro ao buscar protocolo:', err)
      return null
    }
  }

  // =====================================================
  // ESTATÍSTICAS E MÉTRICAS - USANDO PADRÕES UNIFICADOS
  // =====================================================

  const getProtocolStats = () => {
    // Usar função especializada do hook unificado
    return unifiedHook.getProtocoloStats()
  }

  return {
    // Estados do hook unificado
    services: unifiedHook.services,
    protocols: unifiedHook.protocolos,
    myProtocols: unifiedHook.protocolos, // Filtrar no futuro se necessário
    protocolHistory,
    loading: unifiedHook.loading,
    error: unifiedHook.error,

    // Carregamento
    loadServices,
    loadMyProtocols,
    loadProtocolsForFunctionary,
    loadProtocolHistory,

    // Criação e tramitação (usando padrões unificados)
    createProtocol,
    updateProtocolStatus,
    assignProtocol,
    forwardProtocol,

    // Histórico e comentários
    addComment,
    addProtocolHistory,

    // Avaliação
    evaluateProtocol,

    // Busca e filtros (usando padrões unificados)
    searchServices,
    filterProtocols,
    getProtocolByNumber,

    // Estatísticas (usando padrões unificados)
    getProtocolStats,

    // Expor funções unificadas adicionais
    ...unifiedHook
  }
}