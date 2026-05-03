import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/orders';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/orders';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

// Mapeamento de cores semânticas (color-coded para sinalizar fluxo do pedido)
const STATUS_CLASSES: Record<string, string> = {
  gray: 'bg-muted text-foreground/80 border-border',
  yellow: 'bg-warning/15 text-warning border-warning/25',
  orange: 'bg-warning/15 text-warning border-warning/25',
  green: 'bg-success/15 text-success border-success/25',
  red: 'bg-destructive/15 text-destructive border-destructive/25',
  blue: 'bg-info/15 text-info border-info/25',
  purple: 'bg-info/15 text-info border-info/25',
  indigo: 'bg-info/15 text-info border-info/25',
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const color = ORDER_STATUS_COLORS[status];
  const classes = STATUS_CLASSES[color] || STATUS_CLASSES.gray;

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', classes, className)}
    >
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

export default OrderStatusBadge;
