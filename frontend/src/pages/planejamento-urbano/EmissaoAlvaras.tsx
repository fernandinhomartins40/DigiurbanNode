
import { FC, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye, FileText, DollarSign, Calendar, MapPin, User, AlertCircle } from "lucide-react";
import { AlvaraUrbano } from "@/types/planejamento-urbano";

const EmissaoAlvaras: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");

  // Mock data
  const alvaras: AlvaraUrbano[] = [
    {
      id: "1",
      numeroAlvara: "ALV-2024-001",
      tipoAlvara: "construcao",
      requerente: {
        nome: "Construtora XYZ",
        cpfCnpj: "98.765.432/0001-10",
        telefone: "(11) 5555-5555",
        email: "contato@xyz.com",
        endereco: "Rua Principal, 100"
      },
      empreendimento: {
        nome: "Edifício Solar",
        atividade: "Construção residencial",
        endereco: "Av. Central, 200",
        area: 1500,
        coordenadas: { latitude: -23.5505, longitude: -46.6333 }
      },
      status: "aprovado",
      dataEmissao: "2024-01-20",
      dataVencimento: "2025-01-20",
      dataSolicitacao: "2024-01-05",
      condicoes: [
        "Manter recuo frontal de 5m",
        "Instalar sistema de drenagem adequado",
        "Respeitar horário de obras: 7h às 17h"
      ],
      taxas: [
        { tipo: "Taxa de Licenciamento", valor: 1500, status: "pago" },
        { tipo: "Taxa de Vistoria", valor: 300, status: "pago" }
      ],
      documentos: [
        { tipo: "Projeto Aprovado", nome: "projeto_aprovado.pdf", url: "#", obrigatorio: true, status: "aprovado" },
        { tipo: "ART", nome: "art_responsavel.pdf", url: "#", obrigatorio: true, status: "aprovado" }
      ],
      responsavel: "Eng. Roberto Silva"
    },
    {
      id: "2",
      numeroAlvara: "ALV-2024-002",
      tipoAlvara: "funcionamento",
      requerente: {
        nome: "Loja do João",
        cpfCnpj: "12.345.678/0001-90",
        telefone: "(11) 6666-6666",
        email: "joao@loja.com",
        endereco: "Rua B, 50"
      },
      empreendimento: {
        nome: "Loja de Roupas",
        atividade: "Comércio varejista",
        endereco: "Rua Comercial, 123",
        area: 80,
        coordenadas: { latitude: -23.5515, longitude: -46.6343 }
      },
      status: "em_analise",
      dataSolicitacao: "2024-01-18",
      condicoes: [],
      taxas: [
        { tipo: "Taxa de Funcionamento", valor: 200, status: "pendente" }
      ],
      documentos: [
        { tipo: "Alvará de Construção", nome: "alvara_construcao.pdf", url: "#", obrigatorio: true, status: "pendente" },
        { tipo: "Laudo Bombeiros", nome: "laudo_bombeiros.pdf", url: "#", obrigatorio: true, status: "rejeitado" }
      ],
      responsavel: "Arq. Maria Santos"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "solicitado": return "bg-blue-100 text-blue-800";
      case "em_analise": return "bg-yellow-100 text-yellow-800";
      case "aprovado": return "bg-green-100 text-green-800";
      case "negado": return "bg-red-100 text-red-800";
      case "vencido": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "construcao": return "bg-blue-100 text-blue-800";
      case "funcionamento": return "bg-green-100 text-green-800";
      case "demolicao": return "bg-red-100 text-red-800";
      case "ocupacao": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTaxaStatusColor = (status: string) => {
    switch (status) {
      case "pago": return "bg-green-100 text-green-800";
      case "pendente": return "bg-yellow-100 text-yellow-800";
      case "isento": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAlvaras = alvaras.filter(alvara => {
    const matchesSearch = alvara.numeroAlvara.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alvara.requerente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alvara.empreendimento.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "todos" || alvara.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Emissão de Alvarás</h1>
            <p className="text-gray-600">Gerencie alvarás de construção, funcionamento e outros</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Alvará
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Solicitar Novo Alvará</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipoAlvara">Tipo de Alvará</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="construcao">Construção</SelectItem>
                        <SelectItem value="funcionamento">Funcionamento</SelectItem>
                        <SelectItem value="demolicao">Demolição</SelectItem>
                        <SelectItem value="ocupacao">Ocupação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="requerenteNome">Requerente</Label>
                    <Input id="requerenteNome" placeholder="Nome ou razão social" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="documento">CPF/CNPJ</Label>
                    <Input id="documento" placeholder="000.000.000-00" />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nomeEmpreendimento">Nome do Empreendimento</Label>
                  <Input id="nomeEmpreendimento" placeholder="Nome do estabelecimento/obra" />
                </div>
                <div>
                  <Label htmlFor="atividadeEmpreendimento">Atividade</Label>
                  <Input id="atividadeEmpreendimento" placeholder="Descrição da atividade" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="enderecoEmpreendimento">Endereço do Empreendimento</Label>
                    <Input id="enderecoEmpreendimento" placeholder="Endereço completo" />
                  </div>
                  <div>
                    <Label htmlFor="areaEmpreendimento">Área (m²)</Label>
                    <Input id="areaEmpreendimento" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Solicitar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por número, requerente ou empreendimento..."
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
              <SelectItem value="solicitado">Solicitado</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="negado">Negado</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Alvarás</TabsTrigger>
            <TabsTrigger value="vencimentos">Vencimentos</TabsTrigger>
            <TabsTrigger value="taxas">Controle de Taxas</TabsTrigger>
          </TabsList>

          <TabsContent value="lista">
            <div className="grid gap-4">
              {filteredAlvaras.map((alvara) => (
                <Card key={alvara.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{alvara.numeroAlvara}</CardTitle>
                        <Badge className={getStatusColor(alvara.status)}>
                          {alvara.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getTipoColor(alvara.tipoAlvara)}>
                          {alvara.tipoAlvara}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="mr-2 h-4 w-4" />
                          {alvara.requerente.nome}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="mr-2 h-4 w-4" />
                          {alvara.empreendimento.nome}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {alvara.empreendimento.endereco}
                        </div>
                        <div className="text-sm text-gray-600">
                          Área: {alvara.empreendimento.area}m²
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          Solicitado: {new Date(alvara.dataSolicitacao).toLocaleDateString()}
                        </div>
                        {alvara.dataVencimento && (
                          <div className="flex items-center text-sm text-gray-600">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Vence: {new Date(alvara.dataVencimento).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {alvara.condicoes.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900">Condições:</h4>
                        <ul className="mt-1 text-sm text-gray-600">
                          {alvara.condicoes.slice(0, 2).map((condicao, index) => (
                            <li key={index}>• {condicao}</li>
                          ))}
                          {alvara.condicoes.length > 2 && (
                            <li>• ... e mais {alvara.condicoes.length - 2} condição(ões)</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {alvara.documentos.length} documento(s)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {alvara.taxas.filter(t => t.status === "pago").length}/{alvara.taxas.length} taxa(s) paga(s)
                          </span>
                        </div>
                      </div>
                      {alvara.responsavel && (
                        <span className="text-sm text-gray-600">
                          Responsável: {alvara.responsavel}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vencimentos">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                    Alvarás Próximos do Vencimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alvaras
                      .filter(a => a.status === "aprovado" && a.dataVencimento)
                      .map((alvara) => (
                        <div key={alvara.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div>
                            <div className="font-medium">{alvara.numeroAlvara}</div>
                            <div className="text-sm text-gray-600">{alvara.requerente.nome}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Vence: {alvara.dataVencimento ? new Date(alvara.dataVencimento).toLocaleDateString() : '-'}
                            </div>
                            <Button size="sm" variant="outline" className="mt-1">
                              Renovar
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="taxas">
            <div className="space-y-4">
              {alvaras.map((alvara) => (
                <Card key={alvara.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{alvara.numeroAlvara}</CardTitle>
                      <span className="text-sm text-gray-600">{alvara.requerente.nome}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {alvara.taxas.map((taxa, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{taxa.tipo}</div>
                            <div className="text-sm text-gray-600">
                              R$ {taxa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <Badge className={getTaxaStatusColor(taxa.status)}>
                            {taxa.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total:</span>
                        <span className="font-medium">
                          R$ {alvara.taxas.reduce((sum, taxa) => sum + taxa.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
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

export default EmissaoAlvaras;
