// =====================================================
// HOOK PADRONIZADO SAÚDE - FASE 3
// Seguindo common.ts e padrões React Query
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from "@/lib/supabase"
import { toast } from 'react-hot-toast'
import type { 
  BaseEntity, 
  StatusBase, 
  PrioridadePadrao,
  StatusProcesso,
  StatusAgendamento,
  PessoaFisicaPadrao,
  EnderecoPadrao,
  ContatoPadrao,
  AvaliacaoPadrao
} from "@/types/common"

// =====================================================
// TIPOS PADRONIZADOS SAÚDE
// =====================================================

export interface EstabelecimentoSaude extends BaseEntity {
  tenant_id: string
  
  // Identificação
  nome: string
  codigo_cnes?: string
  tipo: 'ubs' | 'hospital' | 'pronto_socorro' | 'clinica_especializada' | 'centro_cirurgico' | 'laboratorio' | 'farmacia' | 'caps'
  
  // Localização e contato
  endereco: EnderecoPadrao
  contato: ContatoPadrao
  
  // Responsáveis
  diretor_id?: string
  coordenador_id?: string
  
  // Capacidade e recursos
  leitos_total: number
  leitos_disponiveis: number
  salas_atendimento: number
  consultorio_odontologico: boolean
  raio_x: boolean
  laboratorio: boolean
  farmacia: boolean
  
  // Funcionamento
  horario_funcionamento: Record<string, any>
  funciona_24h: boolean
  
  // Especialidades oferecidas
  especialidades: string[]
  
  // Status e documentação
  status: StatusBase
  data_inauguracao?: string
  licenca_sanitaria?: string
  validade_licenca?: string
}

export interface AgendamentoConsulta extends BaseEntity {
  tenant_id: string
  paciente_id: string
  profissional_id: string
  estabelecimento_id: string
  protocolo_id?: string
  
  // Dados do agendamento
  data_hora: string
  duracao_minutos: number
  tipo_consulta: string
  prioridade: PrioridadePadrao
  
  // Status e observações
  status: StatusAgendamento
  observacoes_agendamento?: string
  observacoes_atendimento?: string
  
  // Dados do atendimento (quando realizado)
  data_atendimento?: string
  diagnostico?: string
  procedimentos_realizados: string[]
  medicamentos_prescritos: string[]
  retorno_necessario: boolean
  data_retorno?: string
  
  // Avaliação
  avaliacao?: AvaliacaoPadrao
}

export interface Paciente extends BaseEntity {
  tenant_id: string
  user_profile_id?: string
  
  // Dados pessoais
  nome_completo: string
  cpf: string
  rg?: string
  data_nascimento: string
  sexo: 'M' | 'F' | 'O'
  
  // Endereço e contato
  endereco: EnderecoPadrao
  contato: ContatoPadrao
  
  // Dados específicos de saúde
  cartao_sus?: string
  numero_prontuario?: string
  grupo_sanguineo?: string
  alergias: string[]
  medicamentos_uso_continuo: string[]
  
  // Responsável (para menores)
  responsavel?: {
    nome_completo: string
    cpf: string
    parentesco: string
    telefone: string
    e_responsavel_legal: boolean
  }
  
  // Status
  status: StatusBase
  data_cadastro: string
}

export interface CreateUnidadeInput {
  nome: string
  tipo: 'ubs' | 'upf' | 'hospital' | 'clinica' | 'caps' | 'pronto_socorro'
  endereco: string
  telefone: string
  especialidades_disponiveis: string[]
  capacidade_atendimento: number
}

export interface CreateAgendamentoInput {
  paciente_id: string
  profissional_id: string
  unidade_saude_id: string
  especialidade: string
  data_agendamento: string
  horario_inicio: string
  duracao_minutos: number
  tipo: 'consulta' | 'exame' | 'procedimento' | 'retorno' | 'urgencia'
}

export interface SaudeFilters {
  nome?: string
  tipo?: string | string[]
  especialidade?: string
  ativa?: boolean
  data_inicio?: string
  data_fim?: string
  search?: string
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useSaudeStandardized() {
  const queryClient = useQueryClient()

  // =====================================================
  // QUERIES
  // =====================================================

  // Estabelecimentos de saúde
  const { data: estabelecimentos = [], isLoading: loadingEstabelecimentos } = useQuery({
    queryKey: ['saude', 'estabelecimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estabelecimentos_saude')
        .select(`
          *,
          diretor:user_profiles(nome_completo),
          coordenador:user_profiles(nome_completo)
        `)
        .eq('status', 'ativo')
        .order('nome', { ascending: true })

      if (error) throw error
      return data as EstabelecimentoSaude[]
    }
  })

  // Agendamentos de consultas
  const { data: agendamentos = [], isLoading: loadingAgendamentos } = useQuery({
    queryKey: ['saude', 'agendamentos-consultas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos_consultas')
        .select(`
          *,
          paciente:pacientes(nome_completo, telefone),
          profissional:profissionais_saude(user_profile_id, especialidade),
          estabelecimento:estabelecimentos_saude(nome)
        `)
        .order('data_hora', { ascending: true })

      if (error) throw error
      return data as AgendamentoConsulta[]
    }
  })

  // Pacientes
  const { data: pacientes = [], isLoading: loadingPacientes } = useQuery({
    queryKey: ['saude', 'pacientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('status', 'ativo')
        .order('nome_completo', { ascending: true })

      if (error) throw error
      return data as Paciente[]
    }
  })

  // =====================================================
  // MUTATIONS - ESTABELECIMENTOS
  // =====================================================

  const criarEstabelecimentoMutation = useMutation({
    mutationFn: async (dados: Partial<EstabelecimentoSaude>) => {
      const { data, error } = await supabase
        .from('estabelecimentos_saude')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saude', 'estabelecimentos'] })
      toast.success('Estabelecimento de saúde criado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar estabelecimento:', error)
      toast.error('Erro ao criar estabelecimento de saúde')
    }
  })

  const atualizarEstabelecimentoMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string, dados: Partial<EstabelecimentoSaude> }) => {
      const { data, error } = await supabase
        .from('estabelecimentos_saude')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saude', 'estabelecimentos'] })
      toast.success('Estabelecimento atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar estabelecimento:', error)
      toast.error('Erro ao atualizar estabelecimento')
    }
  })

  const desativarEstabelecimentoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('estabelecimentos_saude')
        .update({ status: 'inativo' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saude', 'estabelecimentos'] })
      toast.success('Estabelecimento desativado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao desativar estabelecimento:', error)
      toast.error('Erro ao desativar estabelecimento')
    }
  })

  // =====================================================
  // MUTATIONS - AGENDAMENTOS
  // =====================================================

  const criarAgendamentoMutation = useMutation({
    mutationFn: async (dados: Partial<AgendamentoConsulta>) => {
      const { data, error } = await supabase
        .from('agendamentos_consultas')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saude', 'agendamentos-consultas'] })
      toast.success('Agendamento criado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar agendamento:', error)
      toast.error('Erro ao criar agendamento')
    }
  })

  const atualizarStatusAgendamentoMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: StatusAgendamento }) => {
      const { data, error } = await supabase
        .from('agendamentos_consultas')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saude', 'agendamentos-consultas'] })
      toast.success('Status do agendamento atualizado!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar agendamento:', error)
      toast.error('Erro ao atualizar agendamento')
    }
  })

  // =====================================================
  // MUTATIONS - PACIENTES
  // =====================================================

  const criarPacienteMutation = useMutation({
    mutationFn: async (dados: Partial<Paciente>) => {
      const { data, error } = await supabase
        .from('pacientes')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saude', 'pacientes'] })
      toast.success('Paciente cadastrado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao cadastrar paciente:', error)
      toast.error('Erro ao cadastrar paciente')
    }
  })

  const atualizarPacienteMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string, dados: Partial<Paciente> }) => {
      const { data, error } = await supabase
        .from('pacientes')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saude', 'pacientes'] })
      toast.success('Paciente atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar paciente:', error)
      toast.error('Erro ao atualizar paciente')
    }
  })

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadores = () => {
    const hoje = new Date().toISOString().split('T')[0]
    
    const agendamentosHoje = agendamentos.filter(a => 
      a.data_hora.startsWith(hoje)
    ).length
    
    const agendamentosConfirmados = agendamentos.filter(a => 
      a.status === 'confirmado' && a.data_hora.startsWith(hoje)
    ).length
    
    const pacientesAtivos = pacientes.filter(p => p.status === 'ativo').length
    const estabelecimentosAtivos = estabelecimentos.filter(e => e.status === 'ativo').length

    return {
      agendamentosHoje,
      agendamentosConfirmados,
      pacientesAtivos,
      estabelecimentosAtivos,
      agendamentosPendentes: agendamentos.filter(a => a.status === 'agendado').length
    }
  }

  // =====================================================
  // RETURN DO HOOK
  // =====================================================

  return {
    // Data
    estabelecimentos,
    agendamentos,
    pacientes,

    // Loading states
    isLoading: loadingEstabelecimentos || loadingAgendamentos || loadingPacientes,
    loadingEstabelecimentos,
    loadingAgendamentos,
    loadingPacientes,

    // Mutations - Estabelecimentos
    criarEstabelecimento: criarEstabelecimentoMutation.mutateAsync,
    atualizarEstabelecimento: atualizarEstabelecimentoMutation.mutateAsync,
    desativarEstabelecimento: desativarEstabelecimentoMutation.mutateAsync,
    isCreatingEstabelecimento: criarEstabelecimentoMutation.isPending,
    isUpdatingEstabelecimento: atualizarEstabelecimentoMutation.isPending,

    // Mutations - Agendamentos
    criarAgendamento: criarAgendamentoMutation.mutateAsync,
    atualizarStatusAgendamento: atualizarStatusAgendamentoMutation.mutateAsync,
    isCreatingAgendamento: criarAgendamentoMutation.isPending,
    isUpdatingAgendamento: atualizarStatusAgendamentoMutation.isPending,

    // Mutations - Pacientes
    criarPaciente: criarPacienteMutation.mutateAsync,
    atualizarPaciente: atualizarPacienteMutation.mutateAsync,
    isCreatingPaciente: criarPacienteMutation.isPending,
    isUpdatingPaciente: atualizarPacienteMutation.isPending,

    // Utilities
    getIndicadores
  }
}