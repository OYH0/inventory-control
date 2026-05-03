import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Edit3, Check, X, Trash2, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminGuard } from '@/components/AdminGuard';
import { cn } from '@/lib/utils';

interface BebidasItemCardProps {
  item: any;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onDeleteItem: (id: string) => void;
  onStartEdit: (id: string, currentQuantity: number) => void;
  onUpdateEdit: (id: string, delta: number) => void;
  onConfirmChange: (id: string) => void;
  onCancelEdit: (id: string) => void;
  editingQuantity?: number;
  isEditing: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Refrigerantes': 'bg-destructive/10 text-destructive border-destructive/20',
  'Sucos': 'bg-warning/10 text-warning border-warning/20',
  'Águas': 'bg-info/10 text-info border-info/20',
  'Cervejas': 'bg-primary/10 text-primary border-primary/20',
  'Energéticos': 'bg-success/10 text-success border-success/20',
};

export function BebidasItemCard({
  item,
  onDeleteItem,
  onStartEdit,
  onUpdateEdit,
  onConfirmChange,
  onCancelEdit,
  editingQuantity,
  isEditing,
}: BebidasItemCardProps) {
  const isMobile = useIsMobile();
  const isLowStock = item.minimo && item.quantidade <= item.minimo;
  const categoryClass = CATEGORY_COLORS[item.categoria] || 'bg-muted text-foreground/80 border-border';

  return (
    <Card className={cn('card-elevated relative overflow-hidden', isLowStock && 'ring-1 ring-destructive/30')}>
      {isLowStock && <div className="absolute top-0 left-0 right-0 h-0.5 bg-destructive" />}

      <CardHeader className="pb-3">
        <div className="min-w-0">
          <CardTitle className={cn('font-display font-semibold text-foreground truncate', isMobile ? 'text-base' : 'text-lg')}>
            {item.nome}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant="outline" className={cn('text-[11px] font-medium', categoryClass)}>
              {item.categoria}
            </Badge>
            {item.unidade_item && (
              <Badge variant="outline" className="text-[11px] font-medium gap-1">
                {item.unidade_item === 'juazeiro_norte' ? '🏜️ JN' : '🌊 FOR'}
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="destructive" className="text-[11px] gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                Baixo
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Quantidade
            </p>
            <p className={cn(
              'font-display font-bold tabular-nums leading-none mt-1',
              isMobile ? 'text-2xl' : 'text-3xl',
              isLowStock ? 'text-destructive' : 'text-foreground'
            )}>
              {isEditing ? editingQuantity : item.quantidade}
              <span className="text-sm font-medium text-muted-foreground ml-1">{item.unidade}</span>
            </p>
          </div>
          {item.minimo !== undefined && item.minimo !== null && (
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Mínimo
              </p>
              <p className="text-sm font-medium tabular-nums text-foreground/80 mt-1">{item.minimo}</p>
            </div>
          )}
        </div>

        <AdminGuard fallback={
          <p className="text-center text-xs text-muted-foreground py-2 border-t border-border/60">
            Apenas administradores podem editar
          </p>
        }>
          {isEditing ? (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-center gap-3">
                <Button size="icon" variant="outline" onClick={() => onUpdateEdit(item.id, -1)} disabled={editingQuantity === 0} className="h-9 w-9 rounded-lg">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-display font-bold text-2xl min-w-[3rem] text-center tabular-nums">
                  {editingQuantity}
                </span>
                <Button size="icon" variant="outline" onClick={() => onUpdateEdit(item.id, 1)} className="h-9 w-9 rounded-lg">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => onCancelEdit(item.id)}>
                  <X className="h-4 w-4 mr-1.5" />Cancelar
                </Button>
                <Button size="sm" onClick={() => onConfirmChange(item.id)} className="bg-success hover:bg-success/90 text-success-foreground">
                  <Check className="h-4 w-4 mr-1.5" />Confirmar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-border/60">
              <Button size="sm" variant="outline" onClick={() => onStartEdit(item.id, item.quantidade)} className="flex-1">
                <Edit3 className="h-4 w-4 mr-1.5" />Editar
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onDeleteItem(item.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                title="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </AdminGuard>
      </CardContent>
    </Card>
  );
}
