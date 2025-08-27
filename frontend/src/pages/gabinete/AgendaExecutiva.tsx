import React from 'react';


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FC, useState } from "react";
import { Calendar, Clock, MapPin, Plus, Search, Users, Video, FileText } from "lucide-react";

const compromissosData = [
  {
    id: "AG-2025-001",
    titulo: "Reunião com Secretariado",
    tipo: "reuniao",
    data: "2025-05-20",
    horarioInicio: "09:00",
    horarioFim: "11:00",
    local: "Sala de Reuniões do Gabinete",
    participantes: ["Secretário de Saúde", "Secretário de Educação", "Secretário de Obras"],
    status: "confirmado",
    prioridade: "alta",
    descricao: "Reunião mensal de alinhamento estratégico entre as secretarias",
    observacoes: "Preparar relatórios de execução orçamentária"
  },
  {
    id: "AG-2025-002",
    titulo: "Audiência Pública - Orçamento 2026",
    tipo: "audiencia",
    data: "2025-05-22",
    horarioInicio: "19:00",
    horarioFim: "21:00",
    local: "Câmara Municipal",
    participantes: ["Comunidade", "Vereadores", "Secretário de Finanças"],
    status: "agendado",
    prioridade: "alta",
    descricao: "Apresentação da proposta orçamentária para 2026",
    observacoes: "Transmissão ao vivo pelas redes sociais"
  },
  {
    id: "AG-2025-003",
    titulo: "Inauguração UBS Centro",
    tipo: "evento",
    data: "2025-05-25",
    horarioInicio: "10:00",
    horarioFim: "12:00",
    local: "UBS Centro - Rua Principal, 123",
    participantes: ["Secretário de Saúde", "Equipe médica", "Comunidade"],
    status: "confirmado",
    prioridade: "media",
    descricao: "Cerimônia de inauguração da nova Unidade Básica de Saúde",
    observacoes: "Cobertura da imprensa local"
  },
  {
    id: "AG-2025-004",
    titulo: "Videoconferência SEBRAE",
    tipo: "videoconferencia",
    data: "2025-05-21",
    horarioInicio: "14:00",
    horarioFim: "15:30",
    local: "Gabinete do Prefeito (Online)",
    participantes: ["Diretor Regional SEBRAE", "Secretário de Desenvolvimento"],
    status: "agendado",
    prioridade: "media",
    descricao: "Discussão sobre programas de apoio aos microempreendedores",
    observacoes: "Link da reunião será enviado por e-mail"
  }
];

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    agendado: { label: "Agendado", className: "bg-blue-500 text-blue-50" },
    confirmado: { label: "Confirmado", className: "bg-green-500 text-green-50" },
    cancelado: { label: "Cancelado", className: "bg-red-500 text-red-50" },
    realizado: { label: "Realizado", className: "bg-gray-500 text-gray-50" }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-500 text-gray-50" };

  return <Badge className={config.className}>{config.label}</Badge>;
};

const TipoIcon: FC<{ tipo: string }> = ({ tipo }) => {
  const iconConfig = {
    reuniao: <Users className="h-4 w-4" />,
    audiencia: <Users className="h-4 w-4" />,
    evento: <Calendar className="h-4 w-4" />,
    videoconferencia: <Video className="h-4 w-4" />
  };

  return iconConfig[tipo as keyof typeof iconConfig] || <Calendar className="h-4 w-4" />;
};

const AgendaExecutiva: FC = () => {
  const [selectedCompromisso, setSelectedCompromisso] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"lista" | "calendario">("lista");

  const compromisso = selectedCompromisso ? compromissosData.find(c => c.id === selectedCompromisso) : null;

  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Agenda Executiva</h1>
          <div className="flex gap-2">
            <Select value={viewType} onValueChange={(value) => setViewType(value as "lista" | "calendario")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lista">Lista</SelectItem>
                <SelectItem value="calendario">Calendário</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Novo Compromisso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Compromisso</DialogTitle>
                  <DialogDescription>
                    Agende um novo compromisso na agenda executiva.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="titulo">Título do Compromisso</Label>
                    <Input id="titulo" placeholder="Digite o título" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reuniao">Reunião</SelectItem>
                          <SelectItem value="audiencia">Audiência</SelectItem>
                          <SelectItem value="evento">Evento</SelectItem>
                          <SelectItem value="videoconferencia">Videoconferência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="prioridade">Prioridade</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="data">Data</Label>
                      <Input id="data" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="horarioInicio">Horário Início</Label>
                      <Input id="horarioInicio" type="time" />
                    </div>
                    <div>
                      <Label htmlFor="horarioFim">Horário Fim</Label>
                      <Input id="horarioFim" type="time" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="local">Local</Label>
                    <Input id="local" placeholder="Local do compromisso" />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea id="descricao" placeholder="Descreva o compromisso" />
                  </div>
                  <div>
                    <Label htmlFor="participantes">Participantes</Label>
                    <Input id="participantes" placeholder="Lista de participantes (separados por vírgula)" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Agendar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Compromissos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 confirmados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">8 confirmados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próximo Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">23 confirmados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reuniões Online</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>
        </div>

        {!selectedCompromisso ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agenda de Compromissos</CardTitle>
                  <CardDescription>Gerencie todos os compromissos da agenda executiva</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar compromissos..." className="pl-8 w-[250px]" />
                  </div>
                  <Input type="date" className="w-[150px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewType === "lista" ? (
                <div className="space-y-4">
                  {compromissosData.map((compromisso) => (
                    <div 
                      key={compromisso.id}
                      className="border p-4 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedCompromisso(compromisso.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <TipoIcon tipo={compromisso.tipo} />
                          </div>
                          <div>
                            <h3 className="font-medium">{compromisso.titulo}</h3>
                            <p className="text-sm text-muted-foreground">{compromisso.descricao}</p>
                          </div>
                        </div>
                        <StatusBadge status={compromisso.status} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(compromisso.data).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{compromisso.horarioInicio} - {compromisso.horarioFim}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{compromisso.local}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-muted-foreground">
                          {compromisso.participantes.length} participante(s)
                        </div>
                        <div className="text-xs text-muted-foreground">{compromisso.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2" />
                    <p>Visualização de calendário será implementada aqui</p>
                    <p className="text-sm">Interface de calendário interativo</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <TipoIcon tipo={compromisso?.tipo || ""} />
                  </div>
                  <div>
                    <CardTitle>{compromisso?.titulo}</CardTitle>
                    <CardDescription>{compromisso?.descricao}</CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedCompromisso(null)}>
                  Voltar à Agenda
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Informações do Compromisso</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(compromisso?.data || "").toLocaleDateString("pt-BR", {
                          weekday: "long",
                          year: "numeric", 
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{compromisso?.horarioInicio} - {compromisso?.horarioFim}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{compromisso?.local}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={compromisso?.status || ""} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Participantes</h3>
                  <div className="space-y-2">
                    {compromisso?.participantes.map((participante, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{participante}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {compromisso?.observacoes && (
                <div className="space-y-2">
                  <h3 className="font-medium">Observações</h3>
                  <p className="text-sm bg-muted p-3 rounded">{compromisso.observacoes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Ata
                </Button>
                <Button variant="outline">Editar</Button>
                <Button>Confirmar Presença</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    
  );
};

export default AgendaExecutiva;
