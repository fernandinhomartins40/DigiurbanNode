import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, ArrowLeft, Users, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

export default function CidadaoLogin() {
  const navigate = useNavigate()
  const { login: signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro quando usuário começar a digitar
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔐 Login do cidadão...')
      
      const response = await signIn({ email: formData.email, password: formData.password })
      
      if (response.success && response.user) {
        // Verificar se é cidadão
        if (response.user.userType !== 'citizen') {
          throw new Error('Acesso negado. Este portal é exclusivo para cidadãos.')
        }
        
        toast.success('Login realizado com sucesso!')
        console.log('✅ Login do cidadão realizado com sucesso')
        
        // Redirecionamento direto
        if (response.redirectPath) {
          navigate(response.redirectPath)
        } else {
          navigate('/cidadao/dashboard')
        }
      } else {
        throw new Error(response.error?.message || 'Dados de autenticação inválidos')
      }
    } catch (error: Error | unknown) {
      console.error('❌ Erro no login do cidadão:', error)
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email ainda não confirmado. Verifique sua caixa de entrada.'
      } else if (error.message.includes('Perfil de cidadão não encontrado')) {
        errorMessage = 'Conta não encontrada. Faça seu cadastro primeiro.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-cyan-700 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Portal do Cidadão</h1>
          <p className="text-gray-600">Acesse os serviços municipais de forma prática</p>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar seus serviços
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email ou CPF</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="Digite seu email ou CPF"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 pr-10"
                    disabled={loading}
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
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-green-600 to-cyan-700 hover:from-green-700 hover:to-cyan-800"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center text-sm">
                <Link
                  to="/cidadao/auth/forgot-password"
                  className="text-green-600 hover:text-green-800 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Novo por aqui?</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full h-11" asChild>
                <Link to="/cidadao/register">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar conta
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao início
            </Link>
          </Button>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>Portal oficial dos serviços municipais</p>
            <p>Seus dados estão protegidos pela Lei Geral de Proteção de Dados</p>
          </div>
        </div>
      </div>
    </div>
  )
}