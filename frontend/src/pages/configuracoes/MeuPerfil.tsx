
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/auth';
import { useEffect, useState } from "react";
import { User, Key, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ProfileImageUpload from "@/components/ProfileImageUpload";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  bio: z.string().max(160).optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Senha atual é obrigatória",
    }),
    newPassword: z.string().min(8, {
      message: "Senha deve ter pelo menos 8 caracteres",
    }),
    confirmPassword: z.string().min(8, {
      message: "Confirmar senha é obrigatório",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const MeuPerfil = () => {
  const { user, profile, isCitizen } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Carregar dados do usuário atual
  useEffect(() => {
    if (profile && user) {
      const tipoFormatado = {
        'super_admin': 'super_admin',
        'admin': 'admin',
        'secretario': 'secretario',
        'diretor': 'diretor',
        'coordenador': 'coordenador',
        'funcionario': 'funcionario',
        'atendente': 'atendente',
        'cidadao': 'cidadao'
      }[profile.tipo_usuario] || profile.tipo_usuario;

      form.reset({
        name: profile.nome_completo,
        email: user.email || '',
        bio: '',
        role: tipoFormatado,
        department: '', // Será implementado quando tivermos dados da secretaria
        phone: '',
      });

      // Carregar foto de perfil atual
      setProfileImageUrl(profile.foto_perfil || '');
    }
  }, [profile, user, form]);

  function onSubmit(data: ProfileFormValues) {
    // TODO: Implementar atualização real do perfil no Supabase
    toast.success('Perfil atualizado com sucesso!');
    console.log('Dados para atualizar:', data);
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsChangingPassword(true);
    
    try {
      console.log('🔐 Iniciando alteração de senha...');
      
      // Verificar se o usuário está autenticado
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Usar o método updateUser do Supabase para alterar a senha
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        console.error('❌ Erro ao alterar senha:', error);
        
        // Tratar diferentes tipos de erro
        if (error.message.includes('New password should be different')) {
          toast.error('A nova senha deve ser diferente da atual');
        } else if (error.message.includes('Password should be at least')) {
          toast.error('A senha deve ter pelo menos 6 caracteres');
        } else {
          toast.error(`Erro ao alterar senha: ${error.message}`);
        }
        return;
      }

      console.log('✅ Senha alterada com sucesso');
      toast.success('Senha alterada com sucesso!');
      
      // Limpar formulário e fechar
      passwordForm.reset();
      setShowPasswordForm(false);
      
    } catch (error) {
      console.error('❌ Erro inesperado ao alterar senha:', error);
      toast.error('Erro inesperado ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
  }

  // Callback para atualizar foto de perfil
  const handleImageUpdate = (newImageUrl: string) => {
    setProfileImageUrl(newImageUrl);
    // Também pode atualizar o contexto de autenticação se necessário
  };

  return (
    
      <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerenciar suas informações pessoais e preferências de conta.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="mb-1">Foto de Perfil</CardTitle>
              <CardDescription>
                Esta foto será exibida em seu perfil e em algumas áreas do sistema.
                Tamanho recomendado: 200x200px, formato WebP, máximo 100KB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileImageUpload 
                currentImageUrl={profileImageUrl}
                onImageUpdate={handleImageUpdate}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de contato e identificação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um cargo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="super_admin">Super Administrador</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="secretario">Secretário</SelectItem>
                              <SelectItem value="diretor">Diretor</SelectItem>
                              <SelectItem value="coordenador">Coordenador</SelectItem>
                              <SelectItem value="funcionario">Funcionário</SelectItem>
                              <SelectItem value="atendente">Atendente</SelectItem>
                              <SelectItem value="cidadao">Cidadão</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um departamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="administracao">Administração</SelectItem>
                              <SelectItem value="financas">Finanças</SelectItem>
                              <SelectItem value="tecnologia">Tecnologia</SelectItem>
                              <SelectItem value="saude">Saúde</SelectItem>
                              <SelectItem value="educacao">Educação</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografia</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conte um pouco sobre você"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Breve descrição para seu perfil. Máximo 160 caracteres.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      Trocar Senha
                    </Button>
                    <Button type="submit">Salvar alterações</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Formulário de Trocar Senha */}
          {showPasswordForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Trocar Senha
                </CardTitle>
                <CardDescription>
                  Atualize sua senha para manter sua conta segura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Dica de Segurança</AlertTitle>
                  <AlertDescription>
                    Use uma senha forte com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.
                  </AlertDescription>
                </Alert>

                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha Atual</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Digite sua senha atual" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova Senha</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Digite sua nova senha" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Nova Senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Digite novamente sua nova senha"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 flex justify-end gap-3">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          passwordForm.reset();
                          setShowPasswordForm(false);
                        }}
                        disabled={isChangingPassword}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? 'Alterando...' : 'Atualizar Senha'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    
  );
};

export default MeuPerfil;
