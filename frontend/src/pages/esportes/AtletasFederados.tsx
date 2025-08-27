
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Users, Award, Target, Calendar } from "lucide-react";
import { AtletaFederado } from "@/types/esportes";

export default function EsportesAtletasFederados() {
  const [atletas, setAtletas] = useState<AtletaFederado[]>([
    {
      id: "1",
      nome: "Maria Santos",
      cpf: "123.456.789-00",
      dataNascimento: "1995-05-15",
      modalidade: "Atletismo",
      categoria: "Adulto",
      federacao: "Federação Paulista de Atletismo",
      numeroRegistro: "FPA2024001",
      vigencia: "2024-12-31",
      status: "Ativo",
      conquistas: ["1º lugar Campeonato Estadual 2023", "3º lugar Brasileiro 2022"]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAtleta, setEditingAtleta] = useState<AtletaFederado | null>(null);
  const [formData, setFormData] = useState<Partial<AtletaFederado>>({});

  const filteredAtletas = atletas.filter(
    atleta =>
      atleta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.modalidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.cpf.includes(searchTerm) ||
      atleta.numeroRegistro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAtleta) {
      setAtletas(atletas.map(item => 
        item.id === editingAtleta.id ? { ...editingAtleta, ...formData } : item
      ));
    } else {
      const newAtleta: AtletaFederado = {
        id: Date.now().toString(),
        nome: formData.nome || "",
        cpf: formData.cpf || "",
        dataNascimento: formData.dataNascimento || "",
        modalidade: formData.modalidade || "",
        categoria: formData.categoria || "",
        federacao: formData.federacao || "",
        numeroRegistro: formData.numeroRegistro || "",
        vigencia: formData.vigencia || "",
        status: (formData.status as AtletaFederado['status']) || "Ativo",
        conquistas: []
      };
      setAtletas([...atletas, newAtleta]);
    }
    setIsDialogOpen(false);
    setEditingAtleta(null);
    setFormData({});
  };

  const handleEdit = (atleta: AtletaFederado) => {
    setEditingAtleta(atleta);
    setFormData(atleta);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAtletas(atletas.filter(item => item.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800";
      case "Inativo": return "bg-red-100 text-red-800";
      case "Suspenso": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Atletas Federados</h1>
            <p className="text-muted-foreground">
              Gerencie o cadastro de atletas federados
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingAtleta(null); setFormData({}); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Atleta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAtleta ? "Editar Atleta" : "Novo Atleta"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ""}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf || ""}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento || ""}
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
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
                  <Input
                    id="categoria"
                    value={formData.categoria || ""}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="federacao">Federação</Label>
                  <Input
                    id="federacao"
                    value={formData.federacao || ""}
                    onChange={(e) => setFormData({ ...formData, federacao: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numeroRegistro">Número de Registro</Label>
                  <Input
                    id="numeroRegistro"
                    value={formData.numeroRegistro || ""}
                    onChange={(e) => setFormData({ ...formData, numeroRegistro: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vigencia">Vigência</Label>
                  <Input
                    id="vigencia"
                    type="date"
                    value={formData.vigencia || ""}
                    onChange={(e) => setFormData({ ...formData, vigencia: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as AtletaFederado['status'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                      <SelectItem value="Suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingAtleta ? "Atualizar" : "Cadastrar"} Atleta
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{atletas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {atletas.filter(a => a.status === "Ativo").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Conquistas</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {atletas.filter(a => a.conquistas && a.conquistas.length > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencendo Este Ano</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {atletas.filter(a => a.vigencia > new Date().toISOString().split('T')[0]).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, modalidade, CPF ou registro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Atletas List */}
        <div className="grid gap-4">
          {filteredAtletas.map((atleta) => (
            <Card key={atleta.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{atleta.nome}</h3>
                      <Badge className={getStatusColor(atleta.status)}>
                        {atleta.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>CPF: {atleta.cpf} | Idade: {calcularIdade(atleta.dataNascimento)} anos</p>
                      <p>Modalidade: {atleta.modalidade} | Categoria: {atleta.categoria}</p>
                      <p>Federação: {atleta.federacao}</p>
                      <p>Registro: {atleta.numeroRegistro} | Vigência: {new Date(atleta.vigencia).toLocaleDateString('pt-BR')}</p>
                      {atleta.conquistas && atleta.conquistas.length > 0 && (
                        <p>Conquistas: {atleta.conquistas.join(", ")}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(atleta)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(atleta.id)}>
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
