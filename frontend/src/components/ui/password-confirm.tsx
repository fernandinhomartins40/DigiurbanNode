import React from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';

interface PasswordConfirmProps {
  value: string;
  passwordValue: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const PasswordConfirm: React.FC<PasswordConfirmProps> = ({
  value,
  passwordValue,
  onChange,
  label = "Confirmar Senha",
  placeholder = "Digite a senha novamente",
  required = false,
  className = ""
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const passwordsMatch = value === passwordValue && value.length > 0;
  const hasValue = value.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <Label htmlFor="confirm-password">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-12 ${
            hasValue 
              ? passwordsMatch 
                ? 'border-green-500 focus:border-green-500' 
                : 'border-red-500 focus:border-red-500'
              : ''
          }`}
          required={required}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>

      {/* Feedback visual */}
      {hasValue && (
        <div className="flex items-center space-x-2">
          {passwordsMatch ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                As senhas coincidem
              </span>
            </>
          ) : (
            <>
              <X className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600 font-medium">
                As senhas não coincidem
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};