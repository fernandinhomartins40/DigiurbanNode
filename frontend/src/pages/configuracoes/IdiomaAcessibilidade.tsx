
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Languages, Accessibility, Type, Monitor, MousePointer } from "lucide-react";

const accessibilityFormSchema = z.object({
  language: z.string(),
  textSize: z.array(z.number()),
  highContrast: z.boolean(),
  reduceMotion: z.boolean(),
  screenReader: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
});

type AccessibilityFormValues = z.infer<typeof accessibilityFormSchema>;

const defaultValues: AccessibilityFormValues = {
  language: "pt-BR",
  textSize: [1], // 1 = normal (0 = smaller, 2 = larger)
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  theme: "system",
};

const IdiomaAcessibilidade = () => {
  const { toast } = useToast();
  const form = useForm<AccessibilityFormValues>({
    resolver: zodResolver(accessibilityFormSchema),
    defaultValues,
  });

  function onSubmit(data: AccessibilityFormValues) {
    toast({
      title: "Configurações atualizadas",
      description: "Suas preferências de idioma e acessibilidade foram salvas.",
    });
    console.log(data);
  }

  const languages = [
    { label: "Português (Brasil)", value: "pt-BR" },
    { label: "English (US)", value: "en-US" },
    { label: "Español", value: "es" },
    { label: "Français", value: "fr" },
  ];

  const getTextSizeLabel = (size: number) => {
    switch (size) {
      case 0:
        return "Pequeno";
      case 1:
        return "Normal";
      case 2:
        return "Grande";
      default:
        return "Normal";
    }
  };

  return (
    
      <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Idioma e Acessibilidade</h1>
          <p className="text-muted-foreground">
            Personalize suas preferências de idioma e recursos de acessibilidade.
          </p>
        </div>

        <div className="grid gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" /> Configurações de Idioma
                  </CardTitle>
                  <CardDescription>
                    Escolha seu idioma preferido para a interface do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma da Interface</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um idioma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem key={language.value} value={language.value}>
                                {language.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          O idioma selecionado será aplicado em todo o sistema.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" /> Aparência
                  </CardTitle>
                  <CardDescription>
                    Personalize o aspecto visual do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="light" />
                              </FormControl>
                              <FormLabel className="font-normal">Claro</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="dark" />
                              </FormControl>
                              <FormLabel className="font-normal">Escuro</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="system" />
                              </FormControl>
                              <FormLabel className="font-normal">Seguir configuração do sistema</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Accessibility className="h-5 w-5" /> Recursos de Acessibilidade
                  </CardTitle>
                  <CardDescription>
                    Configure recursos que tornam o sistema mais acessível
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="textSize"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between mb-2">
                          <FormLabel className="flex items-center gap-2">
                            <Type className="h-4 w-4" /> Tamanho do Texto
                          </FormLabel>
                          <span className="text-sm">
                            {getTextSizeLabel(field.value[0])}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2}
                            step={1}
                            value={field.value}
                            onValueChange={field.onChange}
                            className="w-full"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Menor</span>
                          <span>Normal</span>
                          <span>Maior</span>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="highContrast"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <MousePointer className="h-4 w-4" /> Alto Contraste
                            </FormLabel>
                            <FormDescription>
                              Aumentar o contraste para melhorar a legibilidade
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reduceMotion"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Reduzir Animações</FormLabel>
                            <FormDescription>
                              Minimizar efeitos de movimento na interface
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="screenReader"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Compatibilidade com Leitor de Tela</FormLabel>
                            <FormDescription>
                              Otimizar a interface para uso com leitores de tela
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit">Salvar Configurações</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    
  );
};

export default IdiomaAcessibilidade;
