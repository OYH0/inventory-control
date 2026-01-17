// =====================================================
// SERVICE: Orders Management
// Gerenciamento completo de pedidos (compra/venda/transferência)
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  Order,
  OrderItem,
  OrderWithItems,
  OrderStatusHistory,
  OrderDashboardStats,
  CreateOrderInput,
  UpdateOrderInput,
  OrderFilters,
  OrderStatus
} from '@/types/orders';

export class OrdersService {
  
  // ============================================
  // CRUD OPERATIONS
  // ============================================
  
  /**
   * Criar novo pedido com itens
   */
  static async createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuário não autenticado');
    }
    
    // Buscar organization_id
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userData.user.id)
      .eq('is_active', true)
      .single();
    
    if (!memberData) {
      throw new Error('Organização não encontrada');
    }
    
    // Gerar número do pedido
    const { data: orderNumber, error: numberError } = await supabase
      .rpc('generate_order_number');
    
    if (numberError) {
      throw new Error(`Erro ao gerar número do pedido: ${numberError.message}`);
    }
    
    // Extrair itens do input
    const { items, ...orderData } = input;
    
    // Calcular totais dos itens
    const itemsWithTotals = items.map(item => {
      const unitPrice = parseFloat(String(item.unit_price)) || 0;
      const quantity = parseInt(String(item.quantity)) || 1;
      const discountPercentage = parseFloat(String(item.discount_percentage || 0));
      const taxPercentage = parseFloat(String(item.tax_percentage || 0));
      
      const discount = (unitPrice * discountPercentage) / 100;
      const subtotal = unitPrice * quantity - discount;
      const tax = (subtotal * taxPercentage) / 100;
      const line_total = Math.round((subtotal + tax) * 100) / 100;
      
      return {
        item_table: item.item_table,
        item_id: item.item_id,
        item_name: item.item_name,
        item_sku: item.item_sku,
        quantity: quantity,
        unit_price: unitPrice,
        discount_percentage: discountPercentage,
        tax_percentage: taxPercentage,
        line_total: line_total,
        notes: item.notes
      };
    });
    
    const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.line_total, 0);
    const total_amount = subtotal 
      + (input.tax_amount || 0) 
      - (input.discount_amount || 0) 
      + (input.shipping_cost || 0);
    
    // Criar pedido
    const orderInsertData = {
      organization_id: memberData.organization_id,
      user_id: userData.user.id,
      order_number: orderNumber,
      ...orderData,
      subtotal,
      total_amount,
      order_status: input.order_status || 'draft',
      payment_status: input.payment_status || 'unpaid'
    };
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsertData as any)
      .select()
      .single();
    
    if (orderError) {
      throw new Error(`Erro ao criar pedido: ${orderError.message}`);
    }
    
    // Criar itens do pedido - especificar apenas campos necessários
    const orderItems = itemsWithTotals.map(item => ({
      order_id: order.id,
      item_table: item.item_table,
      item_id: item.item_id,
      item_name: item.item_name,
      item_sku: item.item_sku || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percentage: item.discount_percentage || 0,
      tax_percentage: item.tax_percentage || 0,
      line_total: item.line_total,
      notes: item.notes || null
    }));
    
    // Log para debug (remover em produção)
    console.log('Inserindo itens do pedido:', orderItems);
    
    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();
    
    if (itemsError) {
      console.error('Erro detalhado ao criar itens:', itemsError);
      // Rollback: deletar pedido se falhar ao criar itens
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Erro ao criar itens do pedido: ${itemsError.message}`);
    }
    
    return {
      ...order,
      items: (createdItems || []) as OrderItem[]
    } as unknown as OrderWithItems;
  }
  
  /**
   * Buscar pedido por ID com itens
   */
  static async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .is('deleted_at', null)
      .single();
    
    if (orderError) {
      if (orderError.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar pedido: ${orderError.message}`);
    }
    
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    
    if (itemsError) {
      throw new Error(`Erro ao buscar itens: ${itemsError.message}`);
    }
    
    const { data: history } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    
    return {
      ...order,
      items: (items || []) as OrderItem[],
      status_history: (history || []) as OrderStatusHistory[]
    } as unknown as OrderWithItems;
  }
  
  /**
   * Listar pedidos com filtros
   */
  static async listOrders(filters?: OrderFilters): Promise<Order[]> {
    console.log('🔍 OrdersService.listOrders - filters:', filters);
    
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('is_active', true)
      .single();
    
    if (!memberData) {
      throw new Error('Organização não encontrada');
    }
    
    console.log('🔍 OrdersService.listOrders - organization_id:', memberData.organization_id);
    
    let query = supabase
      .from('orders')
      .select('*')
      .eq('organization_id', memberData.organization_id)
      .is('deleted_at', null)
      .order('order_date', { ascending: false });
    
    // Aplicar filtros
    if (filters?.order_type) {
      console.log('🔍 Aplicando filtro order_type:', filters.order_type);
      query = query.eq('order_type', filters.order_type);
    }
    
    if (filters?.order_status) {
      console.log('🔍 Aplicando filtro order_status:', filters.order_status);
      query = query.eq('order_status', filters.order_status);
    }
    
    if (filters?.payment_status) {
      console.log('🔍 Aplicando filtro payment_status:', filters.payment_status);
      query = query.eq('payment_status', filters.payment_status);
    }
    
    if (filters?.from_location) {
      console.log('🔍 Aplicando filtro from_location:', filters.from_location);
      query = query.eq('from_location', filters.from_location);
    }
    
    if (filters?.to_location) {
      console.log('🔍 Aplicando filtro to_location:', filters.to_location);
      query = query.eq('to_location', filters.to_location);
    }
    
    if (filters?.start_date) {
      console.log('🔍 Aplicando filtro start_date:', filters.start_date);
      query = query.gte('order_date', filters.start_date);
    }
    
    if (filters?.end_date) {
      console.log('🔍 Aplicando filtro end_date:', filters.end_date);
      query = query.lte('order_date', filters.end_date);
    }
    
    if (filters?.search) {
      console.log('🔍 Aplicando filtro search:', filters.search);
      query = query.or(`order_number.ilike.%${filters.search}%,supplier_customer_name.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query;
    
    console.log('🔍 OrdersService.listOrders - resultados:', data?.length || 0, 'pedidos');
    
    if (error) {
      console.error('❌ OrdersService.listOrders - erro:', error);
      throw new Error(`Erro ao listar pedidos: ${error.message}`);
    }
    
    return (data || []) as unknown as Order[];
  }
  
  /**
   * Atualizar pedido
   */
  static async updateOrder(orderId: string, input: UpdateOrderInput): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(input as any)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao atualizar pedido: ${error.message}`);
    }
    
    return data as unknown as Order;
  }
  
  /**
   * Soft delete de pedido
   */
  static async deleteOrder(orderId: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', orderId);
    
    if (error) {
      throw new Error(`Erro ao deletar pedido: ${error.message}`);
    }
  }
  
  // ============================================
  // STATUS MANAGEMENT
  // ============================================
  
  /**
   * Atualizar status do pedido
   */
  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ): Promise<Order> {
    const order = await this.updateOrder(orderId, { order_status: newStatus });
    
    // O trigger log_order_status_change registra automaticamente no histórico
    
    return order;
  }
  
  /**
   * Aprovar pedido
   */
  static async approveOrder(orderId: string): Promise<Order> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuário não autenticado');
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update({
        order_status: 'approved',
        approved_by: userData.user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao aprovar pedido: ${error.message}`);
    }
    
    return data as unknown as Order;
  }
  
  /**
   * Cancelar pedido
   */
  static async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<Order> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuário não autenticado');
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update({
        order_status: 'cancelled',
        cancelled_by: userData.user.id,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao cancelar pedido: ${error.message}`);
    }
    
    return data as unknown as Order;
  }
  
  // ============================================
  // ORDER ITEMS MANAGEMENT
  // ============================================
  
  /**
   * Adicionar item ao pedido
   */
  static async addOrderItem(
    orderId: string,
    item: Omit<OrderItem, 'id' | 'order_id' | 'created_at' | 'updated_at' | 'quantity_received' | 'quantity_returned'>
  ): Promise<OrderItem> {
    const { data, error } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        ...item
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao adicionar item: ${error.message}`);
    }
    
    return data as unknown as OrderItem;
  }
  
  /**
   * Atualizar item do pedido
   */
  static async updateOrderItem(
    itemId: string,
    updates: Partial<Omit<OrderItem, 'id' | 'order_id' | 'created_at' | 'updated_at'>>
  ): Promise<OrderItem> {
    const { data, error } = await supabase
      .from('order_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao atualizar item: ${error.message}`);
    }
    
    return data as unknown as OrderItem;
  }
  
  /**
   * Remover item do pedido
   */
  static async removeOrderItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      throw new Error(`Erro ao remover item: ${error.message}`);
    }
  }
  
  // ============================================
  // DASHBOARD & ANALYTICS
  // ============================================
  
  /**
   * Obter estatísticas do dashboard
   */
  static async getDashboardStats(): Promise<OrderDashboardStats | null> {
    console.log('📊 getDashboardStats - Iniciando...');
    
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('is_active', true)
      .single();
    
    if (memberError) {
      console.error('❌ getDashboardStats - Erro ao buscar organização:', memberError);
    }
    
    if (!memberData) {
      console.warn('⚠️ getDashboardStats - Organização não encontrada');
      return null;
    }
    
    console.log('📊 getDashboardStats - organization_id:', memberData.organization_id);
    
    // Buscar estatísticas diretamente da tabela orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('order_status, total_amount, order_date')
      .eq('organization_id', memberData.organization_id)
      .is('deleted_at', null);
    
    if (ordersError) {
      console.error('❌ getDashboardStats - Erro ao buscar pedidos:', ordersError);
      throw new Error(`Erro ao buscar pedidos: ${ordersError.message}`);
    }
    
    console.log('📊 getDashboardStats - Total de pedidos encontrados:', orders?.length || 0);
    
    if (orders && orders.length > 0) {
      console.log('📊 getDashboardStats - Status dos pedidos:');
      const statusCount = orders.reduce((acc, o) => {
        acc[o.order_status] = (acc[o.order_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.table(statusCount);
    }
    
    if (!orders || orders.length === 0) {
      console.warn('⚠️ getDashboardStats - Nenhum pedido encontrado');
      return {
        organization_id: memberData.organization_id,
        pending_orders: 0,
        processing_orders: 0,
        shipped_orders: 0,
        total_revenue: 0,
        today_revenue: 0,
        today_orders: 0
      };
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      organization_id: memberData.organization_id,
      pending_orders: orders.filter(o => o.order_status === 'pending').length,
      processing_orders: orders.filter(o => o.order_status === 'processing').length,
      shipped_orders: orders.filter(o => o.order_status === 'shipped').length,
      total_revenue: orders
        .filter(o => !['cancelled', 'draft'].includes(o.order_status))
        .reduce((sum, o) => sum + (o.total_amount || 0), 0),
      today_revenue: orders
        .filter(o => o.order_date?.startsWith(today))
        .reduce((sum, o) => sum + (o.total_amount || 0), 0),
      today_orders: orders.filter(o => o.order_date?.startsWith(today)).length
    };
    
    console.log('📊 getDashboardStats - Estatísticas calculadas:', stats);
    
    return stats;
  }
  
  /**
   * Obter histórico de status de um pedido
   */
  static async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Buscar pedidos recentes
   */
  static async getRecentOrders(limit: number = 10): Promise<Order[]> {
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('is_active', true)
      .single();
    
    if (!memberData) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('organization_id', memberData.organization_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Erro ao buscar pedidos recentes: ${error.message}`);
    }
    
    return (data || []) as unknown as Order[];
  }
}

export default OrdersService;

