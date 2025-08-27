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
import { Construction, MapPin, Calendar, Wrench, HardHat, Truck } from 'lucide-react';

const mockAtendimentosObrasPublicas: PDVAtendimento[] = [
  {
    id: 'obr001',
    protocolo: 'OBR-2025-0001',
    solicitante: {
      nome: 'Carlos Silva Santos',
      cpf: '123.456.789-00',
      email: 'carlos.silva@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Solicitação de Pavimentação',
    categoria: 'solicitacoes',
    prioridade: 'alta',
    status: 'em_andamento',
    responsavel: {
      nome: 'João Construção',
      cargo: 'Engenheiro Civil',
      setor: 'Pavimentação e Infraestrutura'
    },
    dataAbertura: '2025-01-10T08:00:00Z',
    dataPrevista: '2025-03-15T17:00:00Z',
    descricao: 'Solicitação de pavimentação asfáltica da Rua das Palmeiras devido ao precário estado de conservação',
    localizacao: {
      endereco: 'Rua das Palmeiras, 456',
      bairro: 'Vila Nova',
      cep: '12345-678',
      coordenadas: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    dadosEspecificos: {
      tipoObra: 'Pavimentação',
      extensao: '850 metros',
      largura: '8 metros',
      tipoMaterial: 'Asfalto CBUQ',
      orcamentoEstimado: 450000.00,
      tempoEstimado: '60 dias',
      beneficiados: 320,
      impactoAmbiental: 'Baixo',
      necessitaDesapropriacao: false,
      licencaAmbiental: true,
      estudoViabilidade: true
    },
    anexos: [
      {
        nome: 'fotos-rua-atual.jpg',
        url: '/anexos/fotos-rua-atual.jpg',
        tipo: 'image/jpeg'
      },
      {
        nome: 'abaixo-assinado.pdf',
        url: '/anexos/abaixo-assinado.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-10T08:00:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação registrada'
      },
      {
        data: '2025-01-12T14:30:00Z',
        usuario: 'João Construção',
        acao: 'Vistoria técnica realizada',
        observacao: 'Confirmada necessidade de pavimentação'
      },
      {
        data: '2025-01-15T10:00:00Z',
        usuario: 'João Construção',
        acao: 'Projeto técnico aprovado',
        observacao: 'Obra incluída no cronograma 2025'
      }
    ]
  },
  {
    id: 'obr002',
    protocolo: 'OBR-2025-0002',
    solicitante: {
      nome: 'Associação de Moradores Vila Verde',
      email: 'contato@amvv.org.br',
      telefone: '(11) 88888-8888',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Construção de Praça',
    categoria: 'obras',
    prioridade: 'media',
    status: 'triagem',
    responsavel: {
      nome: 'Maria Urbanismo',
      cargo: 'Arquiteta Urbanista',
      setor: 'Planejamento Urbano'
    },
    dataAbertura: '2025-01-08T15:20:00Z',
    dataPrevista: '2025-08-30T17:00:00Z',
    descricao: 'Solicitação de construção de praça comunitária com playground e academia ao ar livre',
    localizacao: {
      endereco: 'Terreno baldio na Av. Verde, esquina com Rua das Flores',
      bairro: 'Vila Verde',
      cep: '12345-900',
      coordenadas: {
        lat: -23.5600,
        lng: -46.6400
      }
    },
    dadosEspecificos: {
      tipoObra: 'Construção de Praça',
      areaTotal: 2500,
      equipamentos: ['Playground infantil', 'Academia ao ar livre', 'Bancos', 'Iluminação LED', 'Paisagismo'],
      orcamentoEstimado: 180000.00,
      tempoEstimado: '120 dias',
      beneficiados: 850,
      acessibilidade: true,
      sustentabilidade: 'Materiais recicláveis e plantas nativas',
      manutencaoAnual: 12000.00
    },
    anexos: [
      {
        nome: 'projeto-praca.pdf',
        url: '/anexos/projeto-praca.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'ata-aprovacao-comunidade.pdf',
        url: '/anexos/ata-aprovacao-comunidade.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-08T15:20:00Z',
        usuario: 'Sistema',
        acao: 'Projeto recebido'
      },
      {
        data: '2025-01-10T09:00:00Z',
        usuario: 'Maria Urbanismo',
        acao: 'Análise de viabilidade iniciada'
      }
    ]
  },
  {
    id: 'obr003',
    protocolo: 'OBR-2025-0003',
    solicitante: {
      nome: 'Pedro Morador',
      cpf: '987.654.321-00',
      email: 'pedro.morador@email.com',
      telefone: '(11) 77777-7777',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Reclamação sobre Obra',
    categoria: 'reclamacoes',
    prioridade: 'alta',
    status: 'em_andamento',
    responsavel: {
      nome: 'Ana Fiscalização',
      cargo: 'Fiscal de Obras',
      setor: 'Fiscalização e Controle'
    },
    dataAbertura: '2025-01-18T11:30:00Z',
    dataPrevista: '2025-01-25T17:00:00Z',
    descricao: 'Reclamação sobre obra de drenagem que está causando transtornos no trânsito e ruído excessivo',
    localizacao: {
      endereco: 'Rua Central, próximo ao número 789',
      bairro: 'Centro',
      cep: '12345-000',
      coordenadas: {
        lat: -23.5450,
        lng: -46.6280
      }
    },
    dadosEspecificos: {
      obraRelacionada: 'DRE-2024-089',
      tipoReclamacao: 'Transtornos no trânsito',
      problemas: ['Falta de sinalização adequada', 'Ruído excessivo após 18h', 'Poeira em excesso'],
      impactoComercial: true,
      residenciasAfetadas: 15,
      comerciosAfetados: 8,
      medidasSolicitadas: ['Melhor sinalização', 'Controle de horário', 'Aspersão de água'],
      urgencia: 'Impacto no comércio local'
    },
    anexos: [
      {
        nome: 'fotos-obra-problemas.jpg',
        url: '/anexos/fotos-obra-problemas.jpg',
        tipo: 'image/jpeg'
      },
      {
        nome: 'abaixo-assinado-comerciantes.pdf',
        url: '/anexos/abaixo-assinado-comerciantes.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-18T11:30:00Z',
        usuario: 'Sistema',
        acao: 'Reclamação registrada'
      },
      {
        data: '2025-01-18T16:00:00Z',
        usuario: 'Ana Fiscalização',
        acao: 'Vistoria de urgência agendada',
        observacao: 'Vistoria marcada para hoje às 17h'
      },
      {
        data: '2025-01-19T08:00:00Z',
        usuario: 'Ana Fiscalização',
        acao: 'Notificação enviada à empreiteira',
        observacao: 'Prazo de 48h para adequações'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 189,
  novos: 15,
  emAndamento: 28,
  concluidos: 134,
  tempoMedioAtendimento: 18.7,
  satisfacaoMedia: 4.2,
  porStatus: {
    novo: 15,
    triagem: 12,
    em_andamento: 28,
    aguardando: 0,
    concluido: 134,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 76,
    media: 78,
    alta: 28,
    urgente: 7
  },
  porCategoria: {
    obras: 45,
    solicitacoes: 67,
    reclamacoes: 23,
    vistorias: 34,
    manutencao: 20
  }
};

export default function AtendimentosObrasPublicas() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosObrasPublicas);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES["obras-publicas"];

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
        Mapa de Obras
      </Button>
      <Button variant="outline">
        <Calendar className="h-4 w-4 mr-2" />
        Cronograma
      </Button>
      <Button variant="outline">
        <HardHat className="h-4 w-4 mr-2" />
        Empreiteiras
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="obras-publicas"
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
