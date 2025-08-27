import React, { useState } from 'react';
import { PDVAtendimentoBase } from '@/components/pdv/PDVAtendimentoBase';
import { 
  PDVAtendimento, 
  PDVFiltros, 
  PDVEstatisticas, 
  PDV_CONFIGURACOES 
} from '@/types/pdv-types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wheat, Tractor, Sprout, Users, BookOpen, FileText } from 'lucide-react';

const mockAtendimentosAgricultura: PDVAtendimento[] = [
  {
    id: 'agr001',
    protocolo: 'AGR-2025-0001',
    solicitante: {
      nome: 'João Silva Santos',
      cpf: '123.456.789-00',
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Assistência Técnica Rural',
    categoria: 'assistencia',
    prioridade: 'alta',
    status: 'em_andamento',
    responsavel: {
      nome: 'Eng. Agr. Carlos Santos',
      cargo: 'Engenheiro Agrônomo',
      setor: 'Secretaria de Agricultura - Assistência Técnica'
    },
    dataAbertura: '2025-01-15T09:00:00Z',
    dataPrevista: '2025-01-20T17:00:00Z',
    descricao: 'Produtor relatou infestação de lagarta-do-cartucho na plantação de milho de 5 hectares',
    localizacao: {
      endereco: 'Sítio Santa Maria, Estrada Rural, km 15',
      bairro: 'Zona Rural Norte',
      cep: '12345-000',
      coordenadas: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    dadosEspecificos: {
      tipoProdutor: 'Agricultor Familiar',
      propriedade: 'Sítio Santa Maria',
      areaTotalPropriedade: '10 hectares',
      areaAfetada: '5 hectares',
      cultura: 'Milho',
      variedade: 'Híbrido AG 9010',
      estadioCultura: 'V6 - 6 folhas desenvolvidas',
      tipoProblema: 'Praga - Lagarta-do-cartucho',
      intensidadeInfestacao: 'Moderada a alta',
      produtosUtilizados: ['Defensivo biológico Bt', 'Inseticida seletivo'],
      tecnicaAplicacao: 'Pulverização terrestre',
      condicoesTempo: 'Tempo seco, vento calmo',
      produtividadeEsperada: '8 toneladas/hectare',
      investimentoAplicado: 'R$ 3.500,00',
      cronogramaAcompanhamento: 'Visitas semanais por 4 semanas',
      resultadosEsperados: 'Controle da praga e recuperação da cultura'
    },
    anexos: [
      {
        nome: 'fotos-infestation-milho.jpg',
        url: '/anexos/fotos-infestation-milho.jpg',
        tipo: 'image/jpeg'
      },
      {
        nome: 'receituario-agonomico.pdf',
        url: '/anexos/receituario-agonomico.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-15T09:00:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação registrada'
      },
      {
        data: '2025-01-15T14:00:00Z',
        usuario: 'Eng. Agr. Carlos Santos',
        acao: 'Primeira visita técnica realizada',
        observacao: 'Identificada infestação de lagarta-do-cartucho'
      },
      {
        data: '2025-01-16T10:00:00Z',
        usuario: 'Eng. Agr. Carlos Santos',
        acao: 'Receituário agronômico emitido',
        observacao: 'Recomendado controle biológico integrado'
      }
    ]
  },
  {
    id: 'agr002',
    protocolo: 'AGR-2025-0002',
    solicitante: {
      nome: 'Maria Oliveira Santos',
      cpf: '987.654.321-00',
      email: 'maria.oliveira@email.com',
      telefone: '(11) 88888-8888',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Orientação sobre Crédito Rural',
    categoria: 'credito',
    prioridade: 'media',
    status: 'concluido',
    responsavel: {
      nome: 'Ana Costa Lima',
      cargo: 'Técnica em Agropecuária',
      setor: 'Secretaria de Agricultura - Desenvolvimento Rural'
    },
    dataAbertura: '2025-01-10T08:30:00Z',
    dataPrevista: '2025-01-15T17:00:00Z',
    descricao: 'Solicitação de orientações sobre acesso ao PRONAF para diversificação da produção agrícola',
    localizacao: {
      endereco: 'Chácara Boa Vista, Estrada Municipal, km 8',
      bairro: 'Zona Rural Sul',
      cep: '12345-100'
    },
    dadosEspecificos: {
      tipoProdutor: 'Agricultor Familiar',
      propriedade: 'Chácara Boa Vista',
      areaTotalPropriedade: '2 hectares',
      rendaFamiliar: 'Até 3 salários mínimos',
      composicaoFamiliar: '4 pessoas',
      atividadePrincipal: 'Horticultura',
      projetoInteresse: 'Diversificação com fruticultura',
      valorCreditoSolicitado: 'R$ 15.000,00',
      finalidadeCredito: 'Custeio e investimento',
      documentacaoNecessaria: ['DAP', 'CPF', 'Projeto técnico'],
      statusDocumentacao: 'Completa e aprovada',
      bancoParceiro: 'Banco do Brasil',
      linhaCredito: 'PRONAF Mais Alimentos',
      taxaJuros: '3% ao ano',
      prazoPagemento: '5 anos',
      resultadoOrientacao: 'Crédito aprovado e liberado'
    },
    anexos: [
      {
        nome: 'projeto-tecnico-fruticultura.pdf',
        url: '/anexos/projeto-tecnico-fruticultura.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'dap-agricultor-familiar.pdf',
        url: '/anexos/dap-agricultor-familiar.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-10T08:30:00Z',
        usuario: 'Sistema',
        acao: 'Orientação solicitada'
      },
      {
        data: '2025-01-11T09:00:00Z',
        usuario: 'Ana Costa Lima',
        acao: 'Atendimento inicial realizado',
        observacao: 'Orientações sobre PRONAF fornecidas'
      },
      {
        data: '2025-01-12T14:00:00Z',
        usuario: 'Ana Costa Lima',
        acao: 'Documentação analisada',
        observacao: 'Projeto técnico aprovado'
      },
      {
        data: '2025-01-15T16:00:00Z',
        usuario: 'Sistema',
        acao: 'Crédito aprovado e liberado',
        observacao: 'Processo concluído com sucesso'
      }
    ]
  },
  {
    id: 'agr003',
    protocolo: 'AGR-2025-0003',
    solicitante: {
      nome: 'Cooperativa Rural Vale Verde',
      email: 'contato@coopvaleverde.com.br',
      telefone: '(11) 77777-7777',
      tipo: 'externo'
    },
    tipoSolicitacao: 'Capacitação Técnica',
    categoria: 'capacitacao',
    prioridade: 'media',
    status: 'novo',
    responsavel: {
      nome: 'Dr. Roberto Agricultura',
      cargo: 'Coordenador de Extensão Rural',
      setor: 'Secretaria de Agricultura - Extensão Rural'
    },
    dataAbertura: '2025-01-18T10:00:00Z',
    dataPrevista: '2025-02-15T17:00:00Z',
    descricao: 'Solicitação de curso de capacitação sobre agricultura sustentável e orgânica para 30 produtores cooperados',
    localizacao: {
      endereco: 'Sede da Cooperativa, Av. Rural, 200',
      bairro: 'Centro Rural',
      cep: '12345-200'
    },
    dadosEspecificos: {
      tipoEvento: 'Curso de Capacitação',
      temaAbordado: 'Agricultura Sustentável e Orgânica',
      publicoAlvo: 'Produtores rurais cooperados',
      numeroParticipantes: 30,
      cargaHoraria: '40 horas',
      modalidade: 'Presencial',
      duracaoEvento: '5 dias (8h/dia)',
      localRealizacao: 'Auditório da Cooperativa',
      equipamentosNecessarios: ['Projetor', 'Sistema de som', 'Material didático'],
      conteudoProgramatico: [
        'Princípios da agricultura orgânica',
        'Manejo de solo sustentável',
        'Controle biológico de pragas',
        'Certificação orgânica',
        'Comercialização de produtos orgânicos'
      ],
      instrutoresResponsaveis: ['Dr. Roberto Agricultura', 'Eng. Agr. Sandra Sustentável'],
      certificacao: 'Certificado de participação',
      investimentoTotal: 'R$ 8.000,00',
      materialDidatico: 'Apostilas e cartilhas técnicas'
    },
    anexos: [
      {
        nome: 'proposta-curso-agricultura-organica.pdf',
        url: '/anexos/proposta-curso-agricultura-organica.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-18T10:00:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação recebida',
        observacao: 'Aguardando análise e agendamento'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 189,
  novos: 15,
  emAndamento: 32,
  concluidos: 128,
  tempoMedioAtendimento: 12.5,
  satisfacaoMedia: 4.6,
  porStatus: {
    novo: 15,
    triagem: 14,
    em_andamento: 32,
    aguardando: 0,
    concluido: 128,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 67,
    media: 89,
    alta: 28,
    urgente: 5
  },
  porCategoria: {
    assistencia: 78,
    credito: 45,
    capacitacao: 32,
    inspecao: 23,
    outros: 11
  }
};

export default function AgriculturaAtendimentos() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosAgricultura);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES.agricultura;

  const handleNovoAtendimento = (dadosAtendimento: Partial<PDVAtendimento>) => {
    console.log('Novo atendimento:', dadosAtendimento);
  };

  const handleAtualizarAtendimento = (id: string, dados: Partial<PDVAtendimento>) => {
    setAtendimentos(prev => 
      prev.map(atendimento => 
        atendimento.id === id ? { ...atendimento, ...dados } : atendimento
      )
    );
  };

  const handleFiltrar = (novosFiltros: PDVFiltros) => {
    setFiltros(novosFiltros);
  };

  const filtrosCustomizados = (
    <>
      <Select
        value={filtros.categoria?.[0] || 'todas'}
        onValueChange={(value) => {
          const novosFiltros = { 
            ...filtros, 
            categoria: value === 'todas' ? [] : [value] 
          };
          setFiltros(novosFiltros);
          handleFiltrar(novosFiltros);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as Categorias</SelectItem>
          {configuracao.categorias.map(categoria => (
            <SelectItem key={categoria.id} value={categoria.id}>
              <span className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoria.cor }}
                />
                {categoria.nome}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  const acoesCustomizadas = (
    <>
      <Button variant="outline">
        <Tractor className="h-4 w-4 mr-2" />
        Assistência Técnica
      </Button>
      <Button variant="outline">
        <Sprout className="h-4 w-4 mr-2" />
        Extensão Rural
      </Button>
      <Button variant="outline">
        <BookOpen className="h-4 w-4 mr-2" />
        Capacitação
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="agricultura"
      configuracao={configuracao}
      atendimentos={atendimentos}
      estatisticas={mockEstatisticas}
      onNovoAtendimento={handleNovoAtendimento}
      onAtualizarAtendimento={handleAtualizarAtendimento}
      onFiltrar={handleFiltrar}
      customFilters={filtrosCustomizados}
      customActions={acoesCustomizadas}
    />
  );
}
