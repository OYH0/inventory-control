import { useState } from 'react';
import { KeyRound, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PasswordGeneratorProps {
  value: string;
  onChange: (password: string) => void;
  label?: string;
  required?: boolean;
}

export function PasswordGenerator({ value, onChange, label = 'Senha Temporária', required }: PasswordGeneratorProps) {
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + special;
    
    // Garantir pelo menos um de cada tipo
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Preencher o resto (16 caracteres total)
    for (let i = password.length; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Embaralhar
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    onChange(password);
    toast.success('Senha segura gerada!');
  };

  const copyToClipboard = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Senha copiada para a área de transferência');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar senha');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="password">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="password"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Senha temporária"
            className="pr-10 font-mono text-sm"
            required={required}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={generatePassword}
          className="shrink-0"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Gerar
        </Button>
      </div>
      {value && (
        <p className="text-xs text-orange-600 flex items-center gap-1">
          <KeyRound className="w-3 h-3" />
          Guarde esta senha! Ela não será exibida novamente após criar o usuário.
        </p>
      )}
    </div>
  );
}

