

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FC, useState, useEffect } from "react";
import { AlertCircle, ChevronDown, ChevronRight, Download, Eye, LockIcon, Plus, Search, Shield, UserCircle, UserPlus, Users, UsersRound, Loader2, RefreshCw } from "lucide-react";
import { useUserManagement, UserProfile } from "@/hooks/useUserManagement";
import { toast } from "react-hot-toast";

// Dados de secretarias para seleção
const secretariasData = [
  { id: "gabinete", nome: "Gabinete do Prefeito" },
  { id: "administracao", nome: "Administração" },
  { id: "saude", nome: "Saúde" },
  { id: "educacao", nome: "Educação" },
  { id: "obras", nome: "Obras e Infraestrutura" },
  { id: "meio_ambiente", nome: "Meio Ambiente" },
  { id: "assistencia_social", nome: "Assistência Social" },
  { id: "cultura_esportes", nome: "Cultura e Esportes" },
  { id: "turismo", nome: "Turismo" },
  { id: "agricultura", nome: "Agricultura" },
  { id: "juridico", nome: "Jurídico" },
  { id: "procuradoria", nome: "Procuradoria" },
  { id: "controladoria", nome: "Controladoria" }
];

// Dados de exemplo para módulos e recursos
const recursosData = [
  {
    id: "gabinete",
    nome: "Gabinete",
    recursos: [
      { id: "gabinete.atendimentos", nome: "Atendimentos", acesso: "total" },
      { id: "gabinete.visao_geral", nome: "Visão Geral", acesso: "total" },
      { id: "gabinete.mapa_demandas", nome: "Mapa de Demandas", acesso: "total" },
      { id: "gabinete.relatorios", nome: "Relatórios Executivos", acesso: "leitura" },
      { id: "gabinete.ordens", nome: "Ordens aos Setores", acesso: "total" },
      { id: "gabinete.permissoes", nome: "Gerenciar Permissões", acesso: "total" },
    ],
  },
  {
    id: "saude",
    nome: "Saúde",
    recursos: [
      { id: "saude.atendimentos", nome: "Atendimentos", acesso: "total" },
      { id: "saude.agendamentos", nome: "Agendamentos Médicos", acesso: "leitura" },
      { id: "saude.medicamentos", nome: "Controle de Medicamentos", acesso: "negado" },
      { id: "saude.campanhas", nome: "Campanhas de Saúde", acesso: "leitura" },
    ],
  },
  {
    id: "educacao",
    nome: "Educação",
    recursos: [
      { id: "educacao.matriculas", nome: "Matrículas", acesso: "total" },
      { id: "educacao.escolas", nome: "Escolas/CMEI's", acesso: "leitura" },
      { id: "educacao.transporte", nome: "Transporte Escolar", acesso: "negado" },
      { id: "educacao.notas", nome: "Notas e Frequências", acesso: "negado" },
    ],
  },
];


// Componente para o status do usuário
const StatusUsuario: FC<{ ativo: boolean }> = ({ ativo }) => {
  return (
    <Badge className={ativo ? "bg-green-500 text-green-50" : "bg-gray-500 text-gray-50"}>
      {ativo ? "Ativo" : "Inativo"}
    </Badge>
  );
};

// Componente para nível de acesso
const NivelAcesso: FC<{ acesso: string }> = ({ acesso }) => {
  const acessoConfig = {
    total: { label: "Total", className: "bg-green-100 text-green-800 border-green-200" },
    leitura: { label: "Leitura", className: "bg-blue-100 text-blue-800 border-blue-200" },
    negado: { label: "Negado", className: "bg-red-100 text-red-800 border-red-200" },
  };

  const config = acessoConfig[acesso as keyof typeof acessoConfig] || 
                { label: acesso, className: "bg-gray-100 text-gray-800 border-gray-200" };

  return (
    <span className={`px-2 py-1 text-xs rounded border ${config.className}`}>
      {config.label}
    </span>
  );
};

// Componente para a tabela de usuários
const TabelaUsuarios: FC<{ 
  usuarios: UserProfile[]
  onToggleStatus: (userId: string, ativo: boolean) => void
  onResetPassword: (userId: string) => void
}> = ({ usuarios, onToggleStatus, onResetPassword }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Secretaria</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {usuarios.map((usuario) => (
          <tr key={usuario.id} className={!usuario.ativo ? "bg-gray-50 dark:bg-gray-900/30" : ""}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{usuario.nome}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">{usuario.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">{usuario.secretaria?.nome || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
              {usuario.tipo_usuario.replace('_', ' ')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <StatusUsuario ativo={usuario.ativo} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
              <Button variant="ghost" size="sm">Editar</Button>
              <Button 
                variant={usuario.ativo ? "ghost" : "outline"} 
                size="sm"
                onClick={() => onToggleStatus(usuario.id, !usuario.ativo)}
              >
                {usuario.ativo ? "Desativar" : "Ativar"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onResetPassword(usuario.id)}
                title="Resetar senha"
              >
                <LockIcon className="h-4 w-4" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Componente para o formulário de novo usuário
const NovoUsuarioForm: FC<{
  onSubmit: (data: any) => void
  loading?: boolean
}> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    secretaria_id: '',
    tipo_usuario: 'operador' as UserProfile['tipo_usuario'],
    password: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome || !formData.email || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input 
            id="nome" 
            placeholder="Nome do usuário"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="email@prefeitura.gov.br"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="secretaria">Secretaria</Label>
          <Select
            value={formData.secretaria_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, secretaria_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma secretaria" />
            </SelectTrigger>
            <SelectContent>
              {secretariasData.map((secretaria) => (
                <SelectItem key={secretaria.id} value={secretaria.id}>
                  {secretaria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Usuário *</Label>
          <Select
            value={formData.tipo_usuario}
            onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_usuario: value as UserProfile['tipo_usuario'] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="secretario">Secretário</SelectItem>
              <SelectItem value="diretor">Diretor</SelectItem>
              <SelectItem value="gestor">Gestor</SelectItem>
              <SelectItem value="operador">Operador</SelectItem>
              <SelectItem value="cidadao">Cidadão</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha Temporária *</Label>
        <Input 
          id="senha" 
          type="password" 
          placeholder="Senha temporária (min. 6 caracteres)"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          minLength={6}
          required
        />
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="outline">Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Usuário'
          )}
        </Button>
      </div>
    </form>
  )
};

// Componente para o card de perfil
const PerfilCard: FC<{ perfil: any }> = ({ perfil }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{perfil.nome}</CardTitle>
          <Badge variant="outline">{perfil.usuarios || 0} usuários</Badge>
        </div>
        <CardDescription>{perfil.descricao}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              className="flex items-center text-sm p-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              {expanded ? "Ocultar permissões" : "Ver permissões"}
            </Button>
          </div>
          
          {expanded && (
            <div className="rounded border p-3 space-y-2 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm">Visualizar</span>
                <div className="flex h-4 items-center">
                  <Checkbox checked={perfil.permissoes?.visualizar || false} disabled />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Criar</span>
                <div className="flex h-4 items-center">
                  <Checkbox checked={perfil.permissoes?.criar || false} disabled />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Editar</span>
                <div className="flex h-4 items-center">
                  <Checkbox checked={perfil.permissoes?.editar || false} disabled />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Excluir</span>
                <div className="flex h-4 items-center">
                  <Checkbox checked={perfil.permissoes?.excluir || false} disabled />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Aprovar</span>
                <div className="flex h-4 items-center">
                  <Checkbox checked={perfil.permissoes?.aprovar || false} disabled />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Gerenciar Usuários</span>
                <div className="flex h-4 items-center">
                  <Checkbox checked={perfil.permissoes?.gerenciar_usuarios || false} disabled />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para a matriz de permissões
const MatrizPermissoes: FC = () => (
  <div className="space-y-6">
    {recursosData.map((modulo) => (
      <div key={modulo.id} className="space-y-2">
        <h3 className="font-medium">{modulo.nome}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border rounded-md">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recurso</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gestor</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Operador</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visualizador</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {modulo.recursos.map((recurso) => (
                <tr key={recurso.id}>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">{recurso.nome}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-center">
                    <NivelAcesso acesso="total" />
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-center">
                    <Select defaultValue={recurso.acesso}>
                      <SelectTrigger className="h-7 w-24 mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">Total</SelectItem>
                        <SelectItem value="leitura">Leitura</SelectItem>
                        <SelectItem value="negado">Negado</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-center">
                    <Select defaultValue="leitura">
                      <SelectTrigger className="h-7 w-24 mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">Total</SelectItem>
                        <SelectItem value="leitura">Leitura</SelectItem>
                        <SelectItem value="negado">Negado</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-center">
                    <Select defaultValue="leitura">
                      <SelectTrigger className="h-7 w-24 mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">Total</SelectItem>
                        <SelectItem value="leitura">Leitura</SelectItem>
                        <SelectItem value="negado">Negado</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
    
    <div className="flex justify-end">
      <Button>Salvar Alterações</Button>
    </div>
  </div>
);

// Componente para o formulário de novo perfil
const NovoPerfilForm: FC = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="nome_perfil">Nome do Perfil</Label>
      <Input id="nome_perfil" placeholder="Nome do perfil" />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="descricao_perfil">Descrição</Label>
      <Input id="descricao_perfil" placeholder="Breve descrição do perfil" />
    </div>
    
    <div className="space-y-2">
      <Label>Permissões Base</Label>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-x-2 p-2 border rounded-md">
          <div className="flex items-center space-x-2">
            <Checkbox id="perm_visualizar" defaultChecked />
            <Label htmlFor="perm_visualizar">Visualizar</Label>
          </div>
          <div className="text-xs text-muted-foreground">Permitir visualização de conteúdo</div>
        </div>
        
        <div className="flex items-center justify-between space-x-2 p-2 border rounded-md">
          <div className="flex items-center space-x-2">
            <Checkbox id="perm_criar" />
            <Label htmlFor="perm_criar">Criar</Label>
          </div>
          <div className="text-xs text-muted-foreground">Permitir criação de conteúdo</div>
        </div>
        
        <div className="flex items-center justify-between space-x-2 p-2 border rounded-md">
          <div className="flex items-center space-x-2">
            <Checkbox id="perm_editar" />
            <Label htmlFor="perm_editar">Editar</Label>
          </div>
          <div className="text-xs text-muted-foreground">Permitir edição de conteúdo</div>
        </div>
        
        <div className="flex items-center justify-between space-x-2 p-2 border rounded-md">
          <div className="flex items-center space-x-2">
            <Checkbox id="perm_excluir" />
            <Label htmlFor="perm_excluir">Excluir</Label>
          </div>
          <div className="text-xs text-muted-foreground">Permitir exclusão de conteúdo</div>
        </div>
        
        <div className="flex items-center justify-between space-x-2 p-2 border rounded-md">
          <div className="flex items-center space-x-2">
            <Checkbox id="perm_aprovar" />
            <Label htmlFor="perm_aprovar">Aprovar</Label>
          </div>
          <div className="text-xs text-muted-foreground">Permitir aprovação de conteúdo</div>
        </div>
        
        <div className="flex items-center justify-between space-x-2 p-2 border rounded-md">
          <div className="flex items-center space-x-2">
            <Checkbox id="perm_gerenciar_usuarios" />
            <Label htmlFor="perm_gerenciar_usuarios">Gerenciar Usuários</Label>
          </div>
          <div className="text-xs text-muted-foreground">Permitir gerenciamento de usuários</div>
        </div>
      </div>
    </div>
  </div>
);

// Componente principal da página
const GerenciarPermissoes: FC = () => {
  const {
    users,
    profiles,
    activities,
    loading,
    error,
    createUser,
    toggleUserStatus,
    resetUserPassword,
    getUserStats,
    searchUsers,
    loadData
  } = useUserManagement()

  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  
  const stats = getUserStats()
  const filteredUsers = searchUsers(searchQuery)

  const handleCreateUser = async (userData: any) => {
    try {
      setCreateLoading(true)
      await createUser(userData)
      setIsCreateDialogOpen(false)
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setCreateLoading(false)
    }
  }

  const handleToggleStatus = async (userId: string, ativo: boolean) => {
    await toggleUserStatus(userId, ativo)
  }

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Digite a nova senha temporária (min. 6 caracteres):')
    if (newPassword && newPassword.length >= 6) {
      await resetUserPassword(userId, newPassword)
    } else if (newPassword) {
      toast.error('Senha deve ter pelo menos 6 caracteres')
    }
  }

  if (loading) {
    return (
      
        <div className="p-6 flex justify-center items-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando dados...</span>
          </div>
        </div>
      
    )
  }

  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Permissões</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-300">Erro</h3>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Gestão de Usuários e Permissões</CardTitle>
            <CardDescription>Configure usuários, perfis e permissões de acesso ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="usuarios">
              <TabsList className="mb-4">
                <TabsTrigger value="usuarios" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" /> Usuários
                </TabsTrigger>
                <TabsTrigger value="perfis" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Perfis
                </TabsTrigger>
                <TabsTrigger value="permissoes" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Permissões
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Logs
                </TabsTrigger>
              </TabsList>

              {/* Tab de Usuários */}
              <TabsContent value="usuarios" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" /> Adicionar Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                        <DialogDescription>
                          Preencha as informações para criar um novo usuário no sistema.
                        </DialogDescription>
                      </DialogHeader>
                      <NovoUsuarioForm 
                        onSubmit={handleCreateUser}
                        loading={createLoading}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <UsersRound className="h-5 w-5 text-primary" />
                    <span className="font-medium">{stats.total} usuários cadastrados</span>
                    <span className="text-sm text-muted-foreground">
                      ({stats.active} ativos, {stats.inactive} inativos)
                    </span>
                  </div>
                </div>

                <TabelaUsuarios 
                  usuarios={filteredUsers}
                  onToggleStatus={handleToggleStatus}
                  onResetPassword={handleResetPassword}
                />
              </TabsContent>

              {/* Tab de Perfis */}
              <TabsContent value="perfis" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Tipos de Usuário do Sistema</h3>
                  <p className="text-sm text-muted-foreground">
                    Os tipos de usuário definem as permissões básicas no sistema
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profiles.map((perfil) => (
                    <PerfilCard key={perfil.id} perfil={perfil} />
                  ))}
                </div>
              </TabsContent>

              {/* Tab de Permissões */}
              <TabsContent value="permissoes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Matriz de Permissões</h3>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Exportar Matriz
                  </Button>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <LockIcon className="h-5 w-5 text-primary" />
                    <span className="font-medium">Níveis de acesso: </span>
                    <div className="flex items-center space-x-2">
                      <NivelAcesso acesso="total" /> <span className="text-sm">Acesso total</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <NivelAcesso acesso="leitura" /> <span className="text-sm">Somente leitura</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <NivelAcesso acesso="negado" /> <span className="text-sm">Acesso negado</span>
                    </div>
                  </div>
                </div>

                <MatrizPermissoes />
              </TabsContent>

              {/* Tab de Logs */}
              <TabsContent value="logs" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Logs de Atividades</h3>
                  <div className="flex space-x-2">
                    <Input type="date" className="w-40" />
                    <Button variant="outline">Filtrar</Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" /> Exportar Logs
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data/Hora</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ação</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {activities.length > 0 ? activities.map((activity) => (
                        <tr key={activity.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(activity.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {activity.user_profile?.nome || 'Sistema'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{activity.acao}</td>
                          <td className="px-6 py-4 text-sm">{activity.detalhes}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                            Nenhuma atividade registrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Atenção</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Alterações nas permissões de usuário e perfis afetam diretamente o acesso ao sistema. 
              É recomendado revisar cuidadosamente todas as modificações. 
              Alterações realizadas serão registradas com seu usuário nos logs de auditoria.
            </p>
          </div>
        </div>
      </div>
    
  );
};

export default GerenciarPermissoes;
