import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, ArrowLeft, Building2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectFrom = searchParams.get('from') || '/admin/dashboard'
  const { login: signIn, isAuthenticated, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  // ✅ Redirecionamento automático quando autenticado
  useEffect(() => {
    if (isAuthenticated && profile && !loading) {
      console.log('🔄 Usuário autenticado detectado, redirecionando para:', redirectFrom)
      toast.success('Login realizado com sucesso!')
      
      // Usar setTimeout para evitar conflitos
      setTimeout(() => {
        navigate(redirectFrom, { replace: true })
      }, 100)
    }
  }, [isAuthenticated, profile, loading, redirectFrom, navigate])

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
      console.log('🔐 Login administrativo iniciado...')
      
      // O useAuth.login retorna void e atualiza o contexto
      // O redirecionamento será feito pelo useEffect quando isAuthenticated for true
      await signIn({ email: formData.email, password: formData.password })
      
      console.log('✅ Login concluído - aguardando redirecionamento automático')
      
    } catch (error: Error | unknown) {
      console.error('❌ Erro no login administrativo:', error)
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email ainda não confirmado. Verifique sua caixa de entrada.'
      } else if (error.message.includes('exclusivo para administradores')) {
        errorMessage = 'Acesso negado. Este portal é exclusivo para administradores e funcionários.'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Portal Administrativo</h1>
          <p className="text-gray-600">Digite suas credenciais para acessar o sistema</p>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Acesso exclusivo para administradores e funcionários
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu.email@prefeitura.gov.br"
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
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
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

            <div className="mt-6 text-center text-sm">
              <Link
                to="/admin/auth/forgot-password"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Esqueceu sua senha?
              </Link>
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
          
          <div className="text-xs text-gray-500">
            <p>Portal exclusivo para administradores e funcionários municipais</p>
            <p>Em caso de problemas, entre em contato com o suporte técnico</p>
          </div>
        </div>
      </div>
    </div>
  )
}