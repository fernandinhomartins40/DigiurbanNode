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
import { MapPin, Building2, Ruler, FileText, Calendar, Users } from 'lucide-react';

const mockAtendimentosPlanejamentoUrbano: PDVAtendimento[] = [
  {
    id: 'pla001',
    protocolo: 'PLA-2025-0001',
    solicitante: {
      nome: 'João Silva Santos',
      cpf: '123.456.789-00',
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Consulta sobre Zoneamento',
    categoria: 'zoneamento',
    prioridade: 'media',
    status: 'em_andamento',
    responsavel: {
      nome: 'Arq. Maria Planejamento',
      cargo: 'Arquiteta Urbanista',
      setor: 'Planejamento Urbano - Zoneamento'
    },
    dataAbertura: '2025-01-15T09:00:00Z',
    dataPrevista: '2025-01-30T17:00:00Z',
    descricao: 'Consulta sobre as regras de zoneamento urbanístico para terreno residencial e possibilidade de uso misto',
    localizacao: {
      endereco: 'Rua das Flores, 123',
      bairro: 'Jardim das Árvores',
      cep: '12345-678',
      coordenadas: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    dadosEspecificos: {
      zonaUrbana: 'ZR-2 (Zona Residencial 2)',
      areaTerreno: 450.0,
      coeficienteAproveitamento: '2,0',
      taxaOcupacao: '60%',
      recuosObrigatorios: {
        frontal: '5m',
        lateral: '1,5m',
        fundos: '3m'
      },
      usoPermitido: ['Residencial', 'Comércio local', 'Serviços'],
      gabarito: 'Até 15m de altura',
      finalidadeConsulta: 'Construção de edifício residencial com comércio no térreo',
      documentosAnalisados: ['Certidão de Matrícula', 'Levantamento topográfico'],
      parecerTecnico: 'Em elaboração - aguardando vistoria no local',
      legislacaoAplicavel: ['Lei de Zoneamento Municipal 001/2020', 'Código de Obras']
    },
    anexos: [
      {
        nome: 'matricula-imovel.pdf',
        url: '/anexos/matricula-imovel.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'planta-localizacao.pdf',
        url: '/anexos/planta-localizacao.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-15T09:00:00Z',
        usuario: 'Sistema',
        acao: 'Consulta registrada'
      },
      {
        data: '2025-01-16T14:00:00Z',
        usuario: 'Arq. Maria Planejamento',
        acao: 'Análise preliminar iniciada',
        observacao: 'Documentação básica aprovada'
      },
      {
        data: '2025-01-18T10:30:00Z',
        usuario: 'Arq. Maria Planejamento',
        acao: 'Vistoria agendada',
        observacao: 'Vistoria marcada para 22/01 às 14h'
      }
    ]
  },
  {
    id: 'pla002',
    protocolo: 'PLA-2025-0002',
    solicitante: {
      nome: 'Construtora Boa Vista Ltda',
      email: 'projetos@boavista.com.br',
      telefone: '(11) 88888-8888',
      tipo: 'externo'
    },
    tipoSolicitacao: 'Solicitação de Certidão de Uso do Solo',
    categoria: 'certidoes',
    prioridade: 'alta',
    status: 'concluido',
    responsavel: {
      nome: 'Eng. Carlos Urban',
      cargo: 'Engenheiro Civil',
      setor: 'Planejamento Urbano - Aprovações'
    },
    dataAbertura: '2025-01-10T14:30:00Z',
    dataPrevista: '2025-01-20T17:00:00Z',
    descricao: 'Solicitação de Certidão de Uso e Ocupação do Solo para empreendimento residencial multifamiliar',
    localizacao: {
      endereco: 'Av. Principal, 500',
      bairro: 'Centro',
      cep: '12345-000',
      coordenadas: {
        lat: -23.5550,
        lng: -46.6350
      }
    },
    dadosEspecificos: {
      tipoCertidao: 'Uso e Ocupação do Solo',
      finalidade: 'Empreendimento residencial multifamiliar',
      areaTotal: 1200.0,
      numeroUnidades: 24,
      zonaUrbana: 'ZR-3 (Zona Residencial 3)',
      usoPretendido: 'Habitacional coletivo',
      parametrosUrbanisticos: {
        coeficienteAproveitamento: '3,0',
        taxaOcupacao: '70%',
        taxaPermeabilidade: '20%',
        vagasEstacionamento: 30
      },
      resultadoAnalise: 'APROVADO - Empreendimento compatível com o zoneamento',
      certidaoEmitida: true,
      numeroCertidao: 'CUOS-2025-0012',
      validadeCertidao: '2026-01-18',
      observacoesTecnicas: 'Deve atender todas as normas de acessibilidade'
    },
    anexos: [
      {
        nome: 'projeto-arquitetonico.pdf',
        url: '/anexos/projeto-arquitetonico.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'memorial-descritivo.pdf',
        url: '/anexos/memorial-descritivo.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'certidao-uso-solo.pdf',
        url: '/anexos/certidao-uso-solo.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-10T14:30:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação protocolada'
      },
      {
        data: '2025-01-12T09:00:00Z',
        usuario: 'Eng. Carlos Urban',
        acao: 'Análise documental iniciada'
      },
      {
        data: '2025-01-15T16:00:00Z',
        usuario: 'Eng. Carlos Urban',
        acao: 'Parecer técnico aprovado',
        observacao: 'Projeto atende aos parâmetros urbanísticos'
      },
      {
        data: '2025-01-18T14:00:00Z',
        usuario: 'Sistema',
        acao: 'Certidão emitida',
        observacao: 'Certidão CUOS-2025-0012 disponibilizada'
      }
    ]
  },
  {
    id: 'pla003',
    protocolo: 'PLA-2025-0003',
    solicitante: {
      nome: 'Maria Santos Oliveira',
      cpf: '987.654.321-00',
      email: 'maria.santos@email.com',
      telefone: '(11) 77777-7777',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Licença para Demolição',
    categoria: 'licencas',
    prioridade: 'media',
    status: 'triagem',
    responsavel: {
      nome: 'Eng. Roberto Obras',
      cargo: 'Engenheiro Civil',
      setor: 'Fiscalização de Obras'
    },
    dataAbertura: '2025-01-18T11:00:00Z',
    dataPrevista: '2025-02-15T17:00:00Z',
    descricao: 'Solicitação de licença para demolição de edificação residencial para construção de nova residência',
    localizacao: {
      endereco: 'Rua dos Pinheiros, 789',
      bairro: 'Vila Nova',
      cep: '12345-900',
      coordenadas: {
        lat: -23.5600,
        lng: -46.6400
      }
    },
    dadosEspecificos: {
      tipoLicenca: 'Demolição',
      tipoEdificacao: 'Residencial unifamiliar',
      areaEdificacao: 120.0,
      idadeImovel: '45 anos',
      motivoDemolicao: 'Construção de nova residência',
      metodoDemolicao: 'Demolição controlada com equipamentos',
      empresaResponsavel: 'Demolições São Paulo Ltda',
      cronogramaObra: '15 dias úteis',
      destinacaoEntulho: 'Aterro sanitário licenciado',
      medidasSeguranca: ['Isolamento da área', 'Sinalização', 'Controle de poeira'],
      impactoVizinhanca: 'Mínimo - horário comercial apenas',
      documentosNecessarios: ['ART do responsável técnico', 'Plano de demolição', 'Seguro da obra'],
      statusDocumentacao: 'Em análise'
    },
    anexos: [
      {
        nome: 'planta-imovel-atual.pdf',
        url: '/anexos/planta-imovel-atual.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'plano-demolicao.pdf',
        url: '/anexos/plano-demolicao.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-18T11:00:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação registrada'
      },
      {
        data: '2025-01-19T08:30:00Z',
        usuario: 'Eng. Roberto Obras',
        acao: 'Análise preliminar iniciada',
        observacao: 'Verificação da documentação apresentada'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 145,
  novos: 8,
  emAndamento: 23,
  concluidos: 102,
  tempoMedioAtendimento: 21.5,
  satisfacaoMedia: 4.4,
  porStatus: {
    novo: 8,
    triagem: 15,
    em_andamento: 23,
    aguardando: 0,
    concluido: 102,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 58,
    media: 67,
    alta: 18,
    urgente: 2
  },
  porCategoria: {
    zoneamento: 45,
    certidoes: 38,
    licencas: 28,
    parcelamento: 20,
    projetos: 14
  }
};

export default function PlanejamentoUrbanoAtendimentos() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosPlanejamentoUrbano);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES["planejamento-urbano"];

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
        <MapPin className="h-4 w-4 mr-2" />
        Mapa Urbanístico
      </Button>
      <Button variant="outline">
        <Building2 className="h-4 w-4 mr-2" />
        Zoneamento
      </Button>
      <Button variant="outline">
        <Ruler className="h-4 w-4 mr-2" />
        Código de Obras
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="planejamento-urbano"
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
