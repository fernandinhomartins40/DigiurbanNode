import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Clock, 
  User, 
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Pause,
  X,
  Briefcase,
  Heart,
  GraduationCap,
  Users,
  TreePine,
  Lightbulb,
  Shield,
  Tractor,
  Camera,
  Trophy,
  Palette,
  Home
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  PDVAtendimento, 
  PDVFiltros, 
  PDVEstatisticas, 
  PDVConfiguracao,
  ModuloPDV 
} from '@/types/pdv-types';

// Mapeamento de ícones
const ICON_MAP = {
  'Briefcase': Briefcase,
  'Heart': Heart,
  'GraduationCap': GraduationCap,
  'Users': Users,
  'TreePine': TreePine,
  'MapPin': MapPin,
  'Lightbulb': Lightbulb,
  'Shield': Shield,
  'Tractor': Tractor,
  'Camera': Camera,
  'Trophy': Trophy,
  'Palette': Palette,
  'Home': Home
};

interface PDVAtendimentoBaseProps {
  modulo: ModuloPDV;
  configuracao: PDVConfiguracao;
  atendimentos: PDVAtendimento[];
  estatisticas: PDVEstatisticas;
  onNovoAtendimento: (atendimento: Partial<PDVAtendimento>) => void;
  onAtualizarAtendimento: (id: string, dados: Partial<PDVAtendimento>) => void;
  onFiltrar: (filtros: PDVFiltros) => void;
  customHeader?: React.ReactNode;
  customFilters?: React.ReactNode;
  customActions?: React.ReactNode;
}

export const PDVAtendimentoBase: React.FC<PDVAtendimentoBaseProps> = ({
  modulo,
  configuracao,
  atendimentos,
  estatisticas,
  onNovoAtendimento,
  onAtualizarAtendimento,
  onFiltrar,
  customHeader,
  customFilters,
  customActions
}) => {
  const [filtros, setFiltros] = useState<PDVFiltros>({});
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<PDVAtendimento | null>(null);
  const [tabAtiva, setTabAtiva] = useState('todos');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'novo': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'triagem': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'em_andamento': return <User className="h-4 w-4 text-orange-600" />;
      case 'aguardando': return <Pause className="h-4 w-4 text-purple-600" />;
      case 'concluido': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelado': return <X className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'bg-blue-100 text-blue-800';
      case 'triagem': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-orange-100 text-orange-800';
      case 'aguardando': return 'bg-purple-100 text-purple-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    const config = configuracao.prioridades.find(p => p.id === prioridade);
    return config ? config.cor : '#6B7280';
  };

  const filtrarAtendimentos = (status?: string) => {
    return atendimentos.filter(atendimento => {
      if (status && status !== 'todos' && atendimento.status !== status) return false;
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        return (
          atendimento.protocolo.toLowerCase().includes(busca) ||
          atendimento.solicitante.nome.toLowerCase().includes(busca) ||
          atendimento.descricao.toLowerCase().includes(busca)
        );
      }
      return true;
    });
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return data;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header personalizado ou padrão */}
      {customHeader || (
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <div 
                className="p-2 rounded-lg text-white"
                style={{ backgroundColor: configuracao.cor }}
              >
                {React.createElement(ICON_MAP[configuracao.icone as keyof typeof ICON_MAP] || Briefcase, { 
                  className: "h-6 w-6" 
                })}
              </div>
              Atendimentos - {configuracao.nome}
            </h1>
            <p className="text-muted-foreground">
              Gerencie todos os atendimentos e solicitações da secretaria
            </p>
          </div>
          <div className="flex gap-2">
            {customActions}
            <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Atendimento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Novo Atendimento</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo atendimento para {configuracao.nome}
                  </DialogDescription>
                </DialogHeader>
                {/* Formulário de novo atendimento será implementado */}
                <div className="space-y-4 py-4">
                  <div className="text-sm text-muted-foreground">
                    Formulário de registro em desenvolvimento...
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogoAberto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setDialogoAberto(false)}>
                    Registrar Atendimento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-xs text-muted-foreground">
              +{estatisticas.novos} novos hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.emAndamento}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando resolução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.concluidos}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.tempoMedioAtendimento}d</div>
            <p className="text-xs text-muted-foreground">
              Para resolução
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por protocolo, nome ou descrição..."
                value={filtros.busca || ''}
                onChange={(e) => {
                  const novosFiltros = { ...filtros, busca: e.target.value };
                  setFiltros(novosFiltros);
                  onFiltrar(novosFiltros);
                }}
                className="w-full"
              />
            </div>
            
            <Select
              value={filtros.status?.[0] || 'todos'}
              onValueChange={(value) => {
                const novosFiltros = { 
                  ...filtros, 
                  status: value === 'todos' ? [] : [value] 
                };
                setFiltros(novosFiltros);
                onFiltrar(novosFiltros);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="novo">Novos</SelectItem>
                <SelectItem value="triagem">Em Triagem</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="aguardando">Aguardando</SelectItem>
                <SelectItem value="concluido">Concluídos</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.prioridade?.[0] || 'todas'}
              onValueChange={(value) => {
                const novosFiltros = { 
                  ...filtros, 
                  prioridade: value === 'todas' ? [] : [value] 
                };
                setFiltros(novosFiltros);
                onFiltrar(novosFiltros);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {configuracao.prioridades.map(prioridade => (
                  <SelectItem key={prioridade.id} value={prioridade.id}>
                    {prioridade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {customFilters}
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Atendimentos */}
      <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
        <TabsList>
          <TabsTrigger value="todos">
            Todos ({filtrarAtendimentos().length})
          </TabsTrigger>
          <TabsTrigger value="novo">
            Novos ({filtrarAtendimentos('novo').length})
          </TabsTrigger>
          <TabsTrigger value="em_andamento">
            Em Andamento ({filtrarAtendimentos('em_andamento').length})
          </TabsTrigger>
          <TabsTrigger value="concluido">
            Concluídos ({filtrarAtendimentos('concluido').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <AtendimentosTabela 
            atendimentos={filtrarAtendimentos()} 
            configuracao={configuracao}
            onVisualizar={setAtendimentoSelecionado}
            formatarData={formatarData}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getPrioridadeColor={getPrioridadeColor}
          />
        </TabsContent>

        <TabsContent value="novo" className="space-y-4">
          <AtendimentosTabela 
            atendimentos={filtrarAtendimentos('novo')} 
            configuracao={configuracao}
            onVisualizar={setAtendimentoSelecionado}
            formatarData={formatarData}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getPrioridadeColor={getPrioridadeColor}
          />
        </TabsContent>

        <TabsContent value="em_andamento" className="space-y-4">
          <AtendimentosTabela 
            atendimentos={filtrarAtendimentos('em_andamento')} 
            configuracao={configuracao}
            onVisualizar={setAtendimentoSelecionado}
            formatarData={formatarData}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getPrioridadeColor={getPrioridadeColor}
          />
        </TabsContent>

        <TabsContent value="concluido" className="space-y-4">
          <AtendimentosTabela 
            atendimentos={filtrarAtendimentos('concluido')} 
            configuracao={configuracao}
            onVisualizar={setAtendimentoSelecionado}
            formatarData={formatarData}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getPrioridadeColor={getPrioridadeColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente da tabela de atendimentos
const AtendimentosTabela: React.FC<{
  atendimentos: PDVAtendimento[];
  configuracao: PDVConfiguracao;
  onVisualizar: (atendimento: PDVAtendimento) => void;
  formatarData: (data: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  getPrioridadeColor: (prioridade: string) => string;
}> = ({ 
  atendimentos, 
  configuracao, 
  onVisualizar, 
  formatarData, 
  getStatusIcon, 
  getStatusColor, 
  getPrioridadeColor 
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atendimentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum atendimento encontrado
                </TableCell>
              </TableRow>
            ) : (
              atendimentos.map((atendimento) => (
                <TableRow key={atendimento.id}>
                  <TableCell className="font-medium">
                    {atendimento.protocolo}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{atendimento.solicitante.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {atendimento.solicitante.tipo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{atendimento.tipoSolicitacao}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(atendimento.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(atendimento.status)}
                        {atendimento.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div 
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: getPrioridadeColor(atendimento.prioridade) }}
                      title={atendimento.prioridade}
                    />
                    <span className="ml-2 text-sm">
                      {atendimento.prioridade}
                    </span>
                  </TableCell>
                  <TableCell>{formatarData(atendimento.dataAbertura)}</TableCell>
                  <TableCell>
                    {atendimento.responsavel?.nome || 'Não atribuído'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onVisualizar(atendimento)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};