import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Activity, 
  Building2,
  Plus,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useSaudeStats, useSaudeAgendamentos } from '@/hooks/modules/useSaude';
import { DataTable, ColumnConfig, ActionConfig, renderStatus, renderDate } from '@/components/shared/DataTable';
import { FormModal, FieldConfig } from '@/components/shared/FormModal';
import { useNavigate } from 'react-router-dom';

interface AgendamentoRow {
  id: string;
  paciente_nome: string;
  profissional_nome: string;
  data_agendamento: string;
  horario_inicio: string;
  tipo_consulta: string;
  status: string;
}

export default function DashboardSaudeNovo() {
  const navigate = useNavigate();
  const stats = useSaudeStats();
  const { data: agendamentos, isLoading } = useSaudeAgendamentos();

  const [isAgendamentoModalOpen, setIsAgendamentoModalOpen] = React.useState(false);

  // Configuração das colunas para agendamentos
  const agendamentosColumns: ColumnConfig<AgendamentoRow>[] = [
    {
      key: 'paciente_nome',
      label: 'Paciente',
      render: (value) => value || 'Não informado',
    },
    {
      key: 'data_agendamento',
      label: 'Data',
      render: renderDate,
    },
    {
      key: 'horario_inicio',
      label: 'Horário',
      render: (value) => value || '-',
    },
    {
      key: 'tipo_consulta',
      label: 'Tipo',
      render: (value) => (
        <Badge variant="outline">
          {value?.replace('_', ' ').toUpperCase() || 'Consulta'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => renderStatus(status, {
        agendado: { label: 'Agendado', variant: 'secondary' },
        confirmado: { label: 'Confirmado', variant: 'default' },
        realizado: { label: 'Realizado', variant: 'success' },
        cancelado: { label: 'Cancelado', variant: 'destructive' },
        faltou: { label: 'Faltou', variant: 'outline' },
      })
    },
  ];

  // Ações da tabela de agendamentos
  const agendamentosActions: ActionConfig<AgendamentoRow>[] = [
    {
      label: 'Ver detalhes',
      onClick: (row) => navigate(`/admin/saude/agendamentos/${row.id}`),
      variant: 'ghost',
    },
  ];

  // Campos do formulário de agendamento
  const agendamentoFields: FieldConfig[] = [
    {
      name: 'paciente_id',
      label: 'Paciente',
      type: 'select',
      required: true,
      options: [], // Seria preenchido com dados dos pacientes
    },
    {
      name: 'profissional_id',
      label: 'Profissional',
      type: 'select',
      required: true,
      options: [], // Seria preenchido com dados dos profissionais
    },
    {
      name: 'data_agendamento',
      label: 'Data do Agendamento',
      type: 'date',
      required: true,
    },
    {
      name: 'horario_inicio',
      label: 'Horário de Início',
      type: 'time',
      required: true,
    },
    {
      name: 'tipo_consulta',
      label: 'Tipo de Consulta',
      type: 'select',
      required: true,
      options: [
        { value: 'consulta', label: 'Consulta' },
        { value: 'exame', label: 'Exame' },
        { value: 'procedimento', label: 'Procedimento' },
        { value: 'retorno', label: 'Retorno' },
        { value: 'urgencia', label: 'Urgência' },
      ],
    },
    {
      name: 'observacoes',
      label: 'Observações',
      type: 'textarea',
      placeholder: 'Observações adicionais...',
    },
  ];

  const handleNovoAgendamento = (data: any) => {
    console.log('Novo agendamento:', data);
    // Aqui seria chamada a mutation para criar o agendamento
    setIsAgendamentoModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard - Saúde</h1>
          <p className="text-muted-foreground">
            Visão geral dos atendimentos e serviços de saúde
          </p>
        </div>
        <Button 
          onClick={() => setIsAgendamentoModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPacientes}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agendamentos?.filter(ag => 
                new Date(ag.data_agendamento).toDateString() === new Date().toDateString()
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1" />
              Próxima consulta às 14:30
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampanhas}</div>
            <p className="text-xs text-muted-foreground">
              Campanha de vacinação em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades de Saúde</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnidades}</div>
            <p className="text-xs text-muted-foreground">
              Todas operacionais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Agendamentos */}
      <DataTable
        title="Próximos Agendamentos"
        data={agendamentos?.slice(0, 10) || []}
        columns={agendamentosColumns}
        actions={agendamentosActions}
        isLoading={isLoading}
        searchPlaceholder="Buscar por paciente..."
        emptyMessage="Nenhum agendamento encontrado"
        onNew={() => setIsAgendamentoModalOpen(true)}
        newButtonLabel="Novo Agendamento"
      />

      {/* Modal de Novo Agendamento */}
      <FormModal
        title="Novo Agendamento"
        fields={agendamentoFields}
        onSubmit={handleNovoAgendamento}
        open={isAgendamentoModalOpen}
        onOpenChange={setIsAgendamentoModalOpen}
        size="lg"
        submitLabel="Agendar"
      />
    </div>
  );
}