// =====================================================
// HOOK PADRONIZADO EDUCAÇÃO - FASE 3
// Seguindo common.ts e padrões React Query
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from "@/lib/supabase"
import { toast } from 'react-hot-toast'
import type { 
  BaseEntity, 
  StatusBase, 
  StatusProcesso,
  PessoaFisicaPadrao,
  EnderecoPadrao,
  ContatoPadrao,
  ResponsavelPadrao
} from "@/types/common"

// =====================================================
// TIPOS PADRONIZADOS EDUCAÇÃO
// =====================================================

export interface Escola extends BaseEntity {
  tenant_id: string
  
  // Identificação
  nome: string
  codigo_inep?: string
  tipo: 'creche' | 'pre_escola' | 'escola_fundamental' | 'escola_media' | 'centro_eja' | 'escola_especial'
  niveis_ensino: Array<'educacao_infantil' | 'ensino_fundamental_1' | 'ensino_fundamental_2' | 'ensino_medio' | 'eja' | 'educacao_especial'>
  
  // Localização e contato
  endereco: EnderecoPadrao
  contato: ContatoPadrao
  
  // Responsáveis
  diretor_id?: string
  coordenador_pedagogico_id?: string
  
  // Infraestrutura
  salas_aula: number
  capacidade_alunos: number
  biblioteca: boolean
  laboratorio_informatica: boolean
  quadra_esportes: boolean
  refeitorio: boolean
  parque_infantil: boolean
  
  // Horários
  turnos_funcionamento: Array<'matutino' | 'vespertino' | 'noturno' | 'integral'>
  horario_funcionamento: Record<string, any>
  
  // Status
  status: StatusBase
  data_fundacao?: string
}

export interface Turma extends BaseEntity {
  tenant_id: string
  escola_id: string
  professor_responsavel_id?: string
  
  // Identificação
  nome: string
  nivel_ensino: 'educacao_infantil' | 'ensino_fundamental_1' | 'ensino_fundamental_2' | 'ensino_medio' | 'eja' | 'educacao_especial'
  serie_ano: string
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral'
  ano_letivo: number
  
  // Capacidade
  capacidade_maxima: number
  alunos_matriculados: number
  
  // Horários
  horario_aulas: Record<string, any>
  
  // Status
  status: StatusBase
}

export interface Aluno extends BaseEntity {
  tenant_id: string
  escola_id: string
  
  // Dados pessoais
  nome_completo: string
  cpf?: string
  data_nascimento: string
  sexo: 'M' | 'F' | 'O'
  
  // Endereço e contato
  endereco: EnderecoPadrao
  contato: ContatoPadrao
  
  // Responsável obrigatório
  responsavel: ResponsavelPadrao
  
  // Dados escolares
  numero_matricula: string
  nivel_ensino: 'educacao_infantil' | 'ensino_fundamental_1' | 'ensino_fundamental_2' | 'ensino_medio' | 'eja' | 'educacao_especial'
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral'
  ano_letivo: number
  serie_ano: string
  
  // Status de matrícula
  status_matricula: 'ativa' | 'transferida' | 'concluida' | 'abandonada' | 'rematriculada' | 'cancelada'
  data_matricula: string
  data_conclusao?: string
  data_transferencia?: string
  escola_transferencia?: string
  
  // Necessidades especiais
  necessidades_especiais: boolean
  descricao_necessidades?: string
  
  // Transporte escolar
  utiliza_transporte: boolean
  rota_transporte?: string
}

export interface Matricula extends BaseEntity {
  tenant_id: string
  aluno_id: string
  turma_id: string
  protocolo_id?: string
  
  // Dados da matrícula
  data_matricula: string
  status: 'ativa' | 'transferida' | 'concluida' | 'abandonada' | 'rematriculada' | 'cancelada'
  
  observacoes?: string
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useEducacaoStandardized() {
  const queryClient = useQueryClient()

  // =====================================================
  // QUERIES
  // =====================================================

  // Escolas
  const { data: escolas = [], isLoading: loadingEscolas } = useQuery({
    queryKey: ['educacao', 'escolas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escolas')
        .select(`
          *,
          diretor:user_profiles(nome_completo),
          coordenador_pedagogico:user_profiles(nome_completo)
        `)
        .eq('status', 'ativo')
        .order('nome', { ascending: true })

      if (error) throw error
      return data as Escola[]
    }
  })

  // Turmas
  const { data: turmas = [], isLoading: loadingTurmas } = useQuery({
    queryKey: ['educacao', 'turmas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          escola:escolas(nome),
          professor_responsavel:professores(user_profile_id)
        `)
        .eq('status', 'ativo')
        .order('nome', { ascending: true })

      if (error) throw error
      return data as Turma[]
    }
  })

  // Alunos
  const { data: alunos = [], isLoading: loadingAlunos } = useQuery({
    queryKey: ['educacao', 'alunos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          *,
          escola:escolas(nome)
        `)
        .eq('status_matricula', 'ativa')
        .order('nome_completo', { ascending: true })

      if (error) throw error
      return data as Aluno[]
    }
  })

  // Matrículas
  const { data: matriculas = [], isLoading: loadingMatriculas } = useQuery({
    queryKey: ['educacao', 'matriculas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matriculas')
        .select(`
          *,
          aluno:alunos(nome_completo, numero_matricula),
          turma:turmas(nome, escola_id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Matricula[]
    }
  })

  // =====================================================
  // MUTATIONS - ESCOLAS
  // =====================================================

  const criarEscolaMutation = useMutation({
    mutationFn: async (dados: Partial<Escola>) => {
      const { data, error } = await supabase
        .from('escolas')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educacao', 'escolas'] })
      toast.success('Escola criada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar escola:', error)
      toast.error('Erro ao criar escola')
    }
  })

  const atualizarEscolaMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string, dados: Partial<Escola> }) => {
      const { data, error } = await supabase
        .from('escolas')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educacao', 'escolas'] })
      toast.success('Escola atualizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar escola:', error)
      toast.error('Erro ao atualizar escola')
    }
  })

  const desativarEscolaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('escolas')
        .update({ status: 'inativo' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educacao', 'escolas'] })
      toast.success('Escola desativada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao desativar escola:', error)
      toast.error('Erro ao desativar escola')
    }
  })

  // =====================================================
  // MUTATIONS - TURMAS
  // =====================================================

  const criarTurmaMutation = useMutation({
    mutationFn: async (dados: Partial<Turma>) => {
      const { data, error } = await supabase
        .from('turmas')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educacao', 'turmas'] })
      toast.success('Turma criada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar turma:', error)
      toast.error('Erro ao criar turma')
    }
  })

  const atualizarTurmaMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string, dados: Partial<Turma> }) => {
      const { data, error } = await supabase
        .from('turmas')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educacao', 'turmas'] })
      toast.success('Turma atualizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar turma:', error)
      toast.error('Erro ao atualizar turma')
    }
  })

  // =====================================================
  // MUTATIONS - ALUNOS
  // =====================================================

  const criarAlunoMutation = useMutation({
    mutationFn: async (dados: Partial<Aluno>) => {
      const { data, error } = await supabase
        .from('alunos')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educacao', 'alunos'] })
      toast.success('Aluno cadastrado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao cadastrar aluno:', error)
      toast.error('Erro ao cadastrar aluno')
    }
  })

  const atualizarAlunoMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string, dados: Partial<Aluno> }) => {
      const { data, error } = await supabase
        .from('alunos')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educacao', 'alunos'] })
      toast.success('Aluno atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar aluno:', error)
      toast.error('Erro ao atualizar aluno')
    }
  })

  // =====================================================
  // MUTATIONS - MATRÍCULAS
  // =====================================================

  const criarMatriculaMutation = useMutation({
    mutationFn: async (dados: Partial<Matricula>) => {
      const { data, error } = await supabase
        .from('matriculas')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educacao', 'matriculas'] })
      queryClient.invalidateQueries({ queryKey: ['educacao', 'turmas'] })
      toast.success('Matrícula realizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao realizar matrícula:', error)
      toast.error('Erro ao realizar matrícula')
    }
  })

  const transferirAlunoMutation = useMutation({
    mutationFn: async ({ matriculaId, novaEscola }: { matriculaId: string, novaEscola: string }) => {
      const { data, error } = await supabase
        .from('matriculas')
        .update({
          status: 'transferida',
          observacoes: `Transferido para: ${novaEscola}`
        })
        .eq('id', matriculaId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educacao', 'matriculas'] })
      toast.success('Transferência registrada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao transferir aluno:', error)
      toast.error('Erro ao transferir aluno')
    }
  })

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadores = () => {
    return {
      totalEscolas: escolas.length,
      escolasAtivas: escolas.filter(e => e.status === 'ativo').length,
      totalTurmas: turmas.length,
      turmasAtivas: turmas.filter(t => t.status === 'ativo').length,
      totalAlunos: alunos.length,
      alunosMatriculados: alunos.filter(a => a.status_matricula === 'ativa').length,
      matriculasRealizadas: matriculas.filter(m => m.status === 'ativa').length,
      ocupacaoMedia: turmas.length > 0 ? turmas.reduce((acc, t) => acc + (t.alunos_matriculados / t.capacidade_maxima), 0) / turmas.length : 0
    }
  }

  // =====================================================
  // RETURN DO HOOK
  // =====================================================

  return {
    // Data
    escolas,
    turmas,
    alunos,
    matriculas,

    // Loading states
    isLoading: loadingEscolas || loadingTurmas || loadingAlunos || loadingMatriculas,
    loadingEscolas,
    loadingTurmas,
    loadingAlunos,
    loadingMatriculas,

    // Mutations - Escolas
    criarEscola: criarEscolaMutation.mutateAsync,
    atualizarEscola: atualizarEscolaMutation.mutateAsync,
    desativarEscola: desativarEscolaMutation.mutateAsync,
    isCreatingEscola: criarEscolaMutation.isPending,
    isUpdatingEscola: atualizarEscolaMutation.isPending,

    // Mutations - Turmas
    criarTurma: criarTurmaMutation.mutateAsync,
    atualizarTurma: atualizarTurmaMutation.mutateAsync,
    isCreatingTurma: criarTurmaMutation.isPending,
    isUpdatingTurma: atualizarTurmaMutation.isPending,

    // Mutations - Alunos
    criarAluno: criarAlunoMutation.mutateAsync,
    atualizarAluno: atualizarAlunoMutation.mutateAsync,
    isCreatingAluno: criarAlunoMutation.isPending,
    isUpdatingAluno: atualizarAlunoMutation.isPending,

    // Mutations - Matrículas
    criarMatricula: criarMatriculaMutation.mutateAsync,
    transferirAluno: transferirAlunoMutation.mutateAsync,
    isCreatingMatricula: criarMatriculaMutation.isPending,
    isTransferindoAluno: transferirAlunoMutation.isPending,

    // Utilities
    getIndicadores
  }
}