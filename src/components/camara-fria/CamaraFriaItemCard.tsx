import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Check, X, Trash2, ArrowRight, Edit3, AlertTriangle } from 'lucide-react';
import { CamaraFriaItem } from '@/hooks/useCamaraFriaData';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminGuard } from '@/components/AdminGuard';
import { cn } from '@/lib/utils';

interface CamaraFriaItemCardProps {
  item: CamaraFriaItem;
  isEditing: boolean;
  editValue: number;
  isThawing: boolean;
  thawValue: number;
  onStartEdit: (id: string, currentQuantity: number) => void;
  onUpdateEdit: (id: string, delta: number) => void;
  onConfirmChange: (id: string) => void;
  onCancelEdit: (id: string) => void;
  onStartThaw: (id: string, quantity: number) => void;
  onUpdateThaw: (id: string, delta: number) => void;
  onConfirmThaw: (id: string) => void;
  onCancelThaw: (id: string) => void;
  onDelete?: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Bovina': 'bg-destructive/10 text-destructive border-destructive/20',
  'Suína': 'bg-warning/10 text-warning border-warning/20',
  'Aves': 'bg-info/10 text-info border-info/20',
  'Embutidos': 'bg-success/10 text-success border-success/20',
  'Peixes': 'bg-info/10 text-info border-info/20',
  'Congelados': 'bg-muted text-foreground/80 border-border',
};

export function CamaraFriaItemCard({
  item,
  isEditing,
  editValue,
  isThawing,
  thawValue,
  onStartEdit,
  onUpdateEdit,
  onConfirmChange,
  onCancelEdit,
  onStartThaw,
  onUpdateThaw,
  onConfirmThaw,
  onCancelThaw,
  onDelete,
}: CamaraFriaItemCardProps) {
  const isLowStock = item.quantidade <= (item.minimo || 5);
  const isMobile = useIsMobile();
  const categoryClass = CATEGORY_COLORS[item.categoria] || 'bg-muted text-foreground/80 border-border';
  const minimo = item.minimo || 5;

  const StepperButton = ({
    onClick,
    disabled,
    children,
  }: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <Button
      size="icon"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="h-9 w-9 shrink-0 rounded-lg"
    >
      {children}
    </Button>
  );

  return (
    <Card
      className={cn(
        'card-elevated relative overflow-hidden',
        isLowStock && 'ring-1 ring-destructive/30'
      )}
    >
      {isLowStock && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-destructive" />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className={cn(
              'font-display font-semibold text-foreground truncate',
              isMobile ? 'text-base' : 'text-lg'
            )}>
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
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Quantidade */}
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
              {isEditing ? editValue : item.quantidade}
              <span className="text-sm font-medium text-muted-foreground ml-1">
                {item.unidade}
              </span>
            </p>
            {isThawing && (
              <p className="text-xs text-warning mt-1 tabular-nums">
                {thawValue} descongelando
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Mínimo
            </p>
            <p className="text-sm font-medium tabular-nums text-foreground/80 mt-1">
              {minimo}
            </p>
          </div>
        </div>

        {/* Controles */}
        <AdminGuard fallback={
          <p className="text-center text-xs text-muted-foreground py-2 border-t border-border/60">
            Apenas administradores podem editar
          </p>
        }>
          {isEditing ? (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-center gap-3">
                <StepperButton onClick={() => onUpdateEdit(item.id, -1)} disabled={editValue === 0}>
                  <Minus className="h-4 w-4" />
                </StepperButton>
                <span className="font-display font-bold text-2xl min-w-[3rem] text-center tabular-nums">
                  {editValue}
                </span>
                <StepperButton onClick={() => onUpdateEdit(item.id, 1)}>
                  <Plus className="h-4 w-4" />
                </StepperButton>
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
          ) : isThawing ? (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-center gap-3">
                <StepperButton onClick={() => onUpdateThaw(item.id, -1)} disabled={thawValue <= 1}>
                  <Minus className="h-4 w-4" />
                </StepperButton>
                <span className="font-display font-bold text-2xl min-w-[3rem] text-center tabular-nums text-warning">
                  {thawValue}
                </span>
                <StepperButton onClick={() => onUpdateThaw(item.id, 1)} disabled={thawValue >= item.quantidade}>
                  <Plus className="h-4 w-4" />
                </StepperButton>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => onCancelThaw(item.id)}>
                  <X className="h-4 w-4 mr-1.5" />Cancelar
                </Button>
                <Button size="sm" onClick={() => onConfirmThaw(item.id)} className="bg-warning hover:bg-warning/90 text-warning-foreground">
                  <ArrowRight className="h-4 w-4 mr-1.5" />Descongelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-border/60">
              <Button size="sm" variant="outline" onClick={() => onStartEdit(item.id, item.quantidade)} className="flex-1">
                <Edit3 className="h-4 w-4 mr-1.5" />Editar
              </Button>
              {item.quantidade > 0 && (
                <Button
                  size="sm"
                  onClick={() => onStartThaw(item.id, 1)}
                  className="flex-1 bg-warning hover:bg-warning/90 text-warning-foreground"
                >
                  <ArrowRight className="h-4 w-4 mr-1.5" />Descongelar
                </Button>
              )}
              {onDelete && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onDelete(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </AdminGuard>
      </CardContent>
    </Card>
  );
}
