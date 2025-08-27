// =====================================================
// HOOK COMPLETO PARA PLANEJAMENTO URBANO
// 6 FUNCIONALIDADES INTEGRADAS
// =====================================================

import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { toast } from 'react-hot-toast'

// =====================================================
// INTERFACES E TIPOS
// =====================================================

export interface ProjetoArquitetonico {
  id: string
  numero_processo: string
  requerente_id: string
  profissional_responsavel: string
  crea_cau: string
  endereco_obra: string
  coordenadas?: any
  tipo_projeto: 'residencial' | 'comercial' | 'industrial' | 'publico' | 'misto'
  area_construida: number
  area_terreno: number
  numero_pavimentos: number
  descricao_projeto?: string
  documentos_anexos: string[]
  plantas_anexas: string[]
  data_protocolo: string
  prazo_analise_dias: number
  status: 'protocolado' | 'em_analise' | 'pendencias' | 'aprovado' | 'rejeitado'
  pareceres: unknown[]
  observacoes?: string
  taxa_analise: number
  created_at: string
  
  // Relacionamentos
  requerente?: {
    nome: string
    email: string
    telefone: string
  }
  pareceres_tecnicos?: ParecerTecnico[]
}

export interface ParecerTecnico {
  id: string
  projeto_id: string
  tecnico_id: string
  area_tecnica: 'arquitetura' | 'engenharia' | 'urbanismo' | 'meio_ambiente' | 'bombeiros'
  parecer: string
  aprovado: boolean
  pendencias: string[]
  data_parecer: string
  
  // Relacionamentos
  projeto?: ProjetoArquitetonico
  tecnico?: {
    nome: string
  }
}

export interface Alvara {
  id: string
  numero_alvara: string
  tipo: 'construcao' | 'funcionamento' | 'reforma' | 'demolicao' | 'habite_se'
  requerente_id: string
  endereco: string
  projeto_id?: string
  descricao?: string
  area_autorizada?: number
  atividade?: string
  data_emissao: string
  data_validade?: string
  valor_taxa: number
  status: 'vigente' | 'vencido' | 'cassado' | 'suspenso'
  condicoes_especiais: string[]
  vistorias_exigidas: string[]
  responsavel_emissao_id: string
  observacoes?: string
  created_at: string
  
  // Relacionamentos
  requerente?: {
    nome: string
    email: string
  }
  projeto?: ProjetoArquitetonico
  responsavel_emissao?: {
    nome: string
  }
}

export interface DenunciaUrbanistica {
  id: string
  numero_denuncia: string
  denunciante_id?: string
  endereco_denuncia: string
  coordenadas?: any
  tipo_irregularidade: 'construcao_irregular' | 'uso_inadequado' | 'poluicao_sonora' | 'poluicao_visual' | 'ocupacao_irregular'
  descricao: string
  fotos: string[]
  anonima: boolean
  data_denuncia: string
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente'
  status: 'recebida' | 'em_analise' | 'vistoria_agendada' | 'autuada' | 'resolvida'
  fiscal_responsavel_id?: string
  data_vistoria?: string
  auto_infracao?: string
  multa_aplicada: number
  prazo_regularizacao?: string
  regularizada: boolean
  observacoes?: string
  
  // Relacionamentos
  denunciante?: {
    nome: string
    email: string
  }
  fiscal_responsavel?: {
    nome: string
  }
  auto_infracao_detalhes?: AutoInfracao
}

export interface AutoInfracao {
  id: string
  numero_auto: string
  denuncia_id?: string
  autuado_id: string
  endereco_infracao: string
  tipo_infracao: string
  descricao_infracao: string
  base_legal: string
  valor_multa: number
  data_autuacao: string
  prazo_defesa_dias: number
  prazo_regularizacao_dias: number
  fiscal_autuante_id: string
  status: 'autuado' | 'defendido' | 'pago' | 'parcelado' | 'executado'
  data_pagamento?: string
  observacoes?: string
  
  // Relacionamentos
  denuncia?: DenunciaUrbanistica
  autuado?: {
    nome: string
    cpf: string
  }
  fiscal_autuante?: {
    nome: string
  }
}

export interface ConsultaPublica {
  id: string
  titulo: string
  descricao: string
  tipo: 'plano_diretor' | 'zoneamento' | 'obra_publica' | 'lei' | 'projeto_urbano'
  documentos_base: string[]
  data_abertura: string
  data_encerramento: string
  modalidade: 'presencial' | 'online' | 'hibrida'
  local_presencial?: string
  link_online?: string
  responsavel_id: string
  participantes_esperados?: number
  participantes_reais: number
  status: 'planejada' | 'aberta' | 'encerrada' | 'cancelada'
  resultado_final?: string
  impacto_decisao?: string
  created_at: string
  
  // Relacionamentos
  responsavel?: {
    nome: string
  }
  participacoes?: ParticipacaoConsulta[]
}

export interface ParticipacaoConsulta {
  id: string
  consulta_id: string
  participante_id?: string
  nome_participante: string
  contribuicao: string
  data_participacao: string
  modalidade_participacao: 'presencial' | 'online' | 'documento'
  aprovado_moderacao: boolean
  resposta_oficial?: string
  incorporado_projeto: boolean
  
  // Relacionamentos
  consulta?: ConsultaPublica
  participante?: {
    nome: string
    email: string
  }
}

export interface ZonaUrbana {
  id: string
  codigo_zona: string
  nome: string
  tipo: 'residencial' | 'comercial' | 'industrial' | 'mista' | 'preservacao' | 'especial'
  descricao?: string
  area_poligono: any
  coeficiente_aproveitamento: number
  taxa_ocupacao: number
  gabarito_maximo?: number
  recuos: any
  atividades_permitidas: string[]
  atividades_proibidas: string[]
  lei_origem?: string
  data_criacao: string
  ativa: boolean
  
  // Relacionamentos
  lotes?: LoteMunicipal[]
}

export interface LoteMunicipal {
  id: string
  inscricao_municipal: string
  endereco: string
  zona_id: string
  area_m2: number
  frente_metros?: number
  formato_lote?: any
  proprietario_id?: string
  situacao: 'regular' | 'irregular' | 'litigio' | 'desapropriacao'
  uso_atual?: string
  edificado: boolean
  area_construida: number
  valor_venal?: number
  iptu_anual?: number
  observacoes?: string
  updated_at: string
  
  // Relacionamentos
  zona?: ZonaUrbana
  proprietario?: {
    nome: string
    cpf: string
  }
}

export interface AtendimentoUrbanistico {
  id: string
  numero_atendimento: string
  solicitante_id: string
  tipo_consulta: 'zoneamento' | 'viabilidade' | 'certidao' | 'orientacao' | 'informacao'
  endereco_consulta?: string
  descricao_solicitacao: string
  documentos_anexos: string[]
  data_solicitacao: string
  prazo_resposta_dias: number
  tecnico_responsavel_id?: string
  resposta_tecnica?: string
  documentos_resposta: string[]
  data_resposta?: string
  status: 'aberto' | 'respondido' | 'finalizado'
  satisfacao_solicitante?: number
  taxa_servico: number
  observacoes?: string
  
  // Relacionamentos
  solicitante?: {
    nome: string
    email: string
    telefone: string
  }
  tecnico_responsavel?: {
    nome: string
  }
}

export const usePlanejamento = () => {
  // Estados principais
  const [projetosArquitetonicos, setProjetosArquitetonicos] = useState<ProjetoArquitetonico[]>([])
  const [pareceresTecnicos, setPareceresTecnicos] = useState<ParecerTecnico[]>([])
  const [alvaras, setAlvaras] = useState<Alvara[]>([])
  const [denunciasUrbanisticas, setDenunciasUrbanisticas] = useState<DenunciaUrbanistica[]>([])
  const [autosInfracao, setAutosInfracao] = useState<AutoInfracao[]>([])
  const [consultasPublicas, setConsultasPublicas] = useState<ConsultaPublica[]>([])
  const [participacoesConsulta, setParticipacoesConsulta] = useState<ParticipacaoConsulta[]>([])
  const [zonasUrbanas, setZonasUrbanas] = useState<ZonaUrbana[]>([])
  const [lotesMunicipais, setLotesMunicipais] = useState<LoteMunicipal[]>([])
  const [atendimentosUrbanisticos, setAtendimentosUrbanisticos] = useState<AtendimentoUrbanistico[]>([])
  
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
        loadProjetosArquitetonicos(),
        loadPareceresTecnicos(),
        loadAlvaras(),
        loadDenunciasUrbanisticas(),
        loadAutosInfracao(),
        loadConsultasPublicas(),
        loadParticipacoesConsulta(),
        loadZonasUrbanas(),
        loadLotesMunicipais(),
        loadAtendimentosUrbanisticos()
      ])
    } catch (err) {
      console.error('Erro ao carregar dados de planejamento:', err)
      setError('Erro ao carregar dados de planejamento')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // 1. APROVAÇÃO DE PROJETOS
  // =====================================================

  const loadProjetosArquitetonicos = async (filters?: any) => {
    try {
      let query = supabase
        .from('projetos_arquitetonicos')
        .select(`
          *,
          requerente:user_profiles(nome, email, telefone)
        `)
        .order('data_protocolo', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.tipo_projeto) {
        query = query.eq('tipo_projeto', filters.tipo_projeto)
      }

      const { data, error } = await query

      if (error) throw error
      setProjetosArquitetonicos(data || [])
    } catch (err) {
      console.error('Erro ao carregar projetos:', err)
    }
  }

  const loadPareceresTecnicos = async (projetoId?: string) => {
    try {
      let query = supabase
        .from('pareceres_tecnicos')
        .select(`
          *,
          tecnico:user_profiles(nome)
        `)
        .order('data_parecer', { ascending: false })

      if (projetoId) {
        query = query.eq('projeto_id', projetoId)
      }

      const { data, error } = await query

      if (error) throw error
      setPareceresTecnicos(data || [])
    } catch (err) {
      console.error('Erro ao carregar pareceres:', err)
    }
  }

  const protocolizarProjeto = async (dadosProjeto: Partial<ProjetoArquitetonico>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Gerar número do processo
      const numeroProcesso = await gerarNumeroProcesso()

      // Calcular taxa de análise baseada na área
      const taxaAnalise = calcularTaxaAnalise(dadosProjeto.area_construida || 0, dadosProjeto.tipo_projeto!)

      const { data, error } = await supabase
        .from('projetos_arquitetonicos')
        .insert([{
          ...dadosProjeto,
          requerente_id: user?.id,
          numero_processo: numeroProcesso,
          status: 'protocolado',
          prazo_analise_dias: definirPrazoAnalise(dadosProjeto.tipo_projeto!),
          taxa_analise: taxaAnalise,
          pareceres: []
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Projeto protocolizado com sucesso!')
      await loadProjetosArquitetonicos()
      return data
    } catch (err) {
      console.error('Erro ao protocolizar projeto:', err)
      toast.error('Erro ao protocolizar projeto')
      return null
    }
  }

  const gerarNumeroProcesso = async (): Promise<string> => {
    const ano = new Date().getFullYear()
    const { data } = await supabase
      .from('projetos_arquitetonicos')
      .select('numero_processo')
      .like('numero_processo', `${ano}%`)
      .order('numero_processo', { ascending: false })
      .limit(1)

    let proximoNumero = 1
    if (data && data.length > 0) {
      const ultimoNumero = parseInt(data[0].numero_processo.split('/')[0])
      proximoNumero = ultimoNumero + 1
    }

    return `${proximoNumero.toString().padStart(6, '0')}/${ano}`
  }

  const calcularTaxaAnalise = (areaConstructa: number, tipoProjeto: string): number => {
    let valorBase = 100 // R$ base
    
    // Por m²
    valorBase += areaConstructa * 2

    // Por tipo
    switch (tipoProjeto) {
      case 'comercial':
        valorBase *= 1.5
        break
      case 'industrial':
        valorBase *= 2
        break
      case 'publico':
        valorBase *= 0.5
        break
    }

    return Math.round(valorBase)
  }

  const definirPrazoAnalise = (tipoProjeto: string): number => {
    switch (tipoProjeto) {
      case 'residencial': return 15
      case 'comercial': return 30
      case 'industrial': return 45
      case 'publico': return 60
      default: return 30
    }
  }

  const emitirParecerTecnico = async (dadosParecer: Partial<ParecerTecnico>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('pareceres_tecnicos')
        .insert([{
          ...dadosParecer,
          tecnico_id: user?.id
        }])
        .select()
        .single()

      if (error) throw error

      // Verificar se todos os pareceres necessários foram emitidos
      await verificarCompletudePareceresEAtualizarStatus(dadosParecer.projeto_id!)

      toast.success('Parecer técnico emitido!')
      await loadPareceresTecnicos()
      return data
    } catch (err) {
      console.error('Erro ao emitir parecer:', err)
      toast.error('Erro ao emitir parecer')
      return null
    }
  }

  const verificarCompletudePareceresEAtualizarStatus = async (projetoId: string) => {
    try {
      const { data: pareceres } = await supabase
        .from('pareceres_tecnicos')
        .select('area_tecnica, aprovado')
        .eq('projeto_id', projetoId)

      const areasNecessarias = ['arquitetura', 'engenharia', 'urbanismo']
      const areasAnalisadas = pareceres?.map(p => p.area_tecnica) || []
      
      if (areasNecessarias.every(area => areasAnalisadas.includes(area))) {
        const todosAprovados = pareceres?.every(p => p.aprovado)
        const novoStatus = todosAprovados ? 'aprovado' : 'rejeitado'

        await supabase
          .from('projetos_arquitetonicos')
          .update({ status: novoStatus })
          .eq('id', projetoId)

        await loadProjetosArquitetonicos()
      }
    } catch (err) {
      console.error('Erro ao verificar pareceres:', err)
    }
  }

  const solicitarComplementacao = async (projetoId: string, pendencias: string[]) => {
    try {
      const { error } = await supabase
        .from('projetos_arquitetonicos')
        .update({
          status: 'pendencias',
          observacoes: `Documentos pendentes: ${pendencias.join(', ')}`
        })
        .eq('id', projetoId)

      if (error) throw error

      toast.success('Complementação solicitada!')
      await loadProjetosArquitetonicos()
    } catch (err) {
      console.error('Erro ao solicitar complementação:', err)
      toast.error('Erro ao solicitar complementação')
    }
  }

  // =====================================================
  // 2. EMISSÃO DE ALVARÁS
  // =====================================================

  const loadAlvaras = async (filters?: any) => {
    try {
      let query = supabase
        .from('alvaras')
        .select(`
          *,
          requerente:user_profiles!requerente_id(nome, email),
          projeto:projetos_arquitetonicos(numero_processo),
          responsavel_emissao:user_profiles!responsavel_emissao_id(nome)
        `)
        .order('data_emissao', { ascending: false })

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      setAlvaras(data || [])
    } catch (err) {
      console.error('Erro ao carregar alvarás:', err)
    }
  }

  const emitirAlvara = async (dadosAlvara: Partial<Alvara>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Gerar número do alvará
      const numeroAlvara = await gerarNumeroAlvara(dadosAlvara.tipo!)

      // Calcular validade
      const dataValidade = calcularValidadeAlvara(dadosAlvara.tipo!)

      const { data, error } = await supabase
        .from('alvaras')
        .insert([{
          ...dadosAlvara,
          numero_alvara: numeroAlvara,
          data_emissao: new Date().toISOString().split('T')[0],
          data_validade: dataValidade,
          status: 'vigente',
          responsavel_emissao_id: user?.id
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Alvará emitido com sucesso!')
      await loadAlvaras()
      return data
    } catch (err) {
      console.error('Erro ao emitir alvará:', err)
      toast.error('Erro ao emitir alvará')
      return null
    }
  }

  const gerarNumeroAlvara = async (tipo: string): Promise<string> => {
    const ano = new Date().getFullYear()
    const prefixo = tipo.toUpperCase().substring(0, 3)
    
    const { data } = await supabase
      .from('alvaras')
      .select('numero_alvara')
      .like('numero_alvara', `${prefixo}/${ano}%`)
      .order('numero_alvara', { ascending: false })
      .limit(1)

    let proximoNumero = 1
    if (data && data.length > 0) {
      const partes = data[0].numero_alvara.split('/')
      proximoNumero = parseInt(partes[2]) + 1
    }

    return `${prefixo}/${ano}/${proximoNumero.toString().padStart(4, '0')}`
  }

  const calcularValidadeAlvara = (tipo: string): string | undefined => {
    const hoje = new Date()
    
    switch (tipo) {
      case 'construcao':
        hoje.setFullYear(hoje.getFullYear() + 2)
        return hoje.toISOString().split('T')[0]
      case 'funcionamento':
        hoje.setFullYear(hoje.getFullYear() + 1)
        return hoje.toISOString().split('T')[0]
      case 'reforma':
        hoje.setFullYear(hoje.getFullYear() + 1)
        return hoje.toISOString().split('T')[0]
      default:
        return undefined // Alvará permanente
    }
  }

  const renovarAlvara = async (alvaraId: string) => {
    try {
      const novaValidade = new Date()
      novaValidade.setFullYear(novaValidade.getFullYear() + 1)

      const { error } = await supabase
        .from('alvaras')
        .update({
          data_validade: novaValidade.toISOString().split('T')[0],
          status: 'vigente'
        })
        .eq('id', alvaraId)

      if (error) throw error

      toast.success('Alvará renovado!')
      await loadAlvaras()
    } catch (err) {
      console.error('Erro ao renovar alvará:', err)
      toast.error('Erro ao renovar alvará')
    }
  }

  const cassarAlvara = async (alvaraId: string, motivo: string) => {
    try {
      const { error } = await supabase
        .from('alvaras')
        .update({
          status: 'cassado',
          observacoes: `Cassado: ${motivo}`
        })
        .eq('id', alvaraId)

      if (error) throw error

      toast.success('Alvará cassado!')
      await loadAlvaras()
    } catch (err) {
      console.error('Erro ao cassar alvará:', err)
      toast.error('Erro ao cassar alvará')
    }
  }

  // =====================================================
  // 3. RECLAMAÇÕES E DENÚNCIAS
  // =====================================================

  const loadDenunciasUrbanisticas = async (filters?: any) => {
    try {
      let query = supabase
        .from('denuncias_urbanisticas')
        .select(`
          *,
          denunciante:user_profiles!denunciante_id(nome, email),
          fiscal_responsavel:user_profiles!fiscal_responsavel_id(nome)
        `)
        .order('data_denuncia', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.tipo_irregularidade) {
        query = query.eq('tipo_irregularidade', filters.tipo_irregularidade)
      }

      if (filters?.prioridade) {
        query = query.eq('prioridade', filters.prioridade)
      }

      const { data, error } = await query

      if (error) throw error
      setDenunciasUrbanisticas(data || [])
    } catch (err) {
      console.error('Erro ao carregar denúncias:', err)
    }
  }

  const loadAutosInfracao = async () => {
    try {
      const { data, error } = await supabase
        .from('auto_infracoes')
        .select(`
          *,
          autuado:user_profiles!autuado_id(nome, cpf),
          fiscal_autuante:user_profiles!fiscal_autuante_id(nome)
        `)
        .order('data_autuacao', { ascending: false })

      if (error) throw error
      setAutosInfracao(data || [])
    } catch (err) {
      console.error('Erro ao carregar autos de infração:', err)
    }
  }

  const registrarDenuncia = async (dadosDenuncia: Partial<DenunciaUrbanistica>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Gerar número da denúncia
      const numeroDenuncia = await gerarNumeroDenuncia()

      const { data, error } = await supabase
        .from('denuncias_urbanisticas')
        .insert([{
          ...dadosDenuncia,
          numero_denuncia: numeroDenuncia,
          denunciante_id: dadosDenuncia.anonima ? null : user?.id,
          status: 'recebida',
          multa_aplicada: 0,
          regularizada: false
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Denúncia registrada!')
      await loadDenunciasUrbanisticas()
      return data
    } catch (err) {
      console.error('Erro ao registrar denúncia:', err)
      toast.error('Erro ao registrar denúncia')
      return null
    }
  }

  const gerarNumeroDenuncia = async (): Promise<string> => {
    const ano = new Date().getFullYear()
    const { data } = await supabase
      .from('denuncias_urbanisticas')
      .select('numero_denuncia')
      .like('numero_denuncia', `DEN${ano}%`)
      .order('numero_denuncia', { ascending: false })
      .limit(1)

    let proximoNumero = 1
    if (data && data.length > 0) {
      const ultimoNumero = parseInt(data[0].numero_denuncia.replace(`DEN${ano}`, ''))
      proximoNumero = ultimoNumero + 1
    }

    return `DEN${ano}${proximoNumero.toString().padStart(5, '0')}`
  }

  const agendarVistoria = async (denunciaId: string, dataVistoria: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('denuncias_urbanisticas')
        .update({
          status: 'vistoria_agendada',
          fiscal_responsavel_id: user?.id,
          data_vistoria: dataVistoria
        })
        .eq('id', denunciaId)

      if (error) throw error

      toast.success('Vistoria agendada!')
      await loadDenunciasUrbanisticas()
    } catch (err) {
      console.error('Erro ao agendar vistoria:', err)
      toast.error('Erro ao agendar vistoria')
    }
  }

  const autuar = async (denunciaId: string, dadosAuto: Partial<AutoInfracao>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Gerar número do auto
      const numeroAuto = await gerarNumeroAuto()

      const { data: autoInfracao, error: autoError } = await supabase
        .from('auto_infracoes')
        .insert([{
          ...dadosAuto,
          numero_auto: numeroAuto,
          denuncia_id: denunciaId,
          fiscal_autuante_id: user?.id,
          status: 'autuado'
        }])
        .select()
        .single()

      if (autoError) throw autoError

      // Atualizar denúncia
      const { error: denunciaError } = await supabase
        .from('denuncias_urbanisticas')
        .update({
          status: 'autuada',
          auto_infracao: numeroAuto,
          multa_aplicada: dadosAuto.valor_multa || 0
        })
        .eq('id', denunciaId)

      if (denunciaError) throw denunciaError

      toast.success('Auto de infração lavrado!')
      await loadDenunciasUrbanisticas()
      await loadAutosInfracao()
      return autoInfracao
    } catch (err) {
      console.error('Erro ao lavrar auto:', err)
      toast.error('Erro ao lavrar auto')
      return null
    }
  }

  const gerarNumeroAuto = async (): Promise<string> => {
    const ano = new Date().getFullYear()
    const { data } = await supabase
      .from('auto_infracoes')
      .select('numero_auto')
      .like('numero_auto', `AI${ano}%`)
      .order('numero_auto', { ascending: false })
      .limit(1)

    let proximoNumero = 1
    if (data && data.length > 0) {
      const ultimoNumero = parseInt(data[0].numero_auto.replace(`AI${ano}`, ''))
      proximoNumero = ultimoNumero + 1
    }

    return `AI${ano}${proximoNumero.toString().padStart(5, '0')}`
  }

  const marcarRegularizada = async (denunciaId: string, observacoes?: string) => {
    try {
      const { error } = await supabase
        .from('denuncias_urbanisticas')
        .update({
          status: 'resolvida',
          regularizada: true,
          observacoes
        })
        .eq('id', denunciaId)

      if (error) throw error

      toast.success('Irregularidade regularizada!')
      await loadDenunciasUrbanisticas()
    } catch (err) {
      console.error('Erro ao marcar como regularizada:', err)
      toast.error('Erro ao marcar como regularizada')
    }
  }

  // =====================================================
  // 4. CONSULTAS PÚBLICAS
  // =====================================================

  const loadConsultasPublicas = async (filters?: any) => {
    try {
      let query = supabase
        .from('consultas_publicas')
        .select(`
          *,
          responsavel:user_profiles(nome)
        `)
        .order('data_abertura', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      const { data, error } = await query

      if (error) throw error
      setConsultasPublicas(data || [])
    } catch (err) {
      console.error('Erro ao carregar consultas públicas:', err)
    }
  }

  const loadParticipacoesConsulta = async (consultaId?: string) => {
    try {
      let query = supabase
        .from('participacoes_consulta')
        .select(`
          *,
          participante:user_profiles!participante_id(nome, email)
        `)
        .eq('aprovado_moderacao', true)
        .order('data_participacao', { ascending: false })

      if (consultaId) {
        query = query.eq('consulta_id', consultaId)
      }

      const { data, error } = await query

      if (error) throw error
      setParticipacoesConsulta(data || [])
    } catch (err) {
      console.error('Erro ao carregar participações:', err)
    }
  }

  const criarConsultaPublica = async (dadosConsulta: Partial<ConsultaPublica>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('consultas_publicas')
        .insert([{
          ...dadosConsulta,
          responsavel_id: user?.id,
          participantes_reais: 0,
          status: 'planejada'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Consulta pública criada!')
      await loadConsultasPublicas()
      return data
    } catch (err) {
      console.error('Erro ao criar consulta pública:', err)
      toast.error('Erro ao criar consulta pública')
      return null
    }
  }

  const abrirConsultaPublica = async (consultaId: string) => {
    try {
      const { error } = await supabase
        .from('consultas_publicas')
        .update({ status: 'aberta' })
        .eq('id', consultaId)

      if (error) throw error

      toast.success('Consulta pública aberta!')
      await loadConsultasPublicas()
    } catch (err) {
      console.error('Erro ao abrir consulta:', err)
      toast.error('Erro ao abrir consulta')
    }
  }

  const participarConsultaPublica = async (consultaId: string, contribuicao: string, modalidade: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('participacoes_consulta')
        .insert([{
          consulta_id: consultaId,
          participante_id: user?.id,
          nome_participante: user?.user_metadata?.name || 'Cidadão',
          contribuicao,
          modalidade_participacao: modalidade,
          aprovado_moderacao: false,
          incorporado_projeto: false
        }])
        .select()
        .single()

      if (error) throw error

      // Incrementar contador de participantes
      await supabase.rpc('incrementar_participantes_consulta', {
        consulta_id: consultaId
      })

      toast.success('Participação registrada! Aguarde moderação.')
      await loadParticipacoesConsulta()
      return data
    } catch (err) {
      console.error('Erro ao participar da consulta:', err)
      toast.error('Erro ao participar da consulta')
      return null
    }
  }

  const moderarParticipacao = async (participacaoId: string, aprovado: boolean, respostaOficial?: string) => {
    try {
      const { error } = await supabase
        .from('participacoes_consulta')
        .update({
          aprovado_moderacao: aprovado,
          resposta_oficial: respostaOficial
        })
        .eq('id', participacaoId)

      if (error) throw error

      toast.success(`Participação ${aprovado ? 'aprovada' : 'rejeitada'}!`)
      await loadParticipacoesConsulta()
    } catch (err) {
      console.error('Erro ao moderar participação:', err)
      toast.error('Erro ao moderar participação')
    }
  }

  const encerrarConsultaPublica = async (consultaId: string, resultadoFinal: string, impactoDecisao: string) => {
    try {
      const { error } = await supabase
        .from('consultas_publicas')
        .update({
          status: 'encerrada',
          resultado_final: resultadoFinal,
          impacto_decisao: impactoDecisao
        })
        .eq('id', consultaId)

      if (error) throw error

      toast.success('Consulta pública encerrada!')
      await loadConsultasPublicas()
    } catch (err) {
      console.error('Erro ao encerrar consulta:', err)
      toast.error('Erro ao encerrar consulta')
    }
  }

  // =====================================================
  // 5. MAPA URBANO
  // =====================================================

  const loadZonasUrbanas = async () => {
    try {
      const { data, error } = await supabase
        .from('zonas_urbanas')
        .select('*')
        .eq('ativa', true)
        .order('codigo_zona', { ascending: true })

      if (error) throw error
      setZonasUrbanas(data || [])
    } catch (err) {
      console.error('Erro ao carregar zonas urbanas:', err)
    }
  }

  const loadLotesMunicipais = async (filters?: any) => {
    try {
      let query = supabase
        .from('lotes_municipais')
        .select(`
          *,
          zona:zonas_urbanas(codigo_zona, nome, tipo),
          proprietario:user_profiles!proprietario_id(nome, cpf)
        `)
        .order('inscricao_municipal', { ascending: true })

      if (filters?.zona_id) {
        query = query.eq('zona_id', filters.zona_id)
      }

      if (filters?.situacao) {
        query = query.eq('situacao', filters.situacao)
      }

      const { data, error } = await query

      if (error) throw error
      setLotesMunicipais(data || [])
    } catch (err) {
      console.error('Erro ao carregar lotes:', err)
    }
  }

  const criarZonaUrbana = async (dadosZona: Partial<ZonaUrbana>) => {
    try {
      const { data, error } = await supabase
        .from('zonas_urbanas')
        .insert([{
          ...dadosZona,
          data_criacao: new Date().toISOString().split('T')[0],
          ativa: true
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Zona urbana criada!')
      await loadZonasUrbanas()
      return data
    } catch (err) {
      console.error('Erro ao criar zona urbana:', err)
      toast.error('Erro ao criar zona urbana')
      return null
    }
  }

  const consultarZoneamento = async (endereco: string) => {
    try {
      // Simular busca por coordenadas/endereço
      const lote = lotesMunicipais.find(l => 
        l.endereco.toLowerCase().includes(endereco.toLowerCase())
      )

      if (lote && lote.zona) {
        return {
          zona: lote.zona,
          parametros: {
            coeficiente_aproveitamento: lote.zona.coeficiente_aproveitamento,
            taxa_ocupacao: lote.zona.taxa_ocupacao,
            gabarito_maximo: lote.zona.gabarito_maximo,
            recuos: lote.zona.recuos,
            atividades_permitidas: lote.zona.atividades_permitidas
          }
        }
      }

      return null
    } catch (err) {
      console.error('Erro ao consultar zoneamento:', err)
      return null
    }
  }

  const atualizarLote = async (loteId: string, dadosAtualizados: Partial<LoteMunicipal>) => {
    try {
      const { error } = await supabase
        .from('lotes_municipais')
        .update({
          ...dadosAtualizados,
          updated_at: new Date().toISOString()
        })
        .eq('id', loteId)

      if (error) throw error

      toast.success('Lote atualizado!')
      await loadLotesMunicipais()
    } catch (err) {
      console.error('Erro ao atualizar lote:', err)
      toast.error('Erro ao atualizar lote')
    }
  }

  // =====================================================
  // 6. ATENDIMENTOS URBANÍSTICOS
  // =====================================================

  const loadAtendimentosUrbanisticos = async (filters?: any) => {
    try {
      let query = supabase
        .from('atendimentos_urbanisticos')
        .select(`
          *,
          solicitante:user_profiles!solicitante_id(nome, email, telefone),
          tecnico_responsavel:user_profiles!tecnico_responsavel_id(nome)
        `)
        .order('data_solicitacao', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.tipo_consulta) {
        query = query.eq('tipo_consulta', filters.tipo_consulta)
      }

      const { data, error } = await query

      if (error) throw error
      setAtendimentosUrbanisticos(data || [])
    } catch (err) {
      console.error('Erro ao carregar atendimentos:', err)
    }
  }

  const solicitarAtendimento = async (dadosAtendimento: Partial<AtendimentoUrbanistico>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Gerar número do atendimento
      const numeroAtendimento = await gerarNumeroAtendimento()

      const { data, error } = await supabase
        .from('atendimentos_urbanisticos')
        .insert([{
          ...dadosAtendimento,
          numero_atendimento: numeroAtendimento,
          solicitante_id: user?.id,
          status: 'aberto',
          prazo_resposta_dias: definirPrazoResposta(dadosAtendimento.tipo_consulta!),
          taxa_servico: calcularTaxaServico(dadosAtendimento.tipo_consulta!),
          documentos_resposta: []
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Atendimento solicitado!')
      await loadAtendimentosUrbanisticos()
      return data
    } catch (err) {
      console.error('Erro ao solicitar atendimento:', err)
      toast.error('Erro ao solicitar atendimento')
      return null
    }
  }

  const gerarNumeroAtendimento = async (): Promise<string> => {
    const ano = new Date().getFullYear()
    const { data } = await supabase
      .from('atendimentos_urbanisticos')
      .select('numero_atendimento')
      .like('numero_atendimento', `ATD${ano}%`)
      .order('numero_atendimento', { ascending: false })
      .limit(1)

    let proximoNumero = 1
    if (data && data.length > 0) {
      const ultimoNumero = parseInt(data[0].numero_atendimento.replace(`ATD${ano}`, ''))
      proximoNumero = ultimoNumero + 1
    }

    return `ATD${ano}${proximoNumero.toString().padStart(5, '0')}`
  }

  const definirPrazoResposta = (tipoConsulta: string): number => {
    switch (tipoConsulta) {
      case 'informacao': return 2
      case 'orientacao': return 3
      case 'zoneamento': return 5
      case 'viabilidade': return 10
      case 'certidao': return 15
      default: return 5
    }
  }

  const calcularTaxaServico = (tipoConsulta: string): number => {
    switch (tipoConsulta) {
      case 'informacao': return 0
      case 'orientacao': return 25
      case 'zoneamento': return 50
      case 'viabilidade': return 100
      case 'certidao': return 150
      default: return 50
    }
  }

  const responderAtendimento = async (atendimentoId: string, respostaTecnica: string, documentos?: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('atendimentos_urbanisticos')
        .update({
          tecnico_responsavel_id: user?.id,
          resposta_tecnica: respostaTecnica,
          documentos_resposta: documentos || [],
          data_resposta: new Date().toISOString(),
          status: 'respondido'
        })
        .eq('id', atendimentoId)

      if (error) throw error

      toast.success('Atendimento respondido!')
      await loadAtendimentosUrbanisticos()
    } catch (err) {
      console.error('Erro ao responder atendimento:', err)
      toast.error('Erro ao responder atendimento')
    }
  }

  const avaliarAtendimento = async (atendimentoId: string, satisfacao: number) => {
    try {
      const { error } = await supabase
        .from('atendimentos_urbanisticos')
        .update({
          satisfacao_solicitante: satisfacao,
          status: 'finalizado'
        })
        .eq('id', atendimentoId)

      if (error) throw error

      toast.success('Avaliação registrada!')
      await loadAtendimentosUrbanisticos()
    } catch (err) {
      console.error('Erro ao avaliar atendimento:', err)
      toast.error('Erro ao avaliar atendimento')
    }
  }

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadoresPlanejamento = () => {
    const projetosProtocolados = projetosArquitetonicos.filter(p => p.status === 'protocolado').length
    const projetosEmAnalise = projetosArquitetonicos.filter(p => p.status === 'em_analise').length
    const projetosAprovados = projetosArquitetonicos.filter(p => p.status === 'aprovado').length
    
    const alvarasVigentes = alvaras.filter(a => a.status === 'vigente').length
    const alvarasVencidos = alvaras.filter(a => a.status === 'vencido').length
    
    const denunciasAbertas = denunciasUrbanisticas.filter(d => 
      !['resolvida'].includes(d.status)
    ).length
    
    const consultasAbertas = consultasPublicas.filter(c => c.status === 'aberta').length
    
    const atendimentosAbertos = atendimentosUrbanisticos.filter(a => a.status === 'aberto').length
    
    const satisfacaoMedia = atendimentosUrbanisticos
      .filter(a => a.satisfacao_solicitante)
      .reduce((acc, a) => acc + (a.satisfacao_solicitante || 0), 0) / 
      atendimentosUrbanisticos.filter(a => a.satisfacao_solicitante).length || 0

    return {
      projetosProtocolados,
      projetosEmAnalise,
      projetosAprovados,
      taxaAprovacao: projetosArquitetonicos.length > 0 ? 
        (projetosAprovados / projetosArquitetonicos.length) * 100 : 0,
      alvarasVigentes,
      alvarasVencidos,
      denunciasAbertas,
      consultasAbertas,
      atendimentosAbertos,
      satisfacaoMedia: Math.round(satisfacaoMedia * 10) / 10,
      totalZonas: zonasUrbanas.length,
      totalLotes: lotesMunicipais.length
    }
  }

  return {
    // Estados
    projetosArquitetonicos,
    pareceresTecnicos,
    alvaras,
    denunciasUrbanisticas,
    autosInfracao,
    consultasPublicas,
    participacoesConsulta,
    zonasUrbanas,
    lotesMunicipais,
    atendimentosUrbanisticos,
    loading,
    error,

    // Carregamento
    loadAllData,
    loadProjetosArquitetonicos,
    loadPareceresTecnicos,
    loadAlvaras,
    loadDenunciasUrbanisticas,
    loadAutosInfracao,
    loadConsultasPublicas,
    loadParticipacoesConsulta,
    loadZonasUrbanas,
    loadLotesMunicipais,
    loadAtendimentosUrbanisticos,

    // Aprovação de Projetos
    protocolizarProjeto,
    emitirParecerTecnico,
    solicitarComplementacao,

    // Alvarás
    emitirAlvara,
    renovarAlvara,
    cassarAlvara,

    // Denúncias
    registrarDenuncia,
    agendarVistoria,
    autuar,
    marcarRegularizada,

    // Consultas Públicas
    criarConsultaPublica,
    abrirConsultaPublica,
    participarConsultaPublica,
    moderarParticipacao,
    encerrarConsultaPublica,

    // Mapa Urbano
    criarZonaUrbana,
    consultarZoneamento,
    atualizarLote,

    // Atendimentos
    solicitarAtendimento,
    responderAtendimento,
    avaliarAtendimento,

    // Indicadores
    getIndicadoresPlanejamento
  }
}