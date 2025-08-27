
import { FC } from "react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
import { Edit, Search, MoreVertical, Trash2, Send, Clock, AlertCircle } from "lucide-react";

interface DraftEmail {
  id: string;
  to: string | null;
  subject: string | null;
  lastEdited: string;
  hasAttachment: boolean;
  isComplete: boolean;
}

const mockDrafts: DraftEmail[] = [
  {
    id: "1",
    to: "Secretaria de Urbanismo",
    subject: "Parecer sobre projeto de revitalização do centro",
    lastEdited: "Hoje, 15:30",
    hasAttachment: true,
    isComplete: true
  },
  {
    id: "2",
    to: "Secretaria de Saúde",
    subject: null,
    lastEdited: "Hoje, 11:15",
    hasAttachment: false,
    isComplete: false
  },
  {
    id: "3",
    to: "Conselho Municipal",
    subject: "Convocação para reunião extraordinária",
    lastEdited: "Ontem, 17:22",
    hasAttachment: true,
    isComplete: true
  },
  {
    id: "4",
    to: null,
    subject: "Plano de ação para período de chuvas",
    lastEdited: "12/05, 10:08",
    hasAttachment: false,
    isComplete: false
  },
  {
    id: "5",
    to: "Gabinete Vice-Prefeito",
    subject: "Relatório mensal de atividades",
    lastEdited: "10/05, 14:45",
    hasAttachment: true,
    isComplete: true
  }
];

const Rascunhos: FC = () => {
  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Rascunhos</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm py-1 px-3">
              {mockDrafts.length} rascunhos
            </Badge>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Novo Email
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-full">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Emails em Rascunho</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Pesquisar rascunhos..." className="pl-8" />
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
                          <Send className="mr-2 h-4 w-4" />
                          <span>Enviar selecionados</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Clock className="mr-2 h-4 w-4" />
                          <span>Agendar envio</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir selecionados</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription>Emails salvos para envio posterior</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[50px]">Status</TableHead>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead className="text-right">Última Edição</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDrafts.map((draft) => (
                      <TableRow key={draft.id}>
                        <TableCell className="p-2">
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          {draft.isComplete ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Completo</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Incompleto</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {draft.to || <span className="text-gray-400 italic">Sem destinatário</span>}
                        </TableCell>
                        <TableCell>
                          {draft.subject || <span className="text-gray-400 italic">Sem assunto</span>}
                        </TableCell>
                        <TableCell className="text-right">{draft.lastEdited}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    
  );
};

export default Rascunhos;
