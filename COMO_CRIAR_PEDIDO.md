# 🛒 Como Criar um Pedido - Guia Passo a Passo

## ⚠️ **ERRO COMUM: ID Inválido**

Se você recebeu o erro:
```
invalid input syntax for type uuid: "123"
```

**Você usou um ID inválido!** O ID precisa ser um UUID completo.

---

## ✅ **SOLUÇÃO (3 Passos Simples)**

### **Passo 1: Obter IDs Válidos do Supabase**

#### **1.1. Abra o SQL Editor**
```
https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql
```

#### **1.2. Cole e Execute este SQL:**

```sql
SELECT 
  id,
  nome,
  quantidade,
  preco_unitario,
  categoria
FROM estoque_seco_items 
WHERE organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid()
  LIMIT 1
)
AND quantidade > 0
ORDER BY nome
LIMIT 10;
```

#### **1.3. Você verá algo assim:**

```
┌──────────────────────────────────────┬─────────────┬────────────┬────────────────┬───────────┐
│ id                                   │ nome        │ quantidade │ preco_unitario │ categoria │
├──────────────────────────────────────┼─────────────┼────────────┼────────────────┼───────────┤
│ 7b9e4567-e89b-12d3-a456-426614174000 │ Arroz 5kg   │ 50         │ 25.50          │ Grãos     │
│ 8c3f5678-f89c-23e4-b567-537725285111 │ Feijão 1kg  │ 30         │ 8.90           │ Grãos     │
│ 9d4g6789-g89d-34f5-c678-648836396222 │ Açúcar 2kg  │ 20         │ 6.50           │ Açúcar    │
└──────────────────────────────────────┴─────────────┴────────────┴────────────────┴───────────┘
```

#### **1.4. COPIE um UUID da coluna "id"**

Exemplo de UUID válido:
```
7b9e4567-e89b-12d3-a456-426614174000
```

**Formato:** `8-4-4-4-12` caracteres separados por hífens

---

### **Passo 2: Criar o Pedido na Aplicação**

#### **2.1. Acesse o Sistema**
```
http://localhost:8080
```

#### **2.2. Navegue para Pedidos**
- Clique no menu lateral
- Selecione "Pedidos" (ícone 🛒)

#### **2.3. Clique em "Novo Pedido"**

#### **2.4. Preencha o Formulário:**

**Você verá um alerta azul com instruções!**

```
┌────────────────────────────────────────────────────────┐
│ ℹ️  Como obter IDs de produtos válidos:                │
│                                                        │
│ Execute este SQL no Supabase SQL Editor:              │
│                                                        │
│ SELECT id, nome, preco_unitario                       │
│ FROM estoque_seco_items                               │
│ WHERE organization_id = (...)                         │
│ LIMIT 10;                                             │
│                                                        │
│ Copie um UUID da coluna "id" e cole no campo          │
│ "ID do Item"                                          │
└────────────────────────────────────────────────────────┘
```

**Informações Básicas:**
- **Tipo de Pedido:** Compra ✅
- **Data de Entrega:** 2025-10-15 ✅
- **Fornecedor:** Fornecedor ABC ✅

**Adicionar Item:**
1. Clique em **"Adicionar Item"**
2. Preencha:

```
Tabela:          Estoque Seco
Nome:            Arroz 5kg
ID do Item:      7b9e4567-e89b-12d3-a456-426614174000 ← COLE O UUID AQUI!
SKU:             ARR001 (opcional)
Quantidade:      10
Preço Unitário:  25.50
Desconto (%):    0 (opcional)
Taxa (%):        0 (opcional)
```

**⚠️ IMPORTANTE:**
- O campo "ID do Item" agora tem um placeholder mostrando o formato
- A fonte é mono-espaçada para facilitar verificação
- Há uma dica visual abaixo do campo

#### **2.5. Clique em "Criar Pedido"**

---

### **Passo 3: Verificar o Resultado**

#### **3.1. Se UUID for INVÁLIDO:**
```
❌ Item 1: ID inválido. Use o formato UUID (ex: 12345678-1234-1234-1234-123456789012)
```

#### **3.2. Se UUID for VÁLIDO:**
```
✅ Pedido ORD-202510-00001 criado com sucesso!
```

O pedido aparecerá na lista com:
- Status: Rascunho
- Total: R$ 255,00
- Cliente/Fornecedor: Fornecedor ABC

---

## 🎯 **EXEMPLOS CORRETOS**

### **✅ CERTO - UUID Válido:**
```
7b9e4567-e89b-12d3-a456-426614174000
8c3f5678-f89c-23e4-b567-537725285111
9d4g6789-g89d-34f5-c678-648836396222
```

### **❌ ERRADO - UUID Inválido:**
```
123                           ← Muito curto
abc-def-ghi                   ← Formato errado
7b9e4567                      ← Incompleto
7b9e4567-e89b-12d3-a456       ← Faltando parte
```

---

## 📋 **CHECKLIST ANTES DE CRIAR PEDIDO**

Antes de clicar em "Criar Pedido", verifique:

- [ ] Tipo de pedido selecionado
- [ ] Fornecedor/Cliente preenchido (opcional mas recomendado)
- [ ] Pelo menos 1 item adicionado
- [ ] **ID do item é um UUID válido** (36 caracteres com hífens)
- [ ] Nome do item preenchido
- [ ] Quantidade > 0
- [ ] Preço unitário ≥ 0

---

## 🔧 **TROUBLESHOOTING**

### **Erro: "ID inválido"**
**Solução:** Use o formato UUID completo (8-4-4-4-12)

### **Erro: "invalid input syntax for type uuid"**
**Solução:** Execute o SQL no Supabase para obter IDs reais

### **Erro: "Item não encontrado"**
**Solução:** Verifique se o UUID pertence a um produto da sua organização

### **Nenhum produto aparece no SQL?**
**Solução:** Cadastre alguns produtos primeiro em "Estoque Seco"

---

## 💡 **DICAS PRO**

### **1. Criar Produto de Teste Rápido:**

```sql
INSERT INTO estoque_seco_items (
  nome, 
  quantidade, 
  unidade, 
  categoria, 
  preco_unitario,
  user_id,
  organization_id
) VALUES (
  'Produto Teste para Pedido',
  100,
  'un',
  'Teste',
  25.50,
  auth.uid(),
  (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() LIMIT 1)
)
RETURNING id, nome, preco_unitario;
```

### **2. Ver Todos os Produtos:**

```sql
SELECT 'estoque_seco' as origem, id, nome, preco_unitario FROM estoque_seco_items
UNION ALL
SELECT 'bebidas' as origem, id, nome, preco_unitario FROM bebidas_items
UNION ALL
SELECT 'camara_fria' as origem, id, nome, preco_unitario FROM camara_fria_items
ORDER BY nome
LIMIT 50;
```

### **3. Copiar UUID Rapidamente:**

No resultado do SQL:
1. Clique no UUID
2. Será selecionado automaticamente
3. `Ctrl+C` para copiar
4. `Ctrl+V` no formulário

---

## 🎉 **TESTE COMPLETO**

Execute este teste do início ao fim:

1. **SQL Editor do Supabase:**
   ```sql
   SELECT id, nome, preco_unitario 
   FROM estoque_seco_items LIMIT 1;
   ```
   
2. **Copie o UUID** da coluna `id`

3. **Na aplicação:**
   - Pedidos → Novo Pedido
   - Tipo: Compra
   - Fornecedor: "Teste"
   - Adicionar Item:
     - Nome: "Arroz"
     - ID: [Cole o UUID]
     - Quantidade: 10
     - Preço: 25.50
   - Criar Pedido

4. **Resultado esperado:**
   ```
   ✅ Pedido ORD-202510-00001 criado com sucesso!
   Total: R$ 255,00
   ```

---

## 📞 **AINDA COM DÚVIDAS?**

### **Verifique:**
1. O UUID tem 36 caracteres? (incluindo hífens)
2. O formato é 8-4-4-4-12?
3. Você copiou da coluna "id" do SQL?
4. O produto pertence à sua organização?

### **Exemplo de UUID Completo:**
```
7b9e4567-e89b-12d3-a456-426614174000
│      │    │    │    │           │
8 chars│    │    │    │      12 chars
       4 chars  │    4 chars
              4 chars
```

---

**🎊 Agora você está pronto para criar pedidos com sucesso!**

**Arquivo SQL completo disponível em:** `OBTER_IDS_PRODUTOS.sql`

