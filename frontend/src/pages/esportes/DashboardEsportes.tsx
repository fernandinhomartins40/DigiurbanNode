
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEsportesInfraestrutura, useEsportesEquipes, EsportesInfraestrutura, EsportesEquipe } from '@/hooks/modules/useEsportes';
import { Trophy, Users, MapPin, Calendar } from 'lucide-react';

export default function DashboardEsportes() {
  const { 
    data: infraestrutura, 
    loading: loadingInfraestrutura,
    create: createInfraestrutura, 
    update: updateInfraestrutura, 
    remove: removeInfraestrutura 
  } = useEsportesInfraestrutura();

  const { 
    data: equipes, 
    loading: loadingEquipes,
    create: createEquipe, 
    update: updateEquipe, 
    remove: removeEquipe 
  } = useEsportesEquipes();

  const infraestruturaColumns = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'capacidade', label: 'Capacidade' },
    { key: 'status', label: 'Status' }
  ];

  const equipeColumns = [
    { key: 'nome', label: 'Nome' },
    { key: 'modalidade', label: 'Modalidade' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'atletas_ativos', label: 'Atletas Ativos' }
  ];

  const InfraestruturaForm = ({ data, onSave, onCancel }: { data?: EsportesInfraestrutura, onSave: (data: EsportesInfraestrutura) => void, onCancel: () => void }) => {
    const [formData, setFormData] = React.useState<EsportesInfraestrutura>(data || {
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
              <SelectItem value="estadio">Estádio</SelectItem>
              <SelectItem value="ginasio">Ginásio</SelectItem>
              <SelectItem value="quadra">Quadra</SelectItem>
              <SelectItem value="campo">Campo</SelectItem>
              <SelectItem value="piscina">Piscina</SelectItem>
              <SelectItem value="academia">Academia</SelectItem>
              <SelectItem value="pista">Pista</SelectItem>
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

  const EquipeForm = ({ data, onSave, onCancel }: { data?: EsportesEquipe, onSave: (data: EsportesEquipe) => void, onCancel: () => void }) => {
    const [formData, setFormData] = React.useState<EsportesEquipe>(data || {
      nome: '',
      modalidade: '',
      categoria: '',
      atletas_cadastrados: 0,
      atletas_ativos: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome da Equipe</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="modalidade">Modalidade</Label>
          <Select value={formData.modalidade} onValueChange={(value) => setFormData(prev => ({ ...prev, modalidade: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a modalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="futebol">Futebol</SelectItem>
              <SelectItem value="basquete">Basquete</SelectItem>
              <SelectItem value="volei">Vôlei</SelectItem>
              <SelectItem value="handebol">Handebol</SelectItem>
              <SelectItem value="futsal">Futsal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="infantil">Infantil</SelectItem>
              <SelectItem value="juvenil">Juvenil</SelectItem>
              <SelectItem value="adulto">Adulto</SelectItem>
              <SelectItem value="master">Master</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="masculino">Masculino</SelectItem>
            </SelectContent>
          </Select>
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
        <h1 className="text-3xl font-bold">Secretaria de Esportes</h1>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Infraestrutura</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{infraestrutura?.length || 0}</div>
            <p className="text-xs text-muted-foreground">equipamentos esportivos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">equipes ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atletas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {equipes?.reduce((acc, e) => acc + (e.atletas_ativos || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">atletas ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competições</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">competições programadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Infraestrutura Esportiva */}
      <Card>
        <CardHeader>
          <CardTitle>Infraestrutura Esportiva</CardTitle>
          <CardDescription>Gestão de equipamentos esportivos municipais</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={infraestrutura || []}
            columns={infraestruturaColumns}
            loading={loadingInfraestrutura}
            onEdit={(item) => console.log('Edit infraestrutura:', item)}
            onDelete={(item) => removeInfraestrutura(item.id!)}
            renderCreateForm={(onSave, onCancel) => (
              <InfraestruturaForm onSave={onSave} onCancel={onCancel} />
            )}
            renderEditForm={(item, onSave, onCancel) => (
              <InfraestruturaForm data={item} onSave={onSave} onCancel={onCancel} />
            )}
            onCreate={createInfraestrutura}
            onUpdate={updateInfraestrutura}
          />
        </CardContent>
      </Card>

      {/* Equipes Esportivas */}
      <Card>
        <CardHeader>
          <CardTitle>Equipes Esportivas</CardTitle>
          <CardDescription>Gestão de equipes e atletas municipais</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={equipes || []}
            columns={equipeColumns}
            loading={loadingEquipes}
            onEdit={(item) => console.log('Edit equipe:', item)}
            onDelete={(item) => removeEquipe(item.id!)}
            renderCreateForm={(onSave, onCancel) => (
              <EquipeForm onSave={onSave} onCancel={onCancel} />
            )}
            renderEditForm={(item, onSave, onCancel) => (
              <EquipeForm data={item} onSave={onSave} onCancel={onCancel} />
            )}
            onCreate={createEquipe}
            onUpdate={updateEquipe}
          />
        </CardContent>
      </Card>
    </div>
  );
}
