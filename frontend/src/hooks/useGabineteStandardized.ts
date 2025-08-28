// =====================================================
// HOOK PADRONIZADO GABINETE - FASE 3
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
// TIPOS PADRONIZADOS GABINETE
// =====================================================

export interface AgendaGabinete extends BaseEntity {
  tenant_id: string
  
  // Identificação
  titulo: string
  descricao?: string
  tipo_evento: 'reuniao' | 'audiencia_publica' | 'cerimonia' | 'evento_externo' | 'viagem_oficial' | 'compromisso_social' | 'visita_tecnica'
  categoria: 'oficial' | 'politico' | 'tecnico' | 'social' | 'protocolo'
  
  // Data e hora
  data_inicio: string
  data_fim: string
  horario_inicio: string
  horario_fim: string
  dia_todo: boolean
  
  // Local
  local_evento: string
  endereco?: EnderecoPadrao
  sala_reuniao?: string
  capacidade_local?: number
  
  // Participantes
  organizador_id: string
  participantes_internos: string[] // IDs dos user_profiles
  participantes_externos?: {
    nome: string
    cargo?: string
    instituicao?: string
    contato?: ContatoPadrao
  }[]
  total_participantes?: number
  
  // Logística
  recursos_necessarios?: string[]
  apoio_cerimonial: boolean
  apoio_seguranca: boolean
  apoio_transporte: boolean
  coffee_break: boolean
  transmissao_online: boolean
  
  // Documentação
  pauta_reuniao?: string
  documentos_anexos?: string[]
  ata_gerada: boolean
  arquivo_ata?: string
  fotos_evento?: string[]
  
  // Custos
  custo_estimado?: number
  fonte_recursos?: string
  aprovacao_orcamentaria: boolean
  
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'realizado' | 'cancelado' | 'adiado'
  prioridade: PrioridadePadrao
}

export interface CorrespondenciaOficial extends BaseEntity {
  tenant_id: string
  
  // Identificação
  numero_correspondencia: string
  tipo: 'oficio' | 'memorando' | 'carta' | 'circular' | 'portaria' | 'decreto' | 'lei' | 'convite' | 'comunicado'
  assunto: string
  
  // Origem e destino
  remetente_interno: boolean
  remetente_nome: string
  remetente_cargo?: string
  remetente_instituicao?: string
  remetente_contato?: ContatoPadrao
  
  destinatario_interno: boolean
  destinatario_nome: string
  destinatario_cargo?: string
  destinatario_instituicao?: string
  destinatario_contato?: ContatoPadrao
  
  // Conteúdo
  conteudo: string
  anexos?: string[]
  referencias?: string[]
  
  // Processamento
  data_elaboracao: string
  elaborado_por_id: string
  revisado_por_id?: string
  aprovado_por_id?: string
  
  // Expedição
  data_expedicao?: string
  forma_envio: 'correio' | 'email' | 'protocolo_interno' | 'entrega_pessoal' | 'publicacao_oficial'
  numero_protocolo_saida?: string
  comprovante_recebimento?: string
  
  // Controle
  prazo_resposta?: string
  resposta_recebida: boolean
  data_resposta?: string
  arquivo_resposta?: string
  
  // Classificação
  classificacao: 'publico' | 'restrito' | 'confidencial' | 'reservado'
  prioridade: PrioridadePadrao
  
  status: 'rascunho' | 'em_revisao' | 'aprovado' | 'expedido' | 'entregue' | 'respondido' | 'arquivado'
}

export interface DecretoPortaria extends BaseEntity {
  tenant_id: string
  
  // Identificação
  numero: string
  tipo: 'decreto' | 'portaria'
  titulo: string
  ementa: string
  
  // Conteúdo
  considerandos?: string[]
  fundamentacao_legal: string[]
  artigos: {
    numero: number
    conteudo: string
    paragrafos?: string[]
    incisos?: string[]
  }[]
  disposicoes_finais?: string[]
  
  // Tramitação
  elaborado_por_id: string
  revisado_juridicamente: boolean
  revisor_juridico_id?: string
  parecer_juridico?: string
  
  // Aprovação
  aprovado_por_id?: string
  data_assinatura?: string
  local_assinatura?: string
  
  // Publicação
  data_publicacao?: string
  veiculo_publicacao?: string
  numero_edicao?: string
  pagina_publicacao?: number
  
  // Vigência
  data_vigencia: string
  prazo_vigencia?: string
  revoga_normas?: string[]
  altera_normas?: string[]
  
  // Controle
  responsavel_acompanhamento_id?: string
  prazo_implementacao?: string
  indicadores_cumprimento?: string[]
  
  // Arquivamento
  arquivo_original: string
  arquivo_publicado?: string
  processo_origem?: string
  
  status: 'elaboracao' | 'revisao_juridica' | 'aprovacao' | 'assinado' | 'publicado' | 'vigente' | 'revogado'
}

export interface AudienciaPublica extends BaseEntity {
  tenant_id: string
  
  // Identificação
  titulo: string
  numero_edital?: string
  tema: string
  objetivo: string
  justificativa: string
  
  // Organização
  organizador_id: string
  comissao_organizadora: string[]
  modalidade: 'presencial' | 'virtual' | 'hibrida'
  
  // Data e local
  data_audiencia: string
  horario_inicio: string
  horario_fim: string
  local_evento: string
  endereco?: EnderecoPadrao
  capacidade_maxima?: number
  link_transmissao?: string
  
  // Participação
  inscricoes_abertas: boolean
  data_inicio_inscricoes?: string
  data_fim_inscricoes?: string
  forma_inscricao?: string
  total_inscritos: number
  total_presentes?: number
  
  // Documentação base
  documentos_referencia: string[]
  estudos_tecnicos?: string[]
  pareceres_anexos?: string[]
  
  // Condução
  mesa_diretora: {
    nome: string
    cargo: string
    papel: 'presidente' | 'secretario' | 'membro'
  }[]
  cronograma_atividades?: {
    horario: string
    atividade: string
    responsavel?: string
  }[]
  
  // Participação cidadã
  manifestacoes_escritas: number
  manifestacoes_orais: number
  total_questionamentos: number
  propostas_recebidas?: string[]
  
  // Resultados
  ata_audiencia?: string
  relatorio_participacao?: string
  sintese_manifestacoes?: string
  encaminhamentos: string[]
  
  // Custos
  custo_realizacao?: number
  fonte_recursos?: string
  
  status: 'convocada' | 'inscricoes_abertas' | 'realizada' | 'ata_elaborada' | 'encerrada'
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useGabineteStandardized() {
  const queryClient = useQueryClient()

  // =====================================================
  // QUERIES
  // =====================================================

  // Agenda do gabinete
  const { data: agendaGabinete = [], isLoading: loadingAgenda } = useQuery({
    queryKey: ['gabinete', 'agenda'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('gabinete_agenda')
        .select(`
          *,
          organizador:user_profiles(nome_completo, cargo),
          participantes_internos_detalhes:user_profiles(nome_completo, cargo, secretaria_id)
        `)
        .order('data_inicio', { ascending: true })

      if (error) throw error
      return data as AgendaGabinete[]
    }
  })

  // Correspondências oficiais
  const { data: correspondenciasOficiais = [], isLoading: loadingCorrespondencias } = useQuery({
    queryKey: ['gabinete', 'correspondencias'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('gabinete_correspondencias')
        .select(`
          *,
          elaborado_por:user_profiles(nome_completo),
          revisado_por:user_profiles(nome_completo),
          aprovado_por:user_profiles(nome_completo)
        `)
        .order('data_elaboracao', { ascending: false })

      if (error) throw error
      return data as CorrespondenciaOficial[]
    }
  })

  // Decretos e portarias
  const { data: decretosPortarias = [], isLoading: loadingDecretos } = useQuery({
    queryKey: ['gabinete', 'decretos-portarias'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('gabinete_decretos_portarias')
        .select(`
          *,
          elaborado_por:user_profiles(nome_completo),
          revisor_juridico:user_profiles(nome_completo),
          aprovado_por:user_profiles(nome_completo)
        `)
        .order('numero', { ascending: false })

      if (error) throw error
      return data as DecretoPortaria[]
    }
  })

  // Audiências públicas
  const { data: audienciasPublicas = [], isLoading: loadingAudiencias } = useQuery({
    queryKey: ['gabinete', 'audiencias-publicas'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('gabinete_audiencias_publicas')
        .select(`
          *,
          organizador:user_profiles(nome_completo, cargo)
        `)
        .order('data_audiencia', { ascending: false })

      if (error) throw error
      return data as AudienciaPublica[]
    }
  })

  // =====================================================
  // MUTATIONS - AGENDA
  // =====================================================

  const criarEventoAgendaMutation = useMutation({
    mutationFn: async (dados: Partial<AgendaGabinete>) => {
      const { data, error } = await APIClient
        .from('gabinete_agenda')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gabinete', 'agenda'] })
      toast.success('Evento adicionado à agenda!')
    },
    onError: (error) => {
      console.error('Erro ao criar evento:', error)
      toast.error('Erro ao adicionar evento à agenda')
    }
  })

  const atualizarStatusEventoMutation = useMutation({
    mutationFn: async ({ id, status, observacoes }: { 
      id: string, 
      status: AgendaGabinete['status'], 
      observacoes?: string 
    }) => {
      const { data, error } = await APIClient
        .from('gabinete_agenda')
        .update({ status, descricao: observacoes })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gabinete', 'agenda'] })
      toast.success('Status do evento atualizado!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar evento:', error)
      toast.error('Erro ao atualizar status do evento')
    }
  })

  // =====================================================
  // MUTATIONS - CORRESPONDÊNCIAS
  // =====================================================

  const criarCorrespondenciaMutation = useMutation({
    mutationFn: async (dados: Partial<CorrespondenciaOficial>) => {
      // Gerar número da correspondência
      const ano = new Date().getFullYear()
      const timestamp = Date.now().toString().slice(-6)
      const numero = `${dados.tipo?.toUpperCase()}-${ano}-${timestamp}`
      
      const { data, error } = await APIClient
        .from('gabinete_correspondencias')
        .insert([{ ...dados, numero_correspondencia: numero }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gabinete', 'correspondencias'] })
      toast.success('Correspondência criada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar correspondência:', error)
      toast.error('Erro ao criar correspondência')
    }
  })

  const expedirCorrespondenciaMutation = useMutation({
    mutationFn: async ({ id, formaEnvio, protocolo }: { 
      id: string, 
      formaEnvio: CorrespondenciaOficial['forma_envio'],
      protocolo?: string
    }) => {
      const { data, error } = await APIClient
        .from('gabinete_correspondencias')
        .update({
          status: 'expedido',
          data_expedicao: new Date().toISOString(),
          forma_envio: formaEnvio,
          numero_protocolo_saida: protocolo
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gabinete', 'correspondencias'] })
      toast.success('Correspondência expedida com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao expedir correspondência:', error)
      toast.error('Erro ao expedir correspondência')
    }
  })

  // =====================================================
  // MUTATIONS - DECRETOS E PORTARIAS
  // =====================================================

  const criarDecretoPortariaMutation = useMutation({
    mutationFn: async (dados: Partial<DecretoPortaria>) => {
      // Gerar número sequencial
      const ano = new Date().getFullYear()
      const { count } = await APIClient
        .from('gabinete_decretos_portarias')
        .select('*', { count: 'exact', head: true })
        .eq('tipo', dados.tipo)
        .gte('created_at', `${ano}-01-01`)
        .lt('created_at', `${ano + 1}-01-01`)
      
      const numeroSequencial = (count || 0) + 1
      const numero = `${dados.tipo === 'decreto' ? 'D' : 'P'} ${numeroSequencial}/${ano}`
      
      const { data, error } = await APIClient
        .from('gabinete_decretos_portarias')
        .insert([{ ...dados, numero }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gabinete', 'decretos-portarias'] })
      toast.success('Decreto/Portaria criado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar decreto/portaria:', error)
      toast.error('Erro ao criar decreto/portaria')
    }
  })

  const publicarDecretoMutation = useMutation({
    mutationFn: async ({ id, dadosPublicacao }: { 
      id: string, 
      dadosPublicacao: {
        data_publicacao: string
        veiculo_publicacao: string
        numero_edicao?: string
        data_vigencia: string
      }
    }) => {
      const { data, error } = await APIClient
        .from('gabinete_decretos_portarias')
        .update({
          ...dadosPublicacao,
          status: 'publicado'
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gabinete', 'decretos-portarias'] })
      toast.success('Decreto/Portaria publicado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao publicar decreto/portaria:', error)
      toast.error('Erro ao publicar decreto/portaria')
    }
  })

  // =====================================================
  // MUTATIONS - AUDIÊNCIAS PÚBLICAS
  // =====================================================

  const convocarAudienciaPublicaMutation = useMutation({
    mutationFn: async (dados: Partial<AudienciaPublica>) => {
      // Gerar número do edital
      const ano = new Date().getFullYear()
      const timestamp = Date.now().toString().slice(-4)
      const numeroEdital = `AP-${ano}-${timestamp}`
      
      const { data, error } = await APIClient
        .from('gabinete_audiencias_publicas')
        .insert([{ ...dados, numero_edital: numeroEdital }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gabinete', 'audiencias-publicas'] })
      toast.success('Audiência pública convocada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao convocar audiência:', error)
      toast.error('Erro ao convocar audiência pública')
    }
  })

  const registrarResultadosAudienciaMutation = useMutation({
    mutationFn: async ({ id, resultados }: { 
      id: string, 
      resultados: {
        total_presentes: number
        manifestacoes_escritas: number
        manifestacoes_orais: number
        encaminhamentos: string[]
        status: AudienciaPublica['status']
      }
    }) => {
      const { data, error } = await APIClient
        .from('gabinete_audiencias_publicas')
        .update(resultados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gabinete', 'audiencias-publicas'] })
      toast.success('Resultados da audiência registrados!')
    },
    onError: (error) => {
      console.error('Erro ao registrar resultados:', error)
      toast.error('Erro ao registrar resultados da audiência')
    }
  })

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadores = () => {
    const hoje = new Date().toISOString().split('T')[0]
    const semanaAtual = new Date()
    const proximaSemana = new Date()
    proximaSemana.setDate(semanaAtual.getDate() + 7)

    return {
      // Agenda
      eventosHoje: agendaGabinete.filter(e => 
        e.data_inicio.startsWith(hoje) && ['confirmado', 'em_andamento'].includes(e.status)
      ).length,
      eventosProximaSemana: agendaGabinete.filter(e => {
        const dataEvento = new Date(e.data_inicio)
        return dataEvento >= semanaAtual && dataEvento <= proximaSemana && e.status !== 'cancelado'
      }).length,
      reunioesAgendadas: agendaGabinete.filter(e => 
        e.tipo_evento === 'reuniao' && e.status === 'agendado'
      ).length,

      // Correspondências
      correspondenciasPendentes: correspondenciasOficiais.filter(c => 
        ['rascunho', 'em_revisao'].includes(c.status)
      ).length,
      correspondenciasExpedidas: correspondenciasOficiais.filter(c => 
        ['expedido', 'entregue'].includes(c.status)
      ).length,
      respostasAguardando: correspondenciasOficiais.filter(c => 
        c.status === 'entregue' && !c.resposta_recebida && c.prazo_resposta
      ).length,

      // Decretos e Portarias
      decretosVigentes: decretosPortarias.filter(d => d.status === 'vigente').length,
      decretosEmElaboracao: decretosPortarias.filter(d => 
        ['elaboracao', 'revisao_juridica', 'aprovacao'].includes(d.status)
      ).length,
      portariasPublicadas: decretosPortarias.filter(d => 
        d.tipo === 'portaria' && ['publicado', 'vigente'].includes(d.status)
      ).length,

      // Audiências Públicas
      audienciasConvocadas: audienciasPublicas.filter(a => a.status === 'convocada').length,
      audienciasRealizadas: audienciasPublicas.filter(a => a.status === 'realizada').length,
      totalParticipantesAudiencias: audienciasPublicas
        .filter(a => a.total_presentes)
        .reduce((acc, a) => acc + (a.total_presentes || 0), 0),
      inscricoesAbertas: audienciasPublicas.filter(a => a.inscricoes_abertas).length
    }
  }

  // =====================================================
  // RETURN DO HOOK
  // =====================================================

  return {
    // Data
    agendaGabinete,
    correspondenciasOficiais,
    decretosPortarias,
    audienciasPublicas,

    // Loading states
    isLoading: loadingAgenda || loadingCorrespondencias || loadingDecretos || loadingAudiencias,
    loadingAgenda,
    loadingCorrespondencias,
    loadingDecretos,
    loadingAudiencias,

    // Mutations - Agenda
    criarEventoAgenda: criarEventoAgendaMutation.mutateAsync,
    atualizarStatusEvento: atualizarStatusEventoMutation.mutateAsync,
    isCreatingEvento: criarEventoAgendaMutation.isPending,
    isUpdatingEvento: atualizarStatusEventoMutation.isPending,

    // Mutations - Correspondências
    criarCorrespondencia: criarCorrespondenciaMutation.mutateAsync,
    expedirCorrespondencia: expedirCorrespondenciaMutation.mutateAsync,
    isCreatingCorrespondencia: criarCorrespondenciaMutation.isPending,
    isExpedindoCorrespondencia: expedirCorrespondenciaMutation.isPending,

    // Mutations - Decretos e Portarias
    criarDecretoPortaria: criarDecretoPortariaMutation.mutateAsync,
    publicarDecreto: publicarDecretoMutation.mutateAsync,
    isCreatingDecreto: criarDecretoPortariaMutation.isPending,
    isPublicandoDecreto: publicarDecretoMutation.isPending,

    // Mutations - Audiências
    convocarAudienciaPublica: convocarAudienciaPublicaMutation.mutateAsync,
    registrarResultadosAudiencia: registrarResultadosAudienciaMutation.mutateAsync,
    isConvocandoAudiencia: convocarAudienciaPublicaMutation.isPending,
    isRegistrandoResultados: registrarResultadosAudienciaMutation.isPending,

    // Utilities
    getIndicadores
  }
}