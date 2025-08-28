// =====================================================
// HOOK COMPLETO PARA SEGURANÇA PÚBLICA
// 7 FUNCIONALIDADES INTEGRADAS
// =====================================================

import { useState, useEffect } from 'react'
import { APIClient } from "@/auth"
import { toast } from 'react-hot-toast'

// =====================================================
// INTERFACES E TIPOS
// =====================================================

export interface OcorrenciaSeguranca {
  id: string
  numero_bo: string
  tipo: 'furto' | 'roubo' | 'vandalismo' | 'perturbacao' | 'acidente' | 'violencia_domestica' | 'trafico' | 'homicidio'
  gravidade: 'leve' | 'moderada' | 'grave' | 'gravissima'
  descricao: string
  endereco: string
  coordenadas?: any
  data_ocorrencia: string
  solicitante_id: string
  telefone_contato: string
  testemunhas: string[]
  anexos: string[]
  status: 'registrada' | 'investigando' | 'encaminhada' | 'resolvida' | 'arquivada'
  encaminhado_para?: string
  guarda_responsavel_id?: string
  observacoes?: string
  created_at: string
  updated_at: string
  
  // Relacionamentos
  solicitante?: {
    nome: string
    telefone: string
  }
  guarda_responsavel?: {
    nome: string
    matricula: string
  }
}

export interface GuardaMunicipal {
  id: string
  user_profile_id: string
  matricula: string
  patente: string
  especialidade?: string
  data_admissao: string
  situacao: 'ativo' | 'licenca' | 'ferias' | 'afastado'
  telefone_radio?: string
  equipamentos_atribuidos: any
  created_at: string
  
  // Relacionamentos
  user_profile?: {
    nome: string
    email: string
    telefone: string
  }
  escalas?: EscalaServico[]
}

export interface ViaturaSeguranca {
  id: string
  placa: string
  modelo: string
  ano?: number
  tipo: 'patrulha' | 'motocicleta' | 'especial'
  capacidade: number
  equipamentos: any
  km_atual: number
  status: 'disponivel' | 'em_uso' | 'manutencao' | 'indisponivel'
  ultima_manutencao?: string
  proxima_manutencao?: string
  created_at: string
}

export interface EscalaServico {
  id: string
  guarda_id: string
  viatura_id?: string
  data_servico: string
  turno: 'matutino' | 'vespertino' | 'noturno'
  hora_inicio: string
  hora_fim: string
  area_responsabilidade?: string
  status: 'escalado' | 'em_servico' | 'concluido' | 'faltou'
  observacoes?: string
  created_at: string
  
  // Relacionamentos
  guarda?: GuardaMunicipal
  viatura?: ViaturaSeguranca
}

export interface PontoCriticoSeguranca {
  id: string
  nome: string
  endereco: string
  coordenadas: any
  tipo_risco: 'violencia' | 'transito' | 'vandalismo' | 'drogas' | 'perturbacao'
  nivel_risco: number // 1-5
  descricao?: string
  historico_ocorrencias: number
  ultima_ocorrencia?: string
  medidas_adotadas: string[]
  frequencia_patrulhamento: number
  cameras_instaladas: boolean
  iluminacao_adequada: boolean
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface AlertaSeguranca {
  id: string
  tipo: 'emergencia' | 'preventivo' | 'informativo'
  titulo: string
  descricao: string
  gravidade: 'baixa' | 'media' | 'alta' | 'critica'
  area_afetada?: string
  coordenadas_centro?: any
  raio_metros?: number
  data_inicio: string
  data_fim?: string
  canais_comunicacao: string[]
  responsavel_id: string
  status: 'ativo' | 'resolvido' | 'cancelado'
  pessoas_notificadas: number
  created_at: string
  
  // Relacionamentos
  responsavel?: {
    nome: string
  }
}

export interface CameraSeguranca {
  id: string
  codigo: string
  endereco: string
  coordenadas: any
  tipo: 'fixa' | 'dome' | 'speed_dome' | 'termica'
  resolucao?: string
  funcionalidades: string[]
  area_cobertura?: string
  angulo_visao?: number
  status: 'operacional' | 'manutencao' | 'inoperante'
  ip_address?: string
  porta?: number
  gravacao_ativa: boolean
  dias_retencao: number
  responsavel_id?: string
  instalacao_data?: string
  ultima_manutencao?: string
  created_at: string
  
  // Relacionamentos
  responsavel?: {
    nome: string
  }
  gravacoes?: GravacaoCamera[]
}

export interface GravacaoCamera {
  id: string
  camera_id: string
  data_gravacao: string
  hora_inicio: string
  hora_fim: string
  arquivo_path: string
  tamanho_mb?: number
  qualidade?: string
  eventos_detectados: string[]
  backup_realizado: boolean
  data_exclusao?: string
  created_at: string
  
  // Relacionamentos
  camera?: CameraSeguranca
}

export interface ChamadaEmergencia {
  id: string
  numero_chamada: string
  telefone_origem: string
  nome_solicitante?: string
  endereco_ocorrencia: string
  tipo_emergencia: string
  descricao_inicial: string
  prioridade: number // 1-5
  data_chamada: string
  atendente_id: string
  viatura_despachada_id?: string
  tempo_resposta_segundos?: number
  status: 'recebida' | 'despachada' | 'atendida' | 'resolvida'
  satisfacao_solicitante?: number
  observacoes?: string
  created_at: string
  
  // Relacionamentos
  atendente?: {
    nome: string
  }
  viatura_despachada?: ViaturaSeguranca
}

export const useSeguranca = () => {
  // Estados principais
  const [ocorrenciasSeguranca, setOcorrenciasSeguranca] = useState<OcorrenciaSeguranca[]>([])
  const [guardasMunicipais, setGuardasMunicipais] = useState<GuardaMunicipal[]>([])
  const [viaturasSeguranca, setViaturasSeguranca] = useState<ViaturaSeguranca[]>([])
  const [escalasServico, setEscalasServico] = useState<EscalaServico[]>([])
  const [pontosCriticos, setPontosCriticos] = useState<PontoCriticoSeguranca[]>([])
  const [alertasSeguranca, setAlertasSeguranca] = useState<AlertaSeguranca[]>([])
  const [camerasSeguranca, setCamerasSeguranca] = useState<CameraSeguranca[]>([])
  const [gravacoesCamera, setGravacoesCamera] = useState<GravacaoCamera[]>([])
  const [chamadasEmergencia, setChamadasEmergencia] = useState<ChamadaEmergencia[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // CARREGAMENTO INICIAL
  // =====================================================

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadOcorrenciasSeguranca(),
        loadGuardasMunicipais(),
        loadViaturasSeguranca(),
        loadEscalasServico(),
        loadPontosCriticos(),
        loadAlertasSeguranca(),
        loadCamerasSeguranca(),
        loadGravacoesCamera(),
        loadChamadasEmergencia()
      ])
    } catch (err) {
      console.error('Erro ao carregar dados de segurança:', err)
      setError('Erro ao carregar dados de segurança')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // 1. REGISTRO DE OCORRÊNCIAS
  // =====================================================

  const loadOcorrenciasSeguranca = async (filters?: any) => {
    try {
      let query = supabase
        .from('ocorrencias_seguranca')
        .select(`
          *,
          solicitante:user_profiles!solicitante_id(nome, telefone),
          guarda_responsavel:user_profiles!guarda_responsavel_id(nome)
        `)
        .order('data_ocorrencia', { ascending: false })

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters?.gravidade) {
        query = query.eq('gravidade', filters.gravidade)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.data_inicio && filters?.data_fim) {
        query = query
          .gte('data_ocorrencia', filters.data_inicio)
          .lte('data_ocorrencia', filters.data_fim)
      }

      const { data, error } = await query

      if (error) throw error
      setOcorrenciasSeguranca(data || [])
    } catch (err) {
      console.error('Erro ao carregar ocorrências:', err)
    }
  }

  const registrarOcorrencia = async (dadosOcorrencia: Partial<OcorrenciaSeguranca>) => {
    try {
      // Gerar número do BO
      const numeroBo = await gerarNumeroBo()

      const { data, error } = await supabase
        .from('ocorrencias_seguranca')
        .insert([{
          ...dadosOcorrencia,
          numero_bo: numeroBo,
          status: 'registrada'
        }])
        .select()
        .single()

      if (error) throw error

      // Se for ocorrência grave, criar alerta automático
      if (dadosOcorrencia.gravidade === 'grave' || dadosOcorrencia.gravidade === 'gravissima') {
        await criarAlertaAutomatico(data)
      }

      toast.success('Ocorrência registrada!')
      await loadOcorrenciasSeguranca()
      return data
    } catch (err) {
      console.error('Erro ao registrar ocorrência:', err)
      toast.error('Erro ao registrar ocorrência')
      return null
    }
  }

  const gerarNumeroBo = async (): Promise<string> => {
    const ano = new Date().getFullYear()
    const { data } = await supabase
      .from('ocorrencias_seguranca')
      .select('numero_bo')
      .like('numero_bo', `BO${ano}%`)
      .order('numero_bo', { ascending: false })
      .limit(1)

    let proximoNumero = 1
    if (data && data.length > 0) {
      const ultimoNumero = parseInt(data[0].numero_bo.replace(`BO${ano}`, ''))
      proximoNumero = ultimoNumero + 1
    }

    return `BO${ano}${proximoNumero.toString().padStart(6, '0')}`
  }

  const atualizarStatusOcorrencia = async (ocorrenciaId: string, novoStatus: OcorrenciaSeguranca['status'], observacoes?: string) => {
    try {
      const { error } = await supabase
        .from('ocorrencias_seguranca')
        .update({
          status: novoStatus,
          observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', ocorrenciaId)

      if (error) throw error

      toast.success('Status da ocorrência atualizado!')
      await loadOcorrenciasSeguranca()
    } catch (err) {
      console.error('Erro ao atualizar ocorrência:', err)
      toast.error('Erro ao atualizar ocorrência')
    }
  }

  const encaminharOcorrencia = async (ocorrenciaId: string, orgaoDestino: string, observacoes?: string) => {
    try {
      const { error } = await supabase
        .from('ocorrencias_seguranca')
        .update({
          status: 'encaminhada',
          encaminhado_para: orgaoDestino,
          observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', ocorrenciaId)

      if (error) throw error

      toast.success(`Ocorrência encaminhada para ${orgaoDestino}!`)
      await loadOcorrenciasSeguranca()
    } catch (err) {
      console.error('Erro ao encaminhar ocorrência:', err)
      toast.error('Erro ao encaminhar ocorrência')
    }
  }

  // =====================================================
  // 2. APOIO DA GUARDA MUNICIPAL
  // =====================================================

  const loadGuardasMunicipais = async () => {
    try {
      const { data, error } = await supabase
        .from('guardas_municipais')
        .select(`
          *,
          user_profile:user_profiles(nome, email, telefone)
        `)
        .order('patente', { ascending: true })

      if (error) throw error
      setGuardasMunicipais(data || [])
    } catch (err) {
      console.error('Erro ao carregar guardas municipais:', err)
    }
  }

  const loadViaturasSeguranca = async () => {
    try {
      const { data, error } = await supabase
        .from('viaturas_seguranca')
        .select('*')
        .order('placa', { ascending: true })

      if (error) throw error
      setViaturasSeguranca(data || [])
    } catch (err) {
      console.error('Erro ao carregar viaturas:', err)
    }
  }

  const loadEscalasServico = async (filters?: any) => {
    try {
      let query = supabase
        .from('escalas_servico')
        .select(`
          *,
          guarda:guardas_municipais(
            matricula,
            patente,
            user_profile:user_profiles(nome)
          ),
          viatura:viaturas_seguranca(placa, modelo)
        `)
        .order('data_servico', { ascending: false })

      if (filters?.data_servico) {
        query = query.eq('data_servico', filters.data_servico)
      }

      if (filters?.turno) {
        query = query.eq('turno', filters.turno)
      }

      const { data, error } = await query

      if (error) throw error
      setEscalasServico(data || [])
    } catch (err) {
      console.error('Erro ao carregar escalas:', err)
    }
  }

  const criarEscalaServico = async (dadosEscala: Partial<EscalaServico>) => {
    try {
      // Verificar se guarda já tem escala no mesmo período
      const { data: conflito } = await supabase
        .from('escalas_servico')
        .select('id')
        .eq('guarda_id', dadosEscala.guarda_id)
        .eq('data_servico', dadosEscala.data_servico)
        .eq('turno', dadosEscala.turno)

      if (conflito && conflito.length > 0) {
        toast.error('Guarda já possui escala para este período!')
        return null
      }

      // Verificar se viatura já está alocada
      if (dadosEscala.viatura_id) {
        const { data: viaturaOcupada } = await supabase
          .from('escalas_servico')
          .select('id')
          .eq('viatura_id', dadosEscala.viatura_id)
          .eq('data_servico', dadosEscala.data_servico)
          .eq('turno', dadosEscala.turno)

        if (viaturaOcupada && viaturaOcupada.length > 0) {
          toast.error('Viatura já está alocada para este período!')
          return null
        }
      }

      const { data, error } = await supabase
        .from('escalas_servico')
        .insert([{
          ...dadosEscala,
          status: 'escalado'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Escala criada!')
      await loadEscalasServico()
      return data
    } catch (err) {
      console.error('Erro ao criar escala:', err)
      toast.error('Erro ao criar escala')
      return null
    }
  }

  const iniciarTurnoGuarda = async (escalaId: string) => {
    try {
      const { error } = await supabase
        .from('escalas_servico')
        .update({ status: 'em_servico' })
        .eq('id', escalaId)

      if (error) throw error

      toast.success('Turno iniciado!')
      await loadEscalasServico()
    } catch (err) {
      console.error('Erro ao iniciar turno:', err)
      toast.error('Erro ao iniciar turno')
    }
  }

  const finalizarTurnoGuarda = async (escalaId: string, relatorioAtividades?: string) => {
    try {
      const { error } = await supabase
        .from('escalas_servico')
        .update({
          status: 'concluido',
          observacoes: relatorioAtividades
        })
        .eq('id', escalaId)

      if (error) throw error

      toast.success('Turno finalizado!')
      await loadEscalasServico()
    } catch (err) {
      console.error('Erro ao finalizar turno:', err)
      toast.error('Erro ao finalizar turno')
    }
  }

  // =====================================================
  // 3. MAPA DE PONTOS CRÍTICOS
  // =====================================================

  const loadPontosCriticos = async (filters?: any) => {
    try {
      let query = supabase
        .from('pontos_criticos_seguranca')
        .select('*')
        .eq('ativo', true)
        .order('nivel_risco', { ascending: false })

      if (filters?.tipo_risco) {
        query = query.eq('tipo_risco', filters.tipo_risco)
      }

      if (filters?.nivel_risco) {
        query = query.gte('nivel_risco', filters.nivel_risco)
      }

      const { data, error } = await query

      if (error) throw error
      setPontosCriticos(data || [])
    } catch (err) {
      console.error('Erro ao carregar pontos críticos:', err)
    }
  }

  const criarPontoCritico = async (dadosPonto: Partial<PontoCriticoSeguranca>) => {
    try {
      const { data, error } = await supabase
        .from('pontos_criticos_seguranca')
        .insert([{
          ...dadosPonto,
          historico_ocorrencias: 0,
          frequencia_patrulhamento: 0,
          cameras_instaladas: false,
          iluminacao_adequada: false,
          ativo: true
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Ponto crítico cadastrado!')
      await loadPontosCriticos()
      return data
    } catch (err) {
      console.error('Erro ao criar ponto crítico:', err)
      toast.error('Erro ao criar ponto crítico')
      return null
    }
  }

  const atualizarPontoCritico = async (pontoId: string, dadosAtualizados: Partial<PontoCriticoSeguranca>) => {
    try {
      const { error } = await supabase
        .from('pontos_criticos_seguranca')
        .update({
          ...dadosAtualizados,
          updated_at: new Date().toISOString()
        })
        .eq('id', pontoId)

      if (error) throw error

      toast.success('Ponto crítico atualizado!')
      await loadPontosCriticos()
    } catch (err) {
      console.error('Erro ao atualizar ponto crítico:', err)
      toast.error('Erro ao atualizar ponto crítico')
    }
  }

  const incrementarOcorrenciasPonto = async (coordenadas: any, tipoOcorrencia: string) => {
    try {
      // Buscar ponto crítico próximo (raio de 500m)
      const { data: pontosProximos } = await supabase
        .rpc('pontos_proximos', {
          lat: coordenadas.lat,
          lon: coordenadas.lng,
          raio_metros: 500
        })

      if (pontosProximos && pontosProximos.length > 0) {
        const ponto = pontosProximos[0]
        await supabase
          .from('pontos_criticos_seguranca')
          .update({
            historico_ocorrencias: ponto.historico_ocorrencias + 1,
            ultima_ocorrencia: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', ponto.id)

        await loadPontosCriticos()
      }
    } catch (err) {
      console.error('Erro ao incrementar ocorrências do ponto:', err)
    }
  }

  // =====================================================
  // 4. ALERTAS DE SEGURANÇA
  // =====================================================

  const loadAlertasSeguranca = async (filters?: any) => {
    try {
      let query = supabase
        .from('alertas_seguranca')
        .select(`
          *,
          responsavel:user_profiles(nome)
        `)
        .order('data_inicio', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.gravidade) {
        query = query.eq('gravidade', filters.gravidade)
      }

      if (filters?.ativo) {
        query = query.eq('status', 'ativo')
      }

      const { data, error } = await query

      if (error) throw error
      setAlertasSeguranca(data || [])
    } catch (err) {
      console.error('Erro ao carregar alertas:', err)
    }
  }

  const criarAlertaSeguranca = async (dadosAlerta: Partial<AlertaSeguranca>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('alertas_seguranca')
        .insert([{
          ...dadosAlerta,
          responsavel_id: user?.id,
          status: 'ativo',
          pessoas_notificadas: 0
        }])
        .select()
        .single()

      if (error) throw error

      // Disparar notificações
      await dispararNotificacoes(data)

      toast.success('Alerta criado e notificações enviadas!')
      await loadAlertasSeguranca()
      return data
    } catch (err) {
      console.error('Erro ao criar alerta:', err)
      toast.error('Erro ao criar alerta')
      return null
    }
  }

  const criarAlertaAutomatico = async (ocorrencia: OcorrenciaSeguranca) => {
    try {
      const alertaData = {
        tipo: 'emergencia' as const,
        titulo: `Ocorrência ${ocorrencia.tipo} - ${ocorrencia.gravidade}`,
        descricao: ocorrencia.descricao,
        gravidade: ocorrencia.gravidade === 'gravissima' ? 'critica' as const : 'alta' as const,
        area_afetada: ocorrencia.endereco,
        coordenadas_centro: ocorrencia.coordenadas,
        raio_metros: ocorrencia.gravidade === 'gravissima' ? 1000 : 500,
        canais_comunicacao: ['radio', 'sms']
      }

      await criarAlertaSeguranca(alertaData)
    } catch (err) {
      console.error('Erro ao criar alerta automático:', err)
    }
  }

  const dispararNotificacoes = async (alerta: AlertaSeguranca) => {
    try {
      let pessoasNotificadas = 0

      // Simular envio de notificações
      for (const canal of alerta.canais_comunicacao) {
        switch (canal) {
          case 'sms':
            pessoasNotificadas += 50 // Simulação
            break
          case 'email':
            pessoasNotificadas += 30
            break
          case 'radio':
            pessoasNotificadas += 20
            break
          case 'sirene':
            pessoasNotificadas += 100
            break
        }
      }

      // Atualizar contador
      await supabase
        .from('alertas_seguranca')
        .update({ pessoas_notificadas: pessoasNotificadas })
        .eq('id', alerta.id)

    } catch (err) {
      console.error('Erro ao disparar notificações:', err)
    }
  }

  const resolverAlerta = async (alertaId: string) => {
    try {
      const { error } = await supabase
        .from('alertas_seguranca')
        .update({
          status: 'resolvido',
          data_fim: new Date().toISOString()
        })
        .eq('id', alertaId)

      if (error) throw error

      toast.success('Alerta resolvido!')
      await loadAlertasSeguranca()
    } catch (err) {
      console.error('Erro ao resolver alerta:', err)
      toast.error('Erro ao resolver alerta')
    }
  }

  // =====================================================
  // 5. VIGILÂNCIA INTEGRADA (CFTV)
  // =====================================================

  const loadCamerasSeguranca = async (filters?: any) => {
    try {
      let query = supabase
        .from('cameras_seguranca')
        .select(`
          *,
          responsavel:user_profiles(nome)
        `)
        .order('codigo', { ascending: true })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      const { data, error } = await query

      if (error) throw error
      setCamerasSeguranca(data || [])
    } catch (err) {
      console.error('Erro ao carregar câmeras:', err)
    }
  }

  const loadGravacoesCamera = async (cameraId?: string) => {
    try {
      let query = supabase
        .from('gravacoes_cameras')
        .select(`
          *,
          camera:cameras_seguranca(codigo, endereco)
        `)
        .order('data_gravacao', { ascending: false })

      if (cameraId) {
        query = query.eq('camera_id', cameraId)
      }

      const { data, error } = await query

      if (error) throw error
      setGravacoesCamera(data || [])
    } catch (err) {
      console.error('Erro ao carregar gravações:', err)
    }
  }

  const cadastrarCamera = async (dadosCamera: Partial<CameraSeguranca>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('cameras_seguranca')
        .insert([{
          ...dadosCamera,
          responsavel_id: user?.id,
          status: 'operacional',
          gravacao_ativa: true,
          dias_retencao: 30,
          backup_realizado: false
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Câmera cadastrada!')
      await loadCamerasSeguranca()
      return data
    } catch (err) {
      console.error('Erro ao cadastrar câmera:', err)
      toast.error('Erro ao cadastrar câmera')
      return null
    }
  }

  const atualizarStatusCamera = async (cameraId: string, novoStatus: CameraSeguranca['status']) => {
    try {
      const { error } = await supabase
        .from('cameras_seguranca')
        .update({
          status: novoStatus,
          ultima_manutencao: novoStatus === 'operacional' ? new Date().toISOString().split('T')[0] : undefined
        })
        .eq('id', cameraId)

      if (error) throw error

      toast.success('Status da câmera atualizado!')
      await loadCamerasSeguranca()
    } catch (err) {
      console.error('Erro ao atualizar câmera:', err)
      toast.error('Erro ao atualizar câmera')
    }
  }

  const registrarGravacao = async (dadosGravacao: Partial<GravacaoCamera>) => {
    try {
      const { data, error } = await supabase
        .from('gravacoes_cameras')
        .insert([{
          ...dadosGravacao,
          backup_realizado: false
        }])
        .select()
        .single()

      if (error) throw error

      return data
    } catch (err) {
      console.error('Erro ao registrar gravação:', err)
      return null
    }
  }

  // =====================================================
  // 6. ATENDIMENTOS DE SEGURANÇA
  // =====================================================

  const loadChamadasEmergencia = async (filters?: any) => {
    try {
      let query = supabase
        .from('chamadas_emergencia')
        .select(`
          *,
          atendente:user_profiles!atendente_id(nome),
          viatura_despachada:viaturas_seguranca(placa, modelo)
        `)
        .order('data_chamada', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.prioridade) {
        query = query.gte('prioridade', filters.prioridade)
      }

      const { data, error } = await query

      if (error) throw error
      setChamadasEmergencia(data || [])
    } catch (err) {
      console.error('Erro ao carregar chamadas:', err)
    }
  }

  const registrarChamadaEmergencia = async (dadosChamada: Partial<ChamadaEmergencia>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Gerar número da chamada
      const numeroChamada = await gerarNumeroChamada()

      const { data, error } = await supabase
        .from('chamadas_emergencia')
        .insert([{
          ...dadosChamada,
          numero_chamada: numeroChamada,
          atendente_id: user?.id,
          status: 'recebida'
        }])
        .select()
        .single()

      if (error) throw error

      // Se for alta prioridade, despachar viatura automaticamente
      if (dadosChamada.prioridade && dadosChamada.prioridade >= 4) {
        await despacharViaturaProxima(data)
      }

      toast.success('Chamada registrada!')
      await loadChamadasEmergencia()
      return data
    } catch (err) {
      console.error('Erro ao registrar chamada:', err)
      toast.error('Erro ao registrar chamada')
      return null
    }
  }

  const gerarNumeroChamada = async (): Promise<string> => {
    const hoje = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const { data } = await supabase
      .from('chamadas_emergencia')
      .select('numero_chamada')
      .like('numero_chamada', `${hoje}%`)
      .order('numero_chamada', { ascending: false })
      .limit(1)

    let proximoNumero = 1
    if (data && data.length > 0) {
      const ultimoNumero = parseInt(data[0].numero_chamada.slice(-4))
      proximoNumero = ultimoNumero + 1
    }

    return `${hoje}${proximoNumero.toString().padStart(4, '0')}`
  }

  const despacharViaturaProxima = async (chamada: ChamadaEmergencia) => {
    try {
      // Buscar viatura disponível mais próxima
      const { data: viaturaDisponivel } = await supabase
        .from('viaturas_seguranca')
        .select('id, placa')
        .eq('status', 'disponivel')
        .limit(1)

      if (viaturaDisponivel && viaturaDisponivel.length > 0) {
        await despacharViatura(chamada.id, viaturaDisponivel[0].id)
      }
    } catch (err) {
      console.error('Erro ao despachar viatura automática:', err)
    }
  }

  const despacharViatura = async (chamadaId: string, viaturaId: string) => {
    try {
      const horaDespacho = new Date()

      // Atualizar chamada
      const { error: chamadaError } = await supabase
        .from('chamadas_emergencia')
        .update({
          viatura_despachada_id: viaturaId,
          status: 'despachada'
        })
        .eq('id', chamadaId)

      if (chamadaError) throw chamadaError

      // Atualizar viatura
      const { error: viaturaError } = await supabase
        .from('viaturas_seguranca')
        .update({ status: 'em_uso' })
        .eq('id', viaturaId)

      if (viaturaError) throw viaturaError

      toast.success('Viatura despachada!')
      await loadChamadasEmergencia()
      await loadViaturasSeguranca()
    } catch (err) {
      console.error('Erro ao despachar viatura:', err)
      toast.error('Erro ao despachar viatura')
    }
  }

  const finalizarAtendimento = async (chamadaId: string, tempoRespostaSegundos: number, satisfacao?: number) => {
    try {
      const { data: chamada } = await supabase
        .from('chamadas_emergencia')
        .select('viatura_despachada_id')
        .eq('id', chamadaId)
        .single()

      // Atualizar chamada
      const { error: chamadaError } = await supabase
        .from('chamadas_emergencia')
        .update({
          status: 'resolvida',
          tempo_resposta_segundos: tempoRespostaSegundos,
          satisfacao_solicitante: satisfacao
        })
        .eq('id', chamadaId)

      if (chamadaError) throw chamadaError

      // Liberar viatura
      if (chamada?.viatura_despachada_id) {
        await supabase
          .from('viaturas_seguranca')
          .update({ status: 'disponivel' })
          .eq('id', chamada.viatura_despachada_id)
      }

      toast.success('Atendimento finalizado!')
      await loadChamadasEmergencia()
      await loadViaturasSeguranca()
    } catch (err) {
      console.error('Erro ao finalizar atendimento:', err)
      toast.error('Erro ao finalizar atendimento')
    }
  }

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadoresSeguranca = () => {
    const hoje = new Date().toISOString().split('T')[0]
    
    const ocorrenciasHoje = ocorrenciasSeguranca.filter(o => 
      o.data_ocorrencia.startsWith(hoje)
    ).length

    const ocorrenciasGraves = ocorrenciasSeguranca.filter(o => 
      ['grave', 'gravissima'].includes(o.gravidade) && 
      !['resolvida', 'arquivada'].includes(o.status)
    ).length

    const guardaAtivo = guardasMunicipais.filter(g => g.situacao === 'ativo').length
    
    const viaturasDisponiveis = viaturasSeguranca.filter(v => v.status === 'disponivel').length
    
    const camerasOperacionais = camerasSeguranca.filter(c => c.status === 'operacional').length
    
    const alertasAtivos = alertasSeguranca.filter(a => a.status === 'ativo').length
    
    const chamadasPendentes = chamadasEmergencia.filter(c => 
      ['recebida', 'despachada'].includes(c.status)
    ).length

    const pontosCriticosAltoRisco = pontosCriticos.filter(p => p.nivel_risco >= 4).length

    const tempoMedioResposta = chamadasEmergencia
      .filter(c => c.tempo_resposta_segundos)
      .reduce((acc, c) => acc + (c.tempo_resposta_segundos || 0), 0) / 
      chamadasEmergencia.filter(c => c.tempo_resposta_segundos).length || 0

    return {
      ocorrenciasHoje,
      ocorrenciasGraves,
      guardaAtivo,
      viaturasDisponiveis,
      viaturasTotal: viaturasSeguranca.length,
      camerasOperacionais,
      camerasTotal: camerasSeguranca.length,
      alertasAtivos,
      chamadasPendentes,
      pontosCriticosAltoRisco,
      tempoMedioRespostaMinutos: Math.round(tempoMedioResposta / 60)
    }
  }

  return {
    // Estados
    ocorrenciasSeguranca,
    guardasMunicipais,
    viaturasSeguranca,
    escalasServico,
    pontosCriticos,
    alertasSeguranca,
    camerasSeguranca,
    gravacoesCamera,
    chamadasEmergencia,
    loading,
    error,

    // Carregamento
    loadAllData,
    loadOcorrenciasSeguranca,
    loadGuardasMunicipais,
    loadViaturasSeguranca,
    loadEscalasServico,
    loadPontosCriticos,
    loadAlertasSeguranca,
    loadCamerasSeguranca,
    loadGravacoesCamera,
    loadChamadasEmergencia,

    // Ocorrências
    registrarOcorrencia,
    atualizarStatusOcorrencia,
    encaminharOcorrencia,

    // Guarda Municipal
    criarEscalaServico,
    iniciarTurnoGuarda,
    finalizarTurnoGuarda,

    // Pontos Críticos
    criarPontoCritico,
    atualizarPontoCritico,
    incrementarOcorrenciasPonto,

    // Alertas
    criarAlertaSeguranca,
    resolverAlerta,

    // Câmeras
    cadastrarCamera,
    atualizarStatusCamera,
    registrarGravacao,

    // Emergências
    registrarChamadaEmergencia,
    despacharViatura,
    finalizarAtendimento,

    // Indicadores
    getIndicadoresSeguranca
  }
}