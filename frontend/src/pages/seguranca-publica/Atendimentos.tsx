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
import { Shield, Camera, MapPin, AlertTriangle, Radio, Users } from 'lucide-react';

const mockAtendimentosSegurancaPublica: PDVAtendimento[] = [
  {
    id: 'seg001',
    protocolo: 'SEG-2025-0001',
    solicitante: {
      nome: 'João Silva Santos',
      cpf: '123.456.789-00',
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Denúncia de Furto',
    categoria: 'ocorrencias',
    prioridade: 'media',
    status: 'em_andamento',
    responsavel: {
      nome: 'Sgt. Maria Santos',
      cargo: 'Sargento da Guarda Municipal',
      setor: 'Guarda Municipal - Ronda Ostensiva'
    },
    dataAbertura: '2025-01-15T14:30:00Z',
    dataPrevista: '2025-01-20T17:00:00Z',
    descricao: 'Denúncia de furto de bicicleta na Praça Central durante o período da tarde',
    localizacao: {
      endereco: 'Praça Central, Centro',
      bairro: 'Centro',
      cep: '12345-000',
      coordenadas: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    dadosEspecificos: {
      tipoOcorrencia: 'Furto',
      natureza: 'Contra o patrimônio',
      gravidade: 'Leve',
      horarioOcorrencia: '14:30',
      testemunhas: 2,
      objetoFurtado: 'Bicicleta modelo Trek, cor vermelha',
      valorEstimado: 1200.00,
      boletimOcorrencia: 'BO-2025-001234',
      dataBoletim: '2025-01-15',
      delegaciaResponsavel: '1ª DP Centro',
      statusInvestigacao: 'Em andamento',
      equipesEnvolvidas: ['Guarda Municipal', 'Polícia Civil'],
      medidasAdotadas: ['Coleta de depoimentos', 'Análise de câmeras de segurança']
    },
    anexos: [
      {
        nome: 'fotos-local-ocorrencia.jpg',
        url: '/anexos/fotos-local-ocorrencia.jpg',
        tipo: 'image/jpeg'
      },
      {
        nome: 'boletim-ocorrencia.pdf',
        url: '/anexos/boletim-ocorrencia.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-15T14:30:00Z',
        usuario: 'Sistema',
        acao: 'Ocorrência registrada'
      },
      {
        data: '2025-01-15T15:00:00Z',
        usuario: 'Sgt. Maria Santos',
        acao: 'Equipe deslocada para o local',
        observacao: 'Início do atendimento'
      },
      {
        data: '2025-01-15T16:30:00Z',
        usuario: 'Sgt. Maria Santos',
        acao: 'Coleta de depoimentos realizada',
        observacao: 'Identificadas 2 testemunhas'
      }
    ]
  },
  {
    id: 'seg002',
    protocolo: 'SEG-2025-0002',
    solicitante: {
      nome: 'Ana Costa Silva',
      cpf: '987.654.321-00',
      email: 'ana.costa@email.com',
      telefone: '(11) 88888-8888',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Denúncia de Vandalismo',
    categoria: 'vandalismo',
    prioridade: 'alta',
    status: 'novo',
    responsavel: {
      nome: 'Cabo João Pereira',
      cargo: 'Cabo da Guarda Municipal',
      setor: 'Guarda Municipal - Patrimônio Público'
    },
    dataAbertura: '2025-01-18T09:00:00Z',
    dataPrevista: '2025-01-22T17:00:00Z',
    descricao: 'Denúncia de vandalismo com pichações no prédio da Prefeitura Municipal',
    localizacao: {
      endereco: 'Prefeitura Municipal, Av. Principal, 100',
      bairro: 'Centro',
      cep: '12345-001',
      coordenadas: {
        lat: -23.5510,
        lng: -46.6340
      }
    },
    dadosEspecificos: {
      tipoOcorrencia: 'Vandalismo',
      natureza: 'Contra o patrimônio público',
      gravidade: 'Média',
      horarioOcorrencia: '02:00',
      tipoVandalismo: 'Pichação',
      extensaoDano: 'Parede frontal do prédio - aproximadamente 15m²',
      custoEstimadoReparo: 2500.00,
      patrimonioAfetado: 'Prédio da Prefeitura Municipal',
      statusInvestigacao: 'Aguardando',
      camerasSeguranca: true,
      analiseImagens: 'Pendente',
      medidasImediatas: ['Isolamento da área', 'Registro fotográfico'],
      procedimentosAdotados: ['Acionamento da limpeza urbana', 'Comunicação ao MP']
    },
    anexos: [
      {
        nome: 'fotos-vandalismo.jpg',
        url: '/anexos/fotos-vandalismo.jpg',
        tipo: 'image/jpeg'
      }
    ],
    historico: [
      {
        data: '2025-01-18T09:00:00Z',
        usuario: 'Sistema',
        acao: 'Denúncia recebida'
      },
      {
        data: '2025-01-18T09:30:00Z',
        usuario: 'Cabo João Pereira',
        acao: 'Caso atribuído',
        observacao: 'Agendada vistoria para hoje às 14h'
      }
    ]
  },
  {
    id: 'seg003',
    protocolo: 'SEG-2025-0003',
    solicitante: {
      nome: 'Comerciantes da Rua do Comércio',
      email: 'associacao@comerciantes.com.br',
      telefone: '(11) 77777-7777',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Solicitação de Patrulhamento',
    categoria: 'patrulhamento',
    prioridade: 'media',
    status: 'concluido',
    responsavel: {
      nome: 'Ten. Carlos Segurança',
      cargo: 'Tenente da Guarda Municipal',
      setor: 'Comando da Guarda Municipal'
    },
    dataAbertura: '2025-01-12T10:15:00Z',
    dataPrevista: '2025-01-19T17:00:00Z',
    descricao: 'Solicitação de intensificação do patrulhamento na região comercial devido ao aumento de pequenos furtos',
    localizacao: {
      endereco: 'Rua do Comércio, Centro',
      bairro: 'Centro',
      cep: '12345-002'
    },
    dadosEspecificos: {
      tipoSolicitacao: 'Patrulhamento Ostensivo',
      motivoSolicitacao: 'Aumento de pequenos furtos na região',
      periodoSolicitado: 'Segunda a sábado, 08h às 18h',
      numeroEstabelecimentos: 45,
      comerciantesEnvolvidos: 23,
      estatisticasCrime: 'Aumento de 30% em furtos nos últimos 30 dias',
      medidasImplementadas: ['Patrulhamento a pé', 'Ronda motorizada', 'Base móvel'],
      equipesAlocadas: 2,
      resultadosObtidos: 'Redução de 60% nos furtos no período',
      avaliacaoComercio: 'Positiva - maior sensação de segurança',
      continuidade: 'Mantido patrulhamento regular'
    },
    anexos: [
      {
        nome: 'abaixo-assinado-comerciantes.pdf',
        url: '/anexos/abaixo-assinado-comerciantes.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'estatisticas-criminalidade.pdf',
        url: '/anexos/estatisticas-criminalidade.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-12T10:15:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação recebida'
      },
      {
        data: '2025-01-13T08:00:00Z',
        usuario: 'Ten. Carlos Segurança',
        acao: 'Planejamento operacional elaborado'
      },
      {
        data: '2025-01-14T07:00:00Z',
        usuario: 'Ten. Carlos Segurança',
        acao: 'Início do patrulhamento intensificado'
      },
      {
        data: '2025-01-19T16:00:00Z',
        usuario: 'Ten. Carlos Segurança',
        acao: 'Relatório de resultados entregue',
        observacao: 'Patrulhamento mantido com efetividade comprovada'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 167,
  novos: 12,
  emAndamento: 34,
  concluidos: 108,
  tempoMedioAtendimento: 6.2,
  satisfacaoMedia: 4.3,
  porStatus: {
    novo: 12,
    triagem: 13,
    em_andamento: 34,
    aguardando: 0,
    concluido: 108,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 45,
    media: 78,
    alta: 32,
    urgente: 12
  },
  porCategoria: {
    ocorrencias: 67,
    vandalismo: 23,
    patrulhamento: 34,
    emergencias: 18,
    prevencao: 25
  }
};

export default function AtendimentosSegurancaPublica() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosSegurancaPublica);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES["seguranca-publica"];

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
        <Camera className="h-4 w-4 mr-2" />
        Câmeras de Segurança
      </Button>
      <Button variant="outline">
        <Radio className="h-4 w-4 mr-2" />
        Central de Operações
      </Button>
      <Button variant="outline">
        <MapPin className="h-4 w-4 mr-2" />
        Mapa de Ocorrências
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="seguranca-publica"
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
