// =====================================================
// HOOK COMPLETO PARA OBRAS PÚBLICAS
// 4 FUNCIONALIDADES INTEGRADAS
// =====================================================

import { useState, useEffect } from 'react'
import { APIClient } from "@/auth"
import { toast } from 'react-hot-toast'

// =====================================================
// INTERFACES E TIPOS
// =====================================================

export interface ObraPublica {
  id: string
  numero_obra: string
  nome: string
  descricao: string
  tipo: 'pavimentacao' | 'construcao' | 'reforma' | 'infraestrutura' | 'saneamento' | 'iluminacao'
  endereco: string
  coordenadas?: any
  secretaria_responsavel_id: string
  gestor_obra_id: string
  contrato_numero?: string
  empresa_contratada?: string
  cnpj_empresa?: string
  valor_contratado: number
  data_inicio_prevista: string
  data_fim_prevista: string
  data_inicio_real?: string
  data_fim_real?: string
  fonte_recurso: 'proprio' | 'estadual' | 'federal' | 'financiamento'
  modalidade_licitacao?: string
  numero_licitacao?: string
  status: 'planejada' | 'licitando' | 'contratada' | 'iniciada' | 'em_andamento' | 'concluida' | 'paralisada'
  percentual_executado: number
  valor_pago: number
  observacoes?: string
  created_at: string
  updated_at: string
  
  // Relacionamentos
  secretaria_responsavel?: {
    nome: string
  }
  gestor_obra?: {
    nome: string
  }
  etapas?: EtapaObra[]
  medicoes?: MedicaoObra[]
  fornecedor?: FornecedorObra
}

export interface EtapaObra {
  id: string
  obra_id: string
  nome: string
  descricao?: string
  ordem_execucao: number
  data_inicio_prevista?: string
  data_fim_prevista?: string
  data_inicio_real?: string
  data_fim_real?: string
  percentual_previsto: number
  percentual_executado: number
  valor_previsto?: number
  valor_executado: number
  responsavel_tecnico_id?: string
  status: 'nao_iniciada' | 'em_andamento' | 'concluida' | 'atrasada'
  problemas_identificados: string[]
  solucoes_adotadas: string[]
  fotos_progresso: string[]
  observacoes?: string
  updated_at: string
  
  // Relacionamentos
  obra?: ObraPublica
  responsavel_tecnico?: {
    nome: string
  }
}

export interface MedicaoObra {
  id: string
  obra_id: string
  numero_medicao: number
  periodo_inicio: string
  periodo_fim: string
  percentual_periodo: number
  valor_medicao: number
  data_medicao: string
  fiscal_responsavel_id: string
  aprovada: boolean
  data_aprovacao?: string
  data_pagamento?: string
  observacoes?: string
  fotos_medicao: string[]
  planilhas_anexas: string[]
  
  // Relacionamentos
  obra?: ObraPublica
  fiscal_responsavel?: {
    nome: string
  }
}

export interface FornecedorObra {
  id: string
  razao_social: string
  cnpj: string
  endereco: string
  telefone?: string
  email?: string
  responsavel_nome?: string
  responsavel_telefone?: string
  especialidades: string[]
  certificacoes: string[]
  data_cadastro: string
  situacao: 'ativo' | 'suspenso' | 'inabilitado'
  nota_avaliacao: number
  obras_executadas: number
  valor_total_contratado: number
  observacoes?: string
  
  // Relacionamentos
  obras?: ObraPublica[]
  avaliacoes?: AvaliacaoFornecedor[]
}

export interface AvaliacaoFornecedor {
  id: string
  obra_id: string
  fornecedor_id: string
  avaliador_id: string
  qualidade_servico: number
  cumprimento_prazo: number
  organizacao_canteiro: number
  relacionamento: number
  nota_final: number
  observacoes?: string
  recomenda: boolean
  data_avaliacao: string
  
  // Relacionamentos
  obra?: ObraPublica
  fornecedor?: FornecedorObra
  avaliador?: {
    nome: string
  }
}

export const useObras = () => {
  // Estados principais
  const [obrasPublicas, setObrasPublicas] = useState<ObraPublica[]>([])
  const [etapasObras, setEtapasObras] = useState<EtapaObra[]>([])
  const [medicoesObras, setMedicoesObras] = useState<MedicaoObra[]>([])
  const [fornecedoresObras, setFornecedoresObras] = useState<FornecedorObra[]>([])
  const [avaliacoesFornecedores, setAvaliacoesFornecedores] = useState<AvaliacaoFornecedor[]>([])
  
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
        loadObrasPublicas(),
        loadEtapasObras(),
        loadMedicoesObras(),
        loadFornecedoresObras(),
        loadAvaliacoesFornecedores()
      ])
    } catch (err) {
      console.error('Erro ao carregar dados de obras:', err)
      setError('Erro ao carregar dados de obras')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // 1. OBRAS E INTERVENÇÕES
  // =====================================================

  const loadObrasPublicas = async (filters?: any) => {
    try {
      let query = supabase
        .from('obras_publicas')
        .select(`
          *,
          secretaria_responsavel:secretarias(nome),
          gestor_obra:user_profiles(nome)
        `)
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters?.secretaria_id) {
        query = query.eq('secretaria_responsavel_id', filters.secretaria_id)
      }

      const { data, error } = await query

      if (error) throw error
      setObrasPublicas(data || [])
    } catch (err) {
      console.error('Erro ao carregar obras:', err)
    }
  }

  const loadEtapasObras = async (obraId?: string) => {
    try {
      let query = supabase
        .from('etapas_obras')
        .select(`
          *,
          obra:obras_publicas(nome),
          responsavel_tecnico:user_profiles(nome)
        `)
        .order('ordem_execucao', { ascending: true })

      if (obraId) {
        query = query.eq('obra_id', obraId)
      }

      const { data, error } = await query

      if (error) throw error
      setEtapasObras(data || [])
    } catch (err) {
      console.error('Erro ao carregar etapas:', err)
    }
  }

  const loadMedicoesObras = async (obraId?: string) => {
    try {
      let query = supabase
        .from('medicoes_obras')
        .select(`
          *,
          obra:obras_publicas(nome, numero_obra),
          fiscal_responsavel:user_profiles(nome)
        `)
        .order('numero_medicao', { ascending: false })

      if (obraId) {
        query = query.eq('obra_id', obraId)
      }

      const { data, error } = await query

      if (error) throw error
      setMedicoesObras(data || [])
    } catch (err) {
      console.error('Erro ao carregar medições:', err)
    }
  }

  const cadastrarObra = async (dadosObra: Partial<ObraPublica>, etapas: Partial<EtapaObra>[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Gerar número da obra
      const numeroObra = await gerarNumeroObra()

      const { data: obra, error: obraError } = await supabase
        .from('obras_publicas')
        .insert([{
          ...dadosObra,
          numero_obra: numeroObra,
          gestor_obra_id: dadosObra.gestor_obra_id || user?.id,
          status: 'planejada',
          percentual_executado: 0,
          valor_pago: 0
        }])
        .select()
        .single()

      if (obraError) throw obraError

      // Criar etapas da obra
      if (etapas.length > 0) {
        const etapasFinal = etapas.map((etapa, index) => ({
          ...etapa,
          obra_id: obra.id,
          ordem_execucao: index + 1,
          percentual_executado: 0,
          valor_executado: 0,
          status: 'nao_iniciada',
          problemas_identificados: [],
          solucoes_adotadas: [],
          fotos_progresso: []
        }))

        const { error: etapasError } = await supabase
          .from('etapas_obras')
          .insert(etapasFinal)

        if (etapasError) throw etapasError
      }

      toast.success('Obra cadastrada com sucesso!')
      await loadObrasPublicas()
      await loadEtapasObras()
      return obra
    } catch (err) {
      console.error('Erro ao cadastrar obra:', err)
      toast.error('Erro ao cadastrar obra')
      return null
    }
  }

  const gerarNumeroObra = async (): Promise<string> => {
    const ano = new Date().getFullYear()
    const { data } = await supabase
      .from('obras_publicas')
      .select('numero_obra')
      .like('numero_obra', `${ano}%`)
      .order('numero_obra', { ascending: false })
      .limit(1)

    let proximoNumero = 1
    if (data && data.length > 0) {
      const ultimoNumero = parseInt(data[0].numero_obra.split('/')[0])
      proximoNumero = ultimoNumero + 1
    }

    return `${proximoNumero.toString().padStart(4, '0')}/${ano}`
  }

  const atualizarStatusObra = async (obraId: string, novoStatus: ObraPublica['status'], observacoes?: string) => {
    try {
      const updateData: any = {
        status: novoStatus,
        updated_at: new Date().toISOString()
      }

      if (observacoes) {
        updateData.observacoes = observacoes
      }

      if (novoStatus === 'iniciada' || novoStatus === 'em_andamento') {
        updateData.data_inicio_real = new Date().toISOString().split('T')[0]
      }

      if (novoStatus === 'concluida') {
        updateData.data_fim_real = new Date().toISOString().split('T')[0]
        updateData.percentual_executado = 100
      }

      const { error } = await supabase
        .from('obras_publicas')
        .update(updateData)
        .eq('id', obraId)

      if (error) throw error

      toast.success('Status da obra atualizado!')
      await loadObrasPublicas()
    } catch (err) {
      console.error('Erro ao atualizar obra:', err)
      toast.error('Erro ao atualizar obra')
    }
  }

  const vincularContrato = async (obraId: string, dadosContrato: {
    numero_contrato: string
    empresa_contratada: string
    cnpj_empresa: string
    valor_contratado: number
    modalidade_licitacao?: string
    numero_licitacao?: string
  }) => {
    try {
      const { error } = await supabase
        .from('obras_publicas')
        .update({
          ...dadosContrato,
          status: 'contratada',
          updated_at: new Date().toISOString()
        })
        .eq('id', obraId)

      if (error) throw error

      toast.success('Contrato vinculado à obra!')
      await loadObrasPublicas()
    } catch (err) {
      console.error('Erro ao vincular contrato:', err)
      toast.error('Erro ao vincular contrato')
    }
  }

  // =====================================================
  // 2. PROGRESSO DE OBRAS
  // =====================================================

  const atualizarEtapaObra = async (etapaId: string, dadosAtualizacao: Partial<EtapaObra>) => {
    try {
      const { error } = await supabase
        .from('etapas_obras')
        .update({
          ...dadosAtualizacao,
          updated_at: new Date().toISOString()
        })
        .eq('id', etapaId)

      if (error) throw error

      // Recalcular percentual da obra
      const etapa = etapasObras.find(e => e.id === etapaId)
      if (etapa) {
        await recalcularPercentualObra(etapa.obra_id)
      }

      toast.success('Etapa atualizada!')
      await loadEtapasObras()
    } catch (err) {
      console.error('Erro ao atualizar etapa:', err)
      toast.error('Erro ao atualizar etapa')
    }
  }

  const recalcularPercentualObra = async (obraId: string) => {
    try {
      const etapasObra = etapasObras.filter(e => e.obra_id === obraId)
      
      if (etapasObra.length === 0) return

      const percentualTotal = etapasObra.reduce((acc, etapa) => {
        return acc + (etapa.percentual_previsto * etapa.percentual_executado / 100)
      }, 0)

      await supabase
        .from('obras_publicas')
        .update({
          percentual_executado: Math.round(percentualTotal),
          updated_at: new Date().toISOString()
        })
        .eq('id', obraId)

      await loadObrasPublicas()
    } catch (err) {
      console.error('Erro ao recalcular percentual:', err)
    }
  }

  const iniciarEtapa = async (etapaId: string) => {
    try {
      const { error } = await supabase
        .from('etapas_obras')
        .update({
          status: 'em_andamento',
          data_inicio_real: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', etapaId)

      if (error) throw error

      toast.success('Etapa iniciada!')
      await loadEtapasObras()
    } catch (err) {
      console.error('Erro ao iniciar etapa:', err)
      toast.error('Erro ao iniciar etapa')
    }
  }

  const concluirEtapa = async (etapaId: string, fotos?: string[]) => {
    try {
      const { error } = await supabase
        .from('etapas_obras')
        .update({
          status: 'concluida',
          percentual_executado: 100,
          data_fim_real: new Date().toISOString().split('T')[0],
          fotos_progresso: fotos || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', etapaId)

      if (error) throw error

      toast.success('Etapa concluída!')
      await loadEtapasObras()
      
      // Recalcular percentual da obra
      const etapa = etapasObras.find(e => e.id === etapaId)
      if (etapa) {
        await recalcularPercentualObra(etapa.obra_id)
      }
    } catch (err) {
      console.error('Erro ao concluir etapa:', err)
      toast.error('Erro ao concluir etapa')
    }
  }

  const registrarProblemaEtapa = async (etapaId: string, problema: string, solucao?: string) => {
    try {
      const etapa = etapasObras.find(e => e.id === etapaId)
      if (!etapa) return

      const novosProblemas = [...etapa.problemas_identificados, problema]
      const novasSolucoes = solucao ? [...etapa.solucoes_adotadas, solucao] : etapa.solucoes_adotadas

      const { error } = await supabase
        .from('etapas_obras')
        .update({
          problemas_identificados: novosProblemas,
          solucoes_adotadas: novasSolucoes,
          status: solucao ? etapa.status : 'atrasada',
          updated_at: new Date().toISOString()
        })
        .eq('id', etapaId)

      if (error) throw error

      toast.success('Problema registrado!')
      await loadEtapasObras()
    } catch (err) {
      console.error('Erro ao registrar problema:', err)
      toast.error('Erro ao registrar problema')
    }
  }

  // =====================================================
  // 3. MEDIÇÕES DE OBRAS
  // =====================================================

  const gerarMedicao = async (dadosMedicao: Partial<MedicaoObra>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Buscar próximo número de medição
      const { data: ultimaMedicao } = await supabase
        .from('medicoes_obras')
        .select('numero_medicao')
        .eq('obra_id', dadosMedicao.obra_id)
        .order('numero_medicao', { ascending: false })
        .limit(1)

      const proximoNumero = ultimaMedicao && ultimaMedicao.length > 0 ? 
        ultimaMedicao[0].numero_medicao + 1 : 1

      const { data, error } = await supabase
        .from('medicoes_obras')
        .insert([{
          ...dadosMedicao,
          numero_medicao: proximoNumero,
          fiscal_responsavel_id: user?.id,
          aprovada: false,
          fotos_medicao: [],
          planilhas_anexas: []
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Medição gerada!')
      await loadMedicoesObras()
      return data
    } catch (err) {
      console.error('Erro ao gerar medição:', err)
      toast.error('Erro ao gerar medição')
      return null
    }
  }

  const aprovarMedicao = async (medicaoId: string) => {
    try {
      const { error } = await supabase
        .from('medicoes_obras')
        .update({
          aprovada: true,
          data_aprovacao: new Date().toISOString().split('T')[0]
        })
        .eq('id', medicaoId)

      if (error) throw error

      // Atualizar valor pago na obra
      const medicao = medicoesObras.find(m => m.id === medicaoId)
      if (medicao) {
        const obra = obrasPublicas.find(o => o.id === medicao.obra_id)
        if (obra) {
          const novoValorPago = obra.valor_pago + medicao.valor_medicao

          await supabase
            .from('obras_publicas')
            .update({
              valor_pago: novoValorPago,
              updated_at: new Date().toISOString()
            })
            .eq('id', obra.id)
        }
      }

      toast.success('Medição aprovada!')
      await loadMedicoesObras()
      await loadObrasPublicas()
    } catch (err) {
      console.error('Erro ao aprovar medição:', err)
      toast.error('Erro ao aprovar medição')
    }
  }

  const registrarPagamentoMedicao = async (medicaoId: string) => {
    try {
      const { error } = await supabase
        .from('medicoes_obras')
        .update({
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', medicaoId)

      if (error) throw error

      toast.success('Pagamento registrado!')
      await loadMedicoesObras()
    } catch (err) {
      console.error('Erro ao registrar pagamento:', err)
      toast.error('Erro ao registrar pagamento')
    }
  }

  // =====================================================
  // 4. CONTROLE DE FORNECEDORES
  // =====================================================

  const loadFornecedoresObras = async () => {
    try {
      const { data, error } = await supabase
        .from('fornecedores_obras')
        .select('*')
        .order('razao_social', { ascending: true })

      if (error) throw error
      setFornecedoresObras(data || [])
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err)
    }
  }

  const loadAvaliacoesFornecedores = async (fornecedorId?: string) => {
    try {
      let query = supabase
        .from('avaliacoes_fornecedores')
        .select(`
          *,
          obra:obras_publicas(nome, numero_obra),
          avaliador:user_profiles(nome)
        `)
        .order('data_avaliacao', { ascending: false })

      if (fornecedorId) {
        query = query.eq('fornecedor_id', fornecedorId)
      }

      const { data, error } = await query

      if (error) throw error
      setAvaliacoesFornecedores(data || [])
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err)
    }
  }

  const cadastrarFornecedor = async (dadosFornecedor: Partial<FornecedorObra>) => {
    try {
      const { data, error } = await supabase
        .from('fornecedores_obras')
        .insert([{
          ...dadosFornecedor,
          data_cadastro: new Date().toISOString().split('T')[0],
          situacao: 'ativo',
          nota_avaliacao: 0,
          obras_executadas: 0,
          valor_total_contratado: 0
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Fornecedor cadastrado!')
      await loadFornecedoresObras()
      return data
    } catch (err) {
      console.error('Erro ao cadastrar fornecedor:', err)
      toast.error('Erro ao cadastrar fornecedor')
      return null
    }
  }

  const avaliarFornecedor = async (dadosAvaliacao: Partial<AvaliacaoFornecedor>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Calcular nota final
      const notaFinal = (
        (dadosAvaliacao.qualidade_servico || 0) +
        (dadosAvaliacao.cumprimento_prazo || 0) +
        (dadosAvaliacao.organizacao_canteiro || 0) +
        (dadosAvaliacao.relacionamento || 0)
      ) / 4

      const { data, error } = await supabase
        .from('avaliacoes_fornecedores')
        .insert([{
          ...dadosAvaliacao,
          avaliador_id: user?.id,
          nota_final: Math.round(notaFinal * 10) / 10,
          data_avaliacao: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single()

      if (error) throw error

      // Atualizar média do fornecedor
      await atualizarMediaFornecedor(dadosAvaliacao.fornecedor_id!)

      toast.success('Fornecedor avaliado!')
      await loadAvaliacoesFornecedores()
      return data
    } catch (err) {
      console.error('Erro ao avaliar fornecedor:', err)
      toast.error('Erro ao avaliar fornecedor')
      return null
    }
  }

  const atualizarMediaFornecedor = async (fornecedorId: string) => {
    try {
      const avaliacoesFornecedor = avaliacoesFornecedores.filter(a => a.fornecedor_id === fornecedorId)
      
      if (avaliacoesFornecedor.length === 0) return

      const mediaNotas = avaliacoesFornecedor.reduce((acc, av) => acc + av.nota_final, 0) / avaliacoesFornecedor.length

      await supabase
        .from('fornecedores_obras')
        .update({
          nota_avaliacao: Math.round(mediaNotas * 10) / 10,
          obras_executadas: avaliacoesFornecedor.length
        })
        .eq('id', fornecedorId)

      await loadFornecedoresObras()
    } catch (err) {
      console.error('Erro ao atualizar média do fornecedor:', err)
    }
  }

  const suspenderFornecedor = async (fornecedorId: string, motivo: string) => {
    try {
      const { error } = await supabase
        .from('fornecedores_obras')
        .update({
          situacao: 'suspenso',
          observacoes: `Suspenso: ${motivo}`
        })
        .eq('id', fornecedorId)

      if (error) throw error

      toast.success('Fornecedor suspenso!')
      await loadFornecedoresObras()
    } catch (err) {
      console.error('Erro ao suspender fornecedor:', err)
      toast.error('Erro ao suspender fornecedor')
    }
  }

  const reabilitarFornecedor = async (fornecedorId: string) => {
    try {
      const { error } = await supabase
        .from('fornecedores_obras')
        .update({
          situacao: 'ativo',
          observacoes: null
        })
        .eq('id', fornecedorId)

      if (error) throw error

      toast.success('Fornecedor reabilitado!')
      await loadFornecedoresObras()
    } catch (err) {
      console.error('Erro ao reabilitar fornecedor:', err)
      toast.error('Erro ao reabilitar fornecedor')
    }
  }

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadoresObras = () => {
    const obrasEmAndamento = obrasPublicas.filter(o => 
      ['iniciada', 'em_andamento'].includes(o.status)
    ).length

    const obrasConcluidas = obrasPublicas.filter(o => o.status === 'concluida').length
    const obrasAtrasadas = obrasPublicas.filter(o => {
      if (!o.data_fim_prevista) return false
      const hoje = new Date()
      const dataFim = new Date(o.data_fim_prevista)
      return dataFim < hoje && !['concluida'].includes(o.status)
    }).length

    const valorTotalContratado = obrasPublicas.reduce((acc, obra) => acc + obra.valor_contratado, 0)
    const valorTotalPago = obrasPublicas.reduce((acc, obra) => acc + obra.valor_pago, 0)
    const percentualPago = valorTotalContratado > 0 ? (valorTotalPago / valorTotalContratado) * 100 : 0

    const mediaExecucao = obrasPublicas.length > 0 ?
      obrasPublicas.reduce((acc, obra) => acc + obra.percentual_executado, 0) / obrasPublicas.length : 0

    const fornecedoresAtivos = fornecedoresObras.filter(f => f.situacao === 'ativo').length
    
    const medicoesAprovadas = medicoesObras.filter(m => m.aprovada).length
    const medicoesPendentes = medicoesObras.filter(m => !m.aprovada).length

    const economiaLicitacoes = obrasPublicas.reduce((acc, obra) => {
      // Simular economia (diferença entre estimativa e valor contratado)
      const estimativa = obra.valor_contratado * 1.15 // Estimativa 15% maior
      return acc + (estimativa - obra.valor_contratado)
    }, 0)

    return {
      obrasEmAndamento,
      obrasConcluidas,
      obrasAtrasadas,
      totalObras: obrasPublicas.length,
      valorTotalContratado,
      valorTotalPago,
      percentualPago: Math.round(percentualPago),
      mediaExecucao: Math.round(mediaExecucao),
      fornecedoresAtivos,
      medicoesAprovadas,
      medicoesPendentes,
      economiaLicitacoes,
      obrasPorTipo: obrasPublicas.reduce((acc, obra) => {
        acc[obra.tipo] = (acc[obra.tipo] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  const getObrasPorLocalizacao = () => {
    return obrasPublicas
      .filter(obra => obra.coordenadas)
      .map(obra => ({
        id: obra.id,
        nome: obra.nome,
        coordenadas: obra.coordenadas,
        status: obra.status,
        percentual_executado: obra.percentual_executado,
        valor_contratado: obra.valor_contratado,
        tipo: obra.tipo
      }))
  }

  const getTimelineObra = (obraId: string) => {
    const obra = obrasPublicas.find(o => o.id === obraId)
    const etapasObra = etapasObras.filter(e => e.obra_id === obraId)
    const medicoesObra = medicoesObras.filter(m => m.obra_id === obraId)

    const timeline = []

    // Eventos da obra
    if (obra) {
      timeline.push({
        data: obra.created_at,
        tipo: 'cadastro',
        descricao: 'Obra cadastrada no sistema'
      })

      if (obra.data_inicio_real) {
        timeline.push({
          data: obra.data_inicio_real,
          tipo: 'inicio',
          descricao: 'Obra iniciada'
        })
      }

      if (obra.data_fim_real) {
        timeline.push({
          data: obra.data_fim_real,
          tipo: 'conclusao',
          descricao: 'Obra concluída'
        })
      }
    }

    // Eventos das etapas
    etapasObra.forEach(etapa => {
      if (etapa.data_inicio_real) {
        timeline.push({
          data: etapa.data_inicio_real,
          tipo: 'etapa_inicio',
          descricao: `Início da etapa: ${etapa.nome}`
        })
      }

      if (etapa.data_fim_real) {
        timeline.push({
          data: etapa.data_fim_real,
          tipo: 'etapa_fim',
          descricao: `Conclusão da etapa: ${etapa.nome}`
        })
      }
    })

    // Eventos das medições
    medicoesObra.forEach(medicao => {
      timeline.push({
        data: medicao.data_medicao,
        tipo: 'medicao',
        descricao: `${medicao.numero_medicao}ª medição - R$ ${medicao.valor_medicao.toLocaleString()}`
      })

      if (medicao.data_aprovacao) {
        timeline.push({
          data: medicao.data_aprovacao,
          tipo: 'aprovacao',
          descricao: `${medicao.numero_medicao}ª medição aprovada`
        })
      }

      if (medicao.data_pagamento) {
        timeline.push({
          data: medicao.data_pagamento,
          tipo: 'pagamento',
          descricao: `${medicao.numero_medicao}ª medição paga`
        })
      }
    })

    return timeline.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
  }

  return {
    // Estados
    obrasPublicas,
    etapasObras,
    medicoesObras,
    fornecedoresObras,
    avaliacoesFornecedores,
    loading,
    error,

    // Carregamento
    loadAllData,
    loadObrasPublicas,
    loadEtapasObras,
    loadMedicoesObras,
    loadFornecedoresObras,
    loadAvaliacoesFornecedores,

    // Obras e Intervenções
    cadastrarObra,
    atualizarStatusObra,
    vincularContrato,

    // Progresso de Obras
    atualizarEtapaObra,
    iniciarEtapa,
    concluirEtapa,
    registrarProblemaEtapa,

    // Medições
    gerarMedicao,
    aprovarMedicao,
    registrarPagamentoMedicao,

    // Fornecedores
    cadastrarFornecedor,
    avaliarFornecedor,
    suspenderFornecedor,
    reabilitarFornecedor,

    // Indicadores e Relatórios
    getIndicadoresObras,
    getObrasPorLocalizacao,
    getTimelineObra
  }
}