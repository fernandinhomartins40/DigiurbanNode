import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth'
import { AuthService, UserProfile } from '@/auth'

interface Secretaria {
  id: string;
  nome: string;
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, UserPlus, ArrowLeft, Check, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterServer() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingSecretarias, setLoadingSecretarias] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [secretarias, setSecretarias] = useState<Secretaria[]>([])
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    cpf: '',
    telefone: '',
    tipoUsuario: '' as UserProfile['tipo_usuario'],
    secretariaId: '',
    cargo: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Verificar se usuário tem permissão
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin')
      toast.error('Você não tem permissão para acessar esta página')
      return
    }
    
    loadSecretarias()
  }, [])

  const loadSecretarias = async () => {
    try {
      const data = await AuthService.getSecretarias()
      setSecretarias(data)
    } catch (error) {
      console.error('Erro ao carregar secretarias:', error)
      toast.error('Erro ao carregar secretarias')
    } finally {
      setLoadingSecretarias(false)
    }
  }

  const tiposUsuario = [
    { value: 'admin', label: 'Administrador Municipal' },
    { value: 'secretario', label: 'Secretário Municipal' },
    { value: 'diretor', label: 'Diretor de Departamento' },
    { value: 'coordenador', label: 'Coordenador de Setor' },
    { value: 'funcionario', label: 'Funcionário Público' },
    { value: 'atendente', label: 'Atendente' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro quando usuário começar a digitar
    if (error) setError('')
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData(prev => ({ ...prev, cpf: formatted }))
    if (error) setError('')
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({ ...prev, telefone: formatted }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.nomeCompleto.trim()) {
      setError('Nome completo é obrigatório')
      return false
    }
    
    if (!formData.email.trim()) {
      setError('Email é obrigatório')
      return false
    }
    
    if (!formData.cpf.trim()) {
      setError('CPF é obrigatório')
      return false
    }
    
    if (!formData.telefone.trim()) {
      setError('Telefone é obrigatório')
      return false
    }
    
    if (!formData.tipoUsuario) {
      setError('Tipo de usuário é obrigatório')
      return false
    }
    
    if (!formData.secretariaId) {
      setError('Secretaria é obrigatória')
      return false
    }
    
    if (!formData.cargo.trim()) {
      setError('Cargo é obrigatório')
      return false
    }
    
    if (!formData.password) {
      setError('Senha é obrigatória')
      return false
    }
    
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      await signUpServer(
        formData.email,
        formData.password,
        formData.nomeCompleto,
        formData.cpf.replace(/\D/g, ''),
        formData.telefone.replace(/\D/g, ''),
        formData.tipoUsuario,
        formData.secretariaId,
        formData.cargo
      )
      
      setSuccess(true)
      toast.success('Usuário criado com sucesso!')
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/administracao/gerenciamento-usuarios')
      }, 3000)
      
    } catch (error: Error | unknown) {
      console.error('Erro no cadastro:', error)
      
      if (error.message.includes('User already registered')) {
        setError('Este email já está cadastrado')
      } else if (error.message.includes('Invalid email')) {
        setError('Email inválido')
      } else if (error.message.includes('Sem permissão')) {
        setError('Você não tem permissão para criar usuários')
      } else {
        setError('Erro ao criar usuário. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center bg-green-100 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Usuário criado com sucesso!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  O usuário foi cadastrado e poderá fazer login no sistema.
                </p>
                <Link to="/administracao/gerenciamento-usuarios">
                  <Button className="w-full">
                    Voltar ao Gerenciamento
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loadingSecretarias) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Botão voltar */}
        <div className="flex justify-start mb-6">
          <Link 
            to="/administracao/gerenciamento-usuarios"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar ao gerenciamento
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center bg-blue-600 rounded-full">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Cadastro de Servidor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Criar nova conta para servidor público
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <Card className="bg-white dark:bg-gray-800 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Novo Servidor</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados do novo usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto">Nome Completo</Label>
                  <Input
                    id="nomeCompleto"
                    name="nomeCompleto"
                    type="text"
                    value={formData.nomeCompleto}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@municipio.gov.br"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={handleCPFChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="text"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoUsuario">Tipo de Usuário</Label>
                  <Select 
                    value={formData.tipoUsuario} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipoUsuario: value as UserProfile['tipo_usuario'] }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposUsuario.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretariaId">Secretaria</Label>
                  <Select 
                    value={formData.secretariaId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, secretariaId: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a secretaria" />
                    </SelectTrigger>
                    <SelectContent>
                      {secretarias.map((secretaria) => (
                        <SelectItem key={secretaria.id} value={secretaria.id}>
                          {secretaria.sigla} - {secretaria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  name="cargo"
                  type="text"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  placeholder="Ex: Coordenador, Analista, Assistente"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando usuário...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Usuário
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}