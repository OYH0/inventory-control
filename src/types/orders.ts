// =====================================================
// TYPES: Sistema de Pedidos (Orders Management)
// =====================================================

export type OrderType = 'purchase' | 'sale' | 'transfer' | 'adjustment';

export type OrderStatus = 
  | 'draft'
  | 'pending'
  | 'approved'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export type LocationType = 'juazeiro_norte' | 'fortaleza';

export type ItemTable = 
  | 'camara_fria_items'
  | 'camara_refrigerada_items'
  | 'estoque_seco_items'
  | 'bebidas_items'
  | 'descartaveis_items';

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
}

export interface Order {
  id: string;
  organization_id: string;
  user_id: string;
  
  // Informações do pedido
  order_number: string;
  order_type: OrderType;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  
  // Datas
  order_date: string;
  expected_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  
  // Valores
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  
  // Cliente/Fornecedor
  supplier_customer_name?: string | null;
  supplier_customer_email?: string | null;
  supplier_customer_phone?: string | null;
  
  // Endereço
  shipping_address?: Address | null;
  billing_address?: Address | null;
  
  // Localização
  from_location?: LocationType | null;
  to_location?: LocationType | null;
  
  // Observações
  notes?: string | null;
  internal_notes?: string | null;
  
  // Tracking
  tracking_number?: string | null;
  carrier?: string | null;
  
  // Auditoria
  approved_by?: string | null;
  approved_at?: string | null;
  cancelled_by?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  
  // Referência ao item
  item_table: ItemTable;
  item_id: string;
  item_name: string;
  item_sku?: string | null;
  
  // Quantidades
  quantity: number;
  quantity_received: number;
  quantity_returned: number;
  
  // Preços
  unit_price: number;
  discount_percentage: number;
  tax_percentage: number;
  line_total: number;
  
  // Informações adicionais
  notes?: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: string;
  notes?: string | null;
  created_at: string;
}

export interface OrderDashboardStats {
  organization_id: string;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  total_revenue: number;
  today_revenue: number;
  today_orders: number;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateOrderInput {
  order_type: OrderType;
  order_status?: OrderStatus;
  payment_status?: PaymentStatus;
  
  expected_delivery_date?: string;
  
  tax_amount?: number;
  discount_amount?: number;
  shipping_cost?: number;
  
  supplier_customer_name?: string;
  supplier_customer_email?: string;
  supplier_customer_phone?: string;
  
  shipping_address?: Address;
  billing_address?: Address;
  
  from_location?: LocationType;
  to_location?: LocationType;
  
  notes?: string;
  internal_notes?: string;
  
  tracking_number?: string;
  carrier?: string;
  
  items: CreateOrderItemInput[];
}

export interface CreateOrderItemInput {
  item_table: ItemTable;
  item_id: string;
  item_name: string;
  item_sku?: string;
  
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  tax_percentage?: number;
  
  notes?: string;
}

export interface UpdateOrderInput {
  order_status?: OrderStatus;
  payment_status?: PaymentStatus;
  
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  
  tax_amount?: number;
  discount_amount?: number;
  shipping_cost?: number;
  
  supplier_customer_name?: string;
  supplier_customer_email?: string;
  supplier_customer_phone?: string;
  
  shipping_address?: Address;
  billing_address?: Address;
  
  from_location?: LocationType;
  to_location?: LocationType;
  
  notes?: string;
  internal_notes?: string;
  
  tracking_number?: string;
  carrier?: string;
}

export interface OrderFilters {
  order_type?: OrderType;
  order_status?: OrderStatus;
  payment_status?: PaymentStatus;
  from_location?: LocationType;
  to_location?: LocationType;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  status_history?: OrderStatusHistory[];
}

// ============================================
// CONSTANTS
// ============================================

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  purchase: 'Compra',
  sale: 'Venda',
  transfer: 'Transferência',
  adjustment: 'Ajuste'
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  approved: 'Aprovado',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  returned: 'Devolvido'
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Não Pago',
  partial: 'Parcial',
  paid: 'Pago',
  refunded: 'Reembolsado'
};

export const LOCATION_LABELS: Record<LocationType, string> = {
  juazeiro_norte: 'Juazeiro do Norte',
  fortaleza: 'Fortaleza'
};

export const ITEM_TABLE_LABELS: Record<ItemTable, string> = {
  camara_fria_items: 'Câmara Fria',
  camara_refrigerada_items: 'Câmara Refrigerada',
  estoque_seco_items: 'Estoque Seco',
  bebidas_items: 'Bebidas',
  descartaveis_items: 'Descartáveis'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'gray',
  pending: 'yellow',
  approved: 'blue',
  processing: 'purple',
  shipped: 'indigo',
  delivered: 'green',
  cancelled: 'red',
  returned: 'orange'
};

