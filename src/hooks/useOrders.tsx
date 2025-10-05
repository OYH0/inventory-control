// =====================================================
// HOOK: useOrders - Gerenciamento de Pedidos
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import OrdersService from '@/services/OrdersService';
import type {
  Order,
  OrderWithItems,
  OrderDashboardStats,
  CreateOrderInput,
  UpdateOrderInput,
  OrderFilters,
  OrderStatus
} from '@/types/orders';

export function useOrders(filters?: OrderFilters) {
  const queryClient = useQueryClient();
  
  // ============================================
  // QUERIES
  // ============================================
  
  /**
   * Listar pedidos
   */
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => OrdersService.listOrders(filters),
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 2
  });
  
  /**
   * Estatísticas do dashboard
   */
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['orders-dashboard'],
    queryFn: () => OrdersService.getDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2
  });
  
  /**
   * Pedidos recentes
   */
  const {
    data: recentOrders,
    isLoading: recentLoading
  } = useQuery({
    queryKey: ['orders-recent'],
    queryFn: () => OrdersService.getRecentOrders(10),
    staleTime: 1000 * 60 * 1, // 1 minuto
    retry: 2
  });
  
  // ============================================
  // MUTATIONS
  // ============================================
  
  /**
   * Criar pedido
   */
  const createOrderMutation = useMutation({
    mutationFn: (input: CreateOrderInput) => OrdersService.createOrder(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orders-recent'] });
      toast.success(`Pedido ${data.order_number} criado com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar pedido: ${error.message}`);
    }
  });
  
  /**
   * Atualizar pedido
   */
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: UpdateOrderInput }) =>
      OrdersService.updateOrder(orderId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['orders-dashboard'] });
      toast.success('Pedido atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar pedido: ${error.message}`);
    }
  });
  
  /**
   * Deletar pedido
   */
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => OrdersService.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-dashboard'] });
      toast.success('Pedido deletado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao deletar pedido: ${error.message}`);
    }
  });
  
  /**
   * Atualizar status
   */
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, notes }: { orderId: string; status: OrderStatus; notes?: string }) =>
      OrdersService.updateOrderStatus(orderId, status, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['orders-dashboard'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  });
  
  /**
   * Aprovar pedido
   */
  const approveOrderMutation = useMutation({
    mutationFn: (orderId: string) => OrdersService.approveOrder(orderId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['orders-dashboard'] });
      toast.success(`Pedido ${data.order_number} aprovado!`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao aprovar pedido: ${error.message}`);
    }
  });
  
  /**
   * Cancelar pedido
   */
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      OrdersService.cancelOrder(orderId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['orders-dashboard'] });
      toast.success(`Pedido ${data.order_number} cancelado!`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cancelar pedido: ${error.message}`);
    }
  });
  
  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const isLoading = ordersLoading || statsLoading;
  const hasError = ordersError;
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const createOrder = (input: CreateOrderInput) => {
    createOrderMutation.mutate(input);
  };
  
  const updateOrder = (orderId: string, input: UpdateOrderInput) => {
    updateOrderMutation.mutate({ orderId, input });
  };
  
  const deleteOrder = (orderId: string) => {
    deleteOrderMutation.mutate(orderId);
  };
  
  const updateStatus = (orderId: string, status: OrderStatus, notes?: string) => {
    updateStatusMutation.mutate({ orderId, status, notes });
  };
  
  const approveOrder = (orderId: string) => {
    approveOrderMutation.mutate(orderId);
  };
  
  const cancelOrder = (orderId: string, reason?: string) => {
    cancelOrderMutation.mutate({ orderId, reason });
  };
  
  const refresh = () => {
    refetchOrders();
    refetchStats();
  };
  
  // ============================================
  // RETURN
  // ============================================
  
  return {
    // Data
    orders: orders || [],
    dashboardStats,
    recentOrders: recentOrders || [],
    
    // Loading states
    isLoading,
    ordersLoading,
    statsLoading,
    recentLoading,
    
    // Error states
    hasError,
    ordersError,
    
    // Actions
    createOrder,
    updateOrder,
    deleteOrder,
    updateStatus,
    approveOrder,
    cancelOrder,
    
    // Mutation states
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderMutation.isPending,
    isDeleting: deleteOrderMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isApproving: approveOrderMutation.isPending,
    isCancelling: cancelOrderMutation.isPending,
    
    // Helpers
    refresh
  };
}

/**
 * Hook para buscar um pedido específico
 */
export function useOrder(orderId: string | null) {
  const queryClient = useQueryClient();
  
  const {
    data: order,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderId ? OrdersService.getOrderById(orderId) : null,
    enabled: !!orderId,
    staleTime: 1000 * 60 * 1, // 1 minuto
    retry: 2
  });
  
  /**
   * Adicionar item ao pedido
   */
  const addItemMutation = useMutation({
    mutationFn: ({ orderId, item }: { orderId: string; item: any }) =>
      OrdersService.addOrderItem(orderId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success('Item adicionado ao pedido!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar item: ${error.message}`);
    }
  });
  
  /**
   * Atualizar item do pedido
   */
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string; updates: any }) =>
      OrdersService.updateOrderItem(itemId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success('Item atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar item: ${error.message}`);
    }
  });
  
  /**
   * Remover item do pedido
   */
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => OrdersService.removeOrderItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success('Item removido!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover item: ${error.message}`);
    }
  });
  
  const addItem = (item: any) => {
    if (orderId) addItemMutation.mutate({ orderId, item });
  };
  
  const updateItem = (itemId: string, updates: any) => {
    updateItemMutation.mutate({ itemId, updates });
  };
  
  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };
  
  return {
    order,
    isLoading,
    error,
    refetch,
    
    // Item actions
    addItem,
    updateItem,
    removeItem,
    
    // Item mutation states
    isAddingItem: addItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending
  };
}

export default useOrders;

