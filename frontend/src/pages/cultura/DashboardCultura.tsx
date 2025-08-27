
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCulturaEspacos, useCulturaEventos, CulturaEspaco, CulturaEvento } from '@/hooks/modules/useCultura';
import { Palette, Calendar, MapPin, Users } from 'lucide-react';

export default function DashboardCultura() {
  const { 
    data: espacos, 
    loading: loadingEspacos,
    create: createEspaco, 
    update: updateEspaco, 
    remove: removeEspaco 
  } = useCulturaEspacos();

  const { 
    data: eventos, 
    loading: loadingEventos,
    create: createEvento, 
    update: updateEvento, 
    remove: removeEvento 
  } = useCulturaEventos();

  const espacoColumns = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'capacidade', label: 'Capacidade' },
    { key: 'status', label: 'Status' }
  ];

  const eventoColumns = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'data_inicio', label: 'Data Início' },
    { key: 'status', label: 'Status' }
  ];

  const EspacoForm = ({ data, onSave, onCancel }: { data?: CulturaEspaco, onSave: (data: CulturaEspaco) => void, onCancel: () => void }) => {
    const [formData, setFormData] = React.useState<CulturaEspaco>(data || {
      nome: '',
      tipo: '',
      capacidade: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teatro">Teatro</SelectItem>
              <SelectItem value="biblioteca">Biblioteca</SelectItem>
              <SelectItem value="centro_cultural">Centro Cultural</SelectItem>
              <SelectItem value="museu">Museu</SelectItem>
              <SelectItem value="casa_cultura">Casa de Cultura</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="capacidade">Capacidade</Label>
          <Input
            id="capacidade"
            type="number"
            value={formData.capacidade}
            onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) }))}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar
          </Button>
        </div>
      </form>
    );
  };

  const EventoForm = ({ data, onSave, onCancel }: { data?: CulturaEvento, onSave: (data: CulturaEvento) => void, onCancel: () => void }) => {
    const [formData, setFormData] = React.useState<CulturaEvento>(data || {
      nome: '',
      tipo: '',
      categoria: '',
      entrada_gratuita: true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="festival">Festival</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="exposicao">Exposição</SelectItem>
              <SelectItem value="apresentacao">Apresentação</SelectItem>
              <SelectItem value="concurso">Concurso</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="data_inicio">Data de Início</Label>
          <Input
            id="data_inicio"
            type="date"
            value={formData.data_inicio}
            onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Secretaria de Cultura</h1>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaços Culturais</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{espacos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">espaços cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">eventos programados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">participantes ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">projetos em andamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Espaços Culturais */}
      <Card>
        <CardHeader>
          <CardTitle>Espaços Culturais</CardTitle>
          <CardDescription>Gestão dos espaços culturais do município</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={espacos || []}
            columns={espacoColumns}
            loading={loadingEspacos}
            onEdit={(item) => console.log('Edit espaco:', item)}
            onDelete={(item) => removeEspaco(item.id!)}
            renderCreateForm={(onSave, onCancel) => (
              <EspacoForm onSave={onSave} onCancel={onCancel} />
            )}
            renderEditForm={(item, onSave, onCancel) => (
              <EspacoForm data={item} onSave={onSave} onCancel={onCancel} />
            )}
            onCreate={createEspaco}
            onUpdate={updateEspaco}
          />
        </CardContent>
      </Card>

      {/* Eventos Culturais */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Culturais</CardTitle>
          <CardDescription>Programação e gestão de eventos culturais</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={eventos || []}
            columns={eventoColumns}
            loading={loadingEventos}
            onEdit={(item) => console.log('Edit evento:', item)}
            onDelete={(item) => removeEvento(item.id!)}
            renderCreateForm={(onSave, onCancel) => (
              <EventoForm onSave={onSave} onCancel={onCancel} />
            )}
            renderEditForm={(item, onSave, onCancel) => (
              <EventoForm data={item} onSave={onSave} onCancel={onCancel} />
            )}
            onCreate={createEvento}
            onUpdate={updateEvento}
          />
        </CardContent>
      </Card>
    </div>
  );
}
