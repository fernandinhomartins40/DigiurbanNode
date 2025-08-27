import { CidadaoLayout } from "@/components/CidadaoLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FC, useState, useEffect } from "react";
import { Search, FileText, Heart, Bus, School, Building, Home, Leaf, Construction, Shield, CreditCard, User, Clock, DollarSign, GraduationCap, Trophy, Users, Loader2, MapPin, Globe, Filter } from "lucide-react";
import { useProtocols } from "@/hooks/useProtocols";
import { useNavigate } from "react-router-dom";

// Ícones para categorias de serviços
const categoryIcons: Record<string, any> = {
  'Recursos Humanos': User,
  'Consultas e Exames': Heart,
  'Medicamentos': Heart,
  'Documentação': FileText,
  'Transporte': Bus,
  'Matrícula e Transferência': School,
  'Educação Infantil': GraduationCap,
  'Documentação Escolar': School,
  'Licenciamento': Building,
  'Limpeza Urbana': Construction,
  'Manutenção Urbana': Construction,
  'Licenciamento Ambiental': Leaf,
  'Arborização': Leaf,
  'Fiscalização': Shield,
  'Programas Sociais': Users,
  'Auxílios': Heart,
  'Uso de Espaços': Trophy,
  'Cursos e Oficinas': GraduationCap,
  'Material Esportivo': Trophy
};

const CatalogoServicos: FC = () => {
  const navigate = useNavigate();
  const { services, loading, searchServices } = useProtocols();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterType, setFilterType] = useState("all"); // online, presencial, all
  const [sortBy, setSortBy] = useState("name"); // name, price, time

  // Obter categorias únicas
  const categories = [...new Set(services.map(s => s.categoria))].sort();

  // Filtrar e ordenar serviços
  const filteredServices = (() => {
    let filtered = searchServices(searchTerm, selectedCategory);

    // Filtro por tipo (online/presencial)
    if (filterType === 'online') {
      filtered = filtered.filter(s => s.online);
    } else if (filterType === 'presencial') {
      filtered = filtered.filter(s => s.presencial);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.taxa - b.taxa;
        case 'time':
          return a.tempo_estimado_dias - b.tempo_estimado_dias;
        case 'name':
        default:
          return a.nome.localeCompare(b.nome);
      }
    });

    return filtered;
  })();

  const handleSolicitarServico = (serviceId: string) => {
    navigate(`/solicitar-servico?service=${serviceId}`);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratuito";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getServiceIcon = (categoria: string) => {
    const IconComponent = categoryIcons[categoria] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <CidadaoLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando catálogo de serviços...</span>
        </div>
      </CidadaoLayout>
    );
  }

  return (
    <CidadaoLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Serviços</h1>
          <p className="text-muted-foreground">
            Explore todos os serviços municipais disponíveis e faça sua solicitação
          </p>
        </div>

        {/* Barra de busca e filtros */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Busque por nome do serviço, categoria ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
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

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="price">Preço</SelectItem>
                <SelectItem value="time">Prazo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredServices.length} serviços encontrados</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>Online</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Presencial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de serviços */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getServiceIcon(service.categoria)}
                    </div>
                    <div>
                      <CardTitle className="text-base line-clamp-2">{service.nome}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {service.categoria}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {service.descricao}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{service.tempo_estimado_dias} dias</span>
                    </span>
                    <span className="flex items-center space-x-1 font-medium">
                      <DollarSign className="h-3 w-3" />
                      <span>{formatPrice(service.taxa)}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {service.online && (
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    )}
                    {service.presencial && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        Presencial
                      </Badge>
                    )}
                  </div>

                  {service.secretaria && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Responsável:</strong> {service.secretaria.nome}
                    </div>
                  )}

                  {service.documentos_necessarios.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Documentos:</strong> {service.documentos_necessarios.slice(0, 2).join(', ')}
                      {service.documentos_necessarios.length > 2 && ` e mais ${service.documentos_necessarios.length - 2}`}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  onClick={() => handleSolicitarServico(service.id)}
                  className="w-full"
                  size="sm"
                >
                  Solicitar Serviço
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou usar termos de busca diferentes
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setFilterType("all");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Categorias populares */}
        {searchTerm === "" && selectedCategory === "all" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Categorias Populares</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => {
                const count = services.filter(s => s.categoria === category).length;
                const IconComponent = categoryIcons[category] || FileText;
                
                return (
                  <Button
                    key={category}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{category}</div>
                        <div className="text-xs text-muted-foreground">{count} serviços</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dica para novos usuários */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Como solicitar um serviço?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  É muito simples! Clique em "Solicitar Serviço" no cartão do serviço desejado, 
                  preencha o formulário com suas informações e documentos, e acompanhe o 
                  andamento em tempo real.
                </p>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Verifique os documentos necessários antes de começar</li>
                  <li>• Serviços online podem ser feitos sem sair de casa</li>
                  <li>• Você receberá um número de protocolo para acompanhar</li>
                  <li>• Notificações serão enviadas por email e SMS</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CidadaoLayout>
  );
};

export default CatalogoServicos;