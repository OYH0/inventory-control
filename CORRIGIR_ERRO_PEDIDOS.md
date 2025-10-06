# 🔧 CORREÇÃO - Erro ao Atualizar Status de Pedidos

**Erro:** 403 Forbidden ao tentar alterar status do pedido  
**Causa:** Políticas RLS (Row Level Security) não estão permitindo a atualização  
**Solução:** Atualizar políticas RLS para a tabela `orders`

---

## 🚨 PROBLEMA IDENTIFICADO

### Erro no Console
```
PATCH https://uygwwqhjhozyljuxcgkd.supabase.co/rest/v1/orders?id=eq...  403 (Forbidden)
```

### Causa
As políticas RLS da tabela `orders` estão bloqueando as atualizações de status.

---

## ✅ SOLUÇÃO RÁPIDA

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. **Acessar SQL Editor:**
   ```
   https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new
   ```

2. **Copiar e colar o SQL abaixo:**

```sql
-- ============================================
-- FIX: Políticas RLS para Orders
-- ============================================

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Users can view orders from their organization" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders from their organization" ON orders;
DROP POLICY IF EXISTS "Users can delete orders from their organization" ON orders;

-- 2. Criar políticas corretas
-- SELECT
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

-- INSERT
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

-- UPDATE
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

-- DELETE
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

-- 3. Garantir que RLS está habilitado
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

3. **Executar:** Clique em "Run" ou pressione `Ctrl+Enter`

4. **Testar:** Volte para a aplicação e tente atualizar o status novamente

---

### Opção 2: Via psql (se tiver acesso)

```bash
psql "postgres://postgres:[SUA-SENHA]@db.uygwwqhjhozyljuxcgkd.supabase.co:5432/postgres" < fix_orders_rls.sql
```

---

## 🔍 VERIFICAR SE FUNCIONOU

### 1. Verificar Políticas
Execute no SQL Editor:

```sql
SELECT 
  tablename as "Tabela",
  policyname as "Política",
  cmd as "Operação"
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY cmd;
```

**Resultado esperado:** 4 políticas (SELECT, INSERT, UPDATE, DELETE)

### 2. Testar na Aplicação
1. Acesse a página de pedidos
2. Tente alterar o status de "rascunho" para "pendente"
3. Deve funcionar sem erros!

---

## 📝 CORREÇÃO ADICIONAL: Formato de Data

O segundo erro é de formato de data no input HTML:

```
The specified value "2025-10-05T21:20:39.602845+00:00" does not conform to the required format, "yyyy-MM-dd"
```

### Solução

Localize o componente que exibe a data e corrija o formato:

**Arquivo:** `src/pages/OrderEdit.tsx` ou similar

**Problema:**
```tsx
<input 
  type="date" 
  value={order.created_at}  // ❌ Formato errado
/>
```

**Solução:**
```tsx
<input 
  type="date" 
  value={order.created_at?.split('T')[0]}  // ✅ Formato correto
/>
```

Ou melhor ainda, usando `date-fns`:

```tsx
import { format } from 'date-fns';

<input 
  type="date" 
  value={order.created_at ? format(new Date(order.created_at), 'yyyy-MM-dd') : ''}
/>
```

---

## 🎯 CHECKLIST DE CORREÇÃO

- [ ] Executar SQL de correção RLS
- [ ] Verificar políticas criadas
- [ ] Testar atualização de status
- [ ] Corrigir formato de data (se necessário)
- [ ] Recarregar página da aplicação
- [ ] Testar fluxo completo: rascunho → pendente → aprovado

---

## 🔄 SE AINDA NÃO FUNCIONAR

### Verificar se usuário está na organização

```sql
SELECT 
  u.email,
  om.organization_id,
  om.is_active,
  om.role
FROM auth.users u
JOIN organization_members om ON om.user_id = u.id
WHERE u.id = auth.uid();
```

### Verificar se pedido pertence à organização

```sql
SELECT 
  o.id,
  o.order_number,
  o.organization_id,
  o.order_status,
  om.user_id
FROM orders o
JOIN organization_members om ON om.organization_id = o.organization_id
WHERE om.user_id = auth.uid()
AND om.is_active = true;
```

---

## 📞 COMANDOS ÚTEIS

### Desabilitar RLS temporariamente (APENAS PARA DEBUG)
```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

### Reabilitar RLS
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

### Ver todas as políticas
```sql
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

---

## ✅ RESULTADO ESPERADO

Após aplicar a correção:

1. ✅ Erro 403 desaparece
2. ✅ Status pode ser atualizado
3. ✅ Fluxo de pedidos funciona: rascunho → pendente → processando → enviado → entregue
4. ✅ Cancelamento funciona
5. ✅ Histórico é registrado

---

**Arquivo SQL completo:** `fix_orders_rls.sql`  
**Data:** 06 de outubro de 2025  
**Status:** Pronto para aplicar

