
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Users, GraduationCap, Target, DollarSign } from "lucide-react";
import { EscolinhaSport } from "@/types/esportes";

export default function EsportesEscolinhasEsportivas() {
  const [escolinhas, setEscolinhas] = useState<EscolinhaSport[]>([
    {
      id: "1",
      nome: "Escolinha de Futebol Mirim",
      modalidade: "Futebol",
      idadeMinima: 6,
      idadeMaxima: 12,
      professor: "João Carlos",
      local: "Campo Municipal",
      horarios: "08:00 - 10:00",
      diasSemana: ["Segunda", "Quarta", "Sexta"],
      vagas: 30,
      vagasOcupadas: 25,
      valor: 50.00,
      descricao: "Iniciação esportiva para crianças",
      status: "Ativa"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEscolinha, setEditingEscolinha] = useState<EscolinhaSport | null>(null);
  const [formData, setFormData] = useState<Partial<EscolinhaSport>>({});

  const filteredEscolinhas = escolinhas.filter(
    escolinha =>
      escolinha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escolinha.modalidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escolinha.professor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEscolinha) {
      setEscolinhas(escolinhas.map(item => 
        item.id === editingEscolinha.id ? { ...editingEscolinha, ...formData } : item
      ));
    } else {
      const newEscolinha: EscolinhaSport = {
        id: Date.now().toString(),
        nome: formData.nome || "",
        modalidade: formData.modalidade || "",
        idadeMinima: formData.idadeMinima || 0,
        idadeMaxima: formData.idadeMaxima || 0,
        professor: formData.professor || "",
        local: formData.local || "",
        horarios: formData.horarios || "",
        diasSemana: formData.diasSemana || [],
        vagas: formData.vagas || 0,
        vagasOcupadas: 0,
        valor: formData.valor || 0,
        descricao: formData.descricao || "",
        status: (formData.status as EscolinhaSport['status']) || "Ativa"
      };
      setEscolinhas([...escolinhas, newEscolinha]);
    }
    setIsDialogOpen(false);
    setEditingEscolinha(null);
    setFormData({});
  };

  const handleEdit = (escolinha: EscolinhaSport) => {
    setEditingEscolinha(escolinha);
    setFormData(escolinha);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEscolinhas(escolinhas.filter(item => item.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativa": return "bg-green-100 text-green-800";
      case "Inativa": return "bg-red-100 text-red-800";
      case "Cheia": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVagasColor = (vagasOcupadas: number, vagas: number) => {
    const percentual = (vagasOcupadas / vagas) * 100;
    if (percentual >= 90) return "text-red-600";
    if (percentual >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Escolinhas Esportivas</h1>
            <p className="text-muted-foreground">
              Gerencie as escolinhas e programas de iniciação esportiva
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEscolinha(null); setFormData({}); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Escolinha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEscolinha ? "Editar Escolinha" : "Nova Escolinha"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Escolinha</Label>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="idadeMinima">Idade Mínima</Label>
                    <Input
                      id="idadeMinima"
                      type="number"
                      value={formData.idadeMinima || ""}
                      onChange={(e) => setFormData({ ...formData, idadeMinima: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="idadeMaxima">Idade Máxima</Label>
                    <Input
                      id="idadeMaxima"
                      type="number"
                      value={formData.idadeMaxima || ""}
                      onChange={(e) => setFormData({ ...formData, idadeMaxima: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="professor">Professor/Instrutor</Label>
                  <Input
                    id="professor"
                    value={formData.professor || ""}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                    required
                  />
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
                  <Label htmlFor="horarios">Horários</Label>
                  <Input
                    id="horarios"
                    value={formData.horarios || ""}
                    onChange={(e) => setFormData({ ...formData, horarios: e.target.value })}
                    placeholder="ex: 08:00 - 10:00"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vagas">Vagas Totais</Label>
                    <Input
                      id="vagas"
                      type="number"
                      value={formData.vagas || ""}
                      onChange={(e) => setFormData({ ...formData, vagas: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor Mensal (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={formData.valor || ""}
                      onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as EscolinhaSport['status'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativa">Ativa</SelectItem>
                      <SelectItem value="Inativa">Inativa</SelectItem>
                      <SelectItem value="Cheia">Cheia</SelectItem>
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
                  {editingEscolinha ? "Atualizar" : "Criar"} Escolinha
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Escolinhas</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{escolinhas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alunos Matriculados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {escolinhas.reduce((total, escolinha) => total + escolinha.vagasOcupadas, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {escolinhas.reduce((total, escolinha) => total + escolinha.vagas, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {escolinhas.reduce((total, escolinha) => total + (escolinha.valor * escolinha.vagasOcupadas), 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, modalidade ou professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Escolinhas List */}
        <div className="grid gap-4">
          {filteredEscolinhas.map((escolinha) => (
            <Card key={escolinha.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{escolinha.nome}</h3>
                      <Badge className={getStatusColor(escolinha.status)}>
                        {escolinha.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Modalidade: {escolinha.modalidade} | Idades: {escolinha.idadeMinima} - {escolinha.idadeMaxima} anos</p>
                      <p>Professor: {escolinha.professor} | Local: {escolinha.local}</p>
                      <p>Horários: {escolinha.horarios} | Dias: {escolinha.diasSemana.join(", ")}</p>
                      <p className={getVagasColor(escolinha.vagasOcupadas, escolinha.vagas)}>
                        Vagas: {escolinha.vagasOcupadas}/{escolinha.vagas} | Valor: R$ {escolinha.valor.toFixed(2)}
                      </p>
                      {escolinha.descricao && <p>Descrição: {escolinha.descricao}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(escolinha)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(escolinha.id)}>
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
