
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, MapPin, Phone, Users, Building } from "lucide-react";
import { InfraestruturaSport } from "@/types/esportes";

export default function EsportesInfraestruturaEsportiva() {
  const [infraestruturas, setInfraestruturas] = useState<InfraestruturaSport[]>([
    {
      id: "1",
      nome: "Complexo Esportivo Municipal",
      tipo: "Quadra",
      endereco: "Av. Principal, 123 - Centro",
      capacidade: 200,
      modalidades: ["Futebol", "Vôlei", "Basquete"],
      equipamentos: ["Traves", "Cestas", "Redes", "Placar eletrônico"],
      horarioFuncionamento: "06:00 - 22:00",
      responsavel: "João Silva",
      telefone: "(11) 3333-4444",
      status: "Ativo",
      observacoes: "Recém reformado, excelente estado"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInfraestrutura, setEditingInfraestrutura] = useState<InfraestruturaSport | null>(null);
  const [formData, setFormData] = useState<Partial<InfraestruturaSport>>({});

  const filteredInfraestruturas = infraestruturas.filter(
    infraestrutura =>
      infraestrutura.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infraestrutura.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infraestrutura.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infraestrutura.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInfraestrutura) {
      setInfraestruturas(infraestruturas.map(item => 
        item.id === editingInfraestrutura.id ? { ...editingInfraestrutura, ...formData } : item
      ));
    } else {
      const newInfraestrutura: InfraestruturaSport = {
        id: Date.now().toString(),
        nome: formData.nome || "",
        tipo: (formData.tipo as InfraestruturaSport['tipo']) || "Quadra",
        endereco: formData.endereco || "",
        capacidade: formData.capacidade || 0,
        modalidades: [],
        equipamentos: [],
        horarioFuncionamento: formData.horarioFuncionamento || "",
        responsavel: formData.responsavel || "",
        telefone: formData.telefone || "",
        status: (formData.status as InfraestruturaSport['status']) || "Ativo",
        observacoes: formData.observacoes || ""
      };
      setInfraestruturas([...infraestruturas, newInfraestrutura]);
    }
    setIsDialogOpen(false);
    setEditingInfraestrutura(null);
    setFormData({});
  };

  const handleEdit = (infraestrutura: InfraestruturaSport) => {
    setEditingInfraestrutura(infraestrutura);
    setFormData(infraestrutura);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setInfraestruturas(infraestruturas.filter(item => item.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800";
      case "Em Manutenção": return "bg-yellow-100 text-yellow-800";
      case "Inativo": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Quadra": return "bg-blue-100 text-blue-800";
      case "Campo": return "bg-green-100 text-green-800";
      case "Piscina": return "bg-cyan-100 text-cyan-800";
      case "Academia": return "bg-purple-100 text-purple-800";
      case "Pista": return "bg-orange-100 text-orange-800";
      case "Outro": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Infraestrutura Esportiva</h1>
            <p className="text-muted-foreground">
              Gerencie os espaços e equipamentos esportivos da cidade
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingInfraestrutura(null); setFormData({}); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Infraestrutura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingInfraestrutura ? "Editar Infraestrutura" : "Nova Infraestrutura"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Infraestrutura</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ""}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value as InfraestruturaSport['tipo'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quadra">Quadra</SelectItem>
                      <SelectItem value="Campo">Campo</SelectItem>
                      <SelectItem value="Piscina">Piscina</SelectItem>
                      <SelectItem value="Academia">Academia</SelectItem>
                      <SelectItem value="Pista">Pista</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco || ""}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    value={formData.capacidade || ""}
                    onChange={(e) => setFormData({ ...formData, capacidade: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="horarioFuncionamento">Horário de Funcionamento</Label>
                  <Input
                    id="horarioFuncionamento"
                    value={formData.horarioFuncionamento || ""}
                    onChange={(e) => setFormData({ ...formData, horarioFuncionamento: e.target.value })}
                    placeholder="ex: 06:00 - 22:00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel || ""}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone || ""}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as InfraestruturaSport['status'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes || ""}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingInfraestrutura ? "Atualizar" : "Cadastrar"} Infraestrutura
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Infraestruturas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{infraestruturas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {infraestruturas.filter(i => i.status === "Ativo").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacidade Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {infraestruturas.reduce((total, infra) => total + infra.capacidade, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {infraestruturas.filter(i => i.status === "Em Manutenção").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, tipo, endereço ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Infraestruturas List */}
        <div className="grid gap-4">
          {filteredInfraestruturas.map((infraestrutura) => (
            <Card key={infraestrutura.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{infraestrutura.nome}</h3>
                      <Badge className={getStatusColor(infraestrutura.status)}>
                        {infraestrutura.status}
                      </Badge>
                      <Badge className={getTipoColor(infraestrutura.tipo)}>
                        {infraestrutura.tipo}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Endereço: {infraestrutura.endereco}</p>
                      <p>Capacidade: {infraestrutura.capacidade} pessoas | Horário: {infraestrutura.horarioFuncionamento}</p>
                      <p>Responsável: {infraestrutura.responsavel} | Telefone: {infraestrutura.telefone}</p>
                      {infraestrutura.modalidades.length > 0 && (
                        <p>Modalidades: {infraestrutura.modalidades.join(", ")}</p>
                      )}
                      {infraestrutura.equipamentos.length > 0 && (
                        <p>Equipamentos: {infraestrutura.equipamentos.join(", ")}</p>
                      )}
                      {infraestrutura.observacoes && <p>Observações: {infraestrutura.observacoes}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(infraestrutura)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(infraestrutura.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    
  );
}
