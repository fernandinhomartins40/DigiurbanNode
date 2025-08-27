
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Search, Users, Activity, Heart } from "lucide-react";

// Define the HealthCampaign type locally since we can't modify the types file
type HealthCampaign = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  targetAudience: string;
  location: string;
  status: "planejada" | "em andamento" | "concluída" | "cancelada";
  coverageGoal: number;
  currentCoverage: number;
};

// Mock data
const mockCampaigns: HealthCampaign[] = [
  {
    id: "1",
    title: "Vacinação Contra Gripe 2025",
    description: "Campanha anual de vacinação contra o vírus Influenza para idosos e grupos de risco",
    startDate: "2025-04-15",
    endDate: "2025-05-31",
    targetAudience: "Idosos, gestantes, crianças até 6 anos e profissionais de saúde",
    location: "Todas as UBSs do município",
    status: "planejada",
    coverageGoal: 85,
    currentCoverage: 0
  },
  {
    id: "2",
    title: "Hiperdia - Atenção à Hipertensão e Diabetes",
    description: "Campanha de conscientização e prevenção da hipertensão e diabetes",
    startDate: "2025-03-10",
    endDate: "2025-06-15",
    targetAudience: "População adulta acima de 40 anos",
    location: "UBS Central e unidades móveis",
    status: "em andamento",
    coverageGoal: 60,
    currentCoverage: 32
  },
  {
    id: "3",
    title: "Saúde Bucal nas Escolas",
    description: "Programa de educação e prevenção em saúde bucal para crianças do ensino fundamental",
    startDate: "2025-02-10",
    endDate: "2025-11-30",
    targetAudience: "Estudantes de 6 a 12 anos da rede municipal",
    location: "Escolas municipais",
    status: "em andamento",
    coverageGoal: 90,
    currentCoverage: 45
  },
  {
    id: "4",
    title: "Prevenção ao Câncer de Mama",
    description: "Campanha de conscientização e exames preventivos contra o câncer de mama",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    targetAudience: "Mulheres acima de 40 anos",
    location: "Unidades de saúde e centros comunitários",
    status: "planejada",
    coverageGoal: 70,
    currentCoverage: 0
  },
  {
    id: "5",
    title: "Vacinação contra HPV",
    description: "Campanha de vacinação contra o HPV para adolescentes",
    startDate: "2025-03-15",
    endDate: "2025-12-15",
    targetAudience: "Adolescentes de 9 a 14 anos",
    location: "Escolas e unidades de saúde",
    status: "em andamento",
    coverageGoal: 80,
    currentCoverage: 35
  },
  {
    id: "6",
    title: "Combate à Dengue",
    description: "Campanha de prevenção e combate à proliferação do mosquito Aedes aegypti",
    startDate: "2025-01-10",
    endDate: "2025-05-31",
    targetAudience: "População geral",
    location: "Todo o município",
    status: "concluída",
    coverageGoal: 100,
    currentCoverage: 92
  }
];

const statusColors: Record<string, string> = {
  "planejada": "bg-blue-500",
  "em andamento": "bg-green-500",
  "concluída": "bg-purple-500",
  "cancelada": "bg-red-500",
};

const CampanhasSaude = () => {
  console.log("CampanhasSaude component rendering");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter campaigns based on search term and status filter
  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch = 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalCampaigns = mockCampaigns.length;
  const plannedCampaigns = mockCampaigns.filter(c => c.status === "planejada").length;
  const ongoingCampaigns = mockCampaigns.filter(c => c.status === "em andamento").length;
  const completedCampaigns = mockCampaigns.filter(c => c.status === "concluída").length;

  // Function to calculate progress percentage
  const calculateProgress = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Campanhas de Saúde</h1>
          <Button>
            <Calendar className="mr-2 h-4 w-4" /> Nova Campanha
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle>Total de Campanhas</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{totalCampaigns}</div>
              <p className="text-sm text-muted-foreground mt-2">Campanhas registradas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
              <CardTitle>Planejadas</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{plannedCampaigns}</div>
              <p className="text-sm text-muted-foreground mt-2">Campanhas em planejamento</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle>Em Andamento</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{ongoingCampaigns}</div>
              <p className="text-sm text-muted-foreground mt-2">Campanhas ativas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
              <CardTitle>Concluídas</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{completedCampaigns}</div>
              <p className="text-sm text-muted-foreground mt-2">Campanhas finalizadas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="todas">
          <TabsList className="grid grid-cols-3 mb-4 w-[400px]">
            <TabsTrigger value="todas">Todas as Campanhas</TabsTrigger>
            <TabsTrigger value="ativas">Em Andamento</TabsTrigger>
            <TabsTrigger value="analise">Análise de Resultados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todas">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas de Saúde</CardTitle>
                <CardDescription>
                  Visualize e gerencie todas as campanhas de saúde do município
                </CardDescription>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar campanha..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="planejada">Planejada</SelectItem>
                      <SelectItem value="em andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluída">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Público Alvo</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Cobertura</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhuma campanha encontrada com os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCampaigns.map((campaign) => (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{campaign.title}</span>
                                <span className="text-xs text-muted-foreground">{campaign.description.substring(0, 40)}...</span>
                              </div>
                            </TableCell>
                            <TableCell>{campaign.targetAudience}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>Início: {new Date(campaign.startDate).toLocaleDateString('pt-BR')}</span>
                                <span>Fim: {new Date(campaign.endDate).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </TableCell>
                            <TableCell>{campaign.location}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Meta: {campaign.coverageGoal}%</span>
                                <span className="text-xs text-muted-foreground">Atual: {campaign.currentCoverage}%</span>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${calculateProgress(campaign.currentCoverage, campaign.coverageGoal)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`${statusColors[campaign.status]} text-white`}>
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4" />
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
              
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Exibindo {filteredCampaigns.length} de {mockCampaigns.length} campanhas
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Anterior</Button>
                  <Button variant="outline" size="sm">Próximo</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="ativas">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas em Andamento</CardTitle>
                <CardDescription>
                  Campanhas ativas que estão sendo realizadas atualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockCampaigns
                    .filter(campaign => campaign.status === "em andamento")
                    .map(campaign => (
                      <Card key={campaign.id} className="overflow-hidden">
                        <CardHeader className="bg-green-50 dark:bg-green-900/20 pb-2">
                          <div className="flex justify-between">
                            <div>
                              <CardTitle>{campaign.title}</CardTitle>
                              <CardDescription>
                                {campaign.description}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              Em Andamento
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Informações da Campanha</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Público Alvo:</span>
                                  <span className="text-sm">{campaign.targetAudience}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Local:</span>
                                  <span className="text-sm">{campaign.location}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Período:</span>
                                  <span className="text-sm">
                                    {new Date(campaign.startDate).toLocaleDateString('pt-BR')} a {new Date(campaign.endDate).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm mb-2">Progresso</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Meta de Cobertura:</span>
                                  <span className="text-sm">{campaign.coverageGoal}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Cobertura Atual:</span>
                                  <span className="text-sm">{campaign.currentCoverage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
                                  <div 
                                    className="bg-green-600 h-4 rounded-full text-xs flex items-center justify-center text-white" 
                                    style={{ width: `${calculateProgress(campaign.currentCoverage, campaign.coverageGoal)}%` }}
                                  >
                                    {campaign.currentCoverage}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline">Ver Detalhes</Button>
                          <Button>Atualizar Progresso</Button>
                        </CardFooter>
                      </Card>
                    ))}
                    
                  {mockCampaigns.filter(campaign => campaign.status === "em andamento").length === 0 && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium">Nenhuma campanha em andamento</h3>
                      <p className="text-muted-foreground mt-2">
                        Não há campanhas ativas no momento.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analise">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Resultados</CardTitle>
                <CardDescription>
                  Visualize métricas e resultados das campanhas de saúde
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <Calendar size={48} className="text-blue-500" />
                  <Users size={48} className="text-green-500" />
                  <Activity size={48} className="text-amber-500" />
                  <Heart size={48} className="text-red-500" />
                </div>
                <p className="text-muted-foreground text-center max-w-lg">
                  Aqui serão exibidos gráficos e relatórios detalhados sobre o desempenho
                  e impacto das campanhas de saúde realizadas no município.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default CampanhasSaude;
