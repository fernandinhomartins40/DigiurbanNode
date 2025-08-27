
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const passwordSchema = z
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

type PasswordFormValues = z.infer<typeof passwordSchema>;

const TrocarSenha = () => {
  const { toast } = useToast();
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  function onSubmit(data: PasswordFormValues) {
    toast({
      title: "Senha atualizada",
      description: "Sua senha foi atualizada com sucesso.",
    });
    console.log(data);
    form.reset();
  }

  const lastPasswordChanges = [
    { date: "10/05/2025", ip: "192.168.1.45", device: "Windows/Chrome" },
    { date: "25/02/2025", ip: "192.168.1.45", device: "Android/Chrome" },
    { date: "12/11/2024", ip: "187.54.123.72", device: "Windows/Edge" },
  ];

  return (
    
      <div className="mx-auto max-w-3xl p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trocar Senha</h1>
          <p className="text-muted-foreground">
            Atualize sua senha para manter sua conta segura.
          </p>
        </div>

        <div className="grid gap-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Dica de Segurança</AlertTitle>
            <AlertDescription>
              Use uma senha forte com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Informe sua senha atual e escolha uma nova senha segura.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua senha atual" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                  <div className="pt-4 flex justify-end">
                    <Button type="submit">Atualizar Senha</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
              <CardDescription>
                Últimas alterações de senha realizadas na sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-medium p-2">Data</th>
                      <th className="text-left font-medium p-2">Endereço IP</th>
                      <th className="text-left font-medium p-2">Dispositivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastPasswordChanges.map((change, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{change.date}</td>
                        <td className="p-2">{change.ip}</td>
                        <td className="p-2">{change.device}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    
  );
};

export default TrocarSenha;
