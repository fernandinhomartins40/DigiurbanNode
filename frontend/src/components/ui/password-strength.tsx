import React from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';

interface PasswordStrengthProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  value,
  onChange,
  label = "Senha",
  placeholder = "Digite uma senha forte",
  required = false,
  className = ""
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  // Verificar requisitos da senha
  const requirements: PasswordRequirement[] = [
    { text: "Pelo menos 8 caracteres", met: value.length >= 8 },
    { text: "Ao menos uma letra maiúscula", met: /[A-Z]/.test(value) },
    { text: "Ao menos uma letra minúscula", met: /[a-z]/.test(value) },
    { text: "Ao menos um número", met: /\d/.test(value) },
    { text: "Ao menos um símbolo (!@#$%^&*)", met: /[!@#$%^&*(),.?\":{}|<>]/.test(value) }
  ];

  const metRequirements = requirements.filter(req => req.met).length;
  const strengthPercentage = (metRequirements / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage < 40) return 'bg-red-500';
    if (strengthPercentage < 70) return 'bg-yellow-500';
    if (strengthPercentage < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strengthPercentage < 40) return 'Fraca';
    if (strengthPercentage < 70) return 'Média';
    if (strengthPercentage < 90) return 'Boa';
    return 'Forte';
  };

  const isStrong = strengthPercentage === 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <Label htmlFor="password">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-12"
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

      {/* Barra de força da senha */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Força da senha:</span>
            <span className={`font-semibold ${
              isStrong ? 'text-green-600' : 
              strengthPercentage >= 70 ? 'text-blue-600' :
              strengthPercentage >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {getStrengthText()}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${strengthPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de requisitos */}
      {value.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm text-gray-600 font-medium">Requisitos:</p>
          <div className="space-y-1">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                {requirement.met ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
                <span className={requirement.met ? 'text-green-700' : 'text-red-700'}>
                  {requirement.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};