// ====================================================================
// 🛡️ FORMULÁRIO DE LOGIN SEGURO - COM RATE LIMITING E VALIDAÇÕES
// ====================================================================

import React, { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, LogIn, Shield, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/auth';
import { authRateLimiter, getClientIP } from "@/utils/rateLimiter";
import { validateEmail, validatePassword, getPasswordStrength } from "@/utils/validators";
import DemoCredentialsPanel from './DemoCredentialsPanel';

interface SecureLoginFormProps {
  className?: string;
  redirectTo?: string;
  showDemo?: boolean;
}

const SecureLoginForm: React.FC<SecureLoginFormProps> = ({
  className = '',
  redirectTo,
  showDemo = true
}) => {
  const { login: signIn, isLoading: loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Estado de UI
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado de rate limiting
  const [rateLimitInfo, setRateLimitInfo] = useState({
    canAttempt: true,
    attemptsLeft: 5,
    blockedUntil: 0,
    reason: ''
  });
  
  // Estado de validação em tempo real
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: '#gray'
  });

  // ====================================================================
  // EFEITOS
  // ====================================================================

  // Verificar rate limit a cada segundo quando bloqueado
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (rateLimitInfo.blockedUntil > 0) {
      interval = setInterval(() => {
        const now = Date.now();
        if (now >= rateLimitInfo.blockedUntil) {
          // Recarregar status do rate limit
          checkRateLimit();
        } else {
          // Atualizar tempo restante
          setRateLimitInfo(prev => ({
            ...prev,
            blockedUntil: prev.blockedUntil
          }));
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rateLimitInfo.blockedUntil]);

  // Limpar erro da auth quando componente monta
  useEffect(() => {
    if (error) clearError();
  }, []);

  // ====================================================================
  // HANDLERS
  // ====================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erros do campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Limpar erro geral
    if (error) clearError();
    
    // Validação em tempo real para senha
    if (name === 'password' && value) {
      setPasswordStrength(getPasswordStrength(value));
    } else if (name === 'password' && !value) {
      setPasswordStrength({ score: 0, feedback: '', color: '#gray' });
    }
  };

  const handleDemoCredentialsFill = (email: string, password: string) => {
    setFormData({ email, password });
    
    // Limpar erros
    setFieldErrors({});
    if (error) clearError();
    
    // Atualizar força da senha
    if (password) {
      setPasswordStrength(getPasswordStrength(password));
    }
  };

  const checkRateLimit = () => {
    const clientIP = getClientIP();
    const rateLimitCheck = authRateLimiter.canAttemptLogin(formData.email, clientIP);
    
    setRateLimitInfo({
      canAttempt: rateLimitCheck.canAttempt,
      attemptsLeft: rateLimitCheck.attemptsLeft || 0,
      blockedUntil: rateLimitCheck.remainingTime ? Date.now() + rateLimitCheck.remainingTime : 0,
      reason: rateLimitCheck.reason || ''
    });
    
    return rateLimitCheck.canAttempt;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validar email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!;
    }
    
    // Validar senha
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error!;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Prevenir duplo submit
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Verificar rate limiting
      if (!checkRateLimit()) {
        toast.error(rateLimitInfo.reason || 'Muitas tentativas. Tente novamente mais tarde.');
        return;
      }
      
      // Validar formulário
      if (!validateForm()) {
        toast.error('Por favor, corrija os erros no formulário');
        return;
      }
      
      console.log('🔐 Tentando login seguro...');
      
      // Tentar login
      const result = await signIn({ email: formData.email, password: formData.password });
      
      if (result.success) {
        // Registrar login bem-sucedido no rate limiter
        const clientIP = getClientIP();
        authRateLimiter.recordSuccessfulLogin(formData.email, clientIP);
        
        toast.success('Login realizado com sucesso!');
        console.log('✅ Login seguro bem-sucedido');
        
        // Navegar para página apropriada
        const redirectPath = result.redirectPath || redirectTo || 
          (result.user?.userType === 'citizen' ? '/cidadao/dashboard' : '/admin/dashboard');
        
        setTimeout(() => {
          navigate(redirectPath);
        }, 100);
        
      } else {
        // Registrar tentativa falhada no rate limiter
        const clientIP = getClientIP();
        authRateLimiter.recordFailedAttempt(formData.email, clientIP);
        
        // Atualizar info de rate limit
        checkRateLimit();
        
        toast.error(result.error?.message || 'Erro no login');
        console.error('❌ Erro no login seguro:', result.error);
      }
      
    } catch (err: Error | unknown) {
      console.error('❌ Erro inesperado no login:', err);
      
      // Registrar como tentativa falhada
      const clientIP = getClientIP();
      authRateLimiter.recordFailedAttempt(formData.email, clientIP);
      checkRateLimit();
      
      toast.error('Erro inesperado. Tente novamente.');
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================================================================
  // RENDER HELPERS
  // ====================================================================

  const getRemainingTimeString = (): string => {
    if (rateLimitInfo.blockedUntil <= 0) return '';
    
    const remaining = rateLimitInfo.blockedUntil - Date.now();
    const minutes = Math.ceil(remaining / 60000);
    
    return minutes > 1 ? `${minutes} minutos` : '1 minuto';
  };

  const isFormDisabled = (): boolean => {
    return loading || isSubmitting || !rateLimitInfo.canAttempt;
  };

  // ====================================================================
  // RENDER
  // ====================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rate Limiting Alert */}
        {!rateLimitInfo.canAttempt && (
          <Alert variant="destructive" className="border-red-300 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <div>
                <div className="font-semibold">Muitas tentativas de login</div>
                <div className="text-sm mt-1">
                  Tente novamente em {getRemainingTimeString()}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Auth Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Security Status */}
        {rateLimitInfo.canAttempt && rateLimitInfo.attemptsLeft < 5 && (
          <Alert variant="destructive" className="border-yellow-300 bg-yellow-50">
            <Shield className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              ⚠️ Atenção: {rateLimitInfo.attemptsLeft} tentativa(s) restante(s) antes do bloqueio
            </AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="seu@email.com"
            disabled={isFormDisabled()}
            className={fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''}
          />
          {fieldErrors.email && (
            <p className="text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Senha <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={isFormDisabled()}
              className={fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isFormDisabled()}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && passwordStrength.score > 0 && (
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-200 rounded">
                  <div 
                    className="h-full rounded transition-all"
                    style={{ 
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
                <span style={{ color: passwordStrength.color }}>
                  {passwordStrength.feedback}
                </span>
              </div>
            </div>
          )}
          
          {fieldErrors.password && (
            <p className="text-sm text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isFormDisabled()}
        >
          {isSubmitting || loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

      {/* Demo Credentials Panel */}
      {showDemo && (
        <DemoCredentialsPanel 
          onFillCredentials={handleDemoCredentialsFill}
          className="mt-4"
        />
      )}

      {/* Footer Links */}
      <div className="text-center space-y-2">
        <Link 
          to="/auth/forgot-password" 
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Esqueceu sua senha?
        </Link>
        
        <div className="text-xs text-gray-500">
          <Shield className="h-3 w-3 inline mr-1" />
          Protegido por sistema de segurança avançado
        </div>
      </div>
    </div>
  );
};

export default SecureLoginForm;