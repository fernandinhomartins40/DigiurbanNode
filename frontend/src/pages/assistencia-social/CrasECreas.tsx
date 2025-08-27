
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UnidadeCRAS, Funcionario } from "@/types/assistencia-social";
import { Search, MapPin, Phone, Mail, Users, Clock, Building, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockUnidadesCRAS: UnidadeCRAS[] = [
  {
    id: "1",
    nome: "CRAS Central",
    endereco: "Rua das Flores, 123 - Centro",
    telefone: "(11) 3456-7890",
    email: "cras.central@municipio.gov.br",
    coordenador: "Maria Oliveira",
    horarioFuncionamento: "Segunda a Sexta, 8h às 17h",
    servicosOferecidos: [
      "PAIF - Proteção e Atendimento Integral à Família",
      "Serviço de Convivência e Fortalecimento de Vínculos",
      "Cadastro Único",
      "Benefícios Eventuais"
    ],
    areaAbrangencia: ["Centro", "Jardim Europa", "Vila Nova"],
    equipe: [
      {
        id: "101",
        nome: "Maria Oliveira",
        cargo: "Coordenadora",
        registro: "AS12345",
        contato: "(11) 97890-1234"
      },
      {
        id: "102",
        nome: "João Silva",
        cargo: "Assistente Social",
        registro: "AS23456",
        contato: "(11) 98765-4321"
      },
      {
        id: "103",
        nome: "Ana Souza",
        cargo: "Psicóloga",
        registro: "PS34567",
        contato: "(11) 91234-5678"
      }
    ]
  },
  {
    id: "2",
    nome: "CRAS Norte",
    endereco: "Av. dos Ipês, 456 - Jardim das Flores",
    telefone: "(11) 3456-7891",
    email: "cras.norte@municipio.gov.br",
    coordenador: "Carlos Mendes",
    horarioFuncionamento: "Segunda a Sexta, 8h às 17h",
    servicosOferecidos: [
      "PAIF - Proteção e Atendimento Integral à Família",
      "Serviço de Convivência e Fortalecimento de Vínculos",
      "Cadastro Único",
      "Benefícios Eventuais"
    ],
    areaAbrangencia: ["Jardim das Flores", "Vila São João", "Recanto Verde"],
    equipe: [
      {
        id: "201",
        nome: "Carlos Mendes",
        cargo: "Coordenador",
        registro: "AS45678",
        contato: "(11) 97890-5678"
      },
      {
        id: "202",
        nome: "Paula Fernandes",
        cargo: "Assistente Social",
        registro: "AS56789",
        contato: "(11) 98765-9012"
      }
    ]
  },
  {
    id: "3",
    nome: "CRAS Sul",
    endereco: "Rua dos Pinheiros, 789 - Jardim América",
    telefone: "(11) 3456-7892",
    email: "cras.sul@municipio.gov.br",
    coordenador: "Roberto Alves",
    horarioFuncionamento: "Segunda a Sexta, 8h às 17h",
    servicosOferecidos: [
      "PAIF - Proteção e Atendimento Integral à Família",
      "Serviço de Convivência e Fortalecimento de Vínculos",
      "Cadastro Único",
      "Benefícios Eventuais"
    ],
    areaAbrangencia: ["Jardim América", "Vila das Flores", "Parque das Árvores"],
    equipe: [
      {
        id: "301",
        nome: "Roberto Alves",
        cargo: "Coordenador",
        registro: "AS67890",
        contato: "(11) 97890-3456"
      },
      {
        id: "302",
        nome: "Carla Santos",
        cargo: "Assistente Social",
        registro: "AS78901",
        contato: "(11) 98765-0123"
      },
      {
        id: "303",
        nome: "Marcos Lima",
        cargo: "Psicólogo",
        registro: "PS89012",
        contato: "(11) 91234-7890"
      }
    ]
  }
];

const mockUnidadesCREAS: UnidadeCRAS[] = [
  {
    id: "4",
    nome: "CREAS Municipal",
    endereco: "Av. Principal, 100 - Centro",
    telefone: "(11) 3456-7893",
    email: "creas@municipio.gov.br",
    coordenador: "Fernanda Oliveira",
    horarioFuncionamento: "Segunda a Sexta, 8h às 17h",
    servicosOferecidos: [
      "PAEFI - Proteção e Atendimento Especializado a Famílias e Indivíduos",
      "Serviço Especializado em Abordagem Social",
      "Medidas Socioeducativas em Meio Aberto",
      "Atendimento a Vítimas de Violência"
    ],
    areaAbrangencia: ["Todo o município"],
    equipe: [
      {
        id: "401",
        nome: "Fernanda Oliveira",
        cargo: "Coordenadora",
        registro: "AS90123",
        contato: "(11) 97890-9012"
      },
      {
        id: "402",
        nome: "Ricardo Pereira",
        cargo: "Assistente Social",
        registro: "AS01234",
        contato: "(11) 98765-1234"
      },
      {
        id: "403",
        nome: "Juliana Costa",
        cargo: "Psicóloga",
        registro: "PS12345",
        contato: "(11) 91234-2345"
      },
      {
        id: "404",
        nome: "Marcelo Santos",
        cargo: "Advogado",
        registro: "OAB23456",
        contato: "(11) 93456-7890"
      }
    ]
  }
];

export default function CrasECreas() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<UnidadeCRAS | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSearch = (unidades: UnidadeCRAS[]) => {
    if (!searchTerm) return unidades;
    
    return unidades.filter(
      (unidade) =>
        unidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unidade.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unidade.areaAbrangencia.some(area => 
          area.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  };

  const filteredCRAS = handleSearch(mockUnidadesCRAS);
  const filteredCREAS = handleSearch(mockUnidadesCREAS);

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">CRAS e CREAS</h1>
          <div className="flex items-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Unidade
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Unidade</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para cadastrar uma nova unidade de assistência social.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-center py-8 text-muted-foreground">
                    Formulário de cadastro será implementado em breve.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    setIsDialogOpen(false);
                    toast({
                      title: "Cadastro em desenvolvimento",
                      description: "O formulário de cadastro está em implementação."
                    });
                  }}>
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar unidades por nome, endereço ou área de abrangência..."
            className="pl-8 w-full md:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="cras" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cras">CRAS</TabsTrigger>
            <TabsTrigger value="creas">CREAS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cras" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCRAS.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  Nenhuma unidade CRAS encontrada com os critérios de busca.
                </div>
              ) : (
                filteredCRAS.map((unidade) => (
                  <Card key={unidade.id} className="overflow-hidden">
                    <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{unidade.nome}</CardTitle>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          CRAS
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {unidade.endereco}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {unidade.telefone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        {unidade.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        Coordenador: {unidade.coordenador}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        {unidade.horarioFuncionamento}
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-1">Área de Abrangência:</p>
                        <div className="flex flex-wrap gap-1">
                          {unidade.areaAbrangencia.map((area, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => setUnidadeSelecionada(unidade)}>
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({
                          title: "Edição de unidade",
                          description: `Edição da unidade ${unidade.nome} iniciada`
                        });
                      }}>
                        Editar
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="creas" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCREAS.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  Nenhuma unidade CREAS encontrada com os critérios de busca.
                </div>
              ) : (
                filteredCREAS.map((unidade) => (
                  <Card key={unidade.id} className="overflow-hidden">
                    <CardHeader className="bg-orange-50 dark:bg-orange-900/20 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{unidade.nome}</CardTitle>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                          CREAS
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {unidade.endereco}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {unidade.telefone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        {unidade.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        Coordenador: {unidade.coordenador}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        {unidade.horarioFuncionamento}
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-1">Serviços Oferecidos:</p>
                        <div className="flex flex-wrap gap-1">
                          {unidade.servicosOferecidos.slice(0, 2).map((servico, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                              {servico.length > 30 ? `${servico.substring(0, 30)}...` : servico}
                            </Badge>
                          ))}
                          {unidade.servicosOferecidos.length > 2 && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                              +{unidade.servicosOferecidos.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => setUnidadeSelecionada(unidade)}>
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({
                          title: "Edição de unidade",
                          description: `Edição da unidade ${unidade.nome} iniciada`
                        });
                      }}>
                        Editar
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {unidadeSelecionada && (
          <Dialog open={!!unidadeSelecionada} onOpenChange={() => setUnidadeSelecionada(null)}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{unidadeSelecionada.nome}</DialogTitle>
                  <Badge variant={unidadeSelecionada.id.startsWith("4") ? "outline" : "default"} 
                    className={
                      unidadeSelecionada.id.startsWith("4") 
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" 
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }
                  >
                    {unidadeSelecionada.id.startsWith("4") ? "CREAS" : "CRAS"}
                  </Badge>
                </div>
                <DialogDescription className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {unidadeSelecionada.endereco}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Informações de Contato</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {unidadeSelecionada.telefone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        {unidadeSelecionada.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        {unidadeSelecionada.horarioFuncionamento}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Serviços Oferecidos</h3>
                    <div className="mt-2 space-y-1">
                      {unidadeSelecionada.servicosOferecidos.map((servico, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></div>
                          {servico}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Área de Abrangência</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {unidadeSelecionada.areaAbrangencia.map((area, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Equipe Técnica</h3>
                  <div className="mt-2 space-y-3">
                    {unidadeSelecionada.equipe.map((funcionario, index) => (
                      <div key={funcionario.id} className={`${index > 0 ? "border-t pt-3" : ""}`}>
                        <div className="font-medium">{funcionario.nome}</div>
                        <div className="text-sm text-gray-500">{funcionario.cargo}</div>
                        <div className="text-sm flex mt-1">
                          <span className="text-gray-500 mr-2">Reg.: {funcionario.registro}</span>
                          <span className="text-gray-500">Tel.: {funcionario.contato}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setUnidadeSelecionada(null)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Edição de unidade",
                    description: `Edição da unidade ${unidadeSelecionada.nome} iniciada`
                  });
                  setUnidadeSelecionada(null);
                }}>
                  Editar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        <div className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Estatísticas de Atendimentos
              </CardTitle>
              <CardDescription>
                Resumo de atendimentos por unidade no último mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">CRAS Central</CardTitle>
                      <CardDescription>Atendimentos: Maio/2023</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-3xl font-bold">247</div>
                      <div className="text-sm text-green-600 dark:text-green-400">+12% em relação ao mês anterior</div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>PAIF: 124</div>
                        <div>Cadastro Único: 56</div>
                        <div>Benefícios: 45</div>
                        <div>Outros: 22</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">CRAS Norte</CardTitle>
                      <CardDescription>Atendimentos: Maio/2023</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-3xl font-bold">183</div>
                      <div className="text-sm text-red-600 dark:text-red-400">-5% em relação ao mês anterior</div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>PAIF: 92</div>
                        <div>Cadastro Único: 43</div>
                        <div>Benefícios: 38</div>
                        <div>Outros: 10</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">CREAS Municipal</CardTitle>
                      <CardDescription>Atendimentos: Maio/2023</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-3xl font-bold">118</div>
                      <div className="text-sm text-green-600 dark:text-green-400">+8% em relação ao mês anterior</div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>PAEFI: 64</div>
                        <div>MSE: 22</div>
                        <div>Violência: 28</div>
                        <div>Outros: 4</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Button variant="outline" className="w-full">
                  Ver Relatório Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    
  );
}
