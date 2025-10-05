// =====================================================
// COMPONENT: OrderStatusBadge - Badge de Status do Pedido
// =====================================================

import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/orders';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/orders';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const color = ORDER_STATUS_COLORS[status];
  
  const variantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    gray: 'secondary',
    yellow: 'outline',
    green: 'default',
    red: 'destructive',
    blue: 'default',
    purple: 'default',
    indigo: 'default',
    orange: 'outline'
  };
  
  const bgColorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
    red: 'bg-red-100 text-red-800 hover:bg-red-200',
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
  };
  
  return (
    <Badge 
      variant={variantMap[color] || 'default'}
      className={`${bgColorMap[color]} ${className}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

export default OrderStatusBadge;

