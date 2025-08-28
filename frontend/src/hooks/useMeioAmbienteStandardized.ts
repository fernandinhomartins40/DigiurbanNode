// =====================================================
// HOOK PADRONIZADO MEIO AMBIENTE - FASE 3
// Seguindo common.ts e padrões React Query
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { APIClient } from "@/auth/utils/httpInterceptor"
import { toast } from 'react-hot-toast'
import type { 
  BaseEntity, 
  StatusBase, 
  StatusProcesso,
  PrioridadePadrao,
  EnderecoPadrao,
  ContatoPadrao
} from "@/types/common"

// =====================================================
// TIPOS PADRONIZADOS MEIO AMBIENTE
// =====================================================

export interface LicencaAmbiental extends BaseEntity {
  tenant_id: string
  
  // Requerente
  requerente_nome: string
  requerente_cpf_cnpj: string
  requerente_contato: ContatoPadrao
  
  // Atividade
  tipo_licenca: 'previa' | 'instalacao' | 'operacao' | 'corretiva' | 'renovacao'
  atividade_descricao: string
  endereco_atividade: string
  area_impactada_hectares?: number
  
  // Impacto ambiental
  nivel_impacto: 'baixo' | 'medio' | 'alto' | 'muito_alto'
  recursos_naturais_afetados: string[]
  medidas_mitigadoras?: string[]
  
  // Documentação
  estudos_exigidos: string[]
  documentos_apresentados: string[]
  documentos_faltantes?: string[]
  
  // Processo
  numero_processo: string
  data_protocolo: string
  prazo_analise: string
  tecnico_responsavel_id?: string
  
  // Decisão
  parecer_tecnico?: string
  condicoes_aprovacao?: string[]
  taxa_ambiental?: number
  validade_meses?: number
  
  // Vistoria
  vistoria_necessaria: boolean
  data_vistoria?: string
  relatorio_vistoria?: string
  
  status: 'protocolada' | 'em_analise' | 'vistoria_agendada' | 'aguardando_documentos' | 'aprovada' | 'negada' | 'suspensa'
}

export interface MonitoramentoAmbiental extends BaseEntity {
  tenant_id: string
  
  // Local
  local_monitoramento: string
  coordenadas?: {
    latitude: number
    longitude: number
  }
  
  // Tipo
  tipo_monitoramento: 'qualidade_ar' | 'qualidade_agua' | 'ruido' | 'solo' | 'vegetacao' | 'fauna' | 'residuos'
  periodicidade: 'diaria' | 'semanal' | 'mensal' | 'bimestral' | 'semestral' | 'anual'
  
  // Coleta
  data_coleta: string
  hora_coleta: string
  responsavel_coleta: string
  metodo_coleta: string
  equipamentos_utilizados?: string[]
  
  // Parâmetros analisados
  parametros_medidos: Record<string, any>
  valores_referencia: Record<string, any>
  unidades_medida: Record<string, any>
  
  // Resultados
  resultados_conformes: boolean
  parametros_alterados?: string[]
  nivel_alteracao?: 'leve' | 'moderado' | 'grave' | 'critico'
  
  // Análise
  laboratorio_analise?: string
  certificado_analise?: string
  observacoes?: string
  
  // Ações
  acoes_corretivas?: string[]
  prazo_correcao?: string
  acompanhamento_necessario: boolean
  
  status: 'coletado' | 'analisando' | 'concluido' | 'requer_acao'
}

export interface AreaProtegida extends BaseEntity {
  tenant_id: string
  
  // Identificação
  nome: string
  tipo_protecao: 'app' | 'reserva_legal' | 'parque' | 'apa' | 'rppn' | 'nascente' | 'mata_ciliar' | 'unidade_conservacao'
  categoria: 'federal' | 'estadual' | 'municipal' | 'privada'
  
  // Localização
  endereco_referencia: string
  coordenadas_poligono: unknown[] // GeoJSON polygon
  area_hectares: number
  perimetro_metros: number
  
  // Legal
  decreto_criacao?: string
  lei_referencia?: string
  data_criacao: string
  plano_manejo?: string
  
  // Características
  bioma_predominante: string
  tipos_vegetacao: string[]
  especies_flora?: string[]
  especies_fauna?: string[]
  recursos_hidricos?: string[]
  
  // Uso e acesso
  visitacao_permitida: boolean
  atividades_permitidas?: string[]
  restricoes_uso: string[]
  trilhas_existentes: boolean
  
  // Ameaças e conservação
  ameacas_identificadas?: string[]
  nivel_degradacao: 'pristina' | 'bem_conservada' | 'moderadamente_alterada' | 'muito_alterada' | 'degradada'
  acoes_conservacao?: string[]
  
  // Gestão
  orgao_gestor: string
  responsavel_gestao?: string
  contato_gestao?: ContatoPadrao
  orcamento_anual?: number
  
  status: StatusBase
}

export interface OcorrenciaAmbiental extends BaseEntity {
  tenant_id: string
  
  // Identificação
  numero_ocorrencia: string
  tipo: 'poluicao_ar' | 'poluicao_agua' | 'poluicao_solo' | 'desmatamento' | 'queimada' | 'descarte_irregular' | 'ruido' | 'outros'
  gravidade: 'baixa' | 'media' | 'alta' | 'critica'
  
  // Local
  endereco_ocorrencia: string
  coordenadas?: {
    latitude: number
    longitude: number
  }
  area_afetada_m2?: number
  
  // Denúncia
  denunciante_nome?: string
  denunciante_contato?: ContatoPadrao
  denunciante_anonimo: boolean
  data_denuncia: string
  
  // Ocorrência
  data_ocorrencia: string
  hora_ocorrencia?: string
  descricao_detalhada: string
  possivel_causador?: string
  testemunhas?: string[]
  
  // Vistoria
  data_vistoria?: string
  fiscal_responsavel?: string
  situacao_encontrada?: string
  evidencias_coletadas?: string[]
  fotos_anexadas?: string[]
  
  // Impacto
  recursos_afetados: string[]
  dano_ambiental_estimado?: string
  risco_saude_publica: boolean
  especies_afetadas?: string[]
  
  // Providências
  medidas_emergenciais?: string[]
  auto_infracao_lavrado: boolean
  numero_auto_infracao?: string
  valor_multa?: number
  prazo_regularizacao?: string
  
  // Acompanhamento
  monitoramento_necessario: boolean
  acoes_remediacoes?: string[]
  responsavel_recuperacao?: string
  
  status: 'registrada' | 'em_investigacao' | 'vistoriada' | 'autuada' | 'em_recuperacao' | 'resolvida' | 'arquivada'
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useMeioAmbienteStandardized() {
  const queryClient = useQueryClient()

  // =====================================================
  // QUERIES
  // =====================================================

  // Licenças ambientais
  const { data: licencasAmbientais = [], isLoading: loadingLicencas } = useQuery({
    queryKey: ['meio-ambiente', 'licencas'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('ambiente_licencas')
        .select(`
          *,
          tecnico_responsavel:user_profiles(nome_completo, email)
        `)
        .order('data_protocolo', { ascending: false })

      if (error) throw error
      return data as LicencaAmbiental[]
    }
  })

  // Monitoramento ambiental
  const { data: monitoramentos = [], isLoading: loadingMonitoramentos } = useQuery({
    queryKey: ['meio-ambiente', 'monitoramentos'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('ambiente_monitoramento')
        .select('*')
        .order('data_coleta', { ascending: false })

      if (error) throw error
      return data as MonitoramentoAmbiental[]
    }
  })

  // Áreas protegidas
  const { data: areasProtegidas = [], isLoading: loadingAreas } = useQuery({
    queryKey: ['meio-ambiente', 'areas-protegidas'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('ambiente_areas_protegidas')
        .select('*')
        .eq('status', 'ativo')
        .order('nome', { ascending: true })

      if (error) throw error
      return data as AreaProtegida[]
    }
  })

  // Ocorrências ambientais
  const { data: ocorrencias = [], isLoading: loadingOcorrencias } = useQuery({
    queryKey: ['meio-ambiente', 'ocorrencias'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('ocorrencias_ambientais')
        .select('*')
        .order('data_denuncia', { ascending: false })

      if (error) throw error
      return data as OcorrenciaAmbiental[]
    }
  })

  // =====================================================
  // MUTATIONS - LICENÇAS AMBIENTAIS
  // =====================================================

  const criarLicencaAmbientalMutation = useMutation({
    mutationFn: async (dados: Partial<LicencaAmbiental>) => {
      // Gerar número do processo
      const numeroProcesso = `AMB-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
      
      const { data, error } = await APIClient
        .from('ambiente_licencas')
        .insert([{ ...dados, numero_processo: numeroProcesso }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meio-ambiente', 'licencas'] })
      toast.success('Licença ambiental protocolada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao protocolar licença:', error)
      toast.error('Erro ao protocolar licença ambiental')
    }
  })

  const atualizarStatusLicencaMutation = useMutation({
    mutationFn: async ({ id, status, observacoes }: { 
      id: string, 
      status: LicencaAmbiental['status'], 
      observacoes?: string 
    }) => {
      const { data, error } = await APIClient
        .from('ambiente_licencas')
        .update({ status, parecer_tecnico: observacoes })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meio-ambiente', 'licencas'] })
      toast.success('Status da licença atualizado!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar licença:', error)
      toast.error('Erro ao atualizar licença')
    }
  })

  // =====================================================
  // MUTATIONS - MONITORAMENTO
  // =====================================================

  const registrarMonitoramentoMutation = useMutation({
    mutationFn: async (dados: Partial<MonitoramentoAmbiental>) => {
      const { data, error } = await APIClient
        .from('ambiente_monitoramento')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meio-ambiente', 'monitoramentos'] })
      toast.success('Monitoramento registrado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao registrar monitoramento:', error)
      toast.error('Erro ao registrar monitoramento')
    }
  })

  const atualizarResultadosMonitoramentoMutation = useMutation({
    mutationFn: async ({ id, resultados }: { 
      id: string, 
      resultados: {
        resultados_conformes: boolean
        parametros_alterados?: string[]
        acoes_corretivas?: string[]
        status: MonitoramentoAmbiental['status']
      }
    }) => {
      const { data, error } = await APIClient
        .from('ambiente_monitoramento')
        .update(resultados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meio-ambiente', 'monitoramentos'] })
      toast.success('Resultados do monitoramento atualizados!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar resultados:', error)
      toast.error('Erro ao atualizar resultados')
    }
  })

  // =====================================================
  // MUTATIONS - ÁREAS PROTEGIDAS
  // =====================================================

  const criarAreaProtegidaMutation = useMutation({
    mutationFn: async (dados: Partial<AreaProtegida>) => {
      const { data, error } = await APIClient
        .from('ambiente_areas_protegidas')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meio-ambiente', 'areas-protegidas'] })
      toast.success('Área protegida criada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar área protegida:', error)
      toast.error('Erro ao criar área protegida')
    }
  })

  const atualizarAreaProtegidaMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string, dados: Partial<AreaProtegida> }) => {
      const { data, error } = await APIClient
        .from('ambiente_areas_protegidas')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meio-ambiente', 'areas-protegidas'] })
      toast.success('Área protegida atualizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar área protegida:', error)
      toast.error('Erro ao atualizar área protegida')
    }
  })

  // =====================================================
  // MUTATIONS - OCORRÊNCIAS AMBIENTAIS
  // =====================================================

  const registrarOcorrenciaAmbientalMutation = useMutation({
    mutationFn: async (dados: Partial<OcorrenciaAmbiental>) => {
      // Gerar número da ocorrência
      const numeroOcorrencia = `OA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
      
      const { data, error } = await APIClient
        .from('ocorrencias_ambientais')
        .insert([{ ...dados, numero_ocorrencia: numeroOcorrencia }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meio-ambiente', 'ocorrencias'] })
      toast.success('Ocorrência ambiental registrada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao registrar ocorrência:', error)
      toast.error('Erro ao registrar ocorrência ambiental')
    }
  })

  const atualizarStatusOcorrenciaMutation = useMutation({
    mutationFn: async ({ id, status, observacoes }: { 
      id: string, 
      status: OcorrenciaAmbiental['status'], 
      observacoes?: string 
    }) => {
      const { data, error } = await APIClient
        .from('ocorrencias_ambientais')
        .update({ status, situacao_encontrada: observacoes })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meio-ambiente', 'ocorrencias'] })
      toast.success('Status da ocorrência atualizado!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar ocorrência:', error)
      toast.error('Erro ao atualizar ocorrência')
    }
  })

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadores = () => {
    const hoje = new Date().toISOString().split('T')[0]
    const mesAtual = hoje.substring(0, 7)

    return {
      // Licenças
      licencasProtocoladas: licencasAmbientais.length,
      licencasEmAnalise: licencasAmbientais.filter(l => ['em_analise', 'vistoria_agendada'].includes(l.status)).length,
      licencasAprovadas: licencasAmbientais.filter(l => l.status === 'aprovada').length,
      licencasNegadas: licencasAmbientais.filter(l => l.status === 'negada').length,

      // Monitoramentos
      monitoramentosMes: monitoramentos.filter(m => m.data_coleta.startsWith(mesAtual)).length,
      monitoramentosAlterados: monitoramentos.filter(m => !m.resultados_conformes).length,
      parametrosMonitorados: new Set(monitoramentos.flatMap(m => Object.keys(m.parametros_medidos))).size,

      // Áreas protegidas
      areasProtegidasTotal: areasProtegidas.length,
      areaProtegidaTotalHectares: areasProtegidas.reduce((acc, area) => acc + (area.area_hectares || 0), 0),
      areasComPlanoManejo: areasProtegidas.filter(a => a.plano_manejo).length,
      areasAbertoVisitacao: areasProtegidas.filter(a => a.visitacao_permitida).length,

      // Ocorrências
      ocorrenciasTotal: ocorrencias.length,
      ocorrenciasMes: ocorrencias.filter(o => o.data_denuncia.startsWith(mesAtual)).length,
      ocorrenciasGraves: ocorrencias.filter(o => ['alta', 'critica'].includes(o.gravidade)).length,
      ocorrenciasResolvidasMes: ocorrencias.filter(o => 
        o.status === 'resolvida' && o.updated_at?.startsWith(mesAtual)
      ).length,
      ocorrenciasAbertas: ocorrencias.filter(o => 
        ['registrada', 'em_investigacao', 'vistoriada', 'autuada', 'em_recuperacao'].includes(o.status)
      ).length
    }
  }

  // =====================================================
  // RETURN DO HOOK
  // =====================================================

  return {
    // Data
    licencasAmbientais,
    monitoramentos,
    areasProtegidas,
    ocorrencias,

    // Loading states
    isLoading: loadingLicencas || loadingMonitoramentos || loadingAreas || loadingOcorrencias,
    loadingLicencas,
    loadingMonitoramentos,
    loadingAreas,
    loadingOcorrencias,

    // Mutations - Licenças
    criarLicencaAmbiental: criarLicencaAmbientalMutation.mutateAsync,
    atualizarStatusLicenca: atualizarStatusLicencaMutation.mutateAsync,
    isCreatingLicenca: criarLicencaAmbientalMutation.isPending,
    isUpdatingLicenca: atualizarStatusLicencaMutation.isPending,

    // Mutations - Monitoramento
    registrarMonitoramento: registrarMonitoramentoMutation.mutateAsync,
    atualizarResultadosMonitoramento: atualizarResultadosMonitoramentoMutation.mutateAsync,
    isRegistrandoMonitoramento: registrarMonitoramentoMutation.isPending,
    isAtualizandoResultados: atualizarResultadosMonitoramentoMutation.isPending,

    // Mutations - Áreas Protegidas
    criarAreaProtegida: criarAreaProtegidaMutation.mutateAsync,
    atualizarAreaProtegida: atualizarAreaProtegidaMutation.mutateAsync,
    isCreatingArea: criarAreaProtegidaMutation.isPending,
    isUpdatingArea: atualizarAreaProtegidaMutation.isPending,

    // Mutations - Ocorrências
    registrarOcorrenciaAmbiental: registrarOcorrenciaAmbientalMutation.mutateAsync,
    atualizarStatusOcorrencia: atualizarStatusOcorrenciaMutation.mutateAsync,
    isRegistrandoOcorrencia: registrarOcorrenciaAmbientalMutation.isPending,
    isAtualizandoOcorrencia: atualizarStatusOcorrenciaMutation.isPending,

    // Utilities
    getIndicadores
  }
}