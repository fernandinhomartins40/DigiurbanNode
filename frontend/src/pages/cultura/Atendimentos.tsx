import React, { useState, useEffect } from 'react';
import { PDVAtendimentoBase } from '@/components/pdv/PDVAtendimentoBase';
import { 
  PDVAtendimento, 
  PDVFiltros, 
  PDVEstatisticas, 
  PDV_CONFIGURACOES 
} from '@/types/pdv-types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Calendar, Users, MapPin, FileText, Award } from 'lucide-react';

// Mock data para demonstração
const mockAtendimentosCultura: PDVAtendimento[] = [
  {
    id: 'cul001',
    protocolo: 'CUL-2025-0001',
    solicitante: {
      nome: 'Festival de Inverno Ltda',
      email: 'contato@festivalinverno.com.br',
      telefone: '(11) 99999-1111',
      tipo: 'externo'
    },
    tipoSolicitacao: 'Autorização de Evento',
    categoria: 'evento',
    prioridade: 'alta',
    status: 'triagem',
    responsavel: {
      nome: 'Marisa Cultural',
      cargo: 'Coordenadora de Eventos',
      setor: 'Eventos Culturais'
    },
    dataAbertura: '2025-01-14T10:00:00Z',
    dataPrevista: '2025-01-24T17:00:00Z',
    descricao: 'Solicitação de autorização para realização do Festival de Inverno 2025 na Praça Central',
    localizacao: {
      endereco: 'Praça Central, s/n',
      bairro: 'Centro',
      coordenadas: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    dadosEspecificos: {
      nomeEvento: 'Festival de Inverno 2025',
      dataEvento: '2025-07-15',
      horaInicio: '14:00',
      horaFim: '22:00',
      publicoEstimado: 5000,
      tipoEvento: 'Musical',
      contrapartidaSocial: 'Oficinas gratuitas de música',
      equipamentosNecessarios: ['Palco', 'Som', 'Iluminação'],
      segurancaNecessaria: true
    },
    anexos: [
      {
        nome: 'projeto-festival.pdf',
        url: '/anexos/projeto-festival.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'planta-evento.jpg',
        url: '/anexos/planta-evento.jpg',
        tipo: 'image/jpeg'
      }
    ],
    historico: [
      {
        data: '2025-01-14T10:00:00Z',
        usuario: 'Sistema',
        acao: 'Atendimento criado'
      },
      {
        data: '2025-01-14T14:30:00Z',
        usuario: 'Marisa Cultural',
        acao: 'Análise iniciada',
        observacao: 'Verificando disponibilidade da praça e documentação'
      }
    ]
  },
  {
    id: 'cul002',
    protocolo: 'CUL-2025-0002',
    solicitante: {
      nome: 'João Artista',
      cpf: '123.456.789-00',
      email: 'joao.artista@email.com',
      telefone: '(11) 88888-2222',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Reserva de Espaço Cultural',
    categoria: 'espaco',
    prioridade: 'media',
    status: 'em_andamento',
    responsavel: {
      nome: 'Carlos Espaços',
      cargo: 'Gestor de Espaços',
      setor: 'Equipamentos Culturais'
    },
    dataAbertura: '2025-01-13T09:30:00Z',
    dataPrevista: '2025-01-18T17:00:00Z',
    descricao: 'Reserva do Teatro Municipal para exposição de arte contemporânea',
    dadosEspecificos: {
      espacoSolicitado: 'Teatro Municipal',
      dataReserva: '2025-02-20',
      periodoReserva: 'Uma semana',
      tipoUso: 'Exposição de Arte',
      numeroVisitantesEsperados: 200,
      necessitaEquipamentos: true,
      equipamentos: ['Iluminação especial', 'Suportes para quadros'],
      contrapartida: 'Visitas guiadas gratuitas'
    },
    historico: [
      {
        data: '2025-01-13T09:30:00Z',
        usuario: 'Sistema',
        acao: 'Atendimento criado'
      },
      {
        data: '2025-01-13T15:00:00Z',
        usuario: 'Carlos Espaços',
        acao: 'Análise de disponibilidade iniciada'
      }
    ]
  },
  {
    id: 'cul003',
    protocolo: 'CUL-2025-0003',
    solicitante: {
      nome: 'Grupo Folclórico Tradição',
      email: 'tradicao@grupo.com.br',
      telefone: '(11) 77777-3333',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Cadastro de Grupo Artístico',
    categoria: 'grupo',
    prioridade: 'baixa',
    status: 'concluido',
    responsavel: {
      nome: 'Ana Cadastros',
      cargo: 'Analista Cultural',
      setor: 'Registro de Artistas'
    },
    dataAbertura: '2025-01-08T11:15:00Z',
    dataPrevista: '2025-01-15T17:00:00Z',
    dataConclusao: '2025-01-12T16:45:00Z',
    descricao: 'Cadastro oficial do grupo folclórico no sistema municipal de cultura',
    dadosEspecificos: {
      nomeGrupo: 'Grupo Folclórico Tradição',
      tipoGrupo: 'Folclore',
      numeroIntegrantes: 15,
      tempoAtuacao: '8 anos',
      representanteLegal: 'Maria Tradição',
      especialidade: 'Danças folclóricas brasileiras',
      necessitaApoio: true,
      tipoApoio: 'Figurinos e instrumentos'
    },
    anexos: [
      {
        nome: 'estatuto-grupo.pdf',
        url: '/anexos/estatuto-grupo.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'fotos-apresentacoes.zip',
        url: '/anexos/fotos-apresentacoes.zip',
        tipo: 'application/zip'
      }
    ],
    historico: [
      {
        data: '2025-01-08T11:15:00Z',
        usuario: 'Sistema',
        acao: 'Atendimento criado'
      },
      {
        data: '2025-01-09T09:00:00Z',
        usuario: 'Ana Cadastros',
        acao: 'Documentação analisada'
      },
      {
        data: '2025-01-12T16:45:00Z',
        usuario: 'Ana Cadastros',
        acao: 'Cadastro aprovado e concluído'
      }
    ]
  },
  {
    id: 'cul004',
    protocolo: 'CUL-2025-0004',
    solicitante: {
      nome: 'Maria Oficineira',
      cpf: '987.654.321-00',
      email: 'maria.oficinas@email.com',
      telefone: '(11) 66666-4444',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Inscrição em Oficina',
    categoria: 'oficina',
    prioridade: 'media',
    status: 'novo',
    dataAbertura: '2025-01-15T16:20:00Z',
    dataPrevista: '2025-01-20T17:00:00Z',
    descricao: 'Inscrição na oficina de cerâmica artística para iniciantes',
    dadosEspecificos: {
      oficinaEscolhida: 'Cerâmica Artística - Iniciantes',
      motivoInteresse: 'Desenvolvimento pessoal e artístico',
      experienciaPrevia: 'Nenhuma',
      disponibilidade: 'Terças e quintas - tarde',
      necessidadesEspeciais: false,
      idade: 45,
      profissao: 'Professora'
    },
    historico: [
      {
        data: '2025-01-15T16:20:00Z',
        usuario: 'Sistema',
        acao: 'Inscrição realizada',
        observacao: 'Aguardando avaliação e confirmação de vaga'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 89,
  novos: 8,
  emAndamento: 23,
  concluidos: 52,
  tempoMedioAtendimento: 8.5,
  satisfacaoMedia: 4.6,
  porStatus: {
    novo: 8,
    triagem: 5,
    em_andamento: 23,
    aguardando: 1,
    concluido: 52,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 34,
    media: 38,
    alta: 15,
    urgente: 2
  },
  porCategoria: {
    evento: 25,
    espaco: 18,
    projeto: 12,
    grupo: 16,
    oficina: 13,
    patrimonio: 5
  }
};

export default function AtendimentosCultura() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosCultura);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES.cultura;

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
        <SelectTrigger className="w-[220px]">
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
        <Calendar className="h-4 w-4 mr-2" />
        Agenda Cultural
      </Button>
      <Button variant="outline">
        <MapPin className="h-4 w-4 mr-2" />
        Espaços Disponíveis
      </Button>
      <Button variant="outline">
        <Award className="h-4 w-4 mr-2" />
        Editais Ativos
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="cultura"
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