// =====================================================
// COMPONENT: OrderStatusUpdater - Atualizar Status do Pedido
// =====================================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle,
  Clock,
  Package,
  Truck,
  Home,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import type { OrderStatus, Order } from '@/types/orders';
import { ORDER_STATUS_LABELS } from '@/types/orders';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderStatusUpdaterProps {
  order: Order;
  onUpdateStatus: (status: OrderStatus, notes?: string) => void;
  isUpdating?: boolean;
}

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['approved', 'cancelled'],
  approved: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  returned: []
};

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  draft: FileText,
  pending: Clock,
  approved: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle,
  returned: XCircle
};

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  draft: 'Pedido em rascunho, ainda não foi submetido',
  pending: 'Aguardando aprovação',
  approved: 'Pedido aprovado, aguardando início do processamento',
  processing: 'Pedido em processamento',
  shipped: 'Pedido enviado, em trânsito',
  delivered: 'Pedido entregue com sucesso',
  cancelled: 'Pedido cancelado',
  returned: 'Pedido devolvido'
};

export function OrderStatusUpdater({ order, onUpdateStatus, isUpdating }: OrderStatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState('');
  
  const currentStatus = order.order_status;
  const availableStatuses = STATUS_FLOW[currentStatus] || [];
  
  const handleUpdate = () => {
    if (!selectedStatus) return;
    onUpdateStatus(selectedStatus, notes || undefined);
    setSelectedStatus(null);
    setNotes('');
  };
  
  const CurrentIcon = STATUS_ICONS[currentStatus];
  
  // Status terminal (não pode mais ser alterado)
  const isTerminal = availableStatuses.length === 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrentIcon className="h-5 w-5" />
          Status do Pedido
        </CardTitle>
        <CardDescription>
          Gerencie o status e o fluxo do pedido
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Atual */}
        <div className="space-y-2">
          <Label>Status Atual</Label>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={currentStatus} className="text-base px-4 py-2" />
            <span className="text-sm text-muted-foreground">
              {STATUS_DESCRIPTIONS[currentStatus]}
            </span>
          </div>
        </div>
        
        {/* Alerta se terminal */}
        {isTerminal && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {currentStatus === 'delivered' 
                ? 'Pedido finalizado. Status não pode mais ser alterado.' 
                : 'Pedido cancelado. Status não pode mais ser alterado.'}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Seletor de Novo Status */}
        {!isTerminal && availableStatuses.length > 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="new-status">Atualizar Para</Label>
              <Select
                value={selectedStatus || ''}
                onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
              >
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Selecione o novo status..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => {
                    const Icon = STATUS_ICONS[status];
                    return (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{ORDER_STATUS_LABELS[status]}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Notas {selectedStatus === 'cancelled' && '(Motivo do cancelamento)'}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  selectedStatus === 'cancelled'
                    ? 'Descreva o motivo do cancelamento...'
                    : 'Adicione notas sobre esta alteração (opcional)...'
                }
                rows={3}
                className={selectedStatus === 'cancelled' ? 'border-orange-300' : ''}
              />
            </div>
            
            {/* Botão de Atualizar */}
            <Button
              onClick={handleUpdate}
              disabled={!selectedStatus || isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <Package className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Atualizar Status
                </>
              )}
            </Button>
          </>
        )}
        
        {/* Fluxo de Status */}
        <div className="pt-4 border-t">
          <Label className="text-xs text-muted-foreground">Fluxo de Status</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['draft', 'pending', 'approved', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map((status, index) => {
              const Icon = STATUS_ICONS[status];
              const isCurrent = status === currentStatus;
              const isPast = ['draft', 'pending', 'approved', 'processing', 'shipped'].indexOf(status) < 
                            ['draft', 'pending', 'approved', 'processing', 'shipped'].indexOf(currentStatus);
              
              return (
                <div key={status} className="flex items-center">
                  <div
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-md text-xs
                      ${isCurrent ? 'bg-primary text-primary-foreground font-medium' : ''}
                      ${isPast ? 'bg-muted text-muted-foreground' : ''}
                      ${!isCurrent && !isPast ? 'bg-muted/50 text-muted-foreground' : ''}
                    `}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{ORDER_STATUS_LABELS[status]}</span>
                  </div>
                  {index < 5 && (
                    <span className="mx-1 text-muted-foreground">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderStatusUpdater;

