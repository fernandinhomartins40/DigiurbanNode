
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAgricultoraProdutores, useAgriculturaProgramas, AgriculturaProdutor, AgriculturaPrograma } from '@/hooks/modules/useAgricultura';
import { Tractor, Wheat, Users, TrendingUp } from 'lucide-react';

export default function DashboardAgricultura() {
  const { 
    data: produtores, 
    loading: loadingProdutores,
    create: createProdutor, 
    update: updateProdutor, 
    remove: removeProdutor 
  } = useAgricultoraProdutores();

  const { 
    data: programas, 
    loading: loadingProgramas,
    create: createPrograma, 
    update: updatePrograma, 
    remove: removePrograma 
  } = useAgriculturaProgramas();

  const produtorColumns = [
    { key: 'nome_completo', label: 'Nome' },
    { key: 'cpf', label: 'CPF' },
    { key: 'area_total_hectares', label: 'Área (ha)' },
    { key: 'status', label: 'Status' }
  ];

  const programaColumns = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'produtores_beneficiados', label: 'Beneficiados' },
    { key: 'status', label: 'Status' }
  ];

  const ProdutorForm = ({ data, onSave, onCancel }: { data?: AgriculturaProdutor, onSave: (data: AgriculturaProdutor) => void, onCancel: () => void }) => {
    const [formData, setFormData] = React.useState<AgriculturaProdutor>(data || {
      nome_completo: '',
      cpf: '',
      area_total_hectares: 0,
      dap: false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nome_completo">Nome Completo</Label>
          <Input
            id="nome_completo"
            value={formData.nome_completo}
            onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="area_total_hectares">Área Total (hectares)</Label>
          <Input
            id="area_total_hectares"
            type="number"
            step="0.01"
            value={formData.area_total_hectares}
            onChange={(e) => setFormData(prev => ({ ...prev, area_total_hectares: parseFloat(e.target.value) }))}
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

  const ProgramaForm = ({ data, onSave, onCancel }: { data?: AgriculturaPrograma, onSave: (data: AgriculturaPrograma) => void, onCancel: () => void }) => {
    const [formData, setFormData] = React.useState<AgriculturaPrograma>(data || {
      nome: '',
      tipo: '',
      produtores_beneficiados: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome do Programa</Label>
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
              <SelectItem value="credito">Crédito Rural</SelectItem>
              <SelectItem value="capacitacao">Capacitação</SelectItem>
              <SelectItem value="distribuicao_sementes">Distribuição de Sementes</SelectItem>
              <SelectItem value="maquinario">Máquinas e Equipamentos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
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
        <h1 className="text-3xl font-bold">Secretaria de Agricultura</h1>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtores?.length || 0}</div>
            <p className="text-xs text-muted-foreground">produtores cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas</CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programas?.length || 0}</div>
            <p className="text-xs text-muted-foreground">programas ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Total</CardTitle>
            <Wheat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {produtores?.reduce((acc, p) => acc + (p.area_total_hectares || 0), 0) || 0} ha
            </div>
            <p className="text-xs text-muted-foreground">hectares cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programas?.reduce((acc, p) => acc + (p.produtores_beneficiados || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">produtores beneficiados</p>
          </CardContent>
        </Card>
      </div>

      {/* Produtores Rurais */}
      <Card>
        <CardHeader>
          <CardTitle>Produtores Rurais</CardTitle>
          <CardDescription>Cadastro e gestão de produtores rurais</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={produtores || []}
            columns={produtorColumns}
            loading={loadingProdutores}
            onEdit={(item) => console.log('Edit produtor:', item)}
            onDelete={(item) => removeProdutor(item.id!)}
            renderCreateForm={(onSave, onCancel) => (
              <ProdutorForm onSave={onSave} onCancel={onCancel} />
            )}
            renderEditForm={(item, onSave, onCancel) => (
              <ProdutorForm data={item} onSave={onSave} onCancel={onCancel} />
            )}
            onCreate={createProdutor}
            onUpdate={updateProdutor}
          />
        </CardContent>
      </Card>

      {/* Programas Rurais */}
      <Card>
        <CardHeader>
          <CardTitle>Programas Rurais</CardTitle>
          <CardDescription>Programas de apoio à agricultura familiar</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={programas || []}
            columns={programaColumns}
            loading={loadingProgramas}
            onEdit={(item) => console.log('Edit programa:', item)}
            onDelete={(item) => removePrograma(item.id!)}
            renderCreateForm={(onSave, onCancel) => (
              <ProgramaForm onSave={onSave} onCancel={onCancel} />
            )}
            renderEditForm={(item, onSave, onCancel) => (
              <ProgramaForm data={item} onSave={onSave} onCancel={onCancel} />
            )}
            onCreate={createPrograma}
            onUpdate={updatePrograma}
          />
        </CardContent>
      </Card>
    </div>
  );
}
