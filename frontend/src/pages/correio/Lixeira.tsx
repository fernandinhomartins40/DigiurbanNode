
import { FC } from "react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Search, MoreVertical, RefreshCcw, Archive } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DeletedEmail {
  id: string;
  from?: string;
  to?: string;
  subject: string;
  deletionDate: string;
  type: "recebido" | "enviado" | "rascunho";
  permanentDeleteDate: string;
}

const mockDeletedEmails: DeletedEmail[] = [
  {
    id: "1",
    from: "Secretaria de Finanças",
    subject: "Relatório orçamentário do segundo trimestre",
    deletionDate: "Hoje, 15:45",
    type: "recebido",
    permanentDeleteDate: "Em 30 dias"
  },
  {
    id: "2",
    to: "Departamento Jurídico",
    subject: "Minuta de decreto - Regulamentação do estacionamento rotativo",
    deletionDate: "Hoje, 13:22",
    type: "enviado",
    permanentDeleteDate: "Em 30 dias"
  },
  {
    id: "3",
    to: "Recursos Humanos",
    subject: "Avaliação de desempenho",
    deletionDate: "Ontem, 10:15",
    type: "rascunho",
    permanentDeleteDate: "Em 29 dias"
  },
  {
    id: "4",
    from: "Departamento de Compras",
    subject: "Cotação para aquisição de materiais de escritório",
    deletionDate: "12/05, 16:30",
    type: "recebido",
    permanentDeleteDate: "Em 22 dias"
  },
  {
    id: "5",
    to: "Assessoria de Imprensa",
    subject: "Texto para divulgação - Inauguração da nova UBS",
    deletionDate: "10/05, 09:47",
    type: "enviado",
    permanentDeleteDate: "Em 20 dias"
  }
];

const Lixeira: FC = () => {
  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Lixeira</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm py-1 px-3">
              {mockDeletedEmails.length} emails
            </Badge>
          </div>
        </div>

        <Alert>
          <Trash2 className="h-4 w-4" />
          <AlertTitle>Política de retenção</AlertTitle>
          <AlertDescription>
            Os emails são mantidos na lixeira por 30 dias antes de serem excluídos permanentemente.
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <div className="w-full">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Emails Excluídos</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Pesquisar emails excluídos..." className="pl-8" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          <span>Restaurar selecionados</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir permanentemente</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription>Emails excluídos que ainda podem ser recuperados</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[80px]">Tipo</TableHead>
                      <TableHead>De/Para</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Excluído em</TableHead>
                      <TableHead>Exclusão permanente</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDeletedEmails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell className="p-2">
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          {email.type === "recebido" && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Recebido</Badge>
                          )}
                          {email.type === "enviado" && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Enviado</Badge>
                          )}
                          {email.type === "rascunho" && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Rascunho</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {email.from ? `De: ${email.from}` : `Para: ${email.to}`}
                        </TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>{email.deletionDate}</TableCell>
                        <TableCell>{email.permanentDeleteDate}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="Restaurar">
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Excluir permanentemente">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Restaurar Todos
                </Button>
                <Button variant="outline" className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Esvaziar Lixeira
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    
  );
};

export default Lixeira;
