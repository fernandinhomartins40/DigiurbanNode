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
import { Home, FileText, Users, MapPin, Building, ClipboardList } from 'lucide-react';

// Mock data para demonstração - baseado nos dados originais mas adaptado para o padrão PDV
const mockAtendimentosHabitacao: PDVAtendimento[] = [
  {
    id: 'hab001',
    protocolo: 'HAB-2025-0001',
    solicitante: {
      nome: 'Maria Silva Santos',
      cpf: '123.456.789-00',
      email: 'maria.silva@email.com',
      telefone: '(11) 99999-9999',
      endereco: 'Rua das Flores, 123',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Inscrição em Programa',
    categoria: 'inscricao',
    prioridade: 'media',
    status: 'em_andamento',
    responsavel: {
      nome: 'João Santos',
      cargo: 'Analista Habitacional',
      setor: 'Programas Habitacionais'
    },
    dataAbertura: '2025-01-15T08:00:00Z',
    dataPrevista: '2025-01-22T17:00:00Z',
    descricao: 'Solicitação de inscrição no programa habitacional Minha Casa Minha Vida',
    localizacao: {
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cep: '12345-678'
    },
    dadosEspecificos: {
      programaHabitacional: 'Minha Casa Minha Vida',
      rendaFamiliar: 2500.00,
      numeroFamiliares: 4,
      possuiCasa: false,
      primeiraHabitacao: true,
      deficienciaFamilia: false,
      idadeChefeFamilia: 35,
      situacaoAtual: 'Aluguel'
    },
    anexos: [
      {
        nome: 'cpf.pdf',
        url: '/anexos/cpf.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'comprovante_renda.pdf',
        url: '/anexos/comprovante_renda.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'comprovante_residencia.pdf',
        url: '/anexos/comprovante_residencia.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-15T08:00:00Z',
        usuario: 'Sistema',
        acao: 'Inscrição realizada',
        observacao: 'Documentação recebida via portal'
      },
      {
        data: '2025-01-16T09:00:00Z',
        usuario: 'João Santos',
        acao: 'Análise de documentos iniciada',
        observacao: 'Verificando documentação completa'
      }
    ]
  },
  {
    id: 'hab002',
    protocolo: 'HAB-2025-0002',
    solicitante: {
      nome: 'Carlos Oliveira',
      cpf: '987.654.321-00',
      email: 'carlos.oliveira@email.com',
      telefone: '(11) 88888-8888',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Solicitação de Informação',
    categoria: 'informacao',
    prioridade: 'baixa',
    status: 'concluido',
    responsavel: {
      nome: 'Ana Costa',
      cargo: 'Atendente de Habitação',
      setor: 'Atendimento ao Público'
    },
    dataAbertura: '2025-01-10T14:30:00Z',
    dataPrevista: '2025-01-12T17:00:00Z',
    dataConclusao: '2025-01-12T15:45:00Z',
    descricao: 'Informações sobre processo de regularização fundiária no bairro Vila Nova',
    dadosEspecificos: {
      tipoInformacao: 'Regularização Fundiária',
      bairroInteresse: 'Vila Nova',
      finalidadeInformacao: 'Interesse pessoal',
      possuiImovel: true,
      tipoImovel: 'Casa',
      tempoOcupacao: '15 anos'
    },
    historico: [
      {
        data: '2025-01-10T14:30:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação recebida'
      },
      {
        data: '2025-01-11T09:00:00Z',
        usuario: 'Ana Costa',
        acao: 'Informações coletadas'
      },
      {
        data: '2025-01-12T15:45:00Z',
        usuario: 'Ana Costa',
        acao: 'Informações fornecidas',
        observacao: 'Orientado sobre documentação necessária para regularização'
      }
    ]
  },
  {
    id: 'hab003',
    protocolo: 'HAB-2025-0003',
    solicitante: {
      nome: 'Rita Fernandes',
      cpf: '456.789.123-00',
      email: 'rita.fernandes@email.com',
      telefone: '(11) 77777-7777',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Regularização Fundiária',
    categoria: 'regularizacao',
    prioridade: 'alta',
    status: 'novo',
    dataAbertura: '2025-01-18T10:00:00Z',
    dataPrevista: '2025-02-17T17:00:00Z',
    descricao: 'Solicitação de regularização fundiária para imóvel ocupado há 20 anos',
    localizacao: {
      endereco: 'Rua São João, 456',
      bairro: 'Vila Nova',
      cep: '12345-900',
      coordenadas: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    dadosEspecificos: {
      tempoOcupacao: '20 anos',
      tipoOcupacao: 'Própria',
      possuiDocumentacao: 'Parcial',
      valorImovel: 150000.00,
      areaTerrenoM2: 250,
      areaEdificadaM2: 80,
      condicaoImovel: 'Habitável',
      vizinhosRegularizados: true
    },
    anexos: [
      {
        nome: 'planta-imovel.pdf',
        url: '/anexos/planta-imovel.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'fotos-imovel.zip',
        url: '/anexos/fotos-imovel.zip',
        tipo: 'application/zip'
      }
    ],
    historico: [
      {
        data: '2025-01-18T10:00:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação registrada',
        observacao: 'Aguardando distribuição para análise técnica'
      }
    ]
  },
  {
    id: 'hab004',
    protocolo: 'HAB-2025-0004',
    solicitante: {
      nome: 'Pedro Almeida',
      cpf: '789.123.456-00',
      email: 'pedro.almeida@email.com',
      telefone: '(11) 66666-6666',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Solicitação de Vistoria',
    categoria: 'vistoria',
    prioridade: 'media',
    status: 'aguardando',
    responsavel: {
      nome: 'Carlos Técnico',
      cargo: 'Engenheiro Civil',
      setor: 'Vistoria Técnica'
    },
    dataAbertura: '2025-01-16T11:30:00Z',
    dataPrevista: '2025-01-26T17:00:00Z',
    descricao: 'Solicitação de vistoria técnica para unidade habitacional recebida',
    localizacao: {
      endereco: 'Conjunto Habitacional Esperança, Bloco B, Apt 203',
      bairro: 'Esperança',
      cep: '12345-400'
    },
    dadosEspecificos: {
      tipoVistoria: 'Entrega de unidade',
      conjuntoHabitacional: 'Esperança',
      bloco: 'B',
      apartamento: '203',
      dataEntregaPrevista: '2025-01-30',
      areaPrivativa: 42.5,
      numeroQuartos: 2,
      vagaGaragem: false
    },
    historico: [
      {
        data: '2025-01-16T11:30:00Z',
        usuario: 'Sistema',
        acao: 'Vistoria solicitada'
      },
      {
        data: '2025-01-17T08:00:00Z',
        usuario: 'Carlos Técnico',
        acao: 'Agendamento em análise',
        observacao: 'Verificando disponibilidade para próxima semana'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 1247,
  novos: 23,
  emAndamento: 89,
  concluidos: 1098,
  tempoMedioAtendimento: 12.5,
  satisfacaoMedia: 4.2,
  porStatus: {
    novo: 23,
    triagem: 15,
    em_andamento: 89,
    aguardando: 37,
    concluido: 1098,
    cancelado: 8
  },
  porPrioridade: {
    baixa: 456,
    media: 567,
    alta: 189,
    urgente: 35
  },
  porCategoria: {
    inscricao: 589,
    informacao: 234,
    recurso: 156,
    regularizacao: 178,
    vistoria: 67,
    reclamacao: 23
  }
};

export default function AtendimentosHabitacao() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosHabitacao);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES.habitacao;

  const handleNovoAtendimento = (dadosAtendimento: Partial<PDVAtendimento>) => {
    console.log('Novo atendimento:', dadosAtendimento);
    // Implementar criação de novo atendimento
  };

  const handleAtualizarAtendimento = (id: string, dados: Partial<PDVAtendimento>) => {
    setAtendimentos(prev => 
      prev.map(atendimento => 
        atendimento.id === id 
          ? { ...atendimento, ...dados }
          : atendimento
      )
    );
  };

  const handleFiltrar = (novosFiltros: PDVFiltros) => {
    setFiltros(novosFiltros);
    // Implementar lógica de filtros
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

      <Select
        value={filtros.tipoSolicitacao?.[0] || 'todos'}
        onValueChange={(value) => {
          const novosFiltros = { 
            ...filtros, 
            tipoSolicitacao: value === 'todos' ? [] : [value] 
          };
          setFiltros(novosFiltros);
          handleFiltrar(novosFiltros);
        }}
      >
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Tipo de Solicitação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os Tipos</SelectItem>
          {configuracao.tiposAtendimento.map(tipo => (
            <SelectItem key={tipo.id} value={tipo.nome}>
              {tipo.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  const acoesCustomizadas = (
    <>
      <Button variant="outline">
        <Building className="h-4 w-4 mr-2" />
        Programas Ativos
      </Button>
      <Button variant="outline">
        <MapPin className="h-4 w-4 mr-2" />
        Mapa de Unidades
      </Button>
      <Button variant="outline">
        <ClipboardList className="h-4 w-4 mr-2" />
        Lista de Espera
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="habitacao"
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