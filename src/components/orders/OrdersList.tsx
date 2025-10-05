// =====================================================
// COMPONENT: OrdersList - Lista de Pedidos
// =====================================================

import { useState } from 'react';
import * as React from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { PromptDialog } from './PromptDialog';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Search
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import type { OrderFilters } from '@/types/orders';
import { 
  ORDER_TYPE_LABELS, 
  ORDER_STATUS_LABELS, 
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS 
} from '@/types/orders';
import { Skeleton } from '@/components/ui/skeleton';

interface OrdersListProps {
  filters?: OrderFilters;
}

export function OrdersList({ filters }: OrdersListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null
  });
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    orderId: string | null;
    orderNumber: string | null;
  }>({
    open: false,
    orderId: null,
    orderNumber: null
  });
  
  const {
    orders,
    ordersLoading,
    approveOrder,
    cancelOrder,
    deleteOrder,
    isApproving,
    isCancelling,
    isDeleting
  } = useOrders({
    ...filters,
    search: searchTerm || undefined
  });
  
  // Debug logging
  React.useEffect(() => {
    console.log('📋 OrdersList - filters:', filters);
    console.log('📋 OrdersList - searchTerm:', searchTerm);
    console.log('📋 OrdersList - orders:', orders);
    console.log('📋 OrdersList - ordersLoading:', ordersLoading);
  }, [filters, searchTerm, orders, ordersLoading]);
  
  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    const color = ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS];
    
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
    
    return variantMap[color] || 'default';
  };
  
  const handleApprove = (orderId: string) => {
    setApproveDialog({ open: true, orderId });
  };
  
  const confirmApprove = () => {
    if (approveDialog.orderId) {
      approveOrder(approveDialog.orderId);
    }
  };
  
  const handleCancel = (orderId: string) => {
    setCancelDialog({ open: true, orderId });
  };
  
  const confirmCancel = (reason: string) => {
    if (cancelDialog.orderId) {
      cancelOrder(cancelDialog.orderId, reason || undefined);
    }
  };
  
  const handleDelete = (orderId: string, orderNumber: string) => {
    setDeleteDialog({ open: true, orderId, orderNumber });
  };
  
  const confirmDelete = () => {
    if (deleteDialog.orderId) {
      deleteOrder(deleteDialog.orderId);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pedidos</CardTitle>
          
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {ordersLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente/Fornecedor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {orders.map((order) => (
                  <TableRow 
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/pedidos/${order.id}`)}
                  >
                    <TableCell className="font-medium">
                      {order.order_number}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">
                        {ORDER_TYPE_LABELS[order.order_type]}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {order.supplier_customer_name || '-'}
                    </TableCell>
                    
                    <TableCell>
                      {formatDate(order.order_date)}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.order_status)}>
                        {ORDER_STATUS_LABELS[order.order_status]}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary">
                        {PAYMENT_STATUS_LABELS[order.payment_status]}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total_amount)}
                    </TableCell>
                    
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-accent"
                          >
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pedidos/${order.id}`);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Ver Detalhes</span>
                          </DropdownMenuItem>
                          
                          {order.order_status === 'draft' && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/pedidos/${order.id}/edit`);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                          )}
                          
                          {order.order_status === 'pending' && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(order.id);
                              }}
                              disabled={isApproving}
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              <span>Aprovar</span>
                            </DropdownMenuItem>
                          )}
                          
                          {!['cancelled', 'delivered'].includes(order.order_status) && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(order.id);
                              }}
                              disabled={isCancelling}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                              <span>Cancelar</span>
                            </DropdownMenuItem>
                          )}
                          
                          {order.order_status === 'draft' && (
                            <>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(order.id, order.order_number);
                                }}
                                disabled={isDeleting}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {/* Dialogs */}
      <ConfirmDialog
        open={approveDialog.open}
        onOpenChange={(open) => setApproveDialog({ open, orderId: null })}
        onConfirm={confirmApprove}
        title="Aprovar Pedido"
        description="Tem certeza que deseja aprovar este pedido? Esta ação irá mudar o status para 'Aprovado'."
        confirmText="Aprovar"
        cancelText="Cancelar"
        variant="default"
        icon="check"
      />
      
      <PromptDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ open, orderId: null })}
        onConfirm={confirmCancel}
        title="Cancelar Pedido"
        description="Por favor, informe o motivo do cancelamento do pedido."
        label="Motivo do Cancelamento"
        placeholder="Descreva o motivo do cancelamento..."
        required={false}
        confirmText="Cancelar Pedido"
        cancelText="Voltar"
      />
      
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, orderId: null, orderNumber: null })}
        onConfirm={confirmDelete}
        title="Excluir Pedido"
        description={`Tem certeza que deseja excluir o pedido ${deleteDialog.orderNumber}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        icon="delete"
      />
    </Card>
  );
}

export default OrdersList;

