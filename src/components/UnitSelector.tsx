import React from 'react';
import { MapPin, Building2, Globe2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Unidade } from '@/hooks/useUnitPermissions';

interface UnitSelectorProps {
  selectedUnit: Unidade | null;
  accessibleUnits: Unidade[];
  onUnitChange: (unit: Unidade | null) => void;
  loading?: boolean;
  className?: string;
  showLabel?: boolean;
}

const ALL_VALUE = '__all__';

const unitLabels: Record<Unidade, string> = {
  juazeiro_norte: 'Juazeiro do Norte',
  fortaleza: 'Fortaleza',
};

const unitIcons: Record<Unidade, string> = {
  juazeiro_norte: '🏜️',
  fortaleza: '🌊',
};

export function UnitSelector({
  selectedUnit,
  accessibleUnits,
  onUnitChange,
  loading = false,
  className,
  showLabel = true,
}: UnitSelectorProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="h-9 w-40 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (accessibleUnits.length === 0) {
    return (
      <Badge variant="destructive" className={className}>
        <MapPin className="h-3 w-3 mr-1" />
        Sem acesso
      </Badge>
    );
  }

  if (accessibleUnits.length === 1) {
    return (
      <Badge variant="outline" className={cn('gap-1.5', className)}>
        <Building2 className="h-3.5 w-3.5" />
        <span>{unitIcons[accessibleUnits[0]]}</span>
        <span>{unitLabels[accessibleUnits[0]]}</span>
      </Badge>
    );
  }

  const currentValue = selectedUnit ?? ALL_VALUE;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
          Unidade:
        </span>
      )}
      <Select
        value={currentValue}
        onValueChange={(value) => onUnitChange(value === ALL_VALUE ? null : (value as Unidade))}
      >
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue>
            {selectedUnit ? (
              <div className="flex items-center gap-2">
                <span>{unitIcons[selectedUnit]}</span>
                <span className="truncate">{unitLabels[selectedUnit]}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4" />
                <span>Todas as Unidades</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              <span>Todas as Unidades</span>
            </div>
          </SelectItem>
          {accessibleUnits.map((unit) => (
            <SelectItem key={unit} value={unit}>
              <div className="flex items-center gap-2">
                <span>{unitIcons[unit]}</span>
                <span>{unitLabels[unit]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
