// ====================================================================
// 🔐 COMPONENTE DE LOGIN JWT - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Componente de login adaptado para sistema JWT local
// Interface moderna e responsiva com validação completa
// ====================================================================

import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { toast } from 'sonner';

// ====================================================================
// INTERFACES
// ====================================================================

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export const JWTLogin: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Estados do formulário
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  // ================================================================
  // VALIDAÇÃO DO FORMULÁRIO
  // ================================================================

  const validateForm = useCallback((data: LoginFormData): LoginFormErrors => {
    const errors: LoginFormErrors = {};

    // Validar email
    if (!data.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Email deve ter formato válido';
    }

    // Validar senha
    if (!data.password) {
      errors.password = 'Senha é obrigatória';
    } else if (data.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    return errors;
  }, []);

  // ================================================================
  // HANDLERS DOS EVENTOS
  // ================================================================

  const handleInputChange = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro específico quando usuário corrigir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar formulário
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Limpar erros
      setErrors({});

      // Fazer login
      await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      // Sucesso - será redirecionado automaticamente pelo useAuth
      toast.success('Login realizado com sucesso!');
      
      // Navegação condicional baseada no role será feita pelo ProtectedRoute
      navigate('/dashboard');

    } catch (error) {
      console.error('Erro no login:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  }, [formData, validateForm, login, navigate]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Digiurban</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão Municipal</p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Fazer Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Erro geral */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Links adicionais */}
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <span>Não tem conta? </span>
                <Link 
                  to="/auth/register-citizen" 
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Cadastre-se como cidadão
                </Link>
              </div>

              <div className="text-center text-sm text-gray-500">
                <span>Prefeitura? </span>
                <Link 
                  to="/auth/register-tenant" 
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Cadastre sua prefeitura
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 Digiurban. Sistema seguro com criptografia JWT.</p>
        </div>
      </div>
    </div>
  );
};

export default JWTLogin;