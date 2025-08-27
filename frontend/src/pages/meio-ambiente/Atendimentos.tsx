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
import { TreePine, Leaf, MapPin, Shield, Recycle, Search } from 'lucide-react';

const mockAtendimentosMeioAmbiente: PDVAtendimento[] = [
  {
    id: 'amb001',
    protocolo: 'AMB-2025-0001',
    solicitante: {
      nome: 'João Silva Santos',
      cpf: '123.456.789-00',
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Denúncia Ambiental',
    categoria: 'denuncias',
    prioridade: 'alta',
    status: 'em_andamento',
    responsavel: {
      nome: 'Maria Verde',
      cargo: 'Fiscal Ambiental',
      setor: 'Fiscalização Ambiental'
    },
    dataAbertura: '2025-01-15T08:30:00Z',
    dataPrevista: '2025-01-20T17:00:00Z',
    descricao: 'Denúncia de descarte irregular de resíduos industriais em área verde',
    localizacao: {
      endereco: 'Rua das Árvores, próximo ao número 456',
      bairro: 'Vila Verde',
      cep: '12345-678',
      coordenadas: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    dadosEspecificos: {
      tipoDenuncia: 'Descarte irregular',
      tipoResiduos: 'Industriais',
      volumeEstimado: 'Grande quantidade',
      periodicidade: 'Contínua',
      riscoAmbiental: 'Alto',
      proximoCorpoHidrico: true,
      denuncianteIdentificado: true,
      evidenciasFotograficas: true
    },
    anexos: [
      {
        nome: 'fotos-descarte.jpg',
        url: '/anexos/fotos-descarte.jpg',
        tipo: 'image/jpeg'
      },
      {
        nome: 'localizacao-gps.pdf',
        url: '/anexos/localizacao-gps.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-15T08:30:00Z',
        usuario: 'Sistema',
        acao: 'Denúncia registrada'
      },
      {
        data: '2025-01-15T14:00:00Z',
        usuario: 'Maria Verde',
        acao: 'Vistoria agendada',
        observacao: 'Vistoria marcada para hoje às 16h'
      }
    ]
  },
  {
    id: 'amb002',
    protocolo: 'AMB-2025-0002',
    solicitante: {
      nome: 'Construtora Verde Ltda',
      email: 'licencas@construtoraverde.com.br',
      telefone: '(11) 88888-8888',
      tipo: 'externo'
    },
    tipoSolicitacao: 'Solicitação de Licença',
    categoria: 'licencas',
    prioridade: 'media',
    status: 'triagem',
    responsavel: {
      nome: 'Carlos Licenças',
      cargo: 'Analista Ambiental',
      setor: 'Licenciamento'
    },
    dataAbertura: '2025-01-12T09:15:00Z',
    dataPrevista: '2025-02-11T17:00:00Z',
    descricao: 'Solicitação de licença ambiental para construção de condomínio residencial',
    localizacao: {
      endereco: 'Terreno na Av. Sustentável, 1000',
      bairro: 'Novo Horizonte',
      cep: '12345-900',
      coordenadas: {
        lat: -23.5600,
        lng: -46.6400
      }
    },
    dadosEspecificos: {
      tipoLicenca: 'Licença Prévia',
      tipoEmpreendimento: 'Residencial',
      areaTerreno: 50000,
      areaContruida: 35000,
      numeroUnidades: 200,
      arvoresRemover: 45,
      arvoresCompensar: 90,
      estudoImpacto: true,
      captacaoAgua: false,
      sistemaEsgoto: 'Rede pública'
    },
    anexos: [
      {
        nome: 'projeto-arquitetonico.pdf',
        url: '/anexos/projeto-arquitetonico.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'estudo-impacto.pdf',
        url: '/anexos/estudo-impacto.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-12T09:15:00Z',
        usuario: 'Sistema',
        acao: 'Solicitação protocolada'
      },
      {
        data: '2025-01-14T10:30:00Z',
        usuario: 'Carlos Licenças',
        acao: 'Análise documental iniciada'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 234,
  novos: 18,
  emAndamento: 45,
  concluidos: 156,
  tempoMedioAtendimento: 12.3,
  satisfacaoMedia: 4.1,
  porStatus: {
    novo: 18,
    triagem: 12,
    em_andamento: 45,
    aguardando: 3,
    concluido: 156,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 89,
    media: 98,
    alta: 38,
    urgente: 9
  },
  porCategoria: {
    licencas: 67,
    denuncias: 45,
    autorizacoes: 34,
    coleta: 23,
    programas: 28,
    vistorias: 37
  }
};

export default function AtendimentosMeioAmbiente() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosMeioAmbiente);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES["meio-ambiente"];

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
        Mapa Ambiental
      </Button>
      <Button variant="outline">
        <Shield className="h-4 w-4 mr-2" />
        Fiscalização
      </Button>
      <Button variant="outline">
        <Recycle className="h-4 w-4 mr-2" />
        Programas Verdes
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="meio-ambiente"
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