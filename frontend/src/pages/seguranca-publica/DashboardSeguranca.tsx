import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeguranca } from "@/hooks/modules/useSeguranca";
import { Shield, AlertCircle, Users, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardSeguranca() {
  const { ocorrencias, guardas } = useSeguranca();

  const ocorrenciasRecentes = ocorrencias.data?.filter(o => {
    const dataOcorrencia = new Date(o.data_ocorrencia);
    const hoje = new Date();
    const diferenca = hoje.getTime() - dataOcorrencia.getTime();
    const dias = diferenca / (1000 * 3600 * 24);
    return dias <= 30;
  }).length || 0;

  const guardasAtivos = guardas.data?.filter(g => g.status === 'ativo').length || 0;
  const ocorrenciasInvestigacao = ocorrencias.data?.filter(o => o.status === 'investigacao').length || 0;
  const ocorrenciasResolvidas = ocorrencias.data?.filter(o => o.status === 'resolvida').length || 0;

  const cards = [
    {
      title: "Guardas Ativos",
      value: guardasAtivos,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Ocorrências (30 dias)",
      value: ocorrenciasRecentes,
      icon: FileText,
      color: "text-orange-600"
    },
    {
      title: "Em Investigação",
      value: ocorrenciasInvestigacao,
      icon: AlertCircle,
      color: "text-red-600"
    },
    {
      title: "Resolvidas",
      value: ocorrenciasResolvidas,
      icon: Shield,
      color: "text-green-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Segurança Pública</h1>
        <p className="text-muted-foreground">
          Gestão da Guarda Municipal e ocorrências de segurança
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
            <CardTitle>Ocorrências Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ocorrencias.data?.slice(0, 5).map((ocorrencia) => (
                <div key={ocorrencia.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{ocorrencia.tipo_ocorrencia}</p>
                    <p className="text-sm text-muted-foreground">
                      BO: {ocorrencia.numero_bo} - {new Date(ocorrencia.data_registro).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    ocorrencia.status === 'resolvida' ? 'default' :
                    ocorrencia.status === 'investigacao' ? 'secondary' :
                    ocorrencia.status === 'registrada' ? 'outline' : 'destructive'
                  }>
                    {ocorrencia.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Efetivo da Guarda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {guardas.data?.slice(0, 5).map((guarda) => (
                <div key={guarda.id} className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">{guarda.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">
                      {guarda.posto_graduacao} - {guarda.setor_atuacao}
                    </p>
                  </div>
                  <Badge variant={
                    guarda.situacao === 'ativo' ? 'default' : 'outline'
                  }>
                    {guarda.situacao}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}