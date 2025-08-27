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
import { Camera, MapPin, Calendar, Users, Star, Info } from 'lucide-react';

const mockAtendimentosTurismo: PDVAtendimento[] = [
  {
    id: 'tur001',
    protocolo: 'TUR-2025-0001',
    solicitante: {
      nome: 'Maria Guia',
      cpf: '123.456.789-00',
      email: 'maria.guia@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Cadastro de Guia',
    categoria: 'cadastros',
    prioridade: 'media',
    status: 'triagem',
    responsavel: {
      nome: 'Carlos Turismo',
      cargo: 'Coordenador de Guias',
      setor: 'Cadastro de Profissionais'
    },
    dataAbertura: '2025-01-15T09:00:00Z',
    dataPrevista: '2025-01-25T17:00:00Z',
    descricao: 'Solicitação de cadastro como guia de turismo credenciado',
    dadosEspecificos: {
      tipoGuia: 'Turismo Rural',
      experienciaAnos: 5,
      idiomas: ['Português', 'Inglês', 'Espanhol'],
      especialidades: ['Ecoturismo', 'Turismo Rural', 'História Local'],
      certificacoes: ['Curso de Guia Oficial', 'Primeiros Socorros'],
      disponibilidade: 'Fins de semana e feriados',
      veiculo: 'Próprio - Van 15 lugares'
    },
    anexos: [
      {
        nome: 'certificado-guia.pdf',
        url: '/anexos/certificado-guia.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-15T09:00:00Z',
        usuario: 'Sistema',
        acao: 'Cadastro solicitado'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 178,
  novos: 8,
  emAndamento: 23,
  concluidos: 142,
  tempoMedioAtendimento: 6.5,
  satisfacaoMedia: 4.7,
  porStatus: {
    novo: 8,
    triagem: 5,
    em_andamento: 23,
    aguardando: 0,
    concluido: 142,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 89,
    media: 67,
    alta: 19,
    urgente: 3
  },
  porCategoria: {
    cadastros: 67,
    informacoes: 45,
    eventos: 23,
    promocoes: 28,
    suporte: 15
  }
};

export default function AtendimentosTurismo() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosTurismo);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES.turismo;

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
        Pontos Turísticos
      </Button>
      <Button variant="outline">
        <Calendar className="h-4 w-4 mr-2" />
        Agenda de Eventos
      </Button>
      <Button variant="outline">
        <Star className="h-4 w-4 mr-2" />
        Avaliações
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="turismo"
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