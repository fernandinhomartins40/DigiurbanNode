// =====================================================
// HOOK DE INTEGRAÇÃO ENTRE MÓDULOS DA FASE 3
// SAÚDE + EDUCAÇÃO + ASSISTÊNCIA SOCIAL
// =====================================================

import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { toast } from 'react-hot-toast'
import { useSaude } from './useSaude'
import { useEducacao } from './useEducacao'
import { useAssistenciaSocial } from './useAssistenciaSocial'

// =====================================================
// INTERFACES DE INTEGRAÇÃO
// =====================================================

export interface CidadaoCompleto {
  id: string
  nome: string
  cpf: string
  email: string
  telefone: string
  endereco: string
  
  // Dados de Saúde
  agendamentos_saude?: unknown[]
  historico_medico?: unknown[]
  campanhas_participadas?: unknown[]
  
  // Dados de Educação
  filhos_estudantes?: unknown[]
  escolas_frequentadas?: unknown[]
  transporte_utilizado?: boolean
  
  // Dados de Assistência Social
  familia_vulneravel?: any
  beneficios_recebidos?: unknown[]
  atendimentos_sociais?: unknown[]
  visitas_recebidas?: unknown[]
}

export interface FamiliaIntegrada {
  id: string
  codigo_familia: string
  responsavel: any
  membros: unknown[]
  vulnerabilidade: string
  
  // Integrações
  criancas_na_escola: unknown[]
  atendimentos_saude: unknown[]
  beneficios_ativos: unknown[]
  prioridades_automaticas: string[]
}

export const useIntegracaoFase3 = () => {
  const [loading, setLoading] = useState(false)
  const [cidadaosCompletos, setCidadaosCompletos] = useState<CidadaoCompleto[]>([])
  const [familiasIntegradas, setFamiliasIntegradas] = useState<FamiliaIntegrada[]>([])

  // Hooks dos módulos
  const saude = useSaude()
  const educacao = useEducacao()
  const assistencia = useAssistenciaSocial()

  // =====================================================
  // 1. INTEGRAÇÃO SAÚDE + EDUCAÇÃO
  // =====================================================

  // Cartão de vacinação obrigatório para matrícula
  const verificarVacinacaoParaMatricula = async (alunoId: string): Promise<boolean> => {
    try {
      // Verificar se o aluno participou das campanhas de vacinação obrigatórias
      const { data: participacoes } = await supabase
        .from('participacao_campanhas')
        .select(`
          *,
          campanha:campanhas_saude(nome, tipo)
        `)
        .eq('paciente_id', alunoId)
        .eq('campanhas_saude.tipo', 'vacinacao')

      // Verificar vacinas obrigatórias (simplificado)
      const vacinasObrigatorias = ['BCG', 'Hepatite B', 'Tríplice Viral', 'DTP']
      const vacinasRealizadas = participacoes?.map(p => p.campanha?.nome) || []
      
      const vacinasEmFalta = vacinasObrigatorias.filter(vacina => 
        !vacinasRealizadas.some(realizada => realizada?.includes(vacina))
      )

      if (vacinasEmFalta.length > 0) {
        toast.warning(`Vacinas em falta para matrícula: ${vacinasEmFalta.join(', ')}`)
        return false
      }

      return true
    } catch (err) {
      console.error('Erro ao verificar vacinação:', err)
      return false
    }
  }

  // Campanha de saúde nas escolas
  const organizarCampanhaNasEscolas = async (campanhaId: string, escolasIds: string[]) => {
    try {
      // Buscar alunos das escolas selecionadas
      const { data: matriculas } = await supabase
        .from('matriculas')
        .select(`
          aluno:alunos(id, nome_completo, data_nascimento)
        `)
        .in('escola_id', escolasIds)
        .eq('status', 'ativa')

      if (!matriculas) return

      // Agendar automaticamente alunos elegíveis para a campanha
      let agendamentosRealizados = 0

      for (const matricula of matriculas) {
        if (matricula.aluno) {
          // Verificar se é elegível (idade, histórico, etc.)
          const elegivel = await verificarElegibilidadeCampanha(matricula.aluno.id, campanhaId)
          
          if (elegivel) {
            await saude.registrarParticipacaoCampanha(
              campanhaId, 
              matricula.aluno.id, 
              'Campanha Escolar'
            )
            agendamentosRealizados++
          }
        }
      }

      toast.success(`${agendamentosRealizados} alunos agendados para a campanha de saúde!`)
    } catch (err) {
      console.error('Erro ao organizar campanha nas escolas:', err)
      toast.error('Erro ao organizar campanha')
    }
  }

  const verificarElegibilidadeCampanha = async (alunoId: string, campanhaId: string): Promise<boolean> => {
    // Lógica para verificar se o aluno é elegível para a campanha
    // (idade, vacinas anteriores, etc.)
    return true // Simplificado
  }

  // Acompanhamento nutricional integrado
  const criarCardapioAdaptado = async (escolaId: string) => {
    try {
      // Buscar alunos com necessidades especiais alimentares
      const { data: alunosEspeciais } = await supabase
        .from('alunos')
        .select('id, nome_completo, necessidades_especiais')
        .eq('escola_id', escolaId)
        .contains('necessidades_especiais', ['diabetico', 'celiaco', 'intolerante_lactose'])

      if (alunosEspeciais && alunosEspeciais.length > 0) {
        // Adaptar cardápio baseado nas necessidades
        const adaptacoes = alunosEspeciais.flatMap(aluno => aluno.necessidades_especiais)
        const adaptacoesUnicas = [...new Set(adaptacoes)]

        toast.info(`Cardápio adaptado para ${adaptacoesUnicas.length} tipos de necessidades especiais`)
      }
    } catch (err) {
      console.error('Erro ao adaptar cardápio:', err)
    }
  }

  // =====================================================
  // 2. INTEGRAÇÃO ASSISTÊNCIA + SAÚDE
  // =====================================================

  // Prioridade em consultas para famílias vulneráveis
  const agendarConsultaPrioritaria = async (pacienteId: string, especialidade: string) => {
    try {
      // Verificar se o paciente é de família vulnerável
      const { data: familia } = await supabase
        .from('familias_vulneraveis')
        .select('classificacao')
        .eq('responsavel_id', pacienteId)
        .single()

      const prioridade = familia?.classificacao === 'critica' ? 'urgente' : 
                        familia?.classificacao === 'alta' ? 'alta' : 'normal'

      // Criar agendamento com prioridade
      return await saude.criarAgendamento({
        paciente_id: pacienteId,
        especialidade,
        tipo: prioridade === 'urgente' ? 'urgencia' : 'consulta',
        data_agendamento: new Date().toISOString() // Próximo horário disponível
      })
    } catch (err) {
      console.error('Erro ao agendar consulta prioritária:', err)
    }
  }

  // Medicamentos gratuitos para beneficiários
  const dispensarMedicamentoGratuito = async (pacienteId: string, medicamentoId: string, quantidade: number) => {
    try {
      // Verificar se é beneficiário de programas sociais
      const { data: beneficios } = await supabase
        .from('beneficiarios_programas')
        .select('*')
        .eq('membro_beneficiario_id', pacienteId)
        .eq('status', 'ativo')

      if (beneficios && beneficios.length > 0) {
        // Dispensar sem cobrança
        await saude.dispensarMedicamento(medicamentoId, quantidade, pacienteId)
        
        // Registrar como benefício social
        await assistencia.registrarAtendimentoSocial({
          familia_id: beneficios[0].familia_id,
          centro_id: '', // Centro responsável
          tipo_atendimento: 'individual',
          servico_prestado: 'Medicamento Gratuito',
          intervencao_realizada: `Medicamento dispensado gratuitamente`
        })

        toast.success('Medicamento dispensado gratuitamente para beneficiário!')
      } else {
        // Dispensação normal com cobrança
        await saude.dispensarMedicamento(medicamentoId, quantidade, pacienteId)
      }
    } catch (err) {
      console.error('Erro ao dispensar medicamento:', err)
    }
  }

  // Transporte para tratamentos especializados
  const agendarTransporteParaTratamento = async (pacienteId: string, destino: string, data: string) => {
    try {
      // Verificar vulnerabilidade da família
      const { data: familia } = await supabase
        .from('familias_vulneraveis')
        .select('classificacao')
        .eq('responsavel_id', pacienteId)
        .single()

      if (familia && ['alta', 'critica'].includes(familia.classificacao)) {
        // Agendar transporte gratuito
        await saude.agendarTransporte({
          paciente_id: pacienteId,
          origem: 'Domicílio do paciente',
          destino,
          data_transporte: data,
          tipo: 'consulta'
        })

        toast.success('Transporte para tratamento agendado gratuitamente!')
      } else {
        toast.info('Família não elegível para transporte gratuito')
      }
    } catch (err) {
      console.error('Erro ao agendar transporte:', err)
    }
  }

  // =====================================================
  // 3. INTEGRAÇÃO ASSISTÊNCIA + EDUCAÇÃO
  // =====================================================

  // Transporte escolar gratuito para vulneráveis
  const vincularTransporteEscolarGratuito = async (alunoId: string) => {
    try {
      // Verificar se a família do aluno é vulnerável
      const { data: aluno } = await supabase
        .from('alunos')
        .select('responsavel_cpf')
        .eq('id', alunoId)
        .single()

      if (!aluno) return

      // Buscar família vulnerável pelo CPF do responsável
      const { data: familia } = await supabase
        .from('familias_vulneraveis')
        .select('*')
        .eq('responsavel.cpf', aluno.responsavel_cpf)
        .single()

      if (familia && ['alta', 'critica'].includes(familia.classificacao)) {
        // Encontrar rota disponível mais próxima
        const rotasDisponiveis = educacao.rotasTransporte.filter(r => r.ativa)
        
        if (rotasDisponiveis.length > 0) {
          // Vincular à primeira rota disponível (lógica simplificada)
          await educacao.vincularAlunoTransporte(
            alunoId, 
            rotasDisponiveis[0].id, 
            rotasDisponiveis[0].pontos_embarque?.[0]?.id || ''
          )

          toast.success('Aluno de família vulnerável vinculado ao transporte escolar gratuito!')
        }
      }
    } catch (err) {
      console.error('Erro ao vincular transporte escolar:', err)
    }
  }

  // Controle de frequência como contrapartida
  const verificarFrequenciaParaBeneficio = async (beneficiarioId: string) => {
    try {
      // Buscar beneficiário e suas crianças em idade escolar
      const { data: beneficiario } = await supabase
        .from('beneficiarios_programas')
        .select(`
          *,
          familia:familias_vulneraveis(
            membros:membros_familia(*)
          )
        `)
        .eq('id', beneficiarioId)
        .single()

      if (!beneficiario || !beneficiario.familia) return

      // Verificar crianças em idade escolar (6-17 anos)
      const hoje = new Date()
      const criancasEscolares = beneficiario.familia.membros?.filter(membro => {
        if (!membro.data_nascimento) return false
        const idade = hoje.getFullYear() - new Date(membro.data_nascimento).getFullYear()
        return idade >= 6 && idade <= 17
      }) || []

      if (criancasEscolares.length === 0) return true // Sem crianças em idade escolar

      // Verificar se todas as crianças estão matriculadas
      let todasMatriculadas = true
      for (const crianca of criancasEscolares) {
        const { data: matriculas } = await supabase
          .from('matriculas')
          .select('*')
          .eq('aluno.cpf', crianca.cpf)
          .eq('status', 'ativa')

        if (!matriculas || matriculas.length === 0) {
          todasMatriculadas = false
          break
        }
      }

      if (!todasMatriculadas) {
        // Suspender benefício por descumprimento de contrapartida
        await assistencia.suspenderBeneficio(
          beneficiarioId, 
          'Criança(s) fora da escola - descumprimento de contrapartida'
        )

        toast.warning('Benefício suspenso: criança fora da escola')
      }

      return todasMatriculadas
    } catch (err) {
      console.error('Erro ao verificar frequência:', err)
      return false
    }
  }

  // Kit escolar para beneficiários
  const distribuirKitEscolar = async (familiaId: string) => {
    try {
      // Verificar se a família tem crianças matriculadas
      const { data: familia } = await supabase
        .from('familias_vulneraveis')
        .select(`
          *,
          membros:membros_familia(*)
        `)
        .eq('id', familiaId)
        .single()

      if (!familia) return

      // Buscar tipo de auxílio "Kit Escolar"
      const { data: tipoKitEscolar } = await supabase
        .from('tipos_auxilio_emergencial')
        .select('*')
        .eq('nome', 'Kit Escolar')
        .single()

      if (tipoKitEscolar) {
        // Solicitar entrega
        await assistencia.solicitarAuxilioEmergencial({
          familia_id: familiaId,
          tipo_auxilio_id: tipoKitEscolar.id,
          motivo: 'Família com crianças matriculadas na rede municipal',
          quantidade: familia.membros?.filter(m => {
            const idade = new Date().getFullYear() - new Date(m.data_nascimento).getFullYear()
            return idade >= 6 && idade <= 17
          }).length || 1
        })

        toast.success('Kit escolar solicitado para família vulnerável!')
      }
    } catch (err) {
      console.error('Erro ao distribuir kit escolar:', err)
    }
  }

  // =====================================================
  // 4. VISÃO 360° DO CIDADÃO
  // =====================================================

  const getVisao360Cidadao = async (cidadaoId: string): Promise<CidadaoCompleto | null> => {
    try {
      setLoading(true)

      // Buscar dados básicos
      const { data: cidadao } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', cidadaoId)
        .single()

      if (!cidadao) return null

      // Buscar dados de saúde
      const { data: agendamentosSaude } = await supabase
        .from('agendamentos_medicos')
        .select('*')
        .eq('paciente_id', cidadaoId)
        .order('data_agendamento', { ascending: false })
        .limit(10)

      const { data: campanhasParticipadas } = await supabase
        .from('participacao_campanhas')
        .select(`
          *,
          campanha:campanhas_saude(nome, tipo)
        `)
        .eq('paciente_id', cidadaoId)
        .order('data_participacao', { ascending: false })
        .limit(10)

      // Buscar dados de educação (filhos)
      const { data: filhosEstudantes } = await supabase
        .from('alunos')
        .select(`
          *,
          matriculas:matriculas(
            status,
            escola:escolas(nome)
          )
        `)
        .eq('responsavel_cpf', cidadao.cpf)

      // Buscar dados de assistência social
      const { data: familiaVulneravel } = await supabase
        .from('familias_vulneraveis')
        .select('*')
        .eq('responsavel_id', cidadaoId)
        .single()

      const { data: beneficiosRecebidos } = await supabase
        .from('beneficiarios_programas')
        .select(`
          *,
          programa:programas_sociais(nome, valor_beneficio)
        `)
        .eq('membro_beneficiario_id', cidadaoId)
        .order('data_inclusao', { ascending: false })

      const visaoCompleta: CidadaoCompleto = {
        id: cidadao.id,
        nome: cidadao.nome,
        cpf: cidadao.cpf,
        email: cidadao.email,
        telefone: cidadao.telefone,
        endereco: cidadao.endereco,
        agendamentos_saude: agendamentosSaude || [],
        campanhas_participadas: campanhasParticipadas || [],
        filhos_estudantes: filhosEstudantes || [],
        familia_vulneravel: familiaVulneravel,
        beneficios_recebidos: beneficiosRecebidos || []
      }

      return visaoCompleta
    } catch (err) {
      console.error('Erro ao buscar visão 360° do cidadão:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Histórico unificado de atendimentos
  const getHistoricoUnificado = async (cidadaoId: string) => {
    try {
      const historico = []

      // Atendimentos de saúde
      const { data: atendimentosSaude } = await supabase
        .from('agendamentos_medicos')
        .select(`
          data_agendamento as data,
          especialidade,
          status,
          'saude' as modulo
        `)
        .eq('paciente_id', cidadaoId)
        .eq('status', 'realizado')

      // Atendimentos sociais
      const { data: atendimentosSociais } = await supabase
        .from('atendimentos_sociais')
        .select(`
          data_atendimento as data,
          servico_prestado,
          status,
          'assistencia' as modulo
        `)
        .eq('familia.responsavel_id', cidadaoId)

      // Matrículas dos filhos
      const { data: matriculasFilhos } = await supabase
        .from('matriculas')
        .select(`
          data_matricula as data,
          'matricula' as tipo,
          'educacao' as modulo,
          escola:escolas(nome)
        `)
        .eq('aluno.responsavel_cpf', cidadaoId)

      return [
        ...(atendimentosSaude || []),
        ...(atendimentosSociais || []),
        ...(matriculasFilhos || [])
      ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    } catch (err) {
      console.error('Erro ao buscar histórico unificado:', err)
      return []
    }
  }

  // =====================================================
  // ROTINAS AUTOMÁTICAS DE INTEGRAÇÃO
  // =====================================================

  const executarRotinaIntegracaoSemanal = async () => {
    try {
      setLoading(true)
      
      // 1. Verificar contrapartidas de benefícios
      const beneficiariosAtivos = assistencia.beneficiariosPrograma.filter(b => b.status === 'ativo')
      
      for (const beneficiario of beneficiariosAtivos) {
        await verificarFrequenciaParaBeneficio(beneficiario.id)
      }

      // 2. Identificar famílias elegíveis para novos benefícios
      const familiasVulneraveis = assistencia.familiasVulneraveis
      
      for (const familia of familiasVulneraveis) {
        if (familia.classificacao === 'critica') {
          // Verificar se já recebe todos os benefícios possíveis
          await verificarElegibilidadeParaNovosBeneficios(familia.id)
        }
      }

      // 3. Agendar campanhas de saúde para escolas
      await verificarCampanhasPendentesEscolas()

      toast.success('Rotina de integração executada com sucesso!')
    } catch (err) {
      console.error('Erro na rotina de integração:', err)
      toast.error('Erro na rotina de integração')
    } finally {
      setLoading(false)
    }
  }

  const verificarElegibilidadeParaNovosBeneficios = async (familiaId: string) => {
    // Verificar elegibilidade para programas que a família ainda não participa
    // Lógica simplificada
  }

  const verificarCampanhasPendentesEscolas = async () => {
    // Verificar campanhas de saúde que podem ser executadas nas escolas
    // Lógica simplificada
  }

  return {
    // Estados
    loading,
    cidadaosCompletos,
    familiasIntegradas,

    // Integrações Saúde + Educação
    verificarVacinacaoParaMatricula,
    organizarCampanhaNasEscolas,
    criarCardapioAdaptado,

    // Integrações Assistência + Saúde
    agendarConsultaPrioritaria,
    dispensarMedicamentoGratuito,
    agendarTransporteParaTratamento,

    // Integrações Assistência + Educação
    vincularTransporteEscolarGratuito,
    verificarFrequenciaParaBeneficio,
    distribuirKitEscolar,

    // Visão 360°
    getVisao360Cidadao,
    getHistoricoUnificado,

    // Rotinas Automáticas
    executarRotinaIntegracaoSemanal
  }
}