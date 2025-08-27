
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Trophy, Calendar, MapPin, Users } from "lucide-react";
import { Competicao } from "@/types/esportes";

export default function EsportesCompeticoesTorneios() {
  const [competicoes, setCompeticoes] = useState<Competicao[]>([
    {
      id: "1",
      nome: "Campeonato Municipal de Futebol",
      modalidade: "Futebol",
      tipo: "Municipal",
      dataInicio: "2024-03-01",
      dataFim: "2024-06-30",
      local: "Estádio Municipal",
      equipesParticipantes: ["Leões FC", "Águias FC", "Falcões FC"],
      premiacao: "R$ 5.000 (1º lugar), R$ 3.000 (2º lugar), R$ 1.000 (3º lugar)",
      status: "Em Andamento",
      regulamento: "Competição seguindo as regras da CBF"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompeticao, setEditingCompeticao] = useState<Competicao | null>(null);
  const [formData, setFormData] = useState<Partial<Competicao>>({});

  const filteredCompeticoes = competicoes.filter(
    competicao =>
      competicao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competicao.modalidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competicao.local.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompeticao) {
      setCompeticoes(competicoes.map(item => 
        item.id === editingCompeticao.id ? { ...editingCompeticao, ...formData } : item
      ));
    } else {
      const newCompeticao: Competicao = {
        id: Date.now().toString(),
        nome: formData.nome || "",
        modalidade: formData.modalidade || "",
        tipo: (formData.tipo as Competicao['tipo']) || "Municipal",
        dataInicio: formData.dataInicio || "",
        dataFim: formData.dataFim || "",
        local: formData.local || "",
        equipesParticipantes: [],
        premiacao: formData.premiacao || "",
        status: (formData.status as Competicao['status']) || "Planejada",
        regulamento: formData.regulamento || ""
      };
      setCompeticoes([...competicoes, newCompeticao]);
    }
    setIsDialogOpen(false);
    setEditingCompeticao(null);
    setFormData({});
  };

  const handleEdit = (competicao: Competicao) => {
    setEditingCompeticao(competicao);
    setFormData(competicao);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCompeticoes(competicoes.filter(item => item.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalizada": return "bg-green-100 text-green-800";
      case "Em Andamento": return "bg-blue-100 text-blue-800";
      case "Planejada": return "bg-yellow-100 text-yellow-800";
      case "Cancelada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Nacional": return "bg-purple-100 text-purple-800";
      case "Estadual": return "bg-blue-100 text-blue-800";
      case "Regional": return "bg-green-100 text-green-800";
      case "Municipal": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Competições e Torneios</h1>
            <p className="text-muted-foreground">
              Organize e gerencie competições esportivas
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingCompeticao(null); setFormData({}); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Competição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCompeticao ? "Editar Competição" : "Nova Competição"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Competição</Label>
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
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value as Competicao['tipo'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Municipal">Municipal</SelectItem>
                      <SelectItem value="Regional">Regional</SelectItem>
                      <SelectItem value="Estadual">Estadual</SelectItem>
                      <SelectItem value="Nacional">Nacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio || ""}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataFim">Data de Fim</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formData.dataFim || ""}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    value={formData.local || ""}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="premiacao">Premiação</Label>
                  <Input
                    id="premiacao"
                    value={formData.premiacao || ""}
                    onChange={(e) => setFormData({ ...formData, premiacao: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Competicao['status'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planejada">Planejada</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Finalizada">Finalizada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="regulamento">Regulamento</Label>
                  <Textarea
                    id="regulamento"
                    value={formData.regulamento || ""}
                    onChange={(e) => setFormData({ ...formData, regulamento: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingCompeticao ? "Atualizar" : "Criar"} Competição
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Competições</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{competicoes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {competicoes.filter(c => c.status === "Em Andamento").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {competicoes.filter(c => c.status === "Finalizada").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planejadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {competicoes.filter(c => c.status === "Planejada").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, modalidade ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Competições List */}
        <div className="grid gap-4">
          {filteredCompeticoes.map((competicao) => (
            <Card key={competicao.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{competicao.nome}</h3>
                      <Badge className={getStatusColor(competicao.status)}>
                        {competicao.status}
                      </Badge>
                      <Badge className={getTipoColor(competicao.tipo)}>
                        {competicao.tipo}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Modalidade: {competicao.modalidade}</p>
                      <p>Período: {new Date(competicao.dataInicio).toLocaleDateString('pt-BR')} até {new Date(competicao.dataFim).toLocaleDateString('pt-BR')}</p>
                      <p>Local: {competicao.local}</p>
                      {competicao.equipesParticipantes.length > 0 && (
                        <p>Equipes: {competicao.equipesParticipantes.join(", ")}</p>
                      )}
                      {competicao.premiacao && <p>Premiação: {competicao.premiacao}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(competicao)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(competicao.id)}>
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
