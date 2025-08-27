import { DataTable } from "@/components/shared/DataTable";
import { FormModal } from "@/components/shared/FormModal";
import { usePlanejamento } from "@/hooks/modules/usePlanejamento";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Eye } from "lucide-react";
import { useState } from "react";

export default function Projetos() {
  const { projetos } = usePlanejamento();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const columns = [
    { key: "nome", label: "Nome do Projeto" },
    { key: "tipo", label: "Tipo" },
    { key: "categoria", label: "Categoria" },
    { 
      key: "area_total", 
      label: "Área Total", 
      render: (value: number) => value ? `${value.toLocaleString()} m²` : "-"
    },
    { 
      key: "data_protocolo", 
      label: "Data Protocolo",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-"
    },
    { 
      key: "status", 
      label: "Status",
      render: (value: string) => (
        <Badge variant={
          value === 'aprovado' ? 'default' :
          value === 'analise' ? 'secondary' :
          value === 'reprovado' ? 'destructive' : 'outline'
        }>
          {value}
        </Badge>
      )
    }
  ];

  const formFields = [
    { name: "nome", label: "Nome do Projeto", type: "text", required: true },
    { 
      name: "tipo", 
      label: "Tipo", 
      type: "select",
      options: [
        { value: "loteamento", label: "Loteamento" },
        { value: "edificacao", label: "Edificação" },
        { value: "reforma", label: "Reforma" },
        { value: "demolicao", label: "Demolição" },
        { value: "infraestrutura", label: "Infraestrutura" }
      ]
    },
    {
      name: "categoria",
      label: "Categoria",
      type: "select",
      options: [
        { value: "nova", label: "Nova" },
        { value: "reforma", label: "Reforma" },
        { value: "ampliacao", label: "Ampliação" },
        { value: "manutencao", label: "Manutenção" }
      ]
    },
    { name: "descricao", label: "Descrição", type: "textarea" },
    { name: "area_total", label: "Área Total (m²)", type: "number" },
    { name: "responsavel_tecnico", label: "Responsável Técnico", type: "text" },
    { name: "crea_responsavel", label: "CREA", type: "text" },
    { name: "data_protocolo", label: "Data do Protocolo", type: "date" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos Urbanos</h1>
          <p className="text-muted-foreground">
            Gestão de projetos de edificação e urbanização
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      <DataTable
        data={projetos.data || []}
        columns={columns}
        loading={projetos.isLoading}
        onEdit={setEditingItem}
        onDelete={projetos.delete}
        actions={(item) => (
          <>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
          </>
        )}
      />

      <FormModal
        open={isCreateOpen || !!editingItem}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingItem(null);
          }
        }}
        title={editingItem ? "Editar Projeto" : "Novo Projeto"}
        fields={formFields}
        onSubmit={(data) => {
          if (editingItem) {
            projetos.update({ id: editingItem.id, data });
          } else {
            projetos.create(data);
          }
          setIsCreateOpen(false);
          setEditingItem(null);
        }}
        defaultValues={editingItem}
        loading={projetos.isCreating || projetos.isUpdating}
      />
    </div>
  );
}