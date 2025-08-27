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
import { Trophy, Users, Calendar, MapPin, Award, Target } from 'lucide-react';

// Mock data para demonstração - baseado nos dados originais mas adaptado para o padrão PDV
const mockAtendimentosEsportes: PDVAtendimento[] = [
  {
    id: 'esp001',
    protocolo: 'ESP-2025-0001',
    solicitante: {
      nome: 'João Silva',
      cpf: '123.456.789-00',
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Inscrição de Atleta',
    categoria: 'atletas',
    prioridade: 'media',
    status: 'em_andamento',
    responsavel: {
      nome: 'Carlos Esporte',
      cargo: 'Coordenador de Atletas',
      setor: 'Registro de Atletas'
    },
    dataAbertura: '2025-01-15T08:00:00Z',
    dataPrevista: '2025-01-18T17:00:00Z',
    descricao: 'Inscrição para registro como atleta federado na modalidade futebol',
    dadosEspecificos: {
      modalidade: 'Futebol',
      categoria: 'Adulto',
      posicao: 'Atacante',
      experienciaAnterior: true,
      clubeAnterior: 'FC Unidos',
      tempoExperiencia: '5 anos',
      objetivos: 'Participar de competições municipais',
      disponibilidade: 'Manhã e tarde',
      lesaoHistorico: false
    },
    anexos: [
      {
        nome: 'atestado-medico.pdf',
        url: '/anexos/atestado-medico.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'fotos-atleta.jpg',
        url: '/anexos/fotos-atleta.jpg',
        tipo: 'image/jpeg'
      }
    ],
    historico: [
      {
        data: '2025-01-15T08:00:00Z',
        usuario: 'Sistema',
        acao: 'Inscrição realizada'
      },
      {
        data: '2025-01-15T14:30:00Z',
        usuario: 'Carlos Esporte',
        acao: 'Análise de documentos iniciada'
      }
    ]
  },
  {
    id: 'esp002',
    protocolo: 'ESP-2025-0002',
    solicitante: {
      nome: 'Maria Oliveira',
      cpf: '987.654.321-00',
      email: 'maria.oliveira@email.com',
      telefone: '(11) 88888-8888',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Inscrição em Escolinha',
    categoria: 'escolinhas',
    prioridade: 'baixa',
    status: 'novo',
    dataAbertura: '2025-01-18T09:30:00Z',
    dataPrevista: '2025-01-20T17:00:00Z',
    descricao: 'Inscrição da filha em escolinha de natação infantil',
    dadosEspecificos: {
      modalidade: 'Natação',
      categoria: 'Infantil',
      idade: 8,
      nomeResponsavel: 'Maria Oliveira',
      parentesco: 'Mãe',
      experienciaAnterior: false,
      objetivos: 'Aprender a nadar e socializar',
      disponibilidade: 'Terças e quintas - tarde',
      necessidadesEspeciais: false,
      autorizacaoImagem: true
    },
    anexos: [
      {
        nome: 'autorizacao-responsavel.pdf',
        url: '/anexos/autorizacao-responsavel.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-18T09:30:00Z',
        usuario: 'Sistema',
        acao: 'Inscrição recebida',
        observacao: 'Aguardando análise de vaga disponível'
      }
    ]
  },
  {
    id: 'esp003',
    protocolo: 'ESP-2025-0003',
    solicitante: {
      nome: 'Clube Esportivo União',
      email: 'contato@clubeuniao.com.br',
      telefone: '(11) 77777-7777',
      tipo: 'externo'
    },
    tipoSolicitacao: 'Inscrição de Equipe',
    categoria: 'equipes',
    prioridade: 'alta',
    status: 'triagem',
    responsavel: {
      nome: 'Ana Equipes',
      cargo: 'Coordenadora de Equipes',
      setor: 'Registro de Equipes'
    },
    dataAbertura: '2025-01-17T15:20:00Z',
    dataPrevista: '2025-01-22T17:00:00Z',
    descricao: 'Inscrição de equipe de basquete para participar do campeonato municipal',
    dadosEspecificos: {
      modalidade: 'Basquete',
      categoria: 'Adulto',
      nomeEquipe: 'União Basquete',
      numeroAtletas: 12,
      tecnicoResponsavel: 'Pedro Santos',
      registroTecnico: 'CBB-12345',
      historicoEquipe: 'Participou dos últimos 3 campeonatos municipais',
      objetivos: 'Conquistar o título municipal 2025'
    },
    anexos: [
      {
        nome: 'lista-atletas.pdf',
        url: '/anexos/lista-atletas.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'estatuto-clube.pdf',
        url: '/anexos/estatuto-clube.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-17T15:20:00Z',
        usuario: 'Sistema',
        acao: 'Inscrição de equipe recebida'
      },
      {
        data: '2025-01-18T08:00:00Z',
        usuario: 'Ana Equipes',
        acao: 'Verificação de documentação iniciada'
      }
    ]
  },
  {
    id: 'esp004',
    protocolo: 'ESP-2025-0004',
    solicitante: {
      nome: 'Associação de Bairro Central',
      email: 'associacao@bairrocentral.org',
      telefone: '(11) 66666-6666',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Reserva de Espaço Esportivo',
    categoria: 'espacos',
    prioridade: 'media',
    status: 'aguardando',
    responsavel: {
      nome: 'Roberto Espaços',
      cargo: 'Gestor de Equipamentos',
      setor: 'Equipamentos Esportivos'
    },
    dataAbertura: '2025-01-16T11:00:00Z',
    dataPrevista: '2025-01-19T17:00:00Z',
    descricao: 'Reserva do ginásio municipal para torneio de vôlei comunitário',
    localizacao: {
      endereco: 'Ginásio Municipal Central',
      bairro: 'Centro',
      cep: '12345-000'
    },
    dadosEspecificos: {
      espacoSolicitado: 'Ginásio Municipal Central',
      modalidade: 'Vôlei',
      dataEvento: '2025-02-15',
      horaInicio: '08:00',
      horaFim: '18:00',
      numeroParticipantes: 80,
      tipoEvento: 'Torneio comunitário',
      equipamentosNecessarios: ['Rede de vôlei', 'Bolas', 'Placar'],
      responsavelEvento: 'Marina Santos',
      seguroEvento: true
    },
    historico: [
      {
        data: '2025-01-16T11:00:00Z',
        usuario: 'Sistema',
        acao: 'Reserva solicitada'
      },
      {
        data: '2025-01-17T09:00:00Z',
        usuario: 'Roberto Espaços',
        acao: 'Verificação de disponibilidade iniciada'
      }
    ]
  },
  {
    id: 'esp005',
    protocolo: 'ESP-2025-0005',
    solicitante: {
      nome: 'Festival Esportivo Ltda',
      email: 'contato@festivalesportivo.com.br',
      telefone: '(11) 55555-5555',
      tipo: 'externo'
    },
    tipoSolicitacao: 'Organização de Evento',
    categoria: 'eventos',
    prioridade: 'alta',
    status: 'em_andamento',
    responsavel: {
      nome: 'Lucas Eventos',
      cargo: 'Coordenador de Eventos',
      setor: 'Eventos Esportivos'
    },
    dataAbertura: '2025-01-14T13:45:00Z',
    dataPrevista: '2025-01-29T17:00:00Z',
    descricao: 'Organização da Corrida de Rua Municipal 2025',
    localizacao: {
      endereco: 'Praça Central - circuito urbano',
      bairro: 'Centro',
      cep: '12345-000',
      coordenadas: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    dadosEspecificos: {
      nomeEvento: 'Corrida de Rua Municipal 2025',
      modalidade: 'Atletismo',
      dataEvento: '2025-03-15',
      horaInicio: '07:00',
      distancias: ['5km', '10km', '21km'],
      participantesEsperados: 2000,
      percurso: 'Centro histórico da cidade',
      apoioMedico: true,
      hidratacao: true,
      premiacao: 'Troféus e medalhas para os 3 primeiros de cada categoria',
      inscricoes: 'Online e presencial'
    },
    anexos: [
      {
        nome: 'projeto-corrida.pdf',
        url: '/anexos/projeto-corrida.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'mapa-percurso.jpg',
        url: '/anexos/mapa-percurso.jpg',
        tipo: 'image/jpeg'
      }
    ],
    historico: [
      {
        data: '2025-01-14T13:45:00Z',
        usuario: 'Sistema',
        acao: 'Projeto de evento recebido'
      },
      {
        data: '2025-01-15T08:30:00Z',
        usuario: 'Lucas Eventos',
        acao: 'Análise de viabilidade iniciada'
      },
      {
        data: '2025-01-17T14:00:00Z',
        usuario: 'Lucas Eventos',
        acao: 'Aprovação prévia concedida',
        observacao: 'Aguardando documentação de segurança'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 456,
  novos: 12,
  emAndamento: 34,
  concluidos: 398,
  tempoMedioAtendimento: 4.8,
  satisfacaoMedia: 4.5,
  porStatus: {
    novo: 12,
    triagem: 8,
    em_andamento: 34,
    aguardando: 4,
    concluido: 398,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 234,
    media: 167,
    alta: 45,
    urgente: 10
  },
  porCategoria: {
    equipes: 89,
    atletas: 156,
    competicoes: 67,
    escolinhas: 98,
    espacos: 34,
    eventos: 12
  }
};

export default function AtendimentosEsportes() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosEsportes);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES.esportes;

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
        Competições Ativas
      </Button>
      <Button variant="outline">
        <MapPin className="h-4 w-4 mr-2" />
        Equipamentos Esportivos
      </Button>
      <Button variant="outline">
        <Award className="h-4 w-4 mr-2" />
        Ranking de Atletas
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="esportes"
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