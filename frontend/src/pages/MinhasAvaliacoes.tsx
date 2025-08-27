
import { CidadaoLayout } from "@/components/CidadaoLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FC, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, FileText, MessageCircle, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Dummy data for evaluations
const evaluations = [
  {
    id: 1,
    service: "Atendimento da Secretaria de Saúde",
    protocolId: "PROT-2025-0011234",
    date: "15/05/2025",
    rating: 4,
    comment: "O atendimento foi muito bom e rápido. A equipe foi atenciosa e resolveu meu problema rapidamente.",
    status: "completed"
  },
  {
    id: 2,
    service: "Solicitação de Poda de Árvore",
    protocolId: "PROT-2025-0012344",
    date: "16/05/2025",
    rating: 5,
    comment: "Serviço excelente, realizado em tempo recorde. A equipe foi muito profissional.",
    status: "completed"
  },
  {
    id: 3,
    service: "Emissão de Segunda Via de IPTU",
    protocolId: "PROT-2025-0012342",
    date: "05/05/2025",
    rating: 5,
    comment: "Processo automatizado e eficiente. Consegui emitir minha segunda via sem nenhum problema.",
    status: "completed"
  },
  {
    id: 4,
    service: "Solicitação de Alvará para Evento",
    protocolId: "PROT-2025-0012341",
    date: null,
    rating: null,
    comment: null,
    status: "pending"
  },
];

const pendingEvaluations = evaluations.filter(e => e.status === "pending");
const completedEvaluations = evaluations.filter(e => e.status === "completed");

const MinhasAvaliacoes: FC = () => {
  const [activeRating, setActiveRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");

  const handleRatingClick = (rating: number) => {
    setActiveRating(rating);
  };

  const renderStars = (rating: number | null, interactive = false, size = 5) => {
    const stars = [];
    
    for (let i = 1; i <= size; i++) {
      stars.push(
        <Star
          key={i}
          className={`${
            (interactive ? (hoveredRating || activeRating) : rating) >= i
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300 dark:text-gray-600"
          } ${interactive ? "cursor-pointer transition-colors" : ""}`}
          onMouseEnter={interactive ? () => setHoveredRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(null) : undefined}
          onClick={interactive ? () => handleRatingClick(i) : undefined}
        />
      );
    }
    
    return stars;
  };

  return (
    <CidadaoLayout>
      <div className="h-full flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Minhas Avaliações</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Avalie os serviços utilizados e veja suas avaliações anteriores
            </p>
          </div>
        </div>

        <Tabs defaultValue={pendingEvaluations.length > 0 ? "pending" : "completed"}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="relative">
              Pendentes
              {pendingEvaluations.length > 0 && (
                <Badge className="ml-2 bg-blue-500">{pendingEvaluations.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingEvaluations.length === 0 ? (
              <div className="text-center py-12">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">Sem avaliações pendentes</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Você não possui serviços pendentes para avaliação.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvaluations.map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{evaluation.service}</CardTitle>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <FileText className="h-3.5 w-3.5 mr-1" /> 
                            Protocolo: {evaluation.protocolId}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                          Avaliação Pendente
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Como você avalia este serviço?</h4>
                          <div className="flex gap-1">
                            {renderStars(activeRating, true)}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Deixe seu comentário sobre o serviço:</h4>
                          <Textarea 
                            placeholder="Conte-nos sua experiência com este serviço..."
                            className="min-h-[100px]"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button variant="outline" className="mr-2">
                        Responder depois
                      </Button>
                      <Button disabled={!activeRating}>
                        Enviar avaliação
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedEvaluations.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">Nenhuma avaliação realizada</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Você ainda não avaliou nenhum serviço.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedEvaluations.map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{evaluation.service}</CardTitle>
                          <div className="flex items-center mt-2">
                            <div className="flex gap-1 mr-4">
                              {renderStars(evaluation.rating)}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              Avaliado em {evaluation.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                        <div className="flex items-start">
                          <MessageCircle className="h-4 w-4 mt-1 mr-2 text-gray-400" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {evaluation.comment}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button variant="outline">
                        Editar avaliação
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Estatísticas de Satisfação</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Resumo das suas avaliações aos serviços municipais
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md text-center">
                <h4 className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Serviços avaliados</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md text-center">
                <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">4.7</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avaliação média</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md text-center">
                <h4 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">1</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pendentes</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center py-4">
              <div className="flex flex-col items-center">
                <div className="text-center">
                  <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                    Obrigado por ajudar a melhorar os serviços do município!
                  </p>
                  <div className="flex justify-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CidadaoLayout>
  );
};

export default MinhasAvaliacoes;
