
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Calendar as CalendarIcon, FileText, User, Search } from "lucide-react";
import { Doctor, Appointment } from "@/types/saude";

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientId: "101",
    patientName: "Maria Silva",
    doctorId: "201",
    doctorName: "Dr. Carlos Santos",
    specialty: "Clínica Geral",
    date: "2025-05-25",
    time: "09:00",
    status: "agendado",
    priority: "normal",
  },
  {
    id: "2",
    patientId: "102",
    patientName: "João Oliveira",
    doctorId: "202",
    doctorName: "Dra. Ana Pereira",
    specialty: "Cardiologia",
    date: "2025-05-25",
    time: "10:30",
    status: "confirmado",
    priority: "urgente",
  },
  {
    id: "3",
    patientId: "103",
    patientName: "Antônio Ferreira",
    doctorId: "203",
    doctorName: "Dr. Ricardo Martins",
    specialty: "Ortopedia",
    date: "2025-05-26",
    time: "14:00",
    status: "remarcado",
    notes: "Paciente solicitou remarcação",
    priority: "normal",
  },
  {
    id: "4",
    patientId: "104",
    patientName: "Luiza Costa",
    doctorId: "204",
    doctorName: "Dra. Mariana Alves",
    specialty: "Pediatria",
    date: "2025-05-26",
    time: "15:30",
    status: "realizado",
    priority: "normal",
  },
  {
    id: "5",
    patientId: "105",
    patientName: "Roberto Gomes",
    doctorId: "205",
    doctorName: "Dr. Felipe Souza",
    specialty: "Neurologia",
    date: "2025-05-27",
    time: "09:45",
    status: "agendado",
    priority: "emergência",
    notes: "Paciente com dores intensas",
  },
];

const mockDoctors: Doctor[] = [
  {
    id: "201",
    name: "Dr. Carlos Santos",
    specialty: "Clínica Geral",
    crm: "CRM/SP 12345",
    phone: "(11) 1234-5678",
    email: "carlos.santos@clinica.com.br",
  },
  {
    id: "202",
    name: "Dra. Ana Pereira",
    specialty: "Cardiologia",
    crm: "CRM/SP 23456",
    phone: "(11) 2345-6789",
    email: "ana.pereira@clinica.com.br",
  },
  {
    id: "203",
    name: "Dr. Ricardo Martins",
    specialty: "Ortopedia",
    crm: "CRM/SP 34567",
    phone: "(11) 3456-7890",
    email: "ricardo.martins@clinica.com.br",
  },
  {
    id: "204",
    name: "Dra. Mariana Alves",
    specialty: "Pediatria",
    crm: "CRM/SP 45678",
    phone: "(11) 4567-8901",
    email: "mariana.alves@clinica.com.br",
  },
  {
    id: "205",
    name: "Dr. Felipe Souza",
    specialty: "Neurologia",
    crm: "CRM/SP 56789",
    phone: "(11) 5678-9012",
    email: "felipe.souza@clinica.com.br",
  },
];

const statusColors: Record<string, string> = {
  agendado: "bg-blue-500",
  confirmado: "bg-green-500",
  realizado: "bg-purple-500",
  cancelado: "bg-red-500",
  remarcado: "bg-amber-500",
};

const priorityColors: Record<string, string> = {
  normal: "bg-blue-500",
  urgente: "bg-amber-500",
  emergência: "bg-red-500",
};

// Generate time slots for scheduling
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour.toString().padStart(2, "0");
      const minuteStr = minute.toString().padStart(2, "0");
      slots.push(`${hourStr}:${minuteStr}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Generate days for the week view
const generateWeekDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    days.push({
      date: day,
      dayOfWeek: day.toLocaleDateString('pt-BR', { weekday: 'long' }),
      dayOfMonth: day.getDate(),
      month: day.toLocaleDateString('pt-BR', { month: 'short' }),
    });
  }
  
  return days;
};

const weekDays = generateWeekDays();

const AgendamentosMedicos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  // Filter appointments based on the search term, selected doctor, and date
  const filteredAppointments = mockAppointments.filter((appointment) => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDoctor = selectedDoctor ? appointment.doctorId === selectedDoctor : true;
    const matchesDate = selectedDate ? appointment.date === selectedDate : true;
    
    return matchesSearch && matchesDoctor && matchesDate;
  });

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Agendamentos Médicos</h1>
          <Button>
            <Calendar className="mr-2 h-4 w-4" /> Novo Agendamento
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calendário de Consultas</CardTitle>
            <CardDescription>
              Visualize e gerencie os agendamentos médicos
            </CardDescription>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por paciente..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Médico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os médicos</SelectItem>
                  {mockDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-[180px]"
              />
              
              <div className="flex rounded-md shadow-sm">
                <Button
                  variant={viewMode === "day" ? "default" : "outline"}
                  onClick={() => setViewMode("day")}
                  className="rounded-l-md rounded-r-none"
                >
                  Dia
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  onClick={() => setViewMode("week")}
                  className="rounded-none"
                >
                  Semana
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  onClick={() => setViewMode("month")}
                  className="rounded-r-md rounded-l-none"
                >
                  Mês
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {viewMode === "day" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {selectedDate 
                      ? new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm">
                      Hoje
                    </Button>
                    <Button variant="outline" size="sm">
                      Próximo
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Horário</TableHead>
                        {!selectedDoctor && mockDoctors.slice(0, 3).map((doctor) => (
                          <TableHead key={doctor.id}>{doctor.name}</TableHead>
                        ))}
                        {selectedDoctor && (
                          <TableHead>
                            {mockDoctors.find(d => d.id === selectedDoctor)?.name || "Médico"}
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlots.map((timeSlot) => (
                        <TableRow key={timeSlot}>
                          <TableCell className="font-medium">{timeSlot}</TableCell>
                          
                          {!selectedDoctor && mockDoctors.slice(0, 3).map((doctor) => {
                            const appointment = filteredAppointments.find(
                              (a) => a.doctorId === doctor.id && a.time === timeSlot
                            );
                            
                            return (
                              <TableCell key={doctor.id}>
                                {appointment ? (
                                  <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30">
                                    <div className="font-medium">{appointment.patientName}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {appointment.specialty}
                                    </div>
                                    <Badge variant="secondary" className={`${statusColors[appointment.status]} text-white mt-1`}>
                                      {appointment.status}
                                    </Badge>
                                  </div>
                                ) : null}
                              </TableCell>
                            );
                          })}
                          
                          {selectedDoctor && (
                            <TableCell>
                              {filteredAppointments.find(
                                (a) => a.doctorId === selectedDoctor && a.time === timeSlot
                              ) ? (
                                <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30">
                                  <div className="font-medium">
                                    {filteredAppointments.find((a) => a.doctorId === selectedDoctor && a.time === timeSlot)?.patientName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {filteredAppointments.find((a) => a.doctorId === selectedDoctor && a.time === timeSlot)?.specialty}
                                  </div>
                                </div>
                              ) : null}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {viewMode === "week" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Semana de {weekDays[0].dayOfMonth} {weekDays[0].month} a {weekDays[6].dayOfMonth} {weekDays[6].month}
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm">
                      Hoje
                    </Button>
                    <Button variant="outline" size="sm">
                      Próximo
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Horário</TableHead>
                        {weekDays.map((day) => (
                          <TableHead key={day.dayOfMonth}>
                            <div className="text-center">
                              <div>{day.dayOfWeek.charAt(0).toUpperCase() + day.dayOfWeek.slice(1, 3)}</div>
                              <div>{day.dayOfMonth}</div>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlots.filter((_, index) => index % 4 === 0).map((timeSlot) => (
                        <TableRow key={timeSlot}>
                          <TableCell className="font-medium">{timeSlot}</TableCell>
                          {weekDays.map((day) => {
                            const dateStr = day.date.toISOString().split('T')[0];
                            const appointment = filteredAppointments.find(
                              (a) => a.date === dateStr && a.time === timeSlot
                            );
                            
                            return (
                              <TableCell key={`${dateStr}-${timeSlot}`} className="min-h-[60px]">
                                {appointment ? (
                                  <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30">
                                    <div className="font-medium">{appointment.patientName}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {appointment.doctorName}
                                    </div>
                                  </div>
                                ) : null}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {viewMode === "month" && (
              <div className="h-[500px] flex items-center justify-center">
                <p className="text-muted-foreground">
                  [Aqui será exibida a visualização mensal do calendário]
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>
              Lista de consultas agendadas para os próximos dias
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Nenhum agendamento encontrado com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            {appointment.patientName}
                          </div>
                        </TableCell>
                        <TableCell>{appointment.doctorName}</TableCell>
                        <TableCell>{appointment.specialty}</TableCell>
                        <TableCell>{new Date(appointment.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${statusColors[appointment.status]} text-white`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
};

export default AgendamentosMedicos;
