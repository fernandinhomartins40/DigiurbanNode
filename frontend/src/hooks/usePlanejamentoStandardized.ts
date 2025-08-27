// =====================================================
// HOOK PADRONIZADO PLANEJAMENTO URBANO - FASE 3
// Seguindo common.ts e padrões React Query
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from "@/lib/supabase"
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
// TIPOS PADRONIZADOS PLANEJAMENTO URBANO
// =====================================================

export interface ProjetoPlanejamento extends BaseEntity {
  tenant_id: string
  
  // Identificação
  titulo: string
  numero_processo?: string
  tipo_projeto: 'loteamento' | 'edificacao' | 'infraestrutura' | 'zoneamento' | 'mobilidade' | 'habitacional' | 'ambiental'
  categoria: 'residencial' | 'comercial' | 'industrial' | 'misto' | 'publico' | 'especial'
  
  // Descrição
  descricao: string
  objetivos: string[]
  justificativa?: string
  
  // Localização
  endereco: string
  coordenadas?: {
    latitude: number
    longitude: number
  }
  area_total_m2?: number
  area_construida_m2?: number
  
  // Responsáveis
  requerente_nome: string
  requerente_cpf_cnpj: string
  requerente_contato: ContatoPadrao
  responsavel_tecnico?: string
  crea_responsavel?: string
  
  // Projeto
  memorial_descritivo?: string
  plantas_anexadas?: string[]
  estudos_tecnicos?: string[]
  laudo_ambiental?: string
  
  // Análise
  analista_responsavel_id?: string
  parecer_tecnico?: string
  exigencias_tecnicas?: string[]
  documentos_complementares?: string[]
  
  // Prazos e valores
  data_protocolo: string
  prazo_analise: string
  prazo_execucao_dias?: number
  valor_estimado?: number
  taxa_municipal?: number
  
  // Impacto
  impacto_vizinhanca?: string
  impacto_transito?: string
  impacto_ambiental?: string
  medidas_compensatorias?: string[]
  
  status: 'protocolado' | 'em_analise' | 'exigencias_tecnicas' | 'aprovado' | 'aprovado_condicional' | 'reprovado' | 'arquivado'
}

export interface LicencaUrbanistica extends BaseEntity {
  tenant_id: string
  
  // Relacionamento
  projeto_id?: string
  
  // Identificação
  numero_licenca: string
  tipo_licenca: 'construir' | 'demolir' | 'reformar' | 'ampliar' | 'funcionar' | 'parcelar' | 'ocupar'
  
  // Solicitante
  requerente_nome: string
  requerente_cpf_cnpj: string
  requerente_contato: ContatoPadrao
  
  // Local
  endereco_obra: string
  inscricao_municipal?: string
  area_terreno_m2?: number
  area_construir_m2?: number
  
  // Características
  uso_destinacao: string
  numero_pavimentos?: number
  numero_unidades?: number
  vagas_garagem?: number
  
  // Processo
  data_solicitacao: string
  documentos_exigidos: string[]
  documentos_apresentados: string[]
  taxa_licenca?: number
  
  // Aprovação
  data_aprovacao?: string
  condicoes_aprovacao?: string[]
  prazo_validade: string
  observacoes?: string
  
  // Fiscalização
  fiscalizacao_necessaria: boolean
  vistorias_programadas?: number
  vistorias_realizadas: number
  
  status: 'solicitada' | 'documentacao_incompleta' | 'em_analise' | 'aprovada' | 'reprovada' | 'vencida' | 'cancelada'
}

export interface ZoneamentoUrbano extends BaseEntity {
  tenant_id: string
  
  // Identificação
  zona_codigo: string
  zona_nome: string
  descricao: string
  
  // Localização
  perimetro_poligono: unknown[] // GeoJSON polygon
  area_total_hectares: number
  bairros_abrangidos: string[]
  
  // Uso do solo
  uso_predominante: 'residencial' | 'comercial' | 'industrial' | 'misto' | 'institucional' | 'rural' | 'preservacao'
  usos_permitidos: string[]
  usos_condicionados: string[]
  usos_proibidos: string[]
  
  // Parâmetros urbanísticos
  coeficiente_aproveitamento: number
  coeficiente_aproveitamento_maximo: number
  taxa_ocupacao: number
  taxa_permeabilidade: number
  altura_maxima_metros?: number
  afastamento_frontal_metros: number
  afastamento_lateral_metros: number
  afastamento_fundos_metros: number
  
  // Lote
  area_minima_lote_m2: number
  testada_minima_metros: number
  frente_minima_metros: number
  
  // Mobilidade
  vagas_garagem_obrigatorias: boolean
  numero_vagas_por_unidade?: number
  largura_minima_via: number
  
  // Legislação
  lei_referencia: string
  decreto_regulamentacao?: string
  data_vigencia: string
  data_ultima_revisao?: string
  
  // Observações
  restricoes_especiais?: string[]
  incentivos_construtivos?: string[]
  observacoes?: string
  
  status: StatusBase
}

export interface FiscalizacaoUrbana extends BaseEntity {
  tenant_id: string
  
  // Origem
  origem_fiscalizacao: 'denuncia' | 'rotina' | 'projeto_aprovado' | 'licenca_emitida' | 'solicitacao_interna'
  numero_denuncia?: string
  denunciante_nome?: string
  denunciante_contato?: ContatoPadrao
  
  // Localização
  endereco_fiscalizacao: string
  coordenadas?: {
    latitude: number
    longitude: number
  }
  inscricao_municipal?: string
  
  // Tipo
  tipo_fiscalizacao: 'obra' | 'uso_solo' | 'posturas' | 'codigo_edificacoes' | 'parcelamento' | 'ambiental'
  assunto: string
  descricao_solicitacao?: string
  
  // Execução
  data_fiscalizacao: string
  fiscal_responsavel: string
  acompanhantes?: string[]
  
  // Situação encontrada
  situacao_encontrada: string
  irregularidades_detectadas?: string[]
  evidencias_coletadas?: string[]
  fotos_anexadas?: string[]
  medicoes_realizadas?: Record<string, any>
  
  // Ação fiscal
  auto_infracao_lavrado: boolean
  numero_auto_infracao?: string
  tipo_penalidade?: 'advertencia' | 'multa' | 'embargo' | 'demolicao' | 'lacramento'
  valor_multa?: number
  prazo_regularizacao_dias?: number
  
  // Acompanhamento
  reinspecao_necessaria: boolean
  data_reinspecao?: string
  medidas_corretivas?: string[]
  prazo_cumprimento?: string
  
  // Documentos
  relatorio_fiscalizacao: string
  documentos_notificacao?: string[]
  comprovantes_intimacao?: string[]
  
  status: 'agendada' | 'realizada' | 'pendente_regularizacao' | 'regularizada' | 'autuada' | 'processo_judicial' | 'arquivada'
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function usePlanejamentoStandardized() {
  const queryClient = useQueryClient()

  // =====================================================
  // QUERIES
  // =====================================================

  // Projetos de planejamento
  const { data: projetosPlanejamento = [], isLoading: loadingProjetos } = useQuery({
    queryKey: ['planejamento', 'projetos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planejamento_projetos')
        .select(`
          *,
          analista:user_profiles(nome_completo, email)
        `)
        .order('data_protocolo', { ascending: false })

      if (error) throw error
      return data as ProjetoPlanejamento[]
    }
  })

  // Licenças urbanísticas
  const { data: licencasUrbanisticas = [], isLoading: loadingLicencas } = useQuery({
    queryKey: ['planejamento', 'licencas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planejamento_licencas')
        .select(`
          *,
          projeto:planejamento_projetos(titulo, tipo_projeto)
        `)
        .order('data_solicitacao', { ascending: false })

      if (error) throw error
      return data as LicencaUrbanistica[]
    }
  })

  // Zoneamento urbano
  const { data: zoneamentoUrbano = [], isLoading: loadingZoneamento } = useQuery({
    queryKey: ['planejamento', 'zoneamento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planejamento_zoneamento')
        .select('*')
        .eq('status', 'ativo')
        .order('zona_codigo', { ascending: true })

      if (error) throw error
      return data as ZoneamentoUrbano[]
    }
  })

  // Fiscalização urbana
  const { data: fiscalizacoes = [], isLoading: loadingFiscalizacoes } = useQuery({
    queryKey: ['planejamento', 'fiscalizacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planejamento_fiscalizacao')
        .select('*')
        .order('data_fiscalizacao', { ascending: false })

      if (error) throw error
      return data as FiscalizacaoUrbana[]
    }
  })

  // =====================================================
  // MUTATIONS - PROJETOS
  // =====================================================

  const criarProjetoMutation = useMutation({
    mutationFn: async (dados: Partial<ProjetoPlanejamento>) => {
      // Gerar número do processo
      const numeroProcesso = `PU-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
      
      const { data, error } = await supabase
        .from('planejamento_projetos')
        .insert([{ ...dados, numero_processo: numeroProcesso }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento', 'projetos'] })
      toast.success('Projeto protocolado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar projeto:', error)
      toast.error('Erro ao protocolar projeto')
    }
  })

  const atualizarStatusProjetoMutation = useMutation({
    mutationFn: async ({ id, status, parecer }: { 
      id: string, 
      status: ProjetoPlanejamento['status'], 
      parecer?: string 
    }) => {
      const { data, error } = await supabase
        .from('planejamento_projetos')
        .update({ status, parecer_tecnico: parecer })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento', 'projetos'] })
      toast.success('Status do projeto atualizado!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar projeto:', error)
      toast.error('Erro ao atualizar projeto')
    }
  })

  // =====================================================
  // MUTATIONS - LICENÇAS
  // =====================================================

  const solicitarLicencaMutation = useMutation({
    mutationFn: async (dados: Partial<LicencaUrbanistica>) => {
      // Gerar número da licença
      const numeroLicenca = `LU-${dados.tipo_licenca?.toUpperCase()}-${Date.now().toString().slice(-6)}`
      
      const { data, error } = await supabase
        .from('planejamento_licencas')
        .insert([{ ...dados, numero_licenca: numeroLicenca }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento', 'licencas'] })
      toast.success('Licença solicitada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao solicitar licença:', error)
      toast.error('Erro ao solicitar licença')
    }
  })

  const aprovarLicencaMutation = useMutation({
    mutationFn: async ({ id, condicoes }: { 
      id: string, 
      condicoes?: string[] 
    }) => {
      const { data, error } = await supabase
        .from('planejamento_licencas')
        .update({ 
          status: 'aprovada',
          data_aprovacao: new Date().toISOString(),
          condicoes_aprovacao: condicoes
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento', 'licencas'] })
      toast.success('Licença aprovada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao aprovar licença:', error)
      toast.error('Erro ao aprovar licença')
    }
  })

  // =====================================================
  // MUTATIONS - ZONEAMENTO
  // =====================================================

  const criarZonaMutation = useMutation({
    mutationFn: async (dados: Partial<ZoneamentoUrbano>) => {
      const { data, error } = await supabase
        .from('planejamento_zoneamento')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento', 'zoneamento'] })
      toast.success('Zona criada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar zona:', error)
      toast.error('Erro ao criar zona')
    }
  })

  const atualizarZonaMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string, dados: Partial<ZoneamentoUrbano> }) => {
      const { data, error } = await supabase
        .from('planejamento_zoneamento')
        .update({ ...dados, data_ultima_revisao: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento', 'zoneamento'] })
      toast.success('Zona atualizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar zona:', error)
      toast.error('Erro ao atualizar zona')
    }
  })

  // =====================================================
  // MUTATIONS - FISCALIZAÇÃO
  // =====================================================

  const agendarFiscalizacaoMutation = useMutation({
    mutationFn: async (dados: Partial<FiscalizacaoUrbana>) => {
      const { data, error } = await supabase
        .from('planejamento_fiscalizacao')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento', 'fiscalizacoes'] })
      toast.success('Fiscalização agendada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao agendar fiscalização:', error)
      toast.error('Erro ao agendar fiscalização')
    }
  })

  const registrarFiscalizacaoMutation = useMutation({
    mutationFn: async ({ id, dados }: { 
      id: string, 
      dados: {
        situacao_encontrada: string
        irregularidades_detectadas?: string[]
        auto_infracao_lavrado: boolean
        valor_multa?: number
        relatorio_fiscalizacao: string
        status: FiscalizacaoUrbana['status']
      }
    }) => {
      const { data, error } = await supabase
        .from('planejamento_fiscalizacao')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento', 'fiscalizacoes'] })
      toast.success('Fiscalização registrada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao registrar fiscalização:', error)
      toast.error('Erro ao registrar fiscalização')
    }
  })

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadores = () => {
    const hoje = new Date().toISOString().split('T')[0]
    const mesAtual = hoje.substring(0, 7)

    return {
      // Projetos
      projetosProtocolados: projetosPlanejamento.length,
      projetosEmAnalise: projetosPlanejamento.filter(p => p.status === 'em_analise').length,
      projetosAprovados: projetosPlanejamento.filter(p => p.status === 'aprovado').length,
      projetosAprovadosMes: projetosPlanejamento.filter(p => 
        p.status === 'aprovado' && p.updated_at?.startsWith(mesAtual)
      ).length,

      // Licenças
      licencasSolicitadas: licencasUrbanisticas.length,
      licencasEmAnalise: licencasUrbanisticas.filter(l => l.status === 'em_analise').length,
      licencasAprovadas: licencasUrbanisticas.filter(l => l.status === 'aprovada').length,
      licencasVencidas: licencasUrbanisticas.filter(l => 
        l.status === 'vencida' || (l.prazo_validade && l.prazo_validade < hoje)
      ).length,

      // Zoneamento
      totalZonas: zoneamentoUrbano.length,
      areaZoneadaHectares: zoneamentoUrbano.reduce((acc, z) => acc + (z.area_total_hectares || 0), 0),
      zonasResidenciais: zoneamentoUrbano.filter(z => z.uso_predominante === 'residencial').length,
      zonasComerciais: zoneamentoUrbano.filter(z => z.uso_predominante === 'comercial').length,
      zonasIndustriais: zoneamentoUrbano.filter(z => z.uso_predominante === 'industrial').length,

      // Fiscalização
      fiscalizacoesRealizadas: fiscalizacoes.filter(f => f.status === 'realizada').length,
      fiscalizacoesMes: fiscalizacoes.filter(f => f.data_fiscalizacao.startsWith(mesAtual)).length,
      autosInfracaoLavrados: fiscalizacoes.filter(f => f.auto_infracao_lavrado).length,
      fiscalizacoesPendentes: fiscalizacoes.filter(f => 
        ['agendada', 'pendente_regularizacao'].includes(f.status)
      ).length,
      valorMultasAplicadas: fiscalizacoes
        .filter(f => f.valor_multa)
        .reduce((acc, f) => acc + (f.valor_multa || 0), 0)
    }
  }

  // =====================================================
  // RETURN DO HOOK
  // =====================================================

  return {
    // Data
    projetosPlanejamento,
    licencasUrbanisticas,
    zoneamentoUrbano,
    fiscalizacoes,

    // Loading states
    isLoading: loadingProjetos || loadingLicencas || loadingZoneamento || loadingFiscalizacoes,
    loadingProjetos,
    loadingLicencas,
    loadingZoneamento,
    loadingFiscalizacoes,

    // Mutations - Projetos
    criarProjeto: criarProjetoMutation.mutateAsync,
    atualizarStatusProjeto: atualizarStatusProjetoMutation.mutateAsync,
    isCreatingProjeto: criarProjetoMutation.isPending,
    isUpdatingProjeto: atualizarStatusProjetoMutation.isPending,

    // Mutations - Licenças
    solicitarLicenca: solicitarLicencaMutation.mutateAsync,
    aprovarLicenca: aprovarLicencaMutation.mutateAsync,
    isSolicitandoLicenca: solicitarLicencaMutation.isPending,
    isAprovandoLicenca: aprovarLicencaMutation.isPending,

    // Mutations - Zoneamento
    criarZona: criarZonaMutation.mutateAsync,
    atualizarZona: atualizarZonaMutation.mutateAsync,
    isCreatingZona: criarZonaMutation.isPending,
    isUpdatingZona: atualizarZonaMutation.isPending,

    // Mutations - Fiscalização
    agendarFiscalizacao: agendarFiscalizacaoMutation.mutateAsync,
    registrarFiscalizacao: registrarFiscalizacaoMutation.mutateAsync,
    isAgendandoFiscalizacao: agendarFiscalizacaoMutation.isPending,
    isRegistrandoFiscalizacao: registrarFiscalizacaoMutation.isPending,

    // Utilities
    getIndicadores
  }
}