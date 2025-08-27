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
import { GraduationCap, School, Bus, UtensilsCrossed, Building, AlertTriangle } from 'lucide-react';

// Mock data para demonstração
const mockAtendimentosEducacao: PDVAtendimento[] = [
  {
    id: 'edu001',
    protocolo: 'EDU-2025-0001',
    solicitante: {
      nome: 'Maria Santos',
      cpf: '123.456.789-00',
      email: 'maria.santos@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Matrícula Escolar',
    categoria: 'matricula',
    prioridade: 'media',
    status: 'novo',
    dataAbertura: '2025-01-15T08:30:00Z',
    dataPrevista: '2025-01-20T17:00:00Z',
    descricao: 'Solicitação de matrícula para o ensino fundamental na Escola Municipal João XXIII',
    localizacao: {
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cep: '12345-678'
    },
    dadosEspecificos: {
      nomeAluno: 'João Santos',
      idadeAluno: 8,
      serieDesejada: '3º ano',
      escolaPreferencia: 'EM João XXIII',
      possuiNecessidadesEspeciais: false,
      temIrmaoNaEscola: false
    },
    historico: [
      {
        data: '2025-01-15T08:30:00Z',
        usuario: 'Sistema',
        acao: 'Atendimento criado',
        observacao: 'Solicitação recebida via portal do cidadão'
      }
    ]
  },
  {
    id: 'edu002',
    protocolo: 'EDU-2025-0002',
    solicitante: {
      nome: 'Carlos Silva',
      cpf: '987.654.321-00',
      email: 'carlos.silva@email.com',
      telefone: '(11) 88888-8888',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Transporte Escolar',
    categoria: 'transporte',
    prioridade: 'alta',
    status: 'em_andamento',
    responsavel: {
      nome: 'Ana Costa',
      cargo: 'Coordenadora de Transporte',
      setor: 'Transporte Escolar'
    },
    dataAbertura: '2025-01-12T09:15:00Z',
    dataPrevista: '2025-01-19T17:00:00Z',
    descricao: 'Solicitação de transporte escolar para a zona rural - Sítio São João',
    localizacao: {
      endereco: 'Sítio São João, s/n',
      bairro: 'Zona Rural',
      coordenadas: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    dadosEspecificos: {
      nomeAluno: 'Pedro Silva',
      idadeAluno: 12,
      escola: 'EM Rural Santa Maria',
      distanciaKm: 15,
      possuiNecessidadesEspeciais: false,
      turno: 'manhã'
    },
    historico: [
      {
        data: '2025-01-12T09:15:00Z',
        usuario: 'Sistema',
        acao: 'Atendimento criado'
      },
      {
        data: '2025-01-13T14:30:00Z',
        usuario: 'Ana Costa',
        acao: 'Análise iniciada',
        observacao: 'Verificando rota disponível'
      }
    ]
  },
  {
    id: 'edu003',
    protocolo: 'EDU-2025-0003',
    solicitante: {
      nome: 'Lucia Oliveira',
      cpf: '456.789.123-00',
      email: 'lucia.oliveira@email.com',
      telefone: '(11) 77777-7777',
      tipo: 'servidor'
    },
    tipoSolicitacao: 'Infraestrutura Escolar',
    categoria: 'infraestrutura',
    prioridade: 'urgente',
    status: 'concluido',
    responsavel: {
      nome: 'Roberto Santos',
      cargo: 'Diretor de Infraestrutura',
      setor: 'Manutenção Escolar'
    },
    dataAbertura: '2025-01-10T07:45:00Z',
    dataPrevista: '2025-01-15T17:00:00Z',
    dataConclusao: '2025-01-14T16:30:00Z',
    descricao: 'Vazamento no telhado da sala de aula 5 - EM Centro',
    localizacao: {
      endereco: 'Av. Principal, 456',
      bairro: 'Centro',
      cep: '12345-000'
    },
    dadosEspecificos: {
      escola: 'EM Centro',
      tipoProblema: 'Vazamento',
      localEspecifico: 'Sala de aula 5',
      gravidade: 'alta',
      alunosAfetados: 30
    },
    historico: [
      {
        data: '2025-01-10T07:45:00Z',
        usuario: 'Lucia Oliveira',
        acao: 'Atendimento criado'
      },
      {
        data: '2025-01-10T08:00:00Z',
        usuario: 'Roberto Santos',
        acao: 'Atendimento atribuído'
      },
      {
        data: '2025-01-14T16:30:00Z',
        usuario: 'Roberto Santos',
        acao: 'Atendimento concluído',
        observacao: 'Reparo realizado com sucesso'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 156,
  novos: 12,
  emAndamento: 34,
  concluidos: 98,
  tempoMedioAtendimento: 5.2,
  satisfacaoMedia: 4.3,
  porStatus: {
    novo: 12,
    triagem: 8,
    em_andamento: 34,
    aguardando: 4,
    concluido: 98,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 45,
    media: 78,
    alta: 28,
    urgente: 5
  },
  porCategoria: {
    matricula: 67,
    transporte: 32,
    merenda: 18,
    infraestrutura: 24,
    ocorrencia: 15
  }
};

export default function AtendimentosEducacao() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosEducacao);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES.educacao;

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
        <SelectTrigger className="w-[200px]">
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
        <School className="h-4 w-4 mr-2" />
        Relatório Escolar
      </Button>
      <Button variant="outline">
        <Bus className="h-4 w-4 mr-2" />
        Mapa de Transporte
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="educacao"
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