
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
import { Search, MoreVertical, Trash2, Copy, AlertCircle, Send } from "lucide-react";

interface SentEmail {
  id: string;
  to: string;
  cc?: string;
  subject: string;
  excerpt: string;
  date: string;
  hasAttachment: boolean;
  status: "delivered" | "failed" | "sending";
}

const mockSentEmails: SentEmail[] = [
  {
    id: "1",
    to: "Secretaria de Obras",
    subject: "Aprovação do projeto de revitalização da praça central",
    excerpt: "Segue parecer favorável ao projeto de revitalização da praça central. Solicito início imediato...",
    date: "Hoje, 14:32",
    hasAttachment: true,
    status: "delivered"
  },
  {
    id: "2",
    to: "Departamento Jurídico",
    cc: "Procuradoria Municipal",
    subject: "Análise de contrato - Empresa Construtora ABC",
    excerpt: "Preciso de um parecer sobre a minuta de contrato anexa referente à construção do novo centro administrativo...",
    date: "Hoje, 10:15",
    hasAttachment: true,
    status: "delivered"
  },
  {
    id: "3",
    to: "Controladoria Interna",
    subject: "Solicitação de auditoria - Setor de Licitações",
    excerpt: "Em virtude das recentes denúncias, solicito auditoria completa nos processos licitatórios dos últimos 6 meses...",
    date: "Ontem, 16:45",
    hasAttachment: false,
    status: "failed"
  },
  {
    id: "4",
    to: "Secretaria de Educação",
    subject: "Aprovação da reforma da Escola Municipal Central",
    excerpt: "Informo que o projeto de reforma da Escola Municipal Central está aprovado conforme reunião do conselho...",
    date: "12/05, 11:30",
    hasAttachment: true,
    status: "delivered"
  },
  {
    id: "5",
    to: "Assessoria de Comunicação",
    subject: "Material para divulgação - Programa Cidade Sustentável",
    excerpt: "Solicito a preparação de material de divulgação para o lançamento do Programa Cidade Sustentável...",
    date: "10/05, 09:22",
    hasAttachment: false,
    status: "sending"
  }
];

const CaixaSaida: FC = () => {
  return (
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Caixa de Saída</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Novo Email
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-full">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Emails Enviados</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Pesquisar emails enviados..." className="pl-8" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Opções</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Duplicar email</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir selecionados</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription>Gerencie suas mensagens enviadas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[50px]">Status</TableHead>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSentEmails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell className="p-2">
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          {email.status === "delivered" && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Entregue</Badge>
                          )}
                          {email.status === "failed" && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Falhou</Badge>
                          )}
                          {email.status === "sending" && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Enviando</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{email.to}</TableCell>
                        <TableCell>
                          <div>
                            <span className="block">{email.subject}</span>
                            <span className="block text-sm text-gray-500 truncate max-w-md">
                              {email.excerpt}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{email.date}</TableCell>
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

export default CaixaSaida;
