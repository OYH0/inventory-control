-- ============================================
-- FIX: Políticas RLS para Orders
-- Corrige erro 403 ao atualizar status do pedido
-- ============================================

-- 1. Verificar políticas atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders';

-- 2. Remover políticas antigas (se necessário)
DROP POLICY IF EXISTS "Users can view orders from their organization" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders from their organization" ON orders;
DROP POLICY IF EXISTS "Users can delete orders from their organization" ON orders;

-- 3. Criar políticas corretas
-- SELECT: Usuários podem ver pedidos da sua organização
CREATE POLICY "Users can view orders from their organization"
ON orders
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- INSERT: Usuários podem criar pedidos
CREATE POLICY "Users can create orders"
ON orders
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- UPDATE: Usuários podem atualizar pedidos da sua organização
CREATE POLICY "Users can update orders from their organization"
ON orders
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- DELETE: Usuários podem deletar pedidos da sua organização  
CREATE POLICY "Users can delete orders from their organization"
ON orders
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- 4. Verificar se RLS está habilitado
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. Mesmas políticas para order_items
DROP POLICY IF EXISTS "Users can view order items from their organization" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Users can update order items from their organization" ON order_items;
DROP POLICY IF EXISTS "Users can delete order items from their organization" ON order_items;

CREATE POLICY "Users can view order items from their organization"
ON order_items
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM orders
    WHERE organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  )
);

CREATE POLICY "Users can create order items"
ON order_items
FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT id FROM orders
    WHERE organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  )
);

CREATE POLICY "Users can update order items from their organization"
ON order_items
FOR UPDATE
USING (
  order_id IN (
    SELECT id FROM orders
    WHERE organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  )
)
WITH CHECK (
  order_id IN (
    SELECT id FROM orders
    WHERE organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  )
);

CREATE POLICY "Users can delete order items from their organization"
ON order_items
FOR DELETE
USING (
  order_id IN (
    SELECT id FROM orders
    WHERE organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  )
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 6. order_status_history
DROP POLICY IF EXISTS "Users can view order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users can insert order status history" ON order_status_history;

CREATE POLICY "Users can view order status history"
ON order_status_history
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM orders
    WHERE organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  )
);

CREATE POLICY "Users can insert order status history"
ON order_status_history
FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT id FROM orders
    WHERE organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  )
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- 7. Verificar resultado
SELECT 
  tablename as "Tabela",
  policyname as "Política",
  cmd as "Operação"
FROM pg_policies
WHERE tablename IN ('orders', 'order_items', 'order_status_history')
ORDER BY tablename, cmd;

