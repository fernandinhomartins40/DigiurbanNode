
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProtocolo } from '@/hooks/useProtocolos'
import { useSecretarias } from '@/hooks/useSecretarias'
import { useServicos } from '@/hooks/useServicos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CriarProtocolo() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    descricao: '',
    secretaria_id: '',
    servico_id: '',
    prioridade: 'media',
  })

  const { data: secretarias } = useSecretarias()
  const { data: servicos } = useServicos()
  const createProtocolo = useCreateProtocolo()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createProtocolo.mutateAsync({
        titulo: formData.titulo,
        categoria: formData.categoria,
        descricao: formData.descricao,
        secretaria_destino_id: formData.secretaria_id,
        servico_id: formData.servico_id || undefined,
        prioridade: formData.prioridade,
        status: 'aberto',
      })
      
      navigate('/protocolos')
    } catch (error) {
      console.error('Erro ao criar protocolo:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/protocolos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Novo Protocolo</h1>
          <p className="text-muted-foreground">
            Crie um novo protocolo no sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Protocolo</CardTitle>
          <CardDescription>
            Preencha os dados do protocolo que será criado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título/Assunto *</Label>
                <Input
                  id="titulo"
                  placeholder="Digite o título do protocolo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Input
                  id="categoria"
                  placeholder="Ex: Solicitação, Reclamação, Denúncia"
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva detalhadamente o protocolo"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="secretaria">Secretaria Responsável *</Label>
                <Select 
                  value={formData.secretaria_id} 
                  onValueChange={(value) => handleInputChange('secretaria_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a secretaria" />
                  </SelectTrigger>
                  <SelectContent>
                    {secretarias?.map((secretaria) => (
                      <SelectItem key={secretaria.id} value={secretaria.id}>
                        {secretaria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servico">Serviço (opcional)</Label>
                <Select 
                  value={formData.servico_id} 
                  onValueChange={(value) => handleInputChange('servico_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicos
                      ?.filter(servico => !formData.secretaria_id || servico.secretaria_id === formData.secretaria_id)
                      ?.map((servico) => (
                        <SelectItem key={servico.id} value={servico.id}>
                          {servico.nome}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select 
                value={formData.prioridade} 
                onValueChange={(value) => handleInputChange('prioridade', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={createProtocolo.isPending}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {createProtocolo.isPending ? 'Criando...' : 'Criar Protocolo'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/protocolos">
                  Cancelar
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
