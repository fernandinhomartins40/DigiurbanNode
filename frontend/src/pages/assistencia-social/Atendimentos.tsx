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
import { Heart, Users, Shield, Home, HelpCircle, Calendar } from 'lucide-react';

const mockAtendimentosAssistenciaSocial: PDVAtendimento[] = [
  {
    id: 'ass001',
    protocolo: 'ASS-2025-0001',
    solicitante: {
      nome: 'Maria da Silva Santos',
      cpf: '123.456.789-00',
      email: 'maria.silva@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Auxílio Aluguel',
    categoria: 'beneficios',
    prioridade: 'alta',
    status: 'em_andamento',
    responsavel: {
      nome: 'Ana Paula Santos',
      cargo: 'Assistente Social',
      setor: 'CRAS Central'
    },
    dataAbertura: '2025-01-10T14:30:00Z',
    dataPrevista: '2025-01-25T17:00:00Z',
    descricao: 'Solicitação de auxílio aluguel devido à situação de vulnerabilidade socioeconômica da família',
    localizacao: {
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cep: '12345-000'
    },
    dadosEspecificos: {
      tipoFamilia: 'Monoparental',
      numeroMembros: 4,
      rendaFamiliar: 800.00,
      situacaoHabitacional: 'Aluguel em atraso',
      valorSolicitado: 600.00,
      tempoSituacao: '3 meses',
      beneficiosRecebidos: ['Bolsa Família'],
      encaminhamentosPrevios: ['Defensoria Pública'],
      documentosApresentados: ['RG', 'CPF', 'Comprovante de Residência', 'Boletos em atraso'],
      avaliacaoSocial: 'Família em situação de vulnerabilidade social com risco de despejo'
    },
    anexos: [
      {
        nome: 'comprovante-renda.pdf',
        url: '/anexos/comprovante-renda.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'boletos-aluguel.pdf',
        url: '/anexos/boletos-aluguel.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-10T14:30:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação registrada'
      },
      {
        data: '2025-01-12T09:00:00Z',
        usuario: 'Ana Paula Santos',
        acao: 'Visita domiciliar realizada',
        observacao: 'Confirmada situação de vulnerabilidade'
      },
      {
        data: '2025-01-15T14:00:00Z',
        usuario: 'Ana Paula Santos',
        acao: 'Avaliação socioeconômica concluída',
        observacao: 'Parecer favorável ao auxílio'
      }
    ]
  },
  {
    id: 'ass002',
    protocolo: 'ASS-2025-0002',
    solicitante: {
      nome: 'José Pereira dos Santos',
      cpf: '987.654.321-00',
      email: 'jose.pereira@email.com',
      telefone: '(11) 88888-8888',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Cesta Básica',
    categoria: 'alimentacao',
    prioridade: 'media',
    status: 'concluido',
    responsavel: {
      nome: 'Carlos Eduardo Mendes',
      cargo: 'Técnico em Assistência Social',
      setor: 'CRAS Norte'
    },
    dataAbertura: '2025-01-08T10:00:00Z',
    dataPrevista: '2025-01-15T17:00:00Z',
    descricao: 'Solicitação de cesta básica para família em situação de insegurança alimentar',
    dadosEspecificos: {
      tipoFamilia: 'Nuclear',
      numeroMembros: 5,
      rendaFamiliar: 600.00,
      situacaoAlimentar: 'Insegurança alimentar moderada',
      periodicidadeSolicitacao: 'Primeira vez',
      membrosVulneraveis: ['2 crianças menores de 5 anos', '1 idoso'],
      beneficiosRecebidos: [],
      motivoSolicitacao: 'Desemprego recente do chefe da família',
      avaliacaoNutricional: 'Necessária intervenção alimentar imediata'
    },
    anexos: [
      {
        nome: 'declaracao-desemprego.pdf',
        url: '/anexos/declaracao-desemprego.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-08T10:00:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação registrada'
      },
      {
        data: '2025-01-09T15:00:00Z',
        usuario: 'Carlos Eduardo Mendes',
        acao: 'Entrevista realizada'
      },
      {
        data: '2025-01-12T11:00:00Z',
        usuario: 'Carlos Eduardo Mendes',
        acao: 'Cesta básica entregue',
        observacao: 'Família orientada sobre programas sociais disponíveis'
      }
    ]
  },
  {
    id: 'ass003',
    protocolo: 'ASS-2025-0003',
    solicitante: {
      nome: 'Luiza Santos Oliveira',
      cpf: '789.123.456-00',
      email: 'luiza.santos@email.com',
      telefone: '(11) 77777-7777',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Violação de Direitos',
    categoria: 'protecao',
    prioridade: 'urgente',
    status: 'em_andamento',
    responsavel: {
      nome: 'Fernanda Oliveira Silva',
      cargo: 'Assistente Social Especializada',
      setor: 'CREAS'
    },
    dataAbertura: '2025-01-18T11:30:00Z',
    dataPrevista: '2025-01-20T17:00:00Z',
    descricao: 'Atendimento por situação de violência doméstica e acompanhamento familiar',
    dadosEspecificos: {
      tipoViolacao: 'Violência doméstica',
      tipoViolencia: ['Física', 'Psicológica'],
      situacaoRisco: 'Alto risco',
      medidaProtetiva: 'Em andamento',
      numeroFilhos: 2,
      idadeFilhos: ['8 anos', '12 anos'],
      situacaoHabitacional: 'Casa de parente temporariamente',
      rendaPropia: false,
      redeSocialFamiliar: 'Mãe e irmã como apoio',
      encaminhamentosRealizados: ['Delegacia da Mulher', 'Defensoria Pública', 'Casa Abrigo'],
      acompanhamentoPsicologico: true,
      planAcompanhamento: 'Fortalecimento de vínculos e autonomia'
    },
    anexos: [
      {
        nome: 'boletim-ocorrencia.pdf',
        url: '/anexos/boletim-ocorrencia.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'medida-protetiva.pdf',
        url: '/anexos/medida-protetiva.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-18T11:30:00Z',
        usuario: 'Sistema',
        acao: 'Situação reportada'
      },
      {
        data: '2025-01-18T14:00:00Z',
        usuario: 'Fernanda Oliveira Silva',
        acao: 'Atendimento de emergência realizado',
        observacao: 'Encaminhada para casa abrigo temporária'
      },
      {
        data: '2025-01-19T10:00:00Z',
        usuario: 'Fernanda Oliveira Silva',
        acao: 'Plano de acompanhamento elaborado',
        observacao: 'Definidas ações de fortalecimento familiar'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 312,
  novos: 24,
  emAndamento: 67,
  concluidos: 198,
  tempoMedioAtendimento: 8.5,
  satisfacaoMedia: 4.6,
  porStatus: {
    novo: 24,
    triagem: 23,
    em_andamento: 67,
    aguardando: 0,
    concluido: 198,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 89,
    media: 134,
    alta: 67,
    urgente: 22
  },
  porCategoria: {
    beneficios: 89,
    alimentacao: 67,
    protecao: 45,
    orientacao: 78,
    acompanhamento: 33
  }
};

export default function AtendimentosAssistenciaSocial() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosAssistenciaSocial);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES["assistencia-social"];

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
        <Users className="h-4 w-4 mr-2" />
        Famílias Cadastradas
      </Button>
      <Button variant="outline">
        <Shield className="h-4 w-4 mr-2" />
        Casos de Proteção
      </Button>
      <Button variant="outline">
        <Home className="h-4 w-4 mr-2" />
        Benefícios Ativos
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="assistencia-social"
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
