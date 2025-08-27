
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Calendar, Users, MapPin, DollarSign } from "lucide-react";
import { EventoEsportivo } from "@/types/esportes";

export default function EsportesEventosEsportivos() {
  const [eventos, setEventos] = useState<EventoEsportivo[]>([
    {
      id: "1",
      nome: "Torneio de Verão",
      tipo: "Torneio",
      modalidade: "Futebol",
      data: "2024-02-15",
      horario: "09:00",
      local: "Complexo Esportivo Municipal",
      publicoAlvo: "Todas as idades",
      inscricoes: 12,
      limiteInscricoes: 16,
      valor: 25.00,
      organizador: "Secretaria de Esportes",
      descricao: "Torneio de futebol amador para promover o esporte na cidade",
      status: "Aberto"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoEsportivo | null>(null);
  const [formData, setFormData] = useState<Partial<EventoEsportivo>>({});

  const filteredEventos = eventos.filter(
    evento =>
      evento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.modalidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.organizador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvento) {
      setEventos(eventos.map(item => 
        item.id === editingEvento.id ? { ...editingEvento, ...formData } : item
      ));
    } else {
      const newEvento: EventoEsportivo = {
        id: Date.now().toString(),
        nome: formData.nome || "",
        tipo: (formData.tipo as EventoEsportivo['tipo']) || "Torneio",
        modalidade: formData.modalidade || "",
        data: formData.data || "",
        horario: formData.horario || "",
        local: formData.local || "",
        publicoAlvo: formData.publicoAlvo || "",
        inscricoes: 0,
        limiteInscricoes: formData.limiteInscricoes || 0,
        valor: formData.valor || 0,
        organizador: formData.organizador || "",
        descricao: formData.descricao || "",
        status: (formData.status as EventoEsportivo['status']) || "Planejado"
      };
      setEventos([...eventos, newEvento]);
    }
    setIsDialogOpen(false);
    setEditingEvento(null);
    setFormData({});
  };

  const handleEdit = (evento: EventoEsportivo) => {
    setEditingEvento(evento);
    setFormData(evento);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEventos(eventos.filter(item => item.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalizado": return "bg-green-100 text-green-800";
      case "Em Andamento": return "bg-blue-100 text-blue-800";
      case "Aberto": return "bg-yellow-100 text-yellow-800";
      case "Planejado": return "bg-gray-100 text-gray-800";
      case "Cancelado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Torneio": return "bg-purple-100 text-purple-800";
      case "Festival": return "bg-pink-100 text-pink-800";
      case "Clínica": return "bg-blue-100 text-blue-800";
      case "Palestra": return "bg-green-100 text-green-800";
      case "Outro": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getInscricoesColor = (inscricoes: number, limite: number) => {
    const percentual = (inscricoes / limite) * 100;
    if (percentual >= 90) return "text-red-600";
    if (percentual >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Eventos Esportivos</h1>
            <p className="text-muted-foreground">
              Organize e gerencie eventos esportivos da cidade
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEvento(null); setFormData({}); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEvento ? "Editar Evento" : "Novo Evento"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Evento</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ""}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value as EventoEsportivo['tipo'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Torneio">Torneio</SelectItem>
                      <SelectItem value="Festival">Festival</SelectItem>
                      <SelectItem value="Clínica">Clínica</SelectItem>
                      <SelectItem value="Palestra">Palestra</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data || ""}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="horario">Horário</Label>
                    <Input
                      id="horario"
                      type="time"
                      value={formData.horario || ""}
                      onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
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
                  <Label htmlFor="publicoAlvo">Público Alvo</Label>
                  <Input
                    id="publicoAlvo"
                    value={formData.publicoAlvo || ""}
                    onChange={(e) => setFormData({ ...formData, publicoAlvo: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="limiteInscricoes">Limite de Inscrições</Label>
                    <Input
                      id="limiteInscricoes"
                      type="number"
                      value={formData.limiteInscricoes || ""}
                      onChange={(e) => setFormData({ ...formData, limiteInscricoes: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor (R$)</Label>
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
                  <Label htmlFor="organizador">Organizador</Label>
                  <Input
                    id="organizador"
                    value={formData.organizador || ""}
                    onChange={(e) => setFormData({ ...formData, organizador: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as EventoEsportivo['status'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planejado">Planejado</SelectItem>
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
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
                  {editingEvento ? "Atualizar" : "Criar"} Evento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Abertos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {eventos.filter(e => e.status === "Aberto").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {eventos.reduce((total, evento) => total + evento.inscricoes, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {eventos.reduce((total, evento) => total + (evento.valor * evento.inscricoes), 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, modalidade, local ou organizador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Eventos List */}
        <div className="grid gap-4">
          {filteredEventos.map((evento) => (
            <Card key={evento.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{evento.nome}</h3>
                      <Badge className={getStatusColor(evento.status)}>
                        {evento.status}
                      </Badge>
                      <Badge className={getTipoColor(evento.tipo)}>
                        {evento.tipo}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Modalidade: {evento.modalidade} | Público: {evento.publicoAlvo}</p>
                      <p>Data: {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.horario}</p>
                      <p>Local: {evento.local} | Organizador: {evento.organizador}</p>
                      <p className={getInscricoesColor(evento.inscricoes, evento.limiteInscricoes)}>
                        Inscrições: {evento.inscricoes}/{evento.limiteInscricoes} | Valor: R$ {evento.valor.toFixed(2)}
                      </p>
                      {evento.descricao && <p>Descrição: {evento.descricao}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(evento)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(evento.id)}>
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
