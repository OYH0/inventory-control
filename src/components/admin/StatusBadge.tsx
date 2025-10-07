import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  isActive: boolean;
  variant?: 'default' | 'compact';
}

export function StatusBadge({ isActive, variant = 'default' }: StatusBadgeProps) {
  if (variant === 'compact') {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-green-500' : 'bg-gray-400'}>
        {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isActive ? 'default' : 'secondary'} 
      className={isActive ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-white hover:bg-gray-500'}
    >
      {isActive ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" />
          Ativo
        </>
      ) : (
        <>
          <XCircle className="w-3 h-3 mr-1" />
          Inativo
        </>
      )}
    </Badge>
  );
}

