import React from 'react';
import { MapPin, Building2 } from 'lucide-react';
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
  onUnitChange: (unit: Unidade) => void;
  loading?: boolean;
  className?: string;
  showLabel?: boolean;
}

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
        Sem acesso a unidades
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

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
          Unidade:
        </span>
      )}
      <Select
        value={selectedUnit || undefined}
        onValueChange={(value) => onUnitChange(value as Unidade)}
      >
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Selecione a unidade">
            {selectedUnit && (
              <div className="flex items-center gap-2">
                <span>{unitIcons[selectedUnit]}</span>
                <span>{unitLabels[selectedUnit]}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
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
