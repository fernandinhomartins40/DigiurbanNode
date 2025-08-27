import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, MessageSquare, Calendar, Activity, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  icon: React.ReactNode;
}

const PreferenciasNotificacao = () => {
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "new-messages",
      title: "Novas Mensagens",
      description: "Notificações sobre novas mensagens recebidas no sistema",
      email: true,
      push: true,
      sms: false,
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: "events",
      title: "Eventos e Lembretes",
      description: "Lembretes sobre eventos, reuniões e prazos",
      email: true,
      push: true,
      sms: true,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: "system-alerts",
      title: "Alertas do Sistema",
      description: "Notificações importantes sobre o funcionamento do sistema",
      email: true,
      push: true,
      sms: false,
      icon: <Activity className="h-5 w-5" />,
    },
    {
      id: "document-updates",
      title: "Atualizações de Documentos",
      description: "Notificações quando documentos forem atualizados ou compartilhados",
      email: true,
      push: false,
      sms: false,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "status-changes",
      title: "Alterações de Status",
      description: "Notificações sobre mudanças de status em protocolos e solicitações",
      email: true,
      push: true,
      sms: false,
      icon: <Bell className="h-5 w-5" />,
    },
  ]);

  const [emailFrequency, setEmailFrequency] = useState("immediate");
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");

  const updatePreference = (id: string, channel: "email" | "push" | "sms", value: boolean) => {
    setPreferences(
      preferences.map((pref) =>
        pref.id === id ? { ...pref, [channel]: value } : pref
      )
    );
  };

  const handleSave = () => {
    toast({
      title: "Preferências atualizadas",
      description: "Suas preferências de notificação foram salvas com sucesso.",
    });
    console.log({
      preferences,
      emailFrequency,
      quietHours: {
        enabled: quietHoursEnabled,
        start: quietHoursStart,
        end: quietHoursEnd,
      },
    });
  };

  return (
    
      <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Preferências de Notificação</h1>
          <p className="text-muted-foreground">
            Gerencie como e quando você deseja receber notificações.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" /> Canais de Notificação
              </CardTitle>
              <CardDescription>
                Configure quais tipos de notificação você deseja receber por cada canal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium py-2 w-[40%]">Tipo de Notificação</th>
                        <th className="text-center font-medium py-2">
                          <div className="flex justify-center items-center gap-1">
                            <Mail className="h-4 w-4" /> Email
                          </div>
                        </th>
                        <th className="text-center font-medium py-2">
                          <div className="flex justify-center items-center gap-1">
                            <Bell className="h-4 w-4" /> Push
                          </div>
                        </th>
                        <th className="text-center font-medium py-2">
                          <div className="flex justify-center items-center gap-1">
                            <MessageSquare className="h-4 w-4" /> SMS
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {preferences.map((pref) => (
                        <tr key={pref.id} className="border-b">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {pref.icon}
                              <div>
                                <p className="font-medium">{pref.title}</p>
                                <p className="text-sm text-muted-foreground">{pref.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={pref.email}
                                onCheckedChange={(checked) =>
                                  updatePreference(pref.id, "email", checked)
                                }
                              />
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={pref.push}
                                onCheckedChange={(checked) =>
                                  updatePreference(pref.id, "push", checked)
                                }
                              />
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={pref.sms}
                                onCheckedChange={(checked) =>
                                  updatePreference(pref.id, "sms", checked)
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" /> Configurações de Email
              </CardTitle>
              <CardDescription>
                Escolha como deseja receber suas notificações por email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="email-frequency">Frequência de emails</Label>
                  <Select 
                    value={emailFrequency} 
                    onValueChange={setEmailFrequency}
                  >
                    <SelectTrigger id="email-frequency" className="w-full">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Imediato (email para cada notificação)</SelectItem>
                      <SelectItem value="digest">Resumo diário (uma vez ao dia)</SelectItem>
                      <SelectItem value="weekly">Resumo semanal (uma vez por semana)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horário de Silêncio</CardTitle>
              <CardDescription>
                Configure períodos em que você não deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours">Ativar horário de silêncio</Label>
                  <Switch 
                    id="quiet-hours" 
                    checked={quietHoursEnabled}
                    onCheckedChange={setQuietHoursEnabled}
                  />
                </div>
                
                {quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiet-hours-start">Início</Label>
                      <Input
                        id="quiet-hours-start"
                        type="time"
                        value={quietHoursStart}
                        onChange={(e) => setQuietHoursStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiet-hours-end">Fim</Label>
                      <Input
                        id="quiet-hours-end"
                        type="time"
                        value={quietHoursEnd}
                        onChange={(e) => setQuietHoursEnd(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar Preferências</Button>
          </div>
        </div>
      </div>
    
  );
};

export default PreferenciasNotificacao;
