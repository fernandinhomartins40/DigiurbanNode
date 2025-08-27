import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'react-hot-toast';

// ====================================================================
// INTERFACES
// ====================================================================

interface UserCredentials {
  id: string;
  email: string;
  temporary_password: string;
  user_id: string;
  tenant_name: string;
  tenant_code: string;
  created_at: string;
}

interface UserCredentialsAlertProps {
  credentials: UserCredentials;
  onDismiss?: () => void;
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const UserCredentialsAlert: React.FC<UserCredentialsAlertProps> = ({
  credentials,
  onDismiss
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const handleCopy = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type === 'email' ? 'Email' : 'Senha'} copiado!`);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Key className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-900">Usuário Criado com Sucesso</CardTitle>
              <CardDescription className="text-green-700">
                Credenciais temporárias para acesso inicial
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-green-600 hover:bg-green-100"
            >
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações do Tenant */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
          <Building2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">{credentials.tenant_name}</p>
            <p className="text-sm text-green-600">{credentials.tenant_code}</p>
          </div>
        </div>

        {/* Credenciais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-green-600" />
              <label className="text-xs font-medium text-green-700 uppercase tracking-wide">
                Email de Acesso
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-green-900 break-all">
                {credentials.email}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(credentials.email, 'email')}
                className="ml-2 text-green-600 border-green-200 hover:bg-green-50"
              >
                {copied === 'email' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Senha */}
          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-green-600" />
              <label className="text-xs font-medium text-green-700 uppercase tracking-wide">
                Senha Temporária
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-green-900">
                {showPassword ? credentials.temporary_password : '••••••••'}
              </span>
              <div className="flex gap-1 ml-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(credentials.temporary_password, 'password')}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  {copied === 'password' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-green-700 border-green-300">
            <User className="h-3 w-3 mr-1" />
            ID: {credentials.user_id.substring(0, 8)}...
          </Badge>
          <Badge variant="outline" className="text-green-700 border-green-300">
            Criado: {formatDate(credentials.created_at)}
          </Badge>
        </div>

        {/* Avisos importantes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Lembre-se:</h4>
              <ul className="text-xs text-yellow-800 mt-1 space-y-1">
                <li>• A senha temporária expira em 24 horas</li>
                <li>• O usuário deve alterar a senha no primeiro login</li>
                <li>• Email de boas-vindas foi enviado automaticamente</li>
                <li>• Acesso em: <span className="font-mono">{window.location.origin}/auth/login</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              const message = `Credenciais de acesso:\nEmail: ${credentials.email}\nSenha: ${credentials.temporary_password}\n\nTenant: ${credentials.tenant_name} (${credentials.tenant_code})\nAcesso: ${window.location.origin}/auth/login`;
              navigator.clipboard.writeText(message);
              toast.success('Todas as informações copiadas!');
            }}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copiar Tudo
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open('/auth/login', '_blank')}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            Testar Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCredentialsAlert;