// =====================================================
// HOOK DE INTEGRAÇÃO ENTRE MÓDULOS DA FASE 4
// CULTURA + SEGURANÇA + PLANEJAMENTO + OBRAS
// =====================================================

import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { toast } from 'react-hot-toast'
import { useCultura } from './useCultura'
import { useSeguranca } from './useSeguranca'
import { usePlanejamento } from './usePlanejamento'
import { useObras } from './useObras'

// =====================================================
// INTERFACES DE INTEGRAÇÃO
// =====================================================

export interface DashboardFase4 {
  cultura: {
    espacosAtivos: number
    eventosConfirmados: number
    projetosAprovados: number
    oficinasAbertas: number
  }
  seguranca: {
    ocorrenciasHoje: number
    viaturasDisponiveis: number
    camerasOperacionais: number
    alertasAtivos: number
  }
  planejamento: {
    projetosEmAnalise: number
    alvarasVigentes: number
    denunciasAbertas: number
    consultasPublicas: number
  }
  obras: {
    obrasEmAndamento: number
    percentualMedioExecucao: number
    valorExecutado: number
    obrasAtrasadas: number
  }
}

export interface ProjetoIntegrado {
  id: string
  nome: string
  tipo: 'urbano' | 'cultural' | 'seguranca' | 'infraestrutura'
  status: string
  valor: number
  impacto_areas: string[]
  coordenadas?: any
}

export const useIntegracaoFase4 = () => {
  const [loading, setLoading] = useState(false)
  const [dashboard, setDashboard] = useState<DashboardFase4>()
  const [projetosIntegrados, setProjetosIntegrados] = useState<ProjetoIntegrado[]>([])

  // Hooks dos módulos
  const cultura = useCultura()
  const seguranca = useSeguranca()
  const planejamento = usePlanejamento()
  const obras = useObras()

  // =====================================================
  // 1. SEGURANÇA + PLANEJAMENTO
  // =====================================================

  // Análise de segurança em novos projetos urbanos
  const analisarSegurancaProjetoUrbano = async (projetoId: string) => {
    try {
      const projeto = planejamento.projetosArquitetonicos.find(p => p.id === projetoId)
      if (!projeto || !projeto.coordenadas) return

      // Buscar pontos críticos próximos
      const pontosCriticosProximos = seguranca.pontosCriticos.filter(ponto => {
        // Simular cálculo de distância (deveria usar geolocalização real)
        return ponto.nivel_risco >= 4
      })

      if (pontosCriticosProximos.length > 0) {
        // Emitir parecer técnico de segurança
        await planejamento.emitirParecerTecnico({
          projeto_id: projetoId,
          area_tecnica: 'seguranca',
          parecer: `Projeto localizado próximo a ${pontosCriticosProximos.length} pontos críticos de segurança. Recomenda-se: melhoramento da iluminação pública, instalação de câmeras de segurança e patrulhamento reforçado.`,
          aprovado: true,
          pendencias: ['Plano de segurança do empreendimento', 'Sistema de iluminação adequado']
        })
      }
    } catch (err) {
      console.error('Erro ao analisar segurança do projeto:', err)
    }
  }

  // Planejamento de iluminação pública em áreas críticas
  const planejarIluminacaoAreasCriticas = async () => {
    try {
      const pontosCriticos = seguranca.pontosCriticos.filter(p => 
        p.nivel_risco >= 4 && !p.iluminacao_adequada
      )

      for (const ponto of pontosCriticos) {
        // Criar projeto de iluminação
        await planejamento.protocolizarProjeto({
          profissional_responsavel: 'Engenheiro Municipal',
          crea_cau: 'CREA-123456',
          endereco_obra: ponto.endereco,
          coordenadas: ponto.coordenadas,
          tipo_projeto: 'publico',
          area_construida: 0,
          area_terreno: 100,
          numero_pavimentos: 0,
          descricao_projeto: `Projeto de iluminação pública para melhoria da segurança em área crítica: ${ponto.nome}`
        })
      }

      toast.success(`${pontosCriticos.length} projetos de iluminação criados para áreas críticas!`)
    } catch (err) {
      console.error('Erro ao planejar iluminação:', err)
      toast.error('Erro ao planejar iluminação')
    }
  }

  // Instalação de câmeras em pontos estratégicos
  const planejarCamerasEstrategicas = async (projetoUrbanistico: any) => {
    try {
      if (!projetoUrbanistico.coordenadas) return

      // Verificar se há pontos críticos na região
      const pontosProximos = seguranca.pontosCriticos.filter(p => p.nivel_risco >= 3)

      if (pontosProximos.length > 0) {
        // Cadastrar nova câmera
        await seguranca.cadastrarCamera({
          codigo: `CAM-${new Date().getTime()}`,
          endereco: projetoUrbanistico.endereco_obra,
          coordenadas: projetoUrbanistico.coordenadas,
          tipo: 'dome',
          funcionalidades: ['zoom', 'visao_noturna', 'movimento'],
          area_cobertura: 'Via pública e entorno do empreendimento'
        })

        toast.success('Câmera de segurança planejada para o local!')
      }
    } catch (err) {
      console.error('Erro ao planejar câmeras:', err)
    }
  }

  // =====================================================
  // 2. OBRAS + PLANEJAMENTO
  // =====================================================

  // Verificar alinhamento de obras com plano diretor
  const verificarAlinhamentoPlanoDirection = async (obraId: string) => {
    try {
      const obra = obras.obrasPublicas.find(o => o.id === obraId)
      if (!obra || !obra.coordenadas) return

      // Consultar zoneamento do local
      const zoneamento = await planejamento.consultarZoneamento(obra.endereco)
      
      if (zoneamento) {
        const conformidade = verificarConformidadeObra(obra, zoneamento)
        
        if (!conformidade.aprovado) {
          await obras.atualizarStatusObra(
            obraId, 
            'paralisada', 
            `Obra não conforme com zoneamento: ${conformidade.problemas.join(', ')}`
          )
          
          toast.warning('Obra paralisada por não conformidade com plano diretor!')
        }
      }
    } catch (err) {
      console.error('Erro ao verificar alinhamento:', err)
    }
  }

  const verificarConformidadeObra = (obra: any, zoneamento: any) => {
    const problemas = []

    // Verificar atividades permitidas
    if (obra.tipo === 'construcao' && zoneamento.zona.tipo === 'preservacao') {
      problemas.push('Construção não permitida em zona de preservação')
    }

    // Verificar outros parâmetros conforme necessário
    return {
      aprovado: problemas.length === 0,
      problemas
    }
  }

  // Aprovação automática para obras públicas
  const aprovarProjetoObraPublica = async (projetoId: string) => {
    try {
      const projeto = planejamento.projetosArquitetonicos.find(p => p.id === projetoId)
      
      if (projeto && projeto.tipo_projeto === 'publico') {
        // Emitir pareceres automáticos para obras públicas
        const areasAprovacao = ['arquitetura', 'engenharia', 'urbanismo']
        
        for (const area of areasAprovacao) {
          await planejamento.emitirParecerTecnico({
            projeto_id: projetoId,
            area_tecnica: area as any,
            parecer: 'Projeto de obra pública aprovado conforme diretrizes municipais',
            aprovado: true,
            pendencias: []
          })
        }
      }
    } catch (err) {
      console.error('Erro ao aprovar projeto público:', err)
    }
  }

  // Comunicação de impacto de obras
  const comunicarImpactoObra = async (obraId: string) => {
    try {
      const obra = obras.obrasPublicas.find(o => o.id === obraId)
      if (!obra) return

      // Criar alerta de segurança para impacto da obra
      await seguranca.criarAlertaSeguranca({
        tipo: 'informativo',
        titulo: `Obra em andamento: ${obra.nome}`,
        descricao: `Obra de ${obra.tipo} pode causar interdições e desvios de trânsito na região.`,
        gravidade: 'baixa',
        area_afetada: obra.endereco,
        coordenadas_centro: obra.coordenadas,
        raio_metros: 500,
        canais_comunicacao: ['email', 'sms']
      })
    } catch (err) {
      console.error('Erro ao comunicar impacto:', err)
    }
  }

  // =====================================================
  // 3. CULTURA + PLANEJAMENTO
  // =====================================================

  // Proteção do patrimônio histórico em projetos
  const verificarPatrimonioHistorico = async (projetoId: string) => {
    try {
      const projeto = planejamento.projetosArquitetonicos.find(p => p.id === projetoId)
      if (!projeto) return

      // Buscar patrimônio cultural próximo
      const patrimonioProximo = cultura.patrimonioCultural.find(p => 
        p.endereco?.toLowerCase().includes(projeto.endereco_obra.toLowerCase()) &&
        p.tombado
      )

      if (patrimonioProximo) {
        // Solicitar complementação para proteção do patrimônio
        await planejamento.solicitarComplementacao(projetoId, [
          'Estudo de impacto no patrimônio histórico',
          'Medidas de proteção durante a obra',
          'Aprovação do IPHAN/órgão competente'
        ])

        toast.warning('Projeto próximo a patrimônio tombado requer estudos adicionais!')
      }
    } catch (err) {
      console.error('Erro ao verificar patrimônio:', err)
    }
  }

  // Planejamento de espaços culturais no zoneamento
  const planejarEspacosCulturais = async () => {
    try {
      // Identificar zonas que precisam de equipamentos culturais
      const zonasResidenciais = planejamento.zonasUrbanas.filter(z => 
        z.tipo === 'residencial' || z.tipo === 'mista'
      )

      for (const zona of zonasResidenciais) {
        const espacosNaZona = cultura.espacosCulturais.filter(espaco =>
          // Lógica simplificada - deveria usar coordenadas reais
          espaco.endereco.includes(zona.nome)
        )

        if (espacosNaZona.length === 0) {
          // Criar projeto para novo espaço cultural
          await planejamento.protocolizarProjeto({
            profissional_responsavel: 'Arquiteto Municipal',
            crea_cau: 'CAU-123456',
            endereco_obra: `Centro da ${zona.nome}`,
            tipo_projeto: 'publico',
            area_construida: 500,
            area_terreno: 1000,
            numero_pavimentos: 1,
            descricao_projeto: `Centro Cultural para atender a região da ${zona.nome}`
          })
        }
      }
    } catch (err) {
      console.error('Erro ao planejar espaços culturais:', err)
    }
  }

  // Consulta pública para projetos culturais
  const criarConsultaProjetoCultural = async (eventoId: string) => {
    try {
      const evento = cultura.eventosCulturais.find(e => e.id === eventoId)
      if (!evento || evento.publico_esperado! < 1000) return

      // Criar consulta pública para grandes eventos
      await planejamento.criarConsultaPublica({
        titulo: `Consulta Pública: ${evento.nome}`,
        descricao: `Consulta sobre a realização do evento ${evento.nome} com público estimado de ${evento.publico_esperado} pessoas.`,
        tipo: 'projeto_urbano',
        data_abertura: new Date().toISOString().split('T')[0],
        data_encerramento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        modalidade: 'hibrida',
        participantes_esperados: 100
      })

      toast.success('Consulta pública criada para grande evento cultural!')
    } catch (err) {
      console.error('Erro ao criar consulta:', err)
    }
  }

  // =====================================================
  // 4. OBRAS + CULTURA
  // =====================================================

  // Priorizar obras em espaços culturais
  const priorizarObrasCulturais = async () => {
    try {
      const obrasEspacosCulturais = obras.obrasPublicas.filter(obra => 
        cultura.espacosCulturais.some(espaco => 
          espaco.endereco.includes(obra.endereco)
        )
      )

      for (const obra of obrasEspacosCulturais) {
        if (obra.status === 'planejada') {
          await obras.atualizarStatusObra(
            obra.id,
            'licitando',
            'Obra priorizada por estar em espaço cultural'
          )
        }
      }
    } catch (err) {
      console.error('Erro ao priorizar obras culturais:', err)
    }
  }

  // Coordenar obras com eventos culturais
  const coordenarObrasComEventos = async () => {
    try {
      const eventosProximos = cultura.eventosCulturais.filter(evento => {
        const dataEvento = new Date(evento.data_inicio)
        const hoje = new Date()
        const diasParaEvento = (dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
        return diasParaEvento <= 30 && diasParaEvento >= 0
      })

      for (const evento of eventosProximos) {
        if (!evento.espaco?.endereco) continue

        const obrasProximas = obras.obrasPublicas.filter(obra => 
          obra.endereco.includes(evento.espaco!.endereco) &&
          obra.status === 'em_andamento'
        )

        for (const obra of obrasProximas) {
          // Acelerar obra ou pausar temporariamente
          const dataEvento = new Date(evento.data_inicio)
          const dataFimPrevista = new Date(obra.data_fim_prevista)

          if (dataFimPrevista > dataEvento) {
            await obras.atualizarStatusObra(
              obra.id,
              'paralisada',
              `Obra pausada temporariamente devido ao evento ${evento.nome}`
            )

            toast.info(`Obra pausada para não interferir no evento ${evento.nome}`)
          }
        }
      }
    } catch (err) {
      console.error('Erro ao coordenar obras com eventos:', err)
    }
  }

  // =====================================================
  // 5. DASHBOARD INTEGRADO
  // =====================================================

  const getDashboardFase4 = async (): Promise<DashboardFase4> => {
    try {
      const indicadoresCultura = cultura.getIndicadoresCultura()
      const indicadoresSeguranca = seguranca.getIndicadoresSeguranca()
      const indicadoresPlanejamento = planejamento.getIndicadoresPlanejamento()
      const indicadoresObras = obras.getIndicadoresObras()

      return {
        cultura: {
          espacosAtivos: indicadoresCultura.espacosAtivos,
          eventosConfirmados: indicadoresCultura.eventosConfirmados,
          projetosAprovados: indicadoresCultura.projetosAprovados,
          oficinasAbertas: indicadoresCultura.oficinasAbertas
        },
        seguranca: {
          ocorrenciasHoje: indicadoresSeguranca.ocorrenciasHoje,
          viaturasDisponiveis: indicadoresSeguranca.viaturasDisponiveis,
          camerasOperacionais: indicadoresSeguranca.camerasOperacionais,
          alertasAtivos: indicadoresSeguranca.alertasAtivos
        },
        planejamento: {
          projetosEmAnalise: indicadoresPlanejamento.projetosEmAnalise,
          alvarasVigentes: indicadoresPlanejamento.alvarasVigentes,
          denunciasAbertas: indicadoresPlanejamento.denunciasAbertas,
          consultasPublicas: indicadoresPlanejamento.consultasAbertas
        },
        obras: {
          obrasEmAndamento: indicadoresObras.obrasEmAndamento,
          percentualMedioExecucao: indicadoresObras.mediaExecucao,
          valorExecutado: indicadoresObras.valorTotalPago,
          obrasAtrasadas: indicadoresObras.obrasAtrasadas
        }
      }
    } catch (err) {
      console.error('Erro ao gerar dashboard:', err)
      return {
        cultura: { espacosAtivos: 0, eventosConfirmados: 0, projetosAprovados: 0, oficinasAbertas: 0 },
        seguranca: { ocorrenciasHoje: 0, viaturasDisponiveis: 0, camerasOperacionais: 0, alertasAtivos: 0 },
        planejamento: { projetosEmAnalise: 0, alvarasVigentes: 0, denunciasAbertas: 0, consultasPublicas: 0 },
        obras: { obrasEmAndamento: 0, percentualMedioExecucao: 0, valorExecutado: 0, obrasAtrasadas: 0 }
      }
    }
  }

  // Mapa consolidado de projetos
  const getMapaProjetosIntegrados = () => {
    const projetos: ProjetoIntegrado[] = []

    // Projetos arquitetônicos
    planejamento.projetosArquitetonicos.forEach(projeto => {
      if (projeto.coordenadas) {
        projetos.push({
          id: projeto.id,
          nome: projeto.numero_processo,
          tipo: 'urbano',
          status: projeto.status,
          valor: projeto.taxa_analise,
          impacto_areas: ['planejamento'],
          coordenadas: projeto.coordenadas
        })
      }
    })

    // Obras públicas
    obras.obrasPublicas.forEach(obra => {
      if (obra.coordenadas) {
        projetos.push({
          id: obra.id,
          nome: obra.nome,
          tipo: 'infraestrutura',
          status: obra.status,
          valor: obra.valor_contratado,
          impacto_areas: ['obras', 'planejamento'],
          coordenadas: obra.coordenadas
        })
      }
    })

    // Eventos culturais
    cultura.eventosCulturais.forEach(evento => {
      if (evento.espaco?.endereco) {
        projetos.push({
          id: evento.id,
          nome: evento.nome,
          tipo: 'cultural',
          status: evento.status,
          valor: evento.orcamento_total || 0,
          impacto_areas: ['cultura'],
          coordenadas: null // Seria obtido do espaço
        })
      }
    })

    return projetos
  }

  // =====================================================
  // ROTINAS AUTOMÁTICAS INTEGRADAS
  // =====================================================

  const executarRotinaIntegracaoSemanal = async () => {
    try {
      setLoading(true)

      // Análises de segurança para novos projetos
      const projetosNovos = planejamento.projetosArquitetonicos.filter(p => 
        p.status === 'protocolado'
      )

      for (const projeto of projetosNovos) {
        await analisarSegurancaProjetoUrbano(projeto.id)
        await verificarPatrimonioHistorico(projeto.id)
      }

      // Coordenação de obras e eventos
      await coordenarObrasComEventos()

      // Planejamento de melhorias de segurança
      await planejarIluminacaoAreasCriticas()

      // Atualizar dashboard
      const novoDashboard = await getDashboardFase4()
      setDashboard(novoDashboard)

      toast.success('Rotina de integração executada!')
    } catch (err) {
      console.error('Erro na rotina de integração:', err)
      toast.error('Erro na rotina de integração')
    } finally {
      setLoading(false)
    }
  }

  // Análise de impacto integrada
  const analisarImpactoIntegrado = (projetoId: string, tipoModulo: 'cultura' | 'seguranca' | 'planejamento' | 'obras') => {
    const impactos = {
      planejamento: [],
      seguranca: [],
      cultura: [],
      obras: []
    }

    switch (tipoModulo) {
      case 'obras':
        impactos.seguranca.push('Possível alteração no patrulhamento')
        impactos.planejamento.push('Conformidade com zoneamento')
        impactos.cultura.push('Impacto em eventos próximos')
        break
      
      case 'cultura':
        impactos.seguranca.push('Necessidade de reforço policial')
        impactos.planejamento.push('Impacto no trânsito local')
        impactos.obras.push('Pausas em obras próximas')
        break

      case 'planejamento':
        impactos.obras.push('Novas demandas de infraestrutura')
        impactos.seguranca.push('Análise de segurança do projeto')
        impactos.cultura.push('Impacto no patrimônio histórico')
        break

      case 'seguranca':
        impactos.planejamento.push('Demanda por melhorias urbanas')
        impactos.obras.push('Necessidade de iluminação')
        impactos.cultura.push('Restrições para eventos')
        break
    }

    return impactos
  }

  return {
    // Estados
    loading,
    dashboard,
    projetosIntegrados,

    // Integrações Segurança + Planejamento
    analisarSegurancaProjetoUrbano,
    planejarIluminacaoAreasCriticas,
    planejarCamerasEstrategicas,

    // Integrações Obras + Planejamento
    verificarAlinhamentoPlanoDirection,
    aprovarProjetoObraPublica,
    comunicarImpactoObra,

    // Integrações Cultura + Planejamento
    verificarPatrimonioHistorico,
    planejarEspacosCulturais,
    criarConsultaProjetoCultural,

    // Integrações Obras + Cultura
    priorizarObrasCulturais,
    coordenarObrasComEventos,

    // Dashboard e Análises
    getDashboardFase4,
    getMapaProjetosIntegrados,
    analisarImpactoIntegrado,

    // Rotinas Automáticas
    executarRotinaIntegracaoSemanal
  }
}