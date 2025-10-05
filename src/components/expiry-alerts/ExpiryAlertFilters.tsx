import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterState {
  status?: string[];
  priority?: string[];
  location?: 'juazeiro_norte' | 'fortaleza';
}

interface ExpiryAlertFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function ExpiryAlertFilters({ filters, onFilterChange }: ExpiryAlertFiltersProps) {
  const handleClearFilters = () => {
    onFilterChange({});
  };

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label htmlFor="location-filter">Localização</Label>
            <Select
              value={filters.location || 'all'}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  location: value === 'all' ? undefined : (value as 'juazeiro_norte' | 'fortaleza')
                })
              }
            >
              <SelectTrigger id="location-filter">
                <SelectValue placeholder="Todas as localizações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as localizações</SelectItem>
                <SelectItem value="juazeiro_norte">Juazeiro do Norte</SelectItem>
                <SelectItem value="fortaleza">Fortaleza</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <Label htmlFor="priority-filter">Prioridade</Label>
            <Select
              value={filters.priority?.[0] || 'all'}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  priority: value === 'all' ? undefined : [value]
                })
              }
            >
              <SelectTrigger id="priority-filter">
                <SelectValue placeholder="Todas as prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  status: value === 'all' ? undefined : [value]
                })
              }
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="read">Lido</SelectItem>
                <SelectItem value="dismissed">Dispensado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Limpar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

