import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'date' 
  | 'time'
  | 'multiselect';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  validation?: z.ZodTypeAny;
  className?: string;
  description?: string;
  show?: (values: any) => boolean;
}

interface FormModalProps<T = any> {
  trigger?: React.ReactNode;
  title: string;
  fields: FieldConfig[];
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void;
  isLoading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  submitLabel?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function FormModal<T = any>({
  trigger,
  title,
  fields,
  defaultValues,
  onSubmit,
  isLoading = false,
  open,
  onOpenChange,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  size = 'md'
}: FormModalProps<T>) {
  // Criar schema de validação dinamicamente
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    fields.forEach(field => {
      if (field.validation) {
        schemaFields[field.name] = field.validation;
      } else {
        // Schema padrão baseado no tipo
        let fieldSchema: z.ZodTypeAny;
        
        switch (field.type) {
          case 'email':
            fieldSchema = z.string().email('Email inválido');
            break;
          case 'number':
            fieldSchema = z.number().or(z.string().transform(val => Number(val)));
            break;
          case 'checkbox':
            fieldSchema = z.boolean();
            break;
          case 'date':
            fieldSchema = z.date().or(z.string().transform(val => new Date(val)));
            break;
          case 'multiselect':
            fieldSchema = z.array(z.string());
            break;
          default:
            fieldSchema = z.string();
        }
        
        if (!field.required) {
          fieldSchema = fieldSchema.optional();
        }
        
        schemaFields[field.name] = fieldSchema;
      }
    });
    
    return z.object(schemaFields);
  };

  const form = useForm<T>({
    resolver: zodResolver(createSchema()),
    defaultValues: defaultValues as any,
  });

  const watchedValues = form.watch();

  const handleSubmit = (data: T) => {
    onSubmit(data);
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  const renderField = (field: FieldConfig) => {
    // Verificar se o campo deve ser exibido
    if (field.show && !field.show(watchedValues)) {
      return null;
    }

    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as any}
        render={({ field: formField }) => (
          <FormItem className={field.className}>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {(() => {
                switch (field.type) {
                  case 'textarea':
                    return (
                      <Textarea
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        {...formField}
                      />
                    );
                    
                  case 'select':
                    return (
                      <Select 
                        value={formField.value} 
                        onValueChange={formField.onChange}
                        disabled={field.disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                    
                  case 'checkbox':
                    return (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                          disabled={field.disabled}
                        />
                        {field.description && (
                          <label className="text-sm text-muted-foreground">
                            {field.description}
                          </label>
                        )}
                      </div>
                    );
                    
                  case 'date':
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !formField.value && "text-muted-foreground"
                            )}
                            disabled={field.disabled}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formField.value ? (
                              format(new Date(formField.value), "dd/MM/yyyy")
                            ) : (
                              <span>{field.placeholder || "Selecione uma data"}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formField.value ? new Date(formField.value) : undefined}
                            onSelect={formField.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    );
                    
                  case 'time':
                    return (
                      <Input
                        type="time"
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        {...formField}
                      />
                    );
                    
                  case 'number':
                    return (
                      <Input
                        type="number"
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        {...formField}
                        onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : '')}
                      />
                    );
                    
                  default:
                    return (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        {...formField}
                      />
                    );
                }
              })()}
            </FormControl>
            {field.description && field.type !== 'checkbox' && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const content = (
    <DialogContent className={cn(sizeClasses[size])}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            {fields.map(renderField)}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
}