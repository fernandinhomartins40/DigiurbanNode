
import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye, FileText, Building, Calendar, MapPin, User } from "lucide-react";
import { ProjetoUrbano } from "@/types/planejamento-urbano";

const AprovacaoProjetos: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");

  // Mock data
  const projetos: ProjetoUrbano[] = [
    {
      id: "1",
      numeroProtocolo: "PRJ-2024-001",
      requerente: {
        nome: "Construtora ABC",
        cpfCnpj: "12.345.678/0001-90",
        telefone: "(11) 3333-3333",
        email: "contato@construtoraabc.com",
        endereco: "Av. Principal, 456"
      },
      tipoProjeto: "residencial",
      categoria: "construcao_nova",
      descricao: "Edifício residencial de 12 andares",
      localizacao: {
        endereco: "Rua das Palmeiras, 789",
        lote: "15",
        quadra: "C",
        bairro: "Centro",
        coordenadas: { latitude: -23.5505, longitude: -46.6333 },
        area: 1200
      },
      status: "em_analise",
      dataProtocolo: "2024-01-10",
      dataAnalise: "2024-01-12",
      responsavelAnalise: "Eng. Carlos Lima",
      documentos: [
        {
          tipo: "Projeto Arquitetônico",
          nome: "projeto_arquitetonico.pdf",
          url: "#",
          dataUpload: "2024-01-10",
          status: "aprovado"
        },
        {
          tipo: "Memorial Descritivo",
          nome: "memorial.pdf",
          url: "#",
          dataUpload: "2024-01-10",
          status: "pendente"
        }
      ],
      observacoes: "Projeto em análise técnica",
      historico: []
    },
    {
      id: "2",
      numeroProtocolo: "PRJ-2024-002",
      requerente: {
        nome: "João Construtor",
        cpfCnpj: "123.456.789-00",
        telefone: "(11) 4444-4444",
        email: "joao@email.com",
        endereco: "Rua B, 123"
      },
      tipoProjeto: "comercial",
      categoria: "reforma",
      descricao: "Reforma de loja comercial",
      localizacao: {
        endereco: "Av. Comercial, 321",
        lote: "8",
        quadra: "A",
        bairro: "Centro",
        coordenadas: { latitude: -23.5515, longitude: -46.6343 },
        area: 200
      },
      status: "aprovado",
      dataProtocolo: "2024-01-05",
      dataAnalise: "2024-01-08",
      dataAprovacao: "2024-01-15",
      responsavelAnalise: "Arq. Ana Silva",
      documentos: [],
      observacoes: "Projeto aprovado com restrições",
      condicoes: ["Manter recuo frontal de 3m", "Respeitar gabarito máximo"],
      historico: []
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "protocolado": return "bg-blue-100 text-blue-800";
      case "em_analise": return "bg-yellow-100 text-yellow-800";
      case "aprovado": return "bg-green-100 text-green-800";
      case "negado": return "bg-red-100 text-red-800";
      case "pendente_correcoes": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "residencial": return "bg-blue-100 text-blue-800";
      case "comercial": return "bg-green-100 text-green-800";
      case "industrial": return "bg-purple-100 text-purple-800";
      case "misto": return "bg-orange-100 text-orange-800";
      case "publico": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjetos = projetos.filter(projeto => {
    const matchesSearch = projeto.numeroProtocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.requerente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "todos" || projeto.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Aprovação de Projetos</h1>
            <p className="text-gray-600">Gerencie a aprovação de projetos urbanos</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Novo Projeto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requerente">Requerente</Label>
                    <Input id="requerente" placeholder="Nome ou razão social" />
                  </div>
                  <div>
                    <Label htmlFor="documento">CPF/CNPJ</Label>
                    <Input id="documento" placeholder="000.000.000-00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipoProjeto">Tipo de Projeto</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residencial">Residencial</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="misto">Misto</SelectItem>
                        <SelectItem value="publico">Público</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="construcao_nova">Construção Nova</SelectItem>
                        <SelectItem value="reforma">Reforma</SelectItem>
                        <SelectItem value="ampliacao">Ampliação</SelectItem>
                        <SelectItem value="demolicao">Demolição</SelectItem>
                        <SelectItem value="regularizacao">Regularização</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço do Projeto</Label>
                  <Input id="endereco" placeholder="Endereço completo" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="lote">Lote</Label>
                    <Input id="lote" placeholder="Número do lote" />
                  </div>
                  <div>
                    <Label htmlFor="quadra">Quadra</Label>
                    <Input id="quadra" placeholder="Quadra" />
                  </div>
                  <div>
                    <Label htmlFor="area">Área (m²)</Label>
                    <Input id="area" type="number" placeholder="0" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="descricaoProjeto">Descrição do Projeto</Label>
                  <Textarea id="descricaoProjeto" placeholder="Descreva o projeto" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Protocolar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por protocolo, requerente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="protocolado">Protocolado</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="negado">Negado</SelectItem>
              <SelectItem value="pendente_correcoes">Pendente Correções</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Projetos</TabsTrigger>
            <TabsTrigger value="analise">Em Análise</TabsTrigger>
            <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
          </TabsList>

          <TabsContent value="lista">
            <div className="grid gap-4">
              {filteredProjetos.map((projeto) => (
                <Card key={projeto.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{projeto.numeroProtocolo}</CardTitle>
                        <Badge className={getStatusColor(projeto.status)}>
                          {projeto.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getTipoColor(projeto.tipoProjeto)}>
                          {projeto.tipoProjeto}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Analisar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="mr-2 h-4 w-4" />
                          {projeto.requerente.nome}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="mr-2 h-4 w-4" />
                          {projeto.categoria.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {projeto.localizacao.endereco}
                        </div>
                        <div className="text-sm text-gray-600">
                          Área: {projeto.localizacao.area}m²
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          Protocolado: {new Date(projeto.dataProtocolo).toLocaleDateString()}
                        </div>
                        {projeto.responsavelAnalise && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="mr-2 h-4 w-4" />
                            Analista: {projeto.responsavelAnalise}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-700">{projeto.descricao}</p>
                    {projeto.condicoes && projeto.condicoes.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900">Condições:</h4>
                        <ul className="mt-1 text-sm text-gray-600">
                          {projeto.condicoes.map((condicao, index) => (
                            <li key={index}>• {condicao}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-3 flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {projeto.documentos.length} documento(s)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analise">
            <div className="grid gap-4">
              {filteredProjetos
                .filter(p => p.status === "em_analise")
                .map((projeto) => (
                  <Card key={projeto.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{projeto.numeroProtocolo}</span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Solicitar Correções
                          </Button>
                          <Button size="sm" variant="outline">
                            Negar
                          </Button>
                          <Button size="sm">
                            Aprovar
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Requerente:</h4>
                          <p className="text-sm text-gray-600">{projeto.requerente.nome}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Descrição:</h4>
                          <p className="text-sm text-gray-600">{projeto.descricao}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Documentos:</h4>
                          <div className="space-y-2">
                            {projeto.documentos.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm">{doc.nome}</span>
                                <Badge className={doc.status === "aprovado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                  {doc.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="aprovados">
            <div className="grid gap-4">
              {filteredProjetos
                .filter(p => p.status === "aprovado")
                .map((projeto) => (
                  <Card key={projeto.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{projeto.numeroProtocolo}</CardTitle>
                        <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm"><strong>Requerente:</strong> {projeto.requerente.nome}</p>
                          <p className="text-sm"><strong>Tipo:</strong> {projeto.tipoProjeto}</p>
                          <p className="text-sm"><strong>Data de Aprovação:</strong> {projeto.dataAprovacao ? new Date(projeto.dataAprovacao).toLocaleDateString() : '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm"><strong>Localização:</strong> {projeto.localizacao.endereco}</p>
                          <p className="text-sm"><strong>Área:</strong> {projeto.localizacao.area}m²</p>
                          <p className="text-sm"><strong>Analista:</strong> {projeto.responsavelAnalise}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default AprovacaoProjetos;
