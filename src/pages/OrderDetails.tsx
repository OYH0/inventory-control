// =====================================================
// PAGE: OrderDetails - Detalhes do Pedido
// =====================================================

import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  User,
  Package,
  DollarSign,
  FileText,
  Clock
} from 'lucide-react';
import { useOrder, useOrders } from '@/hooks/useOrders';
import { OrderStatusUpdater } from '@/components/orders/OrderStatusUpdater';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { ConfirmDialog } from '@/components/orders/ConfirmDialog';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ORDER_TYPE_LABELS,
  LOCATION_LABELS,
  PAYMENT_STATUS_LABELS,
  ITEM_TABLE_LABELS
} from '@/types/orders';

export function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  // Hook para ações (update, delete, etc)
  const { 
    updateStatus, 
    deleteOrder, 
    isUpdatingStatus, 
    isDeleting 
  } = useOrders();
  
  // Hook para carregar dados do pedido
  const {
    order,
    isLoading,
    error,
    refetch
  } = useOrder(orderId || null);
  
  // Formatadores
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleUpdateStatus = (status: any, notes?: string) => {
    if (orderId) {
      updateStatus(orderId, status, notes);
      // Recarregar pedido após atualização
      setTimeout(() => refetch(), 500);
    }
  };
  
  const handleDelete = () => {
    setDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    if (orderId) {
      deleteOrder(orderId);
      setTimeout(() => navigate('/pedidos'), 500);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }
  
  // Error state
  if (error || !order) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive font-medium">
                {error ? 'Erro ao carregar pedido' : 'Pedido não encontrado'}
              </p>
              <Button onClick={() => navigate('/pedidos')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Pedidos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/pedidos')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Pedido {order.order_number}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                {ORDER_TYPE_LABELS[order.order_type]}
              </Badge>
              <OrderStatusBadge status={order.order_status} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {order.order_status === 'draft' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/pedidos/${orderId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna Esquerda (2/3) */}
        <div className="md:col-span-2 space-y-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Pedido</p>
                  <p className="font-medium">{ORDER_TYPE_LABELS[order.order_type]}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Data do Pedido</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.order_date)}
                  </p>
                </div>
                
                {order.supplier_customer_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {order.order_type === 'purchase' ? 'Fornecedor' : 'Cliente'}
                    </p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {order.supplier_customer_name}
                    </p>
                  </div>
                )}
                
                {order.expected_delivery_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Data Prevista de Entrega</p>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatDate(order.expected_delivery_date)}
                    </p>
                  </div>
                )}
                
                {order.from_location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Origem</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {LOCATION_LABELS[order.from_location]}
                    </p>
                  </div>
                )}
                
                {order.to_location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Destino</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {LOCATION_LABELS[order.to_location]}
                    </p>
                  </div>
                )}
              </div>
              
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Observações</p>
                    <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Itens do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens do Pedido ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Tabela</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Desc.%</TableHead>
                      <TableHead className="text-right">Taxa%</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.item_name}</p>
                              {item.item_sku && (
                                <p className="text-xs text-muted-foreground">
                                  SKU: {item.item_sku}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {ITEM_TABLE_LABELS[item.item_table]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unit_price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.discount_percentage}%
                          </TableCell>
                          <TableCell className="text-right">
                            {item.tax_percentage}%
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.line_total)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Nenhum item no pedido
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Totais */}
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto Total</span>
                  <span className="text-red-600">
                    -{formatCurrency(order.discount_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxas/Impostos</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Histórico de Status */}
          {order.status_history && order.status_history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.status_history.map((history, index) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="rounded-full bg-primary p-2">
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        </div>
                        {index < order.status_history!.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <OrderStatusBadge status={history.new_status} />
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(history.created_at)}
                        </span>
                      </div>
                      {history.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {history.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Coluna Direita (1/3) */}
        <div className="space-y-6">
          {/* Atualizar Status */}
          <OrderStatusUpdater
            order={order}
            onUpdateStatus={handleUpdateStatus}
            isUpdating={isUpdatingStatus}
          />
          
          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status do Pagamento</span>
                <Badge variant="secondary">
                  {PAYMENT_STATUS_LABELS[order.payment_status]}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total do Pedido</span>
                <span className="text-lg font-bold">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Metadados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Criado em:</span>{' '}
                {formatDateTime(order.created_at)}
              </div>
              <div>
                <span className="font-medium">Última atualização:</span>{' '}
                {formatDateTime(order.updated_at)}
              </div>
              <div>
                <span className="font-medium">ID:</span>{' '}
                <code className="text-xs">{order.id}</code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Pedido"
        description={`Tem certeza que deseja excluir o pedido ${order?.order_number}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        icon="delete"
      />
    </div>
  );
}

export default OrderDetails;

