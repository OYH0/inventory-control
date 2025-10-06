# 🚀 APLICAR CORREÇÃO AGORA - Passo a Passo

**Tempo necessário:** 2 minutos  
**Senha do banco:** `cecOYH09118`

---

## 📋 PASSO 1: Abrir SQL Editor

Clique neste link (ou copie e cole no navegador):

```
https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new
```

---

## 📋 PASSO 2: Copiar este SQL

```sql
-- ============================================
-- FIX: Políticas RLS para Orders
-- Corrige erro 403 ao atualizar status
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view orders from their organization" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders from their organization" ON orders;
DROP POLICY IF EXISTS "Users can delete orders from their organization" ON orders;

-- Criar SELECT policy
CREATE POLICY "Users can view orders from their organization"
ON orders FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Criar INSERT policy
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Criar UPDATE policy
CREATE POLICY "Users can update orders from their organization"
ON orders FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Criar DELETE policy
CREATE POLICY "Users can delete orders from their organization"
ON orders FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Verificar resultado
SELECT 
  policyname as "Política",
  cmd as "Operação"
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY cmd;
```

---

## 📋 PASSO 3: Executar

1. Cole o SQL no editor
2. Clique em **"Run"** ou pressione **`Ctrl+Enter`**
3. Aguarde a mensagem de sucesso

**Resultado esperado:**
```
Success. No rows returned
```

E na seção de resultados, você verá 4 políticas listadas.

---

## 📋 PASSO 4: Testar

1. Volte para a aplicação: http://localhost:8080/pedidos
2. Recarregue a página (**F5**)
3. Tente atualizar o status de um pedido
4. **Deve funcionar sem erro 403!** ✅

---

## ✅ CONFIRMAÇÃO DE SUCESSO

Você saberá que funcionou quando:

- ✅ SQL executou sem erros
- ✅ 4 políticas foram criadas
- ✅ Status do pedido pode ser alterado
- ✅ Não aparece mais erro 403 no console

---

## 🆘 SE DER ERRO

### Erro: "permission denied"
**Solução:** Você precisa estar logado como administrador do projeto no Supabase.

### Erro: "already exists"
**Solução:** Execute apenas a parte do `DROP POLICY` primeiro, depois execute o restante.

### Erro persiste na aplicação
**Solução:** 
1. Limpe o cache do navegador (Ctrl+Shift+Del)
2. Faça logout e login novamente
3. Recarregue a página (F5)

---

## 📞 LINKS RÁPIDOS

- **SQL Editor:** https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new
- **Dashboard:** https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd
- **Aplicação:** http://localhost:8080/pedidos

---

**🎯 AÇÃO IMEDIATA: Execute o SQL acima AGORA!**

