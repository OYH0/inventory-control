import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Package, 
  DollarSign,
  X,
  Eye,
  Clock
} from 'lucide-react';
import type { ExpiryAlert } from '@/services/ExpiryAlertService';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExpiryAlertCardProps {
  alert: ExpiryAlert;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string, reason?: string, action?: string) => void;
  compact?: boolean;
}

export function ExpiryAlertCard({ 
  alert, 
  onMarkAsRead, 
  onDismiss, 
  compact = false 
}: ExpiryAlertCardProps) {
  const [showDismissDialog, setShowDismissDialog] = useState(false);
  const [dismissReason, setDismissReason] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'expired':
        return 'Vencido';
      case 'critical':
        return 'Crítico';
      case 'near_expiry':
        return 'Próximo ao Vencimento';
      default:
        return type;
    }
  };

  const getLocationLabel = (location?: string) => {
    switch (location) {
      case 'juazeiro_norte':
        return 'Juazeiro do Norte';
      case 'fortaleza':
        return 'Fortaleza';
      default:
        return 'N/A';
    }
  };

  const getDaysText = (days: number) => {
    if (days < 0) {
      return `Venceu há ${Math.abs(days)} dias`;
    } else if (days === 0) {
      return 'Vence hoje!';
    } else if (days === 1) {
      return 'Vence amanhã!';
    } else {
      return `Vence em ${days} dias`;
    }
  };

  const handleDismiss = () => {
    onDismiss(alert.id, dismissReason, actionTaken);
    setShowDismissDialog(false);
    setDismissReason('');
    setActionTaken('');
  };

  const borderColor = alert.priority === 'critical' 
    ? 'border-red-500' 
    : alert.priority === 'high'
    ? 'border-orange-500'
    : 'border-yellow-500';

  return (
    <>
      <Card className={`${borderColor} border-l-4`}>
        <CardContent className={compact ? 'p-4' : 'p-6'}>
          <div className="flex items-start justify-between gap-4">
            {/* Main Content */}
            <div className="flex-1 space-y-2">
              {/* Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{alert.item_name}</h3>
                <Badge variant={getPriorityColor(alert.priority)}>
                  {getAlertTypeLabel(alert.alert_type)}
                </Badge>
                {alert.status === 'read' && (
                  <Badge variant="outline" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Lido
                  </Badge>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className={alert.days_until_expiry <= 0 ? 'text-red-600 font-semibold' : ''}>
                    {getDaysText(alert.days_until_expiry)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(alert.expiry_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>

                {!compact && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>{alert.quantity} unidades</span>
                    </div>

                    {alert.estimated_value && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium text-red-600">
                          {formatCurrency(alert.estimated_value)}
                        </span>
                      </div>
                    )}

                    {alert.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{getLocationLabel(alert.location)}</span>
                      </div>
                    )}

                    {alert.item_category && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs">
                          Categoria: <strong>{alert.item_category}</strong>
                        </span>
                      </div>
                    )}

                    {alert.batch_number && (
                      <div className="col-span-2 flex items-center gap-2 text-muted-foreground text-xs">
                        Lote: <strong>{alert.batch_number}</strong>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {alert.status === 'sent' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(alert.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDismissDialog(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dismiss Dialog */}
      <Dialog open={showDismissDialog} onOpenChange={setShowDismissDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispensar Alerta</DialogTitle>
            <DialogDescription>
              Registre o motivo e a ação tomada para este alerta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Produto foi vendido, descarte programado..."
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Ação Tomada (opcional)</Label>
              <Textarea
                id="action"
                placeholder="Ex: Aplicado desconto de 30%, retirado do estoque..."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDismissDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDismiss}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

