// ====================================================================
// LOGIN DIRETO - BYPASSA PROBLEMAS DE RLS
// ====================================================================
// Componente de login que usa sistema direto via RPC
// ====================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/auth';
import { toast } from 'sonner';

interface DirectLoginProps {
  redirectTo?: string;
  title?: string;
  description?: string;
}

export const DirectLogin: React.FC<DirectLoginProps> = ({
  redirectTo = '/super-admin/dashboard',
  title = 'Login Super Administrador',
  description = 'Sistema de autenticação direta'
}) => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    try {
      console.log('🔐 [DirectLogin] Iniciando login direto...');
      
      await login({
        email: formData.email,
        password: formData.password
      });
      
      // O novo sistema AUTH2 não retorna response, ele atualiza o contexto diretamente
      toast.success('Login realizado com sucesso!');
      console.log('✅ [DirectLogin] Login AUTH2 bem-sucedido');
      
      // Aguardar um pouco para o contexto ser atualizado
      setTimeout(() => {
        navigate(redirectTo);
      }, 100);
    } catch (error: Error | unknown) {
      console.error('❌ [DirectLogin] Erro no login:', error);
      setLoginAttempts(prev => prev + 1);
      
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.message.includes('Acesso negado')) {
        errorMessage = error.message;
      } else if (error.message.includes('recursion')) {
        errorMessage = 'Problema temporário no sistema. Tente novamente.';
      }
      
      toast.error(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>
            {description}
            <br />
            <span className="text-xs text-green-600 font-medium">
              ✅ Sistema Direto - Bypass RLS
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                  {loginAttempts > 2 && (
                    <div className="mt-2 text-xs">
                      💡 Dica: Verifique se as RLS policies estão configuradas corretamente.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Sistema de autenticação direta v2.0
              <br />
              <span className="text-green-600">
                ✓ Resistente a problemas de RLS
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};