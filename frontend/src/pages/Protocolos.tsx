
import { useState } from 'react'
import { useProtocolos } from '@/hooks/useProtocolos'
import { useSecretarias } from '@/hooks/useSecretarias'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Protocolos() {
  const [filtro, setFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('all')
  const [secretariaFiltro, setSecretariaFiltro] = useState<string>('all')

  const { data: protocolos, isLoading } = useProtocolos()
  const { data: secretarias } = useSecretarias()

  const protocolosFiltrados = protocolos?.filter((protocolo) => {
    const matchesFiltro = filtro === '' || 
      protocolo.numero_protocolo.toLowerCase().includes(filtro.toLowerCase()) ||
      protocolo.assunto.toLowerCase().includes(filtro.toLowerCase()) ||
      protocolo.descricao.toLowerCase().includes(filtro.toLowerCase())
    
    const matchesStatus = statusFiltro === 'all' || protocolo.status === statusFiltro
    const matchesSecretaria = secretariaFiltro === 'all' || protocolo.secretaria_id === secretariaFiltro

    return matchesFiltro && matchesStatus && matchesSecretaria
  })

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'aberto': { label: 'Aberto', variant: 'default' as const },
      'em_andamento': { label: 'Em Andamento', variant: 'secondary' as const },
      'concluido': { label: 'Concluído', variant: 'success' as const },
      'cancelado': { label: 'Cancelado', variant: 'destructive' as const },
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'default' as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeMap = {
      'baixa': { label: 'Baixa', variant: 'outline' as const },
      'media': { label: 'Média', variant: 'secondary' as const },
      'alta': { label: 'Alta', variant: 'default' as const },
      'urgente': { label: 'Urgente', variant: 'destructive' as const },
    }
    
    const prioridadeInfo = prioridadeMap[prioridade as keyof typeof prioridadeMap] || { label: prioridade, variant: 'outline' as const }
    return <Badge variant={prioridadeInfo.variant}>{prioridadeInfo.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Protocolos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os protocolos do sistema
          </p>
        </div>
        <Button asChild>
          <Link to="/protocolos/criar">
            <Plus className="mr-2 h-4 w-4" />
            Novo Protocolo
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Número, assunto ou descrição..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Secretaria</label>
              <Select value={secretariaFiltro} onValueChange={setSecretariaFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as secretarias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {secretarias?.map((secretaria) => (
                    <SelectItem key={secretaria.id} value={secretaria.id}>
                      {secretaria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFiltro('')
                  setStatusFiltro('')
                  setSecretariaFiltro('')
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de protocolos */}
      <div className="space-y-4">
        {protocolosFiltrados?.map((protocolo) => (
          <Card key={protocolo.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">
                      {protocolo.numero_protocolo}
                    </span>
                    {getStatusBadge(protocolo.status)}
                    {getPrioridadeBadge(protocolo.prioridade)}
                  </div>
                  
                  <h3 className="text-lg font-semibold">{protocolo.assunto}</h3>
                  
                  <p className="text-muted-foreground line-clamp-2">
                    {protocolo.descricao}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Criado em {new Date(protocolo.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {protocolo.data_vencimento && (
                      <span>
                        Vence em {new Date(protocolo.data_vencimento).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link to={`/protocolos/${protocolo.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {protocolosFiltrados?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum protocolo encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Não há protocolos que correspondam aos filtros aplicados.
              </p>
              <Button asChild>
                <Link to="/protocolos/criar">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Protocolo
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
