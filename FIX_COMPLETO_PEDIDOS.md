# 🔧 FIX COMPLETO - Sistema de Pedidos

**Erro:** `new row violates row-level security policy for table "order_status_history"`  
**Causa:** Falta política RLS na tabela `order_status_history`

---

## 🚀 EXECUTE ESTE SQL AGORA

Acabei de abrir o SQL Editor do Supabase. **Cole e execute este SQL:**

```sql
-- ============================================
-- FIX COMPLETO: Order Status History RLS
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

-- INSERT (importante para o trigger funcionar)
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

-- 4. Criar/recriar função e trigger para log automático
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
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

DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;

CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- 5. Verificar
SELECT 
  policyname as "Política",
  cmd as "Operação"
FROM pg_policies
WHERE tablename = 'order_status_history'
ORDER BY cmd;
```

---

## ✅ RESULTADO ESPERADO

Após executar o SQL acima, você deve ver:

1. **4 políticas criadas** (SELECT, INSERT, UPDATE, DELETE)
2. **Função criada:** `log_order_status_change()`
3. **Trigger criado:** `trigger_log_order_status_change`

---

## 🧪 TESTAR

1. **Recarregue a aplicação** (F5)
2. **Abra um pedido**
3. **Altere o status** de "rascunho" para "pendente"
4. **Deve funcionar!** ✅

---

## 📊 FLUXO COMPLETO DE STATUS

Agora você pode usar todo o fluxo:

```
rascunho → pendente → processando → enviado → entregue
              ↓
          cancelado
```

---

## 🔍 SE AINDA DER ERRO

### Verificar se usuário está na organização:
```sql
SELECT * FROM organization_members 
WHERE user_id = auth.uid() 
AND is_active = true;
```

### Verificar se pedido existe:
```sql
SELECT * FROM orders 
WHERE id = 'seu-order-id';
```

### Verificar políticas:
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('orders', 'order_status_history');
```

---

**🎯 Execute o SQL acima AGORA e teste novamente!**

