
import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Plus,
  Search,
  Bell,
  Clock,
  MapPin,
  Users,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { AlertaSeguranca } from "@/types/seguranca-publica";

const mockAlertas: AlertaSeguranca[] = [
  {
    id: "1",
    tipo: "emergencia",
    nivel: "critico",
    titulo: "Situação de Risco na Escola Municipal",
    descricao: "Ameaça de bomba reportada na Escola Municipal Centro. Evacuação em andamento.",
    local: "Escola Municipal Centro",
    coordenadas: { lat: -23.5505, lng: -46.6333 },
    dataInicio: "2024-01-15T14:00:00",
    dataFim: undefined,
    status: "ativo",
    canais: ["sms", "email", "app", "sirene"],
    populacaoAlvo: ["Pais de alunos", "Funcionários", "Comunidade local"],
    responsavel: "Comandante Silva",
    instrucoesSeguranca: [
      "Mantenha-se afastado da área",
      "Aguarde orientações oficiais",
      "Não espalhe rumores"
    ],
    contatosEmergencia: [
      { nome: "Comandante Silva", telefone: "(11) 99999-9999", funcao: "Coordenador" },
      { nome: "Bombeiros", telefone: "193", funcao: "Emergência" }
    ],
    dataCriacao: "2024-01-15T14:00:00"
  },
  {
    id: "2",
    tipo: "preventivo",
    nivel: "medio",
    titulo: "Evento na Praça Central - Reforço de Segurança",
    descricao: "Durante o evento cultural na Praça Central, haverá reforço da segurança.",
    local: "Praça Central",
    dataInicio: "2024-01-20T18:00:00",
    dataFim: "2024-01-20T22:00:00",
    status: "ativo",
    canais: ["email", "app"],
    populacaoAlvo: ["Participantes do evento", "Comerciantes locais"],
    responsavel: "Sgt. Santos",
    instrucoesSeguranca: [
      "Evite aglomerações desnecessárias",
      "Mantenha pertences pessoais seguros",
      "Procure a Guarda Municipal em caso de necessidade"
    ],
    dataCriacao: "2024-01-18T10:00:00"
  }
];

const AlertasSeguranca: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [nivelFilter, setNivelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaSeguranca | null>(null);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "emergencia": return "bg-red-500 text-white";
      case "atencao": return "bg-orange-500 text-white";
      case "informativo": return "bg-blue-500 text-white";
      case "preventivo": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "critico": return "bg-red-600 text-white";
      case "alto": return "bg-orange-600 text-white";
      case "medio": return "bg-yellow-600 text-white";
      case "baixo": return "bg-green-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      emergencia: "Emergência",
      atencao: "Atenção",
      informativo: "Informativo",
      preventivo: "Preventivo"
    };
    return labels[tipo] || tipo;
  };

  const getNivelLabel = (nivel: string) => {
    const labels: { [key: string]: string } = {
      critico: "Crítico",
      alto: "Alto",
      medio: "Médio",
      baixo: "Baixo"
    };
    return labels[nivel] || nivel;
  };

  const filteredAlertas = mockAlertas.filter(alerta => {
    const matchesSearch = searchTerm === "" || 
      alerta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerta.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = tipoFilter === "all" || alerta.tipo === tipoFilter;
    const matchesNivel = nivelFilter === "all" || alerta.nivel === nivelFilter;
    const matchesStatus = statusFilter === "all" || alerta.status === statusFilter;
    
    return matchesSearch && matchesTipo && matchesNivel && matchesStatus;
  });

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <AlertTriangle className="mr-3 h-8 w-8 text-orange-600" />
              Alertas de Segurança
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie alertas e comunicações de segurança pública
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Alerta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Alerta</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Alerta</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergencia">Emergência</SelectItem>
                      <SelectItem value="atencao">Atenção</SelectItem>
                      <SelectItem value="informativo">Informativo</SelectItem>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nivel">Nível</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                      <SelectItem value="critico">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar alertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="emergencia">Emergência</SelectItem>
              <SelectItem value="atencao">Atenção</SelectItem>
              <SelectItem value="informativo">Informativo</SelectItem>
              <SelectItem value="preventivo">Preventivo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={nivelFilter} onValueChange={setNivelFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="baixo">Baixo</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="alto">Alto</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="resolvido">Resolvido</SelectItem>
              <SelectItem value="expirado">Expirado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredAlertas.map((alerta) => (
            <Card key={alerta.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{alerta.titulo}</h3>
                      <Badge className={getTipoColor(alerta.tipo)}>
                        {getTipoLabel(alerta.tipo)}
                      </Badge>
                      <Badge className={getNivelColor(alerta.nivel)}>
                        {getNivelLabel(alerta.nivel)}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{alerta.descricao}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {alerta.local && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{alerta.local}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{new Date(alerta.dataInicio).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{alerta.populacaoAlvo.length} grupos alvo</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye size={14} className="mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit size={14} className="mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlertas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum alerta encontrado</p>
          </div>
        )}
      </div>
    
  );
};

export default AlertasSeguranca;
