
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Users, Trophy, Target } from "lucide-react";
import { EquipeEsportiva } from "@/types/esportes";

export default function EsportesEquipesEsportivas() {
  const [equipes, setEquipes] = useState<EquipeEsportiva[]>([
    {
      id: "1",
      nome: "Leões FC",
      modalidade: "Futebol",
      categoria: "Adulto",
      tecnico: "Carlos Silva",
      numeroAtletas: 18,
      status: "Ativa",
      competicoes: ["Campeonato Municipal", "Copa Regional"],
      descricao: "Equipe principal de futebol da cidade"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<EquipeEsportiva | null>(null);
  const [formData, setFormData] = useState<Partial<EquipeEsportiva>>({});

  const filteredEquipes = equipes.filter(
    equipe =>
      equipe.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipe.modalidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipe.tecnico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEquipe) {
      setEquipes(equipes.map(item => 
        item.id === editingEquipe.id ? { ...editingEquipe, ...formData } : item
      ));
    } else {
      const newEquipe: EquipeEsportiva = {
        id: Date.now().toString(),
        nome: formData.nome || "",
        modalidade: formData.modalidade || "",
        categoria: (formData.categoria as EquipeEsportiva['categoria']) || "Adulto",
        tecnico: formData.tecnico || "",
        numeroAtletas: formData.numeroAtletas || 0,
        status: (formData.status as EquipeEsportiva['status']) || "Ativa",
        competicoes: formData.competicoes || [],
        descricao: formData.descricao || ""
      };
      setEquipes([...equipes, newEquipe]);
    }
    setIsDialogOpen(false);
    setEditingEquipe(null);
    setFormData({});
  };

  const handleEdit = (equipe: EquipeEsportiva) => {
    setEditingEquipe(equipe);
    setFormData(equipe);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEquipes(equipes.filter(item => item.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativa": return "bg-green-100 text-green-800";
      case "Inativa": return "bg-red-100 text-red-800";
      case "Em Formação": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipes Esportivas</h1>
            <p className="text-muted-foreground">
              Gerencie as equipes esportivas municipais
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEquipe(null); setFormData({}); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Equipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEquipe ? "Editar Equipe" : "Nova Equipe"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Equipe</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ""}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="modalidade">Modalidade</Label>
                  <Input
                    id="modalidade"
                    value={formData.modalidade || ""}
                    onChange={(e) => setFormData({ ...formData, modalidade: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value as EquipeEsportiva['categoria'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Base">Base</SelectItem>
                      <SelectItem value="Juvenil">Juvenil</SelectItem>
                      <SelectItem value="Adulto">Adulto</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tecnico">Técnico</Label>
                  <Input
                    id="tecnico"
                    value={formData.tecnico || ""}
                    onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numeroAtletas">Número de Atletas</Label>
                  <Input
                    id="numeroAtletas"
                    type="number"
                    value={formData.numeroAtletas || ""}
                    onChange={(e) => setFormData({ ...formData, numeroAtletas: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as EquipeEsportiva['status'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativa">Ativa</SelectItem>
                      <SelectItem value="Inativa">Inativa</SelectItem>
                      <SelectItem value="Em Formação">Em Formação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao || ""}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingEquipe ? "Atualizar" : "Criar"} Equipe
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Equipes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipes Ativas</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipes.filter(e => e.status === "Ativa").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipes.reduce((total, equipe) => total + equipe.numeroAtletas, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Formação</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipes.filter(e => e.status === "Em Formação").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, modalidade ou técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Equipes List */}
        <div className="grid gap-4">
          {filteredEquipes.map((equipe) => (
            <Card key={equipe.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{equipe.nome}</h3>
                      <Badge className={getStatusColor(equipe.status)}>
                        {equipe.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Modalidade: {equipe.modalidade} | Categoria: {equipe.categoria}</p>
                      <p>Técnico: {equipe.tecnico} | Atletas: {equipe.numeroAtletas}</p>
                      {equipe.competicoes.length > 0 && (
                        <p>Competições: {equipe.competicoes.join(", ")}</p>
                      )}
                      {equipe.descricao && <p>Descrição: {equipe.descricao}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(equipe)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(equipe.id)}>
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
