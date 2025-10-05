-- =====================================================
-- SISTEMA DE PEDIDOS (ORDERS MANAGEMENT)
-- Data: 05/10/2025
-- Execute este SQL no SQL Editor do Supabase
-- =====================================================

-- Criar ENUMs para pedidos
DO $$ BEGIN
    CREATE TYPE public.order_type AS ENUM ('purchase', 'sale', 'transfer', 'adjustment');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('draft', 'pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('unpaid', 'partial', 'paid', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Tabela principal de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    -- Informações do pedido
    order_number TEXT NOT NULL UNIQUE,
    order_type public.order_type NOT NULL,
    order_status public.order_status DEFAULT 'draft' NOT NULL,
    payment_status public.payment_status DEFAULT 'unpaid' NOT NULL,
    
    -- Datas
    order_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Valores
    subtotal DECIMAL(12,2) DEFAULT 0 NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0 NOT NULL,
    
    -- Cliente/Fornecedor
    supplier_customer_name TEXT,
    supplier_customer_email TEXT,
    supplier_customer_phone TEXT,
    
    -- Endereço
    shipping_address JSONB,
    billing_address JSONB,
    
    -- Localização (origem/destino)
    from_location TEXT CHECK (from_location IN ('juazeiro_norte', 'fortaleza')),
    to_location TEXT CHECK (to_location IN ('juazeiro_norte', 'fortaleza')),
    
    -- Observações
    notes TEXT,
    internal_notes TEXT,
    
    -- Tracking
    tracking_number TEXT,
    carrier TEXT,
    
    -- Auditoria
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES auth.users(id),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Referência ao item (genérica)
    item_table TEXT NOT NULL CHECK (item_table IN (
        'camara_fria_items',
        'camara_refrigerada_items',
        'estoque_seco_items',
        'bebidas_items',
        'descartaveis_items'
    )),
    item_id UUID NOT NULL,
    item_name TEXT NOT NULL,
    item_sku TEXT,
    
    -- Quantidades
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    quantity_received INTEGER DEFAULT 0,
    quantity_returned INTEGER DEFAULT 0,
    
    -- Preços
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(12,2) NOT NULL,
    
    -- Informações adicionais
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de histórico de status
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status public.order_status,
    new_status public.order_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_org ON public.orders(organization_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item ON public.order_items(item_table, item_id);

-- Função para gerar número de pedido automático
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    v_year TEXT := TO_CHAR(NOW(), 'YYYY');
    v_month TEXT := TO_CHAR(NOW(), 'MM');
    v_sequence TEXT;
    v_order_number TEXT;
BEGIN
    SELECT LPAD((COUNT(*) + 1)::TEXT, 5, '0')
    INTO v_sequence
    FROM public.orders
    WHERE order_number LIKE 'ORD-' || v_year || v_month || '%';
    
    v_order_number := 'ORD-' || v_year || v_month || '-' || v_sequence;
    
    RETURN v_order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Calcular totais do pedido automaticamente
CREATE OR REPLACE FUNCTION public.calculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal DECIMAL(12,2);
BEGIN
    -- Calcular subtotal dos itens
    SELECT COALESCE(SUM(line_total), 0)
    INTO v_subtotal
    FROM public.order_items
    WHERE order_id = NEW.order_id;
    
    -- Atualizar totais
    UPDATE public.orders
    SET 
        subtotal = v_subtotal,
        total_amount = v_subtotal + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0) + COALESCE(shipping_cost, 0),
        updated_at = NOW()
    WHERE id = NEW.order_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_order_totals ON public.order_items;
CREATE TRIGGER trigger_calculate_order_totals
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.calculate_order_totals();

-- Trigger: Registrar mudanças de status
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.order_status IS DISTINCT FROM NEW.order_status THEN
        INSERT INTO public.order_status_history (
            order_id,
            previous_status,
            new_status,
            changed_by
        ) VALUES (
            NEW.id,
            OLD.order_status,
            NEW.order_status,
            auth.uid()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_order_status ON public.orders;
CREATE TRIGGER trigger_log_order_status
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();

-- Trigger: Atualizar estoque ao confirmar pedido
CREATE OR REPLACE FUNCTION public.update_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
    v_item RECORD;
BEGIN
    -- Apenas para pedidos de venda aprovados
    IF NEW.order_type = 'sale' AND NEW.order_status = 'approved' AND (OLD.order_status IS NULL OR OLD.order_status != 'approved') THEN
        FOR v_item IN 
            SELECT item_table, item_id, quantity 
            FROM public.order_items 
            WHERE order_id = NEW.id
        LOOP
            EXECUTE format('
                UPDATE %I 
                SET quantidade = quantidade - $1 
                WHERE id = $2 AND quantidade >= $1
            ', v_item.item_table)
            USING v_item.quantity, v_item.item_id;
        END LOOP;
    END IF;
    
    -- Para pedidos de compra recebidos
    IF NEW.order_type = 'purchase' AND NEW.order_status = 'delivered' AND (OLD.order_status IS NULL OR OLD.order_status != 'delivered') THEN
        FOR v_item IN 
            SELECT item_table, item_id, quantity 
            FROM public.order_items 
            WHERE order_id = NEW.id
        LOOP
            EXECUTE format('
                UPDATE %I 
                SET quantidade = quantidade + $1 
                WHERE id = $2
            ', v_item.item_table)
            USING v_item.quantity, v_item.item_id;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_on_order ON public.orders;
CREATE TRIGGER trigger_update_inventory_on_order
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_on_order();

-- RLS Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users view org orders" ON public.orders;
DROP POLICY IF EXISTS "Users create orders" ON public.orders;
DROP POLICY IF EXISTS "Users update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins approve orders" ON public.orders;
DROP POLICY IF EXISTS "Users view order items" ON public.order_items;
DROP POLICY IF EXISTS "Users manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Users view order history" ON public.order_status_history;

-- Policy: Ver pedidos da organização
CREATE POLICY "Users view org orders"
ON public.orders FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Policy: Criar pedidos
CREATE POLICY "Users create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (
    organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Policy: Atualizar pedidos
CREATE POLICY "Users update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Policy: Deletar pedidos (soft delete)
CREATE POLICY "Users delete orders"
ON public.orders FOR DELETE
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Policies para order_items
CREATE POLICY "Users view order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
    order_id IN (
        SELECT id FROM public.orders WHERE organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users manage order items"
ON public.order_items FOR ALL
TO authenticated
USING (
    order_id IN (
        SELECT id FROM public.orders WHERE organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);

-- Policies para order_status_history
CREATE POLICY "Users view order history"
ON public.order_status_history FOR SELECT
TO authenticated
USING (
    order_id IN (
        SELECT id FROM public.orders WHERE organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);

-- View: Dashboard de pedidos
CREATE OR REPLACE VIEW public.orders_dashboard AS
SELECT 
    o.organization_id,
    COUNT(*) FILTER (WHERE o.order_status = 'pending') as pending_orders,
    COUNT(*) FILTER (WHERE o.order_status = 'processing') as processing_orders,
    COUNT(*) FILTER (WHERE o.order_status = 'shipped') as shipped_orders,
    SUM(o.total_amount) FILTER (WHERE o.order_status NOT IN ('cancelled', 'draft')) as total_revenue,
    SUM(o.total_amount) FILTER (WHERE DATE(o.order_date) = CURRENT_DATE) as today_revenue,
    COUNT(*) FILTER (WHERE DATE(o.order_date) = CURRENT_DATE) as today_orders
FROM public.orders o
WHERE o.deleted_at IS NULL
GROUP BY o.organization_id;

COMMENT ON TABLE public.orders IS 'Sistema completo de gerenciamento de pedidos';
COMMENT ON TABLE public.order_items IS 'Itens individuais de cada pedido';
COMMENT ON TABLE public.order_status_history IS 'Histórico de mudanças de status';

