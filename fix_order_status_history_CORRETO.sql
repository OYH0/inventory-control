-- ============================================
-- FIX CORRETO: Order Status History RLS
-- Estrutura correta: previous_status, new_status
-- ============================================

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Users can view order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users can insert order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users can update order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users can delete order status history" ON order_status_history;

-- 2. Criar políticas corretas

-- SELECT
CREATE POLICY "Users can view order status history"
ON order_status_history FOR SELECT
USING (
  order_id IN (
    SELECT o.id FROM orders o
    WHERE o.organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

-- INSERT (CRÍTICO)
CREATE POLICY "Users can insert order status history"
ON order_status_history FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT o.id FROM orders o
    WHERE o.organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

-- UPDATE
CREATE POLICY "Users can update order status history"
ON order_status_history FOR UPDATE
USING (
  order_id IN (
    SELECT o.id FROM orders o
    WHERE o.organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
)
WITH CHECK (
  order_id IN (
    SELECT o.id FROM orders o
    WHERE o.organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

-- DELETE
CREATE POLICY "Users can delete order status history"
ON order_status_history FOR DELETE
USING (
  order_id IN (
    SELECT o.id FROM orders o
    WHERE o.organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

-- 3. Habilitar RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- 4. Criar/recriar função com ESTRUTURA CORRETA
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o status mudou
  IF (TG_OP = 'UPDATE' AND OLD.order_status IS DISTINCT FROM NEW.order_status) THEN
    INSERT INTO order_status_history (
      order_id,
      previous_status,  -- CORRETO: previous_status (não old_status)
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.order_status,
      NEW.order_status,
      auth.uid(),
      'Status alterado via sistema'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recriar trigger
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;

CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- 6. Verificar estrutura da tabela
SELECT 
  column_name as "Coluna",
  data_type as "Tipo",
  is_nullable as "Nullable"
FROM information_schema.columns
WHERE table_name = 'order_status_history'
ORDER BY ordinal_position;

-- 7. Verificar políticas
SELECT 
  policyname as "Política",
  cmd as "Operação"
FROM pg_policies
WHERE tablename = 'order_status_history'
ORDER BY cmd;

-- 8. Verificar trigger
SELECT 
  trigger_name as "Trigger",
  event_manipulation as "Evento"
FROM information_schema.triggers
WHERE event_object_table = 'orders'
AND trigger_name = 'trigger_log_order_status_change';

