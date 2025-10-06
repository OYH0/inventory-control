-- ============================================
-- FIX: Políticas RLS para order_status_history
-- Corrige erro: "new row violates row-level security policy"
-- ============================================

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Users can view order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users can insert order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users can update order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users can delete order status history" ON order_status_history;

-- 2. Criar políticas corretas

-- SELECT: Ver histórico de pedidos da organização
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

-- INSERT: Permitir inserção de histórico (o trigger faz isso automaticamente)
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

-- UPDATE: Permitir atualização (caso necessário)
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

-- DELETE: Permitir deleção (caso necessário)
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

-- 4. Verificar se há trigger que registra o histórico automaticamente
-- Se não houver, vamos criar um

-- Primeiro, criar a função que registra o histórico
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar mudança de status no histórico
  IF (TG_OP = 'UPDATE' AND OLD.order_status IS DISTINCT FROM NEW.order_status) THEN
    INSERT INTO order_status_history (
      order_id,
      old_status,
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

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;

-- Criar trigger
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- 5. Verificar resultado
SELECT 
  tablename as "Tabela",
  policyname as "Política",
  cmd as "Operação"
FROM pg_policies
WHERE tablename = 'order_status_history'
ORDER BY cmd;

-- 6. Testar se o trigger está criado
SELECT 
  trigger_name as "Trigger",
  event_manipulation as "Evento",
  event_object_table as "Tabela"
FROM information_schema.triggers
WHERE event_object_table = 'orders'
AND trigger_name = 'trigger_log_order_status_change';

