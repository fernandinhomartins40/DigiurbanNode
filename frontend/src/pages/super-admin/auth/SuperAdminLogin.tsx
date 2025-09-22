import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, ArrowLeft, Shield, Crown } from 'lucide-react'
import { toast } from 'sonner'
// Supabase removido - usando sistema JWT unificado

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('from') || '/super-admin/dashboard'
  const { login, logout, profile, isAuthenticated, isSuperAdmin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  // ✅ Redirecionamento automático quando autenticado como super admin
  useEffect(() => {
    if (isAuthenticated && profile && !loading) {
      console.log('🔄 [SUPER-ADMIN] Usuário autenticado detectado:', { role: profile.role, email: profile.email })
      
      if (profile.role === 'super_admin' || isSuperAdmin()) {
        console.log('✅ [SUPER-ADMIN] Super Admin confirmado, redirecionando...')
        toast.success('🎆 Login de Super Administrador realizado com sucesso!')
        
        setTimeout(() => {
          navigate(redirectTo, { replace: true })
        }, 1000)
      } else {
        console.log('🚫 [SUPER-ADMIN] Access denied for role:', profile.role)
        toast.error('Acesso negado. Este portal é exclusivo para Super Administradores.')
        setError('Acesso negado. Este portal é exclusivo para Super Administradores.')
        logout() // Fazer logout se não for super admin
      }
    }
  }, [isAuthenticated, profile, loading, redirectTo, navigate, isSuperAdmin, logout])

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
      console.log('🔐 [SUPER-ADMIN] Login Super Administrador iniciado...')
      
      // O useAuth.login retorna um resultado mas o useEffect detectará a mudança de estado
      // O redirecionamento será feito pelo useEffect quando isAuthenticated for true
      await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      })
      
      console.log('✅ [SUPER-ADMIN] Login concluído - aguardando redirecionamento automático')
    } catch (error: Error | unknown) {
      console.error('❌ Erro no login Super Admin:', error)
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais de Super Administrador.'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Verifique suas credenciais de Super Administrador.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email ainda não confirmado. Entre em contato com o suporte técnico.'
      } else if (error.message.includes('exclusivo para Super Administradores')) {
        errorMessage = 'Acesso negado. Este portal é exclusivo para Super Administradores.'
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
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 flex flex-col items-center justify-start px-4 py-12 overflow-y-auto">
      <div className="w-full max-w-md space-y-6 flex-shrink-0 mt-8 mb-16">
        {/* Header Premium */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mb-4 shadow-2xl border-4 border-amber-300/30">
              <Crown className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
            Super Administrador
          </h1>
          <p className="text-purple-200">
            🔐 Portal Executivo - Acesso Máximo Restrito
          </p>
        </div>

        {/* Login Form Premium */}
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-white flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-amber-400" />
              Acesso Executivo
            </CardTitle>
            <CardDescription className="text-center text-purple-200">
              Credenciais de Super Administrador necessárias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-400/50 text-red-100">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">Email Corporativo</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@digiurban.com.br"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-12 bg-white/10 border-white/30 text-white placeholder:text-purple-300 focus:border-amber-400 focus:ring-amber-400/50"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">Senha Master</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha master"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-12 pr-12 bg-white/10 border-white/30 text-white placeholder:text-purple-300 focus:border-amber-400 focus:ring-amber-400/50"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10 text-purple-300"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Autenticando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Acessar Portal Executivo
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link
                to="/super-admin/auth/forgot-password"
                className="text-amber-300 hover:text-amber-200 hover:underline"
              >
                Recuperar credenciais master?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-100">
              <p className="font-medium mb-1">⚠️ Área de Segurança Máxima</p>
              <p className="text-xs text-amber-200">
                Este portal concede acesso total ao sistema. Todos os acessos são monitorados e registrados.
                Em caso de uso não autorizado, as autoridades competentes serão notificadas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <Button variant="ghost" size="sm" asChild className="text-purple-300 hover:text-white">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao site principal
            </Link>
          </Button>
          
          <div className="text-xs text-purple-400 space-y-1">
            <p>DigiUrban - Sistema de Gestão Municipal</p>
            <p>Portal Super Administrador - Versão 2.0</p>
            <p>© 2025 - Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </div>
  )
}