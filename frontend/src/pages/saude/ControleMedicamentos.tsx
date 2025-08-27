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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { 
  AlertTriangle,
  Calendar,
  Package,
  Search,
  Pill,
  FileText,
  User,
} from "lucide-react";
import { Medication, MedicationDispensing } from "@/types/saude";

// Mock data
const mockMedications: Medication[] = [
  {
    id: "1",
    name: "Dipirona 500mg",
    description: "Analgésico e antipirético",
    category: "Analgésicos",
    stock: 320,
    unit: "comprimido",
    expirationDate: "2025-12-31",
    batchNumber: "LOT12345",
    minimumStock: 100,
  },
  {
    id: "2",
    name: "Amoxicilina 500mg",
    description: "Antibiótico de amplo espectro",
    category: "Antibióticos",
    stock: 85,
    unit: "cápsula",
    expirationDate: "2025-08-15",
    batchNumber: "LOT23456",
    minimumStock: 50,
  },
  {
    id: "3",
    name: "Losartana Potássica 50mg",
    description: "Anti-hipertensivo",
    category: "Anti-hipertensivos",
    stock: 240,
    unit: "comprimido",
    expirationDate: "2025-10-20",
    batchNumber: "LOT34567",
    minimumStock: 100,
  },
  {
    id: "4",
    name: "Salbutamol Spray 100mcg",
    description: "Broncodilatador",
    category: "Broncodilatadores",
    stock: 45,
    unit: "frasco",
    expirationDate: "2025-06-10",
    batchNumber: "LOT45678",
    minimumStock: 30,
  },
  {
    id: "5",
    name: "Omeprazol 20mg",
    description: "Inibidor da bomba de prótons",
    category: "Antiácidos",
    stock: 180,
    unit: "cápsula",
    expirationDate: "2025-09-05",
    batchNumber: "LOT56789",
    minimumStock: 80,
  },
  {
    id: "6",
    name: "Insulina NPH 100UI/ml",
    description: "Insulina de ação intermediária",
    category: "Antidiabéticos",
    stock: 25,
    unit: "frasco",
    expirationDate: "2025-07-22",
    batchNumber: "LOT67890",
    minimumStock: 20,
  },
  {
    id: "7",
    name: "Paracetamol 750mg",
    description: "Analgésico e antipirético",
    category: "Analgésicos",
    stock: 410,
    unit: "comprimido",
    expirationDate: "2026-01-15",
    batchNumber: "LOT78901",
    minimumStock: 150,
  },
  {
    id: "8",
    name: "Metformina 850mg",
    description: "Antidiabético oral",
    category: "Antidiabéticos",
    stock: 15,
    unit: "comprimido",
    expirationDate: "2025-05-30",
    batchNumber: "LOT89012",
    minimumStock: 100,
  },
];

const mockDispensings: MedicationDispensing[] = [
  {
    id: "1",
    medicationId: "1",
    medicationName: "Dipirona 500mg",
    patientId: "101",
    patientName: "Maria Silva",
    quantity: 20,
    date: "2025-05-18",
    prescribedBy: "Dr. Carlos Santos",
    dispensedBy: "Farmacêutico João",
  },
  {
    id: "2",
    medicationId: "2",
    medicationName: "Amoxicilina 500mg",
    patientId: "102",
    patientName: "João Oliveira",
    quantity: 21,
    date: "2025-05-18",
    prescribedBy: "Dra. Ana Pereira",
    dispensedBy: "Farmacêutico João",
  },
  {
    id: "3",
    medicationId: "3",
    medicationName: "Losartana Potássica 50mg",
    patientId: "103",
    patientName: "Antônio Ferreira",
    quantity: 30,
    date: "2025-05-19",
    prescribedBy: "Dr. Ricardo Martins",
    dispensedBy: "Farmacêutica Maria",
  },
  {
    id: "4",
    medicationId: "4",
    medicationName: "Salbutamol Spray 100mcg",
    patientId: "104",
    patientName: "Luiza Costa",
    quantity: 1,
    date: "2025-05-19",
    prescribedBy: "Dra. Mariana Alves",
    dispensedBy: "Farmacêutica Maria",
  },
  {
    id: "5",
    medicationId: "5",
    medicationName: "Omeprazol 20mg",
    patientId: "105",
    patientName: "Roberto Gomes",
    quantity: 30,
    date: "2025-05-20",
    prescribedBy: "Dr. Felipe Souza",
    dispensedBy: "Farmacêutico Pedro",
  },
];

const getExpirationStatus = (expirationDate: string): "ok" | "warning" | "danger" => {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
  
  if (diffDays <= 0) {
    return "danger";
  } else if (diffDays <= 90) {
    return "warning";
  } else {
    return "ok";
  }
};

const getStockStatus = (stock: number, minimumStock: number): "ok" | "warning" | "danger" => {
  if (stock <= 0) {
    return "danger";
  } else if (stock < minimumStock) {
    return "warning";
  } else {
    return "ok";
  }
};

const stockStatusColors = {
  ok: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

const ControleMedicamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [showLowStock, setShowLowStock] = useState<boolean>(false);
  const [showExpiringItems, setShowExpiringItems] = useState<boolean>(false);

  // Filter medications based on search, category, and other filters
  const filteredMedications = mockMedications.filter((med) => {
    const matchesSearch = 
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? med.category === filterCategory : true;
    const matchesLowStock = showLowStock ? (med.stock < med.minimumStock) : true;
    const matchesExpiration = showExpiringItems ? (getExpirationStatus(med.expirationDate) !== "ok") : true;
    
    return matchesSearch && matchesCategory && matchesLowStock && matchesExpiration;
  });

  // Extract unique categories for the filter
  const categories = Array.from(new Set(mockMedications.map((med) => med.category)));

  // Calculate alerts
  const lowStockCount = mockMedications.filter((med) => med.stock < med.minimumStock).length;
  const expiringCount = mockMedications.filter((med) => getExpirationStatus(med.expirationDate) !== "ok").length;
  const outOfStockCount = mockMedications.filter((med) => med.stock <= 0).length;

  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Controle de Medicamentos</h1>
          <Button>
            <Package className="mr-2 h-4 w-4" /> Nova Entrada de Estoque
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={lowStockCount > 0 ? "border-amber-500" : ""}>
            <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
              <CardTitle>Estoque Baixo</CardTitle>
              <CardDescription>Medicamentos abaixo do estoque mínimo</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{lowStockCount}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {lowStockCount === 0
                  ? "Todos os itens com estoque adequado"
                  : `${lowStockCount} itens precisam de reposição`}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant={showLowStock ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowLowStock(!showLowStock)}
              >
                {showLowStock ? "Remover filtro" : "Ver apenas com estoque baixo"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className={expiringCount > 0 ? "border-amber-500" : ""}>
            <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
              <CardTitle>Próximos ao Vencimento</CardTitle>
              <CardDescription>Medicamentos a vencer em 90 dias</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{expiringCount}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {expiringCount === 0
                  ? "Nenhum item próximo do vencimento"
                  : `${expiringCount} itens próximos do vencimento`}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant={showExpiringItems ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowExpiringItems(!showExpiringItems)}
              >
                {showExpiringItems ? "Remover filtro" : "Ver apenas próximos ao vencimento"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className={outOfStockCount > 0 ? "border-red-500" : ""}>
            <CardHeader className="bg-red-50 dark:bg-red-900/20">
              <CardTitle>Sem Estoque</CardTitle>
              <CardDescription>Medicamentos esgotados</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{outOfStockCount}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {outOfStockCount === 0
                  ? "Todos os itens disponíveis em estoque"
                  : `${outOfStockCount} itens esgotados`}
              </p>
            </CardContent>
          </Card>
        </div>

        {expiringCount > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              Existem medicamentos próximos à data de vencimento. Por favor, verifique a lista e tome as providências necessárias.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="estoque">
          <TabsList className="grid grid-cols-3 mb-4 w-[400px]">
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="dispensacao">Dispensação</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="estoque">
            <Card>
              <CardHeader>
                <CardTitle>Estoque de Medicamentos</CardTitle>
                <CardDescription>
                  Controle do estoque atual de medicamentos por unidade
                </CardDescription>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar medicamento..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicamento</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Estoque Mínimo</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            Nenhum medicamento encontrado com os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMedications.map((medication) => {
                          const stockStatus = getStockStatus(medication.stock, medication.minimumStock);
                          const expirationStatus = getExpirationStatus(medication.expirationDate);
                          
                          return (
                            <TableRow key={medication.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Pill className="mr-2 h-4 w-4" />
                                  {medication.name}
                                  <div className="text-xs text-muted-foreground ml-2">
                                    {medication.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{medication.category}</TableCell>
                              <TableCell>{medication.batchNumber}</TableCell>
                              <TableCell>
                                <Badge variant={stockStatus !== "ok" ? "destructive" : "outline"}>
                                  {medication.stock} {medication.unit}(s)
                                </Badge>
                              </TableCell>
                              <TableCell>{medication.minimumStock} {medication.unit}(s)</TableCell>
                              <TableCell>
                                <div className={expirationStatus !== "ok" ? "text-red-500 font-medium" : ""}>
                                  {new Date(medication.expirationDate).toLocaleDateString('pt-BR')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`${stockStatusColors[stockStatus]} text-white`}>
                                  {stockStatus === "ok" ? "Adequado" : stockStatus === "warning" ? "Baixo" : "Esgotado"}
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
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Exibindo {filteredMedications.length} de {mockMedications.length} medicamentos
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Anterior</Button>
                  <Button variant="outline" size="sm">Próximo</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="dispensacao">
            <Card>
              <CardHeader>
                <CardTitle>Dispensação de Medicamentos</CardTitle>
                <CardDescription>
                  Registro de medicamentos fornecidos aos pacientes
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" /> Nova Dispensação
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Medicamento</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Prescrição</TableHead>
                        <TableHead>Dispensado por</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDispensings.map((dispensing) => (
                        <TableRow key={dispensing.id}>
                          <TableCell>
                            {new Date(dispensing.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              {dispensing.patientName}
                            </div>
                          </TableCell>
                          <TableCell>{dispensing.medicationName}</TableCell>
                          <TableCell>{dispensing.quantity} unid.</TableCell>
                          <TableCell>{dispensing.prescribedBy}</TableCell>
                          <TableCell>{dispensing.dispensedBy}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Estoque e Consumo</CardTitle>
                <CardDescription>
                  Análise de estoque e consumo de medicamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">
                  [Aqui serão exibidos gráficos e relatórios de consumo e estoque]
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default ControleMedicamentos;
