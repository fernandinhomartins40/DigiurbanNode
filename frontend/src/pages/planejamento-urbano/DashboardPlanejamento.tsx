import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlanejamento } from "@/hooks/modules/usePlanejamento";
import { Building, FileCheck, Search, MapPin, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardPlanejamento() {
  const { projetos, alvaras, vistorias, consultasPublicas, zoneamento } = usePlanejamento();

  const projetosAtivos = projetos.data?.filter(p => p.status === 'aprovado').length || 0;
  const alvarasVigentes = alvaras.data?.filter(a => a.status === 'vigente').length || 0;
  const vistoriasPendentes = vistorias.data?.filter(v => v.status === 'agendada').length || 0;
  const consultasAndamento = consultasPublicas.data?.filter(c => c.status === 'andamento').length || 0;

  const cards = [
    {
      title: "Projetos Ativos",
      value: projetosAtivos,
      icon: Building,
      color: "text-blue-600"
    },
    {
      title: "Alvarás Vigentes",
      value: alvarasVigentes,
      icon: FileCheck,
      color: "text-green-600"
    },
    {
      title: "Vistorias Pendentes",
      value: vistoriasPendentes,
      icon: Search,
      color: "text-orange-600"
    },
    {
      title: "Consultas Públicas",
      value: consultasAndamento,
      icon: MapPin,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planejamento Urbano</h1>
        <p className="text-muted-foreground">
          Gestão de projetos urbanos, alvarás e consultas públicas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projetos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projetos.data?.slice(0, 5).map((projeto) => (
                <div key={projeto.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{projeto.nome}</p>
                    <p className="text-sm text-muted-foreground">{projeto.tipo}</p>
                  </div>
                  <Badge variant={
                    projeto.status === 'aprovado' ? 'default' :
                    projeto.status === 'analise' ? 'secondary' :
                    projeto.status === 'reprovado' ? 'destructive' : 'outline'
                  }>
                    {projeto.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vistorias Urgentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vistorias.data?.filter(v => v.status === 'agendada').slice(0, 5).map((vistoria) => (
                <div key={vistoria.id} className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-medium">{vistoria.tipo_vistoria}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(vistoria.data_agendamento).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}