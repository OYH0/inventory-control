import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Package } from 'lucide-react';
import type { ABCCategory } from '@/types/abc-analysis';
import { cn } from '@/lib/utils';

interface ABCCategoryCardProps {
  category: ABCCategory;
  count: number;
  percentage: number;
  value: number;
  valuePercentage: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

const categoryConfig = {
  A: {
    badgeBg: 'bg-destructive',
    text: 'text-destructive',
    band: 'bg-destructive',
    iconBg: 'bg-destructive/10',
    title: 'Categoria A — Alto Valor',
    description: 'Itens críticos. Representam ~80% do valor.',
  },
  B: {
    badgeBg: 'bg-warning',
    text: 'text-warning',
    band: 'bg-warning',
    iconBg: 'bg-warning/10',
    title: 'Categoria B — Valor Médio',
    description: 'Itens importantes com controle moderado.',
  },
  C: {
    badgeBg: 'bg-success',
    text: 'text-success',
    band: 'bg-success',
    iconBg: 'bg-success/10',
    title: 'Categoria C — Baixo Valor',
    description: 'Itens de baixo impacto financeiro.',
  },
} as const;

export function ABCCategoryCard({
  category,
  count,
  percentage,
  value,
  valuePercentage,
  trend,
  trendValue,
}: ABCCategoryCardProps) {
  const config = categoryConfig[category];

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendClass =
    trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <Card className="card-elevated relative overflow-hidden">
      <div className={cn('absolute top-0 left-0 right-0 h-1', config.band)} />

      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-foreground leading-tight">
              {config.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {config.description}
            </p>
          </div>
          <div
            className={cn(
              'shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-display text-3xl font-bold text-white shadow-md',
              config.badgeBg
            )}
          >
            {category}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              <Package className="w-3 h-3" />
              Produtos
            </div>
            <p className="font-display text-2xl font-bold tabular-nums mt-1 text-foreground">
              {count}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {percentage.toFixed(1)}% do total
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Valor anual
            </p>
            <p className={cn('font-display text-lg font-bold tabular-nums mt-1 truncate', config.text)}>
              {formatCurrency(value)}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {valuePercentage.toFixed(1)}% do valor
            </p>
          </div>
        </div>

        {trend && trendValue !== undefined && (
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <span className="text-xs text-muted-foreground">Tendência</span>
            <div className={cn('flex items-center gap-1.5 text-sm font-medium', trendClass)}>
              <TrendIcon className="w-4 h-4" />
              <span className="tabular-nums">
                {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ABCCategoryCard;
