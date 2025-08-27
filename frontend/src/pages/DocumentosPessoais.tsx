
import { CidadaoLayout } from "@/components/CidadaoLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FC } from "react";
import { FileText, FileImage, FilePlus, Download, Eye, Upload, FileCheck, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Dummy data for documents
const documents = [
  {
    id: 1,
    title: "Certidão de Nascimento",
    category: "pessoal",
    date: "15/03/2025",
    verified: true,
    expiryDate: null,
    fileType: "pdf",
    fileSize: "1.2 MB"
  },
  {
    id: 2,
    title: "CPF",
    category: "pessoal",
    date: "10/01/2025",
    verified: true,
    expiryDate: null,
    fileType: "pdf",
    fileSize: "0.8 MB"
  },
  {
    id: 3,
    title: "RG",
    category: "pessoal",
    date: "10/01/2025",
    verified: true,
    expiryDate: null,
    fileType: "jpg",
    fileSize: "1.5 MB"
  },
  {
    id: 4,
    title: "Comprovante de Residência",
    category: "residencial",
    date: "02/05/2025",
    verified: true,
    expiryDate: "02/06/2025",
    fileType: "pdf",
    fileSize: "0.9 MB"
  },
  {
    id: 5,
    title: "Carteira de Trabalho Digital",
    category: "trabalho",
    date: "20/04/2025",
    verified: true,
    expiryDate: null,
    fileType: "pdf",
    fileSize: "1.1 MB"
  },
  {
    id: 6,
    title: "Título de Eleitor",
    category: "pessoal",
    date: "18/02/2025",
    verified: true,
    expiryDate: null,
    fileType: "pdf",
    fileSize: "0.7 MB"
  },
  {
    id: 7,
    title: "Cartão SUS",
    category: "saude",
    date: "15/03/2025",
    verified: true,
    expiryDate: null,
    fileType: "jpg",
    fileSize: "1.3 MB"
  },
  {
    id: 8,
    title: "Cartão de Vacinação",
    category: "saude",
    date: "10/05/2025",
    verified: true,
    expiryDate: null,
    fileType: "pdf",
    fileSize: "2.0 MB"
  },
  {
    id: 9,
    title: "Certidão de Casamento",
    category: "pessoal",
    date: "05/01/2025",
    verified: true,
    expiryDate: null,
    fileType: "pdf",
    fileSize: "1.2 MB"
  },
  {
    id: 10,
    title: "Histórico Escolar",
    category: "educacao",
    date: "20/02/2025",
    verified: false,
    expiryDate: null,
    fileType: "pdf",
    fileSize: "2.3 MB"
  }
];

const categories = [
  { id: "todos", name: "Todos" },
  { id: "pessoal", name: "Documentos Pessoais" },
  { id: "residencial", name: "Comprovantes Residenciais" },
  { id: "trabalho", name: "Documentos de Trabalho" },
  { id: "saude", name: "Saúde" },
  { id: "educacao", name: "Educação" }
];

const DocumentosPessoais: FC = () => {
  const getDocumentIcon = (fileType: string) => {
    switch (fileType) {
      case "jpg":
      case "png":
      case "jpeg":
        return <FileImage className="h-6 w-6 text-blue-500" />;
      default:
        return <FileText className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <CidadaoLayout>
      <div className="h-full flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Documentos Pessoais</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Gerencie seus documentos pessoais
            </p>
          </div>
          
          <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            Adicionar Documento
          </Button>
        </div>

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="mb-4 overflow-x-auto flex flex-nowrap justify-start">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent 
              key={category.id} 
              value={category.id} 
              className="mt-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents
                  .filter(doc => category.id === "todos" || doc.category === category.id)
                  .map((document) => (
                    <Card key={document.id} className="overflow-hidden h-full">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                            {getDocumentIcon(document.fileType)}
                          </div>
                          {document.verified && (
                            <Badge 
                              variant="outline" 
                              className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                            >
                              <FileCheck className="mr-1 h-3 w-3" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-2">
                          {document.title}
                        </CardTitle>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>Enviado em {document.date}</span>
                          </div>
                          
                          {document.expiryDate && (
                            <div className="flex items-center mt-1 text-amber-600 dark:text-amber-500">
                              <span>Válido até {document.expiryDate}</span>
                            </div>
                          )}
                          
                          <div className="mt-1">
                            {document.fileType.toUpperCase()} • {document.fileSize}
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="p-4 pt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="mr-1 h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Download className="mr-1 h-4 w-4" />
                          Baixar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
              
              {documents.filter(doc => category.id === "todos" || doc.category === category.id).length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">Nenhum documento encontrado</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Você não possui documentos nesta categoria.
                  </p>
                  <Button variant="outline" className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar novo documento
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Novo Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-1">Arraste e solte seu documento</h4>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Suportamos PDF, JPG, PNG e outros formatos comuns
              </p>
              <Button>
                Selecionar Arquivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CidadaoLayout>
  );
};

export default DocumentosPessoais;
