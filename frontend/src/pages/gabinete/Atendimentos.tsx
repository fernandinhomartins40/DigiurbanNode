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
import { Briefcase, Users, FileText, Calendar, Bell, MapPin } from 'lucide-react';

// Mock data para demonstração - baseado nos dados originais mas adaptado para o padrão PDV
const mockAtendimentosGabinete: PDVAtendimento[] = [
  {
    id: 'gab001',
    protocolo: 'GAB-2025-0001',
    solicitante: {
      nome: 'Maria Silva',
      cpf: '123.456.789-00',
      email: 'maria.silva@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Solicitação de Audiência',
    categoria: 'audiencia',
    prioridade: 'media',
    status: 'novo',
    responsavel: {
      nome: 'João Oliveira',
      cargo: 'Assessor de Gabinete',
      setor: 'Gabinete do Prefeito'
    },
    dataAbertura: '2025-01-18T08:00:00Z',
    dataPrevista: '2025-01-25T17:00:00Z',
    descricao: 'Solicitação de audiência com o prefeito para discussão sobre melhorias no bairro Centro',
    dadosEspecificos: {
      motivoAudiencia: 'Discussão sobre melhorias urbanas',
      representaEntidade: false,
      numeroParticipantes: 1,
      tempoEstimado: '30 minutos',
      assuntoDetalhado: 'Solicitação de semáforo na Rua Principal'
    },
    historico: [
      {
        data: '2025-01-18T08:00:00Z',
        usuario: 'Sistema',
        acao: 'Atendimento criado',
        observacao: 'Solicitação recebida via portal do cidadão'
      }
    ]
  },
  {
    id: 'gab002',
    protocolo: 'GAB-2025-0002',
    solicitante: {
      nome: 'Carlos Mendes',
      cpf: '987.654.321-00',
      email: 'carlos.mendes@email.com',
      telefone: '(11) 88888-8888',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Reclamação',
    categoria: 'reclamacao',
    prioridade: 'alta',
    status: 'em_andamento',
    responsavel: {
      nome: 'Fernanda Lima',
      cargo: 'Coordenadora de Atendimento',
      setor: 'Ouvidoria'
    },
    dataAbertura: '2025-01-17T09:30:00Z',
    dataPrevista: '2025-01-20T17:00:00Z',
    descricao: 'Reclamação sobre demora no atendimento em posto de saúde do bairro',
    localizacao: {
      endereco: 'Rua das Flores, 456',
      bairro: 'Vila Nova',
      cep: '12345-678'
    },
    dadosEspecificos: {
      unidadeReclamada: 'UBS Vila Nova',
      tipoReclamacao: 'Demora no atendimento',
      dataOcorrencia: '2025-01-15',
      horaOcorrencia: '14:30',
      funcionarioEnvolvido: 'Não informado',
      gravidade: 'alta'
    },
    anexos: [
      {
        nome: 'comprovante-agendamento.pdf',
        url: '/anexos/comprovante-agendamento.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-17T09:30:00Z',
        usuario: 'Sistema',
        acao: 'Atendimento criado'
      },
      {
        data: '2025-01-17T14:00:00Z',
        usuario: 'Fernanda Lima',
        acao: 'Análise iniciada',
        observacao: 'Encaminhado para Secretaria de Saúde'
      }
    ]
  },
  {
    id: 'gab003',
    protocolo: 'GAB-2025-0003',
    solicitante: {
      nome: 'Ana Pereira',
      cpf: '456.789.123-00',
      email: 'ana.pereira@email.com',
      telefone: '(11) 77777-7777',
      tipo: 'servidor'
    },
    tipoSolicitacao: 'Denúncia',
    categoria: 'denuncia',
    prioridade: 'urgente',
    status: 'concluido',
    responsavel: {
      nome: 'Roberto Santos',
      cargo: 'Controlador Interno',
      setor: 'Controladoria'
    },
    dataAbertura: '2025-01-15T07:45:00Z',
    dataPrevista: '2025-01-18T17:00:00Z',
    dataConclusao: '2025-01-17T16:30:00Z',
    descricao: 'Denúncia de irregularidades em processo licitatório',
    dadosEspecificos: {
      tipoDenuncia: 'Irregularidade administrativa',
      orgaoEnvolvido: 'Secretaria de Obras',
      processoNumero: 'PROC-2024-1234',
      valorEnvolvido: 'R$ 150.000,00',
      evidencias: 'Documentos anexados',
      anonima: false
    },
    anexos: [
      {
        nome: 'documentos-processo.pdf',
        url: '/anexos/documentos-processo.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'planilha-custos.xlsx',
        url: '/anexos/planilha-custos.xlsx',
        tipo: 'application/vnd.ms-excel'
      }
    ],
    historico: [
      {
        data: '2025-01-15T07:45:00Z',
        usuario: 'Ana Pereira',
        acao: 'Denúncia registrada'
      },
      {
        data: '2025-01-15T08:00:00Z',
        usuario: 'Roberto Santos',
        acao: 'Análise iniciada'
      },
      {
        data: '2025-01-17T16:30:00Z',
        usuario: 'Roberto Santos',
        acao: 'Investigação concluída',
        observacao: 'Irregularidades confirmadas. Processo encaminhado ao MP.'
      }
    ]
  },
  {
    id: 'gab004',
    protocolo: 'GAB-2025-0004',
    solicitante: {
      nome: 'Paulo Ribeiro',
      cpf: '321.654.987-00',
      email: 'paulo.ribeiro@email.com',
      telefone: '(11) 66666-6666',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Sugestão',
    categoria: 'sugestao',
    prioridade: 'baixa',
    status: 'triagem',
    responsavel: {
      nome: 'Carla Ferreira',
      cargo: 'Analista de Políticas Públicas',
      setor: 'Gabinete do Prefeito'
    },
    dataAbertura: '2025-01-14T10:15:00Z',
    dataPrevista: '2025-01-21T17:00:00Z',
    descricao: 'Sugestão para criação de programa de compostagem domiciliar',
    dadosEspecificos: {
      areaSugerida: 'Meio Ambiente',
      tipoSugestao: 'Programa público',
      impactoEstimado: 'Redução de resíduos orgânicos',
      custoEstimado: 'Baixo',
      prazoImplementacao: '6 meses',
      beneficiariosEstimados: '500 famílias'
    },
    historico: [
      {
        data: '2025-01-14T10:15:00Z',
        usuario: 'Sistema',
        acao: 'Sugestão recebida'
      },
      {
        data: '2025-01-15T09:00:00Z',
        usuario: 'Carla Ferreira',
        acao: 'Em análise de viabilidade'
      }
    ]
  },
  {
    id: 'gab005',
    protocolo: 'GAB-2025-0005',
    solicitante: {
      nome: 'Lucia Martins',
      cpf: '654.321.987-00',
      email: 'lucia.martins@email.com',
      telefone: '(11) 55555-5555',
      tipo: 'externo'
    },
    tipoSolicitacao: 'Solicitação de Informação',
    categoria: 'informacao',
    prioridade: 'media',
    status: 'em_andamento',
    responsavel: {
      nome: 'Ricardo Gomes',
      cargo: 'Assessor de Transparência',
      setor: 'Transparência'
    },
    dataAbertura: '2025-01-12T14:20:00Z',
    dataPrevista: '2025-01-19T17:00:00Z',
    descricao: 'Solicitação de informações sobre orçamento municipal 2025',
    dadosEspecificos: {
      tipoInformacao: 'Dados orçamentários',
      finalidade: 'Pesquisa acadêmica',
      instituicao: 'Universidade Federal',
      prazoNecessario: '30 dias',
      formatoPreferido: 'Planilha eletrônica',
      leiAccessoInformacao: true
    },
    historico: [
      {
        data: '2025-01-12T14:20:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação registrada'
      },
      {
        data: '2025-01-13T08:30:00Z',
        usuario: 'Ricardo Gomes',
        acao: 'Levantamento de dados iniciado'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 47,
  novos: 8,
  emAndamento: 12,
  concluidos: 25,
  tempoMedioAtendimento: 3.2,
  satisfacaoMedia: 4.7,
  porStatus: {
    novo: 8,
    triagem: 3,
    em_andamento: 12,
    aguardando: 2,
    concluido: 25,
    cancelado: 1
  },
  porPrioridade: {
    baixa: 18,
    media: 22,
    alta: 15,
    urgente: 4
  },
  porCategoria: {
    audiencia: 18,
    reclamacao: 12,
    sugestao: 8,
    denuncia: 5,
    informacao: 4
  }
};

export default function AtendimentosGabinete() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosGabinete);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES.gabinete;

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
        Agenda Executiva
      </Button>
      <Button variant="outline">
        <FileText className="h-4 w-4 mr-2" />
        Relatórios
      </Button>
      <Button variant="outline">
        <MapPin className="h-4 w-4 mr-2" />
        Mapa de Demandas
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="gabinete"
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