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
import { Phone, MapPin, Lightbulb, Truck, Wrench, Calendar } from 'lucide-react';

const mockAtendimentosServicosPublicos: PDVAtendimento[] = [
  {
    id: 'ser001',
    protocolo: 'SER-2025-0001',
    solicitante: {
      nome: 'João Silva Santos',
      cpf: '123.456.789-00',
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Reparo de Iluminação Pública',
    categoria: 'iluminacao',
    prioridade: 'alta',
    status: 'em_andamento',
    responsavel: {
      nome: 'Téc. Carlos Iluminação',
      cargo: 'Técnico Eletricista',
      setor: 'Manutenção de Iluminação Pública'
    },
    dataAbertura: '2025-01-15T19:30:00Z',
    dataPrevista: '2025-01-17T17:00:00Z',
    descricao: 'Poste de iluminação pública queimado deixando rua sem iluminação há 3 dias',
    localizacao: {
      endereco: 'Rua das Flores, 123, em frente ao número 125',
      bairro: 'Centro',
      cep: '12345-000',
      coordenadas: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    dadosEspecificos: {
      tipoServico: 'Iluminação Pública',
      tipoPoste: 'Ornamental LED 150W',
      numeroPatrimonio: 'IL-2025-0847',
      tipoProblema: 'Lâmpada queimada',
      impactoSeguranca: 'Alto - rua escura à noite',
      equipamentos: ['Lâmpada LED 150W', 'Reator eletrônico'],
      equipeResponsavel: 'Equipe Iluminação Setor Norte',
      horarioServico: 'Comercial - 8h às 17h',
      previsaoExecucao: '24 horas após disponibilidade de peças',
      pecasNecessarias: 'Lâmpada LED 150W - 1 unidade',
      statusPecas: 'Solicitada ao almoxarifado',
      procedimentos: ['Desligamento do circuito', 'Substituição da lâmpada', 'Teste de funcionamento']
    },
    anexos: [
      {
        nome: 'foto-poste-queimado.jpg',
        url: '/anexos/foto-poste-queimado.jpg',
        tipo: 'image/jpeg'
      }
    ],
    historico: [
      {
        data: '2025-01-15T19:30:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação registrada'
      },
      {
        data: '2025-01-16T08:00:00Z',
        usuario: 'Téc. Carlos Iluminação',
        acao: 'Vistoria realizada',
        observacao: 'Confirmado problema na lâmpada LED'
      },
      {
        data: '2025-01-16T14:30:00Z',
        usuario: 'Téc. Carlos Iluminação',
        acao: 'Peça solicitada ao almoxarifado',
        observacao: 'Lâmpada LED 150W - prazo 24h'
      }
    ]
  },
  {
    id: 'ser002',
    protocolo: 'SER-2025-0002',
    solicitante: {
      nome: 'Maria Santos Oliveira',
      cpf: '987.654.321-00',
      email: 'maria.santos@email.com',
      telefone: '(11) 88888-8888',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Limpeza de Terreno Público',
    categoria: 'limpeza',
    prioridade: 'media',
    status: 'concluido',
    responsavel: {
      nome: 'Coord. Ana Limpeza',
      cargo: 'Coordenadora de Limpeza Urbana',
      setor: 'Secretaria de Limpeza Urbana'
    },
    dataAbertura: '2025-01-12T14:20:00Z',
    dataPrevista: '2025-01-19T17:00:00Z',
    descricao: 'Terreno público com acúmulo de lixo, mato alto e entulho, causando mau cheiro e proliferação de insetos',
    localizacao: {
      endereco: 'Av. Central, 456 - terreno baldio ao lado do mercado',
      bairro: 'Vila Nova',
      cep: '12345-456',
      coordenadas: {
        lat: -23.5520,
        lng: -46.6350
      }
    },
    dadosEspecificos: {
      tipoServico: 'Limpeza Urbana',
      tipoTerreno: 'Terreno público municipal',
      areaAproximada: '500m²',
      tipoResiduo: ['Lixo doméstico', 'Entulho', 'Vegetação'],
      volumeEstimado: '15 m³',
      equipamentosUtilizados: ['Caminhão coletor', 'Roçadeira', 'Ferramentas manuais'],
      equipeExecutora: 'Equipe Limpeza Setor Sul',
      numeroFuncionarios: 6,
      tempoExecucao: '1 dia completo',
      destinacaoResiduos: 'Aterro sanitário municipal',
      medidasPreventivas: 'Cercação provisória instalada',
      resultadoServico: 'Terreno completamente limpo e cerca instalada',
      custoPrevisto: 'R$ 1.200,00'
    },
    anexos: [
      {
        nome: 'fotos-antes-limpeza.jpg',
        url: '/anexos/fotos-antes-limpeza.jpg',
        tipo: 'image/jpeg'
      },
      {
        nome: 'fotos-depois-limpeza.jpg',
        url: '/anexos/fotos-depois-limpeza.jpg',
        tipo: 'image/jpeg'
      }
    ],
    historico: [
      {
        data: '2025-01-12T14:20:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação recebida'
      },
      {
        data: '2025-01-13T09:00:00Z',
        usuario: 'Coord. Ana Limpeza',
        acao: 'Vistoria técnica realizada'
      },
      {
        data: '2025-01-15T07:00:00Z',
        usuario: 'Coord. Ana Limpeza',
        acao: 'Serviço iniciado',
        observacao: 'Equipe de 6 funcionários mobilizada'
      },
      {
        data: '2025-01-15T17:00:00Z',
        usuario: 'Coord. Ana Limpeza',
        acao: 'Serviço concluído',
        observacao: 'Terreno limpo e cerca provisória instalada'
      }
    ]
  },
  {
    id: 'ser003',
    protocolo: 'SER-2025-0003',
    solicitante: {
      nome: 'Associação de Moradores Jardim das Flores',
      email: 'contato@amjf.org.br',
      telefone: '(11) 77777-7777',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Coleta Especial de Entulho',
    categoria: 'coleta',
    prioridade: 'media',
    status: 'novo',
    dataAbertura: '2025-01-18T16:00:00Z',
    dataPrevista: '2025-01-25T17:00:00Z',
    descricao: 'Solicitação de coleta especial de entulho acumulado em vários pontos do bairro após reforma de praça',
    localizacao: {
      endereco: 'Praça das Flores - diversos pontos',
      bairro: 'Jardim das Flores',
      cep: '12345-789'
    },
    dadosEspecificos: {
      tipoServico: 'Coleta Especial',
      tipoMaterial: 'Entulho de construção civil',
      origem: 'Reforma da praça municipal',
      pontoColeta: ['Entrada da praça', 'Lateral esquerda', 'Fundo da praça'],
      volumeEstimado: '25 m³',
      tipoEntulho: ['Concreto', 'Tijolos', 'Material cerâmico'],
      equipamentoNecessario: 'Caminhão baúl com carregadeira',
      agendamentoPreferido: 'Horário comercial',
      contatoLocal: 'Síndico da Associação',
      observacoesSolicitante: 'Material já separado e organizado',
      destinacao: 'Bota-fora licenciado',
      urgencia: 'Normal - sem pressão de prazo'
    },
    anexos: [
      {
        nome: 'fotos-entulho-praca.jpg',
        url: '/anexos/fotos-entulho-praca.jpg',
        tipo: 'image/jpeg'
      }
    ],
    historico: [
      {
        data: '2025-01-18T16:00:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação registrada',
        observacao: 'Aguardando triagem e agendamento'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 298,
  novos: 32,
  emAndamento: 56,
  concluidos: 189,
  tempoMedioAtendimento: 4.8,
  satisfacaoMedia: 4.5,
  porStatus: {
    novo: 32,
    triagem: 21,
    em_andamento: 56,
    aguardando: 0,
    concluido: 189,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 123,
    media: 134,
    alta: 35,
    urgente: 6
  },
  porCategoria: {
    iluminacao: 89,
    limpeza: 78,
    coleta: 56,
    manutencao: 43,
    outros: 32
  }
};

export default function ServicosPublicosAtendimentos() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosServicosPublicos);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES["servicos-publicos"];

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
        <Lightbulb className="h-4 w-4 mr-2" />
        Iluminação
      </Button>
      <Button variant="outline">
        <Truck className="h-4 w-4 mr-2" />
        Limpeza Urbana
      </Button>
      <Button variant="outline">
        <Wrench className="h-4 w-4 mr-2" />
        Manutenção
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="servicos-publicos"
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
