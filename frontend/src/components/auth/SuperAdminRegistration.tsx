// ====================================================================
// 🚨 REGISTRO PROVISÓRIO DE SUPER ADMIN - DIGIURBAN
// ====================================================================
// ATENÇÃO: Este componente é PROVISÓRIO e deve ser REMOVIDO após
// a criação do super admin inicial
// ====================================================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Shield, User } from 'lucide-react';

interface SuperAdminRegistrationProps {
  onSuccess?: () => void;
}

export const SuperAdminRegistration: React.FC<SuperAdminRegistrationProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    nome_completo: 'Fernando Martins',
    email: 'fernandinhomartins040@gmail.com',
    password: 'Nando157940/',
    confirmPassword: 'Nando157940/'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Erro", 
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/super-admin-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome_completo: formData.nome_completo,
          email: formData.email,
          password: formData.password,
          role: 'super_admin'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Super Admin criado com sucesso! Você pode fazer login agora.",
        });
        
        setFormData({
          nome_completo: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Erro",
          description: data.error || 'Erro ao criar super admin',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao registrar super admin:', error);
      toast({
        title: "Erro",
        description: 'Erro de conexão com o servidor',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            <Shield className="inline mr-2" size={24} />
            Registro Super Admin
          </CardTitle>
          <CardDescription className="text-gray-600">
            Formulário provisório para criação do super admin inicial
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              <strong>ATENÇÃO:</strong> Este formulário é provisório e será removido após 
              a criação do super admin. Use apenas para configuração inicial!
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">
                <User className="inline mr-1" size={16} />
                Nome Completo
              </Label>
              <Input
                id="nome_completo"
                type="text"
                placeholder="Digite o nome completo"
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Criando Super Admin...' : 'Criar Super Admin'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Lembrete:</strong> Após criar o super admin, acesse o sistema e 
              desabilite/remova este formulário imediatamente por segurança.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminRegistration;