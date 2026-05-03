import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SwapButton } from '@/components/ui/swap-button';
import { Clock, ArrowLeft, CheckCircle2, Snowflake } from 'lucide-react';
import { CamaraRefrigeradaItem } from '@/hooks/useCamaraRefrigeradaData';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface CamaraRefrigeradaItemCardProps {
  item: CamaraRefrigeradaItem;
  onMoveToReady: (id: string) => void;
  onMoveToFreezer: (id: string) => void;
  onRemoveFromChamber: (id: string) => void;
}

export function CamaraRefrigeradaItemCard({
  item,
  onMoveToReady,
  onMoveToFreezer,
  onRemoveFromChamber,
}: CamaraRefrigeradaItemCardProps) {
  const isMobile = useIsMobile();
  const isPronto = item.status === 'pronto';

  return (
    <Card
      className={cn(
        'card-elevated relative overflow-hidden',
        isPronto ? 'ring-1 ring-success/30' : 'ring-1 ring-warning/30'
      )}
    >
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-0.5',
          isPronto ? 'bg-success' : 'bg-warning'
        )}
      />

      <CardHeader className="pb-3">
        <div className="min-w-0">
          <CardTitle className={cn('font-display font-semibold text-foreground truncate', isMobile ? 'text-base' : 'text-lg')}>
            {item.nome}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge
              variant="outline"
              className={cn(
                'text-[11px] font-medium gap-1',
                isPronto
                  ? 'bg-success/10 text-success border-success/20'
                  : 'bg-warning/10 text-warning border-warning/20'
              )}
            >
              {isPronto ? <CheckCircle2 className="w-3 h-3" /> : <Snowflake className="w-3 h-3" />}
              {isPronto ? 'Pronto' : 'Descongelando'}
            </Badge>
            {item.unidade_item && (
              <Badge variant="outline" className="text-[11px] font-medium gap-1">
                {item.unidade_item === 'juazeiro_norte' ? '🏜️ JN' : '🌊 FOR'}
              </Badge>
            )}
            {item.tempo_descongelamento && (
              <Badge variant="outline" className="text-[11px] font-medium gap-1">
                <Clock className="w-3 h-3" />
                {item.tempo_descongelamento}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Quantidade
          </p>
          <p className={cn(
            'font-display font-bold tabular-nums leading-none mt-1',
            isMobile ? 'text-2xl' : 'text-3xl',
            isPronto ? 'text-success' : 'text-warning'
          )}>
            {item.quantidade}
            <span className="text-sm font-medium text-muted-foreground ml-1">
              {item.unidade || 'kg'}
            </span>
          </p>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border/60">
          {isPronto ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemoveFromChamber(item.id)}
              className="flex-1"
            >
              Retirar da Câmara
            </Button>
          ) : (
            <div className="flex-1">
              <SwapButton onSwipe={() => onMoveToReady(item.id)} className="w-full">
                Marcar como Pronto
              </SwapButton>
            </div>
          )}

          <Button
            size="icon"
            variant="outline"
            onClick={() => onMoveToFreezer(item.id)}
            className="text-info hover:text-info hover:bg-info/10 hover:border-info/30"
            title="Voltar para câmara fria"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
