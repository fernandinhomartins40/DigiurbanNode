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
import { Heart, Calendar, Stethoscope, Pill, FileText, Activity } from 'lucide-react';

const mockAtendimentosSaude: PDVAtendimento[] = [
  {
    id: 'sau001',
    protocolo: 'SAU-2025-0001',
    solicitante: {
      nome: 'Maria Silva Santos',
      cpf: '123.456.789-00',
      email: 'maria.silva@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Consulta Médica - Clínica Geral',
    categoria: 'consultas',
    prioridade: 'media',
    status: 'em_andamento',
    responsavel: {
      nome: 'Dr. Carlos Santos',
      cargo: 'Médico Clínico Geral',
      setor: 'UBS Central - Clínica Geral'
    },
    dataAbertura: '2025-01-15T09:00:00Z',
    dataPrevista: '2025-01-15T10:00:00Z',
    descricao: 'Consulta médica de rotina com queixas de dor de cabeça recorrente e fadiga',
    dadosEspecificos: {
      cartaoSus: '123456789012345',
      especialidade: 'Clínica Geral',
      tipoAtendimento: 'Consulta',
      motivoConsulta: 'Dor de cabeça e fadiga',
      sinaisVitais: {
        pressaoArterial: '120/80 mmHg',
        temperatura: '36.5°C',
        frequenciaCardiaca: '75 bpm',
        peso: '68 kg',
        altura: '165 cm'
      },
      historicoMedico: ['Hipertensão controlada', 'Diabetes tipo 2'],
      medicamentosUso: ['Losartana 50mg', 'Metformina 850mg'],
      alergias: ['Penicilina'],
      examesComplementares: ['Hemograma completo', 'Glicemia de jejum'],
      procedimentosRealizados: ['Aferição de sinais vitais', 'Exame físico geral'],
      diagnosticoPreliminar: 'Cefaleia tensão - investigar causas',
      prescricao: 'Analgésico SOS, retorno em 15 dias'
    },
    anexos: [
      {
        nome: 'exames-laboratoriais.pdf',
        url: '/anexos/exames-laboratoriais.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-15T09:00:00Z',
        usuario: 'Sistema',
        acao: 'Consulta agendada'
      },
      {
        data: '2025-01-15T09:15:00Z',
        usuario: 'Enf. Ana Costa',
        acao: 'Triagem realizada',
        observacao: 'Sinais vitais aferidos'
      },
      {
        data: '2025-01-15T09:30:00Z',
        usuario: 'Dr. Carlos Santos',
        acao: 'Consulta iniciada'
      }
    ]
  },
  {
    id: 'sau002',
    protocolo: 'SAU-2025-0002',
    solicitante: {
      nome: 'João Oliveira Silva',
      cpf: '987.654.321-00',
      email: 'joao.oliveira@email.com',
      telefone: '(11) 88888-8888',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Consulta Especializada - Cardiologia',
    categoria: 'especialidades',
    prioridade: 'alta',
    status: 'concluido',
    responsavel: {
      nome: 'Dra. Ana Pereira',
      cargo: 'Médica Cardiologista',
      setor: 'Hospital Municipal - Cardiologia'
    },
    dataAbertura: '2025-01-12T10:30:00Z',
    dataPrevista: '2025-01-12T11:30:00Z',
    descricao: 'Consulta cardiologia para avaliação de dor torácica e dispneia aos esforços',
    dadosEspecificos: {
      cartaoSus: '987654321098765',
      especialidade: 'Cardiologia',
      tipoAtendimento: 'Consulta Especializada',
      motivoConsulta: 'Dor torácica e dispneia',
      encaminhamento: 'UBS Vila Nova - Dr. Pedro Silva',
      sinaisVitais: {
        pressaoArterial: '160/95 mmHg',
        temperatura: '36.2°C',
        frequenciaCardiaca: '88 bpm',
        saturacaoO2: '96%'
      },
      examesComplementares: ['ECG', 'Ecocardiograma', 'Teste ergométrico'],
      diagnostico: 'Hipertensão arterial sistêmica estágio 2',
      conduta: 'Ajuste medicamentoso e acompanhamento',
      medicamentosPrescritos: ['Amlodipina 10mg', 'Atenolol 50mg'],
      retorno: '30 dias',
      orientacoes: ['Dieta hipossódica', 'Atividade física regular', 'Controle de peso']
    },
    anexos: [
      {
        nome: 'ecg-resultado.pdf',
        url: '/anexos/ecg-resultado.pdf',
        tipo: 'application/pdf'
      },
      {
        nome: 'ecocardiograma.pdf',
        url: '/anexos/ecocardiograma.pdf',
        tipo: 'application/pdf'
      }
    ],
    historico: [
      {
        data: '2025-01-12T10:30:00Z',
        usuario: 'Sistema',
        acao: 'Consulta agendada'
      },
      {
        data: '2025-01-12T10:45:00Z',
        usuario: 'Dra. Ana Pereira',
        acao: 'Consulta realizada',
        observacao: 'Paciente orientado sobre mudanças no estilo de vida'
      },
      {
        data: '2025-01-12T11:15:00Z',
        usuario: 'Sistema',
        acao: 'Consulta concluída',
        observacao: 'Retorno agendado para 30 dias'
      }
    ]
  },
  {
    id: 'sau003',
    protocolo: 'SAU-2025-0003',
    solicitante: {
      nome: 'Luiza Costa Mendes',
      cpf: '456.789.123-00',
      email: 'luiza.costa@email.com',
      telefone: '(11) 77777-7777',
      tipo: 'cidadao'
    },
    tipoSolicitacao: 'Consulta Pediátrica',
    categoria: 'pediatria',
    prioridade: 'media',
    status: 'novo',
    responsavel: {
      nome: 'Dra. Mariana Alves',
      cargo: 'Médica Pediatra',
      setor: 'UBS Norte - Pediatria'
    },
    dataAbertura: '2025-01-18T15:30:00Z',
    dataPrevista: '2025-01-20T14:00:00Z',
    descricao: 'Consulta pediátrica para avaliação de febre e tosse em criança de 5 anos',
    dadosEspecificos: {
      cartaoSus: '456789123045678',
      especialidade: 'Pediatria',
      tipoAtendimento: 'Consulta Pediátrica',
      idadePaciente: '5 anos',
      motivoConsulta: 'Febre há 3 dias e tosse seca',
      responsavelLegal: 'Luiza Costa Mendes (Mãe)',
      sinaisVitais: {
        temperatura: '38.5°C',
        frequenciaCardiaca: '105 bpm',
        frequenciaRespiratoria: '24 irpm',
        peso: '18 kg',
        altura: '110 cm'
      },
      vacinacao: 'Em dia conforme calendário',
      desenvolvimentoNeuropsicomotor: 'Adequado para a idade',
      antecedentesPatologicos: 'Nenhum',
      medicamentosUso: 'Nenhum',
      exameFisico: 'A realizar',
      diagnosticoPreliminar: 'Investigação de síndrome gripal',
      orientacoes: ['Hidratação adequada', 'Repouso', 'Antitérmico se necessário']
    },
    historico: [
      {
        data: '2025-01-18T15:30:00Z',
        usuario: 'Sistema',
        acao: 'Consulta agendada',
        observacao: 'Aguardando atendimento'
      }
    ]
  }
];

const mockEstatisticas: PDVEstatisticas = {
  total: 287,
  novos: 18,
  emAndamento: 45,
  concluidos: 203,
  tempoMedioAtendimento: 35.5,
  satisfacaoMedia: 4.7,
  porStatus: {
    novo: 18,
    triagem: 21,
    em_andamento: 45,
    aguardando: 0,
    concluido: 203,
    cancelado: 0
  },
  porPrioridade: {
    baixa: 89,
    media: 145,
    alta: 42,
    urgente: 11
  },
  porCategoria: {
    consultas: 156,
    especialidades: 67,
    pediatria: 34,
    emergencia: 18,
    exames: 12
  }
};

export default function AtendimentosSaude() {
  const [atendimentos, setAtendimentos] = useState<PDVAtendimento[]>(mockAtendimentosSaude);
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const configuracao = PDV_CONFIGURACOES.saude;

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
        <Calendar className="h-4 w-4 mr-2" />
        Agenda Médica
      </Button>
      <Button variant="outline">
        <Stethoscope className="h-4 w-4 mr-2" />
        Protocolos
      </Button>
      <Button variant="outline">
        <Pill className="h-4 w-4 mr-2" />
        Farmácia Básica
      </Button>
    </>
  );

  return (
    <PDVAtendimentoBase
      modulo="saude"
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
