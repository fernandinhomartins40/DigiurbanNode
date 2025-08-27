// =====================================================
// HOOK UNIFICADO PARA PROTOCOLOS - FASE 3
// Implementação exemplo seguindo padrões CRUD
// =====================================================

import { useUnifiedCrud } from "@/lib/unified-hooks"
import { protocoloSchema, servicoMunicipalSchema } from "@/lib/validation-schemas"
import { z } from 'zod'

// =====================================================
// TYPES DERIVADOS DOS SCHEMAS ZOD
// =====================================================

export type Protocolo = z.infer<typeof protocoloSchema>
const protocoloCreateSchema = protocoloSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  numero_protocolo: true, // Gerado automaticamente
})

export type CreateProtocoloInput = z.infer<typeof protocoloCreateSchema>
export type UpdateProtocoloInput = Partial<CreateProtocoloInput>

export type ServicoMunicipal = z.infer<typeof servicoMunicipalSchema>

// =====================================================
// HOOK UNIFICADO PARA PROTOCOLOS
// =====================================================

export function useProtocolsUnified() {
  // Hook base com configurações específicas para protocolos
  const protocolsHook = useUnifiedCrud<Protocolo, CreateProtocoloInput, UpdateProtocoloInput>({
    entityName: 'Protocolo',
    tableName: 'protocolos_completos',
    validationSchema: protocoloSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
      numero_protocolo: true,
    }),
    searchFields: ['numero_protocolo', 'assunto', 'descricao'],
    defaultSort: {
      field: 'created_at',
      order: 'desc'
    },
    pageSize: 20,
    enableSoftDelete: true,
    enableAudit: true
  })

  // Hook para serviços municipais (usado no formulário de criação)
  const servicesHook = useUnifiedCrud<ServicoMunicipal>({
    entityName: 'Serviço Municipal',
    tableName: 'servicos_municipais',
    validationSchema: servicoMunicipalSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
    }),
    searchFields: ['nome', 'descricao', 'categoria'],
    defaultSort: {
      field: 'nome',
      order: 'asc'
    },
    pageSize: 50
  })

  // =====================================================
  // FUNÇÕES ESPECIALIZADAS PARA PROTOCOLOS
  // Seguindo nomenclatura padrão: {operation}{Entity}
  // =====================================================

  const createProtocolo = async (data: CreateProtocoloInput) => {
    // Transformar dados antes de enviar para o hook base
    const protocolData = {
      ...data,
      // Número do protocolo será gerado pelo trigger no banco
      status: 'aberto' as const,
      prioridade: data.prioridade || 'normal' as const
    }

    return protocolsHook.createEntity(protocolData)
  }

  const getProtocoloById = protocolsHook.getEntityById

  const getProtocoloList = protocolsHook.getEntityList

  const updateProtocolo = protocolsHook.updateEntity

  const deleteProtocolo = protocolsHook.deleteEntity

  const softProtocoloDelete = protocolsHook.softEntityDelete

  const searchProtocolos = protocolsHook.searchEntity

  const bulkProtocoloCreate = protocolsHook.bulkEntityCreate

  const bulkProtocoloUpdate = protocolsHook.bulkEntityUpdate

  const bulkProtocoloDelete = protocolsHook.bulkEntityDelete

  // =====================================================
  // FUNÇÕES ESPECIALIZADAS PARA SERVIÇOS
  // =====================================================

  const getServicoById = servicesHook.getEntityById

  const getServicoList = servicesHook.getEntityList

  const searchServicos = servicesHook.searchEntity

  // =====================================================
  // FUNÇÕES ESPECIALIZADAS DE NEGÓCIO
  // =====================================================

  const updateProtocoloStatus = async (
    id: string, 
    newStatus: Protocolo['status'],
    comment?: string
  ) => {
    const updateData: UpdateProtocoloInput = {
      status: newStatus
    }

    // Se estiver concluindo, adicionar data de conclusão
    if (newStatus === 'concluido') {
      updateData.data_conclusao = new Date().toISOString().split('T')[0]
    }

    return updateProtocolo(id, updateData)
  }

  const assignProtocolo = async (
    protocoloId: string, 
    funcionarioId: string
  ) => {
    return updateProtocolo(protocoloId, {
      funcionario_responsavel_id: funcionarioId,
      status: 'em_andamento'
    })
  }

  const evaluateProtocolo = async (
    protocoloId: string,
    rating: number,
    comment?: string
  ) => {
    return updateProtocolo(protocoloId, {
      avaliacao_nota: rating,
      avaliacao_comentario: comment,
      avaliado_em: new Date().toISOString().split('T')[0]
    })
  }

  // Busca por número do protocolo (consulta pública)
  const getProtocoloByNumber = async (numeroProtocolo: string) => {
    const result = await searchProtocolos(numeroProtocolo, {
      fields: ['numero_protocolo'],
      exact_match: true
    })
    
    return result.data.length > 0 ? result.data[0] : null
  }

  // Filtros especializados para protocolos
  const filterProtocolosByStatus = (status: string) => {
    return getProtocoloList({
      filters: { status },
      page: 1,
      limit: protocolsHook.pageSize || 20
    })
  }

  const filterProtocolosByPriority = (prioridade: string) => {
    return getProtocoloList({
      filters: { 
        // Usar campo customizado para prioridade
        created_at_start: undefined,
        created_at_end: undefined,
        status: undefined,
        search: undefined
      },
      page: 1,
      limit: protocolsHook.pageSize || 20
    })
  }

  const getProtocolosOverdue = () => {
    const today = new Date().toISOString().split('T')[0]
    return getProtocoloList({
      filters: {
        // Filtrar protocolos vencidos (data_vencimento < hoje e status != concluido)
        created_at_end: today,
        status: 'aberto'
      }
    })
  }

  // =====================================================
  // ESTATÍSTICAS E MÉTRICAS
  // =====================================================

  const getProtocoloStats = () => {
    const { items } = protocolsHook
    
    const stats = {
      total: items.length,
      byStatus: items.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byPriority: items.reduce((acc, p) => {
        acc[p.prioridade] = (acc[p.prioridade] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      overdue: items.filter(p => 
        p.data_vencimento && 
        new Date(p.data_vencimento) < new Date() &&
        !['concluido', 'cancelado'].includes(p.status)
      ).length,
      avgRating: items
        .filter(p => p.avaliacao_nota)
        .reduce((acc, p) => acc + (p.avaliacao_nota || 0), 0) / 
        items.filter(p => p.avaliacao_nota).length || 0
    }

    return stats
  }

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    // Estados do hook base
    protocolos: protocolsHook.items,
    loading: protocolsHook.loading,
    error: protocolsHook.error,
    currentPage: protocolsHook.currentPage,
    totalPages: protocolsHook.totalPages,
    totalItems: protocolsHook.totalItems,

    // Estados dos serviços
    services: servicesHook.items,
    servicesLoading: servicesHook.loading,

    // Operações CRUD padronizadas - Protocolos
    createProtocolo,
    getProtocoloById,
    getProtocoloList,
    updateProtocolo,
    deleteProtocolo,
    softProtocoloDelete,
    searchProtocolos,
    bulkProtocoloCreate,
    bulkProtocoloUpdate,
    bulkProtocoloDelete,

    // Operações CRUD padronizadas - Serviços
    getServicoById,
    getServicoList,
    searchServicos,

    // Operações especializadas de negócio
    updateProtocoloStatus,
    assignProtocolo,
    evaluateProtocolo,
    getProtocoloByNumber,

    // Filtros especializados
    filterProtocolosByStatus,
    filterProtocolosByPriority,
    getProtocolosOverdue,

    // Estatísticas
    getProtocoloStats,

    // Utilitários do hook base
    refreshEntity: protocolsHook.refreshEntity,
    clearError: protocolsHook.clearError,
    resetState: protocolsHook.resetState,

    // Utilitários dos serviços
    refreshServices: servicesHook.refreshEntity
  }
}

// =====================================================
// EXEMPLO DE USO DO HOOK
// =====================================================

/*
// Em um componente React:

const ProtocolosPage = () => {
  const {
    protocolos,
    loading,
    error,
    createProtocolo,
    updateProtocoloStatus,
    searchProtocolos,
    getProtocoloStats
  } = useProtocolsUnified()

  const handleCreateProtocolo = async (data) => {
    const result = await createProtocolo({
      cidadao_id: user.id,
      servico_id: selectedService.id,
      secretaria_id: selectedService.secretaria_id,
      assunto: data.assunto,
      descricao: data.descricao,
      prioridade: data.prioridade || 'normal'
    })

    if (result.success) {
      console.log('Protocolo criado:', result.data)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    await updateProtocoloStatus(id, status, 'Status atualizado pelo sistema')
  }

  const handleSearch = async (query) => {
    const results = await searchProtocolos(query)
    console.log('Resultados da busca:', results.data)
  }

  const stats = getProtocoloStats()

  return (
    <div>
      <h1>Protocolos</h1>
      <div>Total: {stats.total}</div>
      <div>Em aberto: {stats.byStatus.aberto || 0}</div>
      <div>Vencidos: {stats.overdue}</div>
      
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      
      <ul>
        {protocolos.map(protocolo => (
          <li key={protocolo.id}>
            {protocolo.numero_protocolo} - {protocolo.assunto}
            <button onClick={() => handleUpdateStatus(protocolo.id, 'em_andamento')}>
              Assumir
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
*/