# 🔐 Configuração do Supabase - Inventory Control

**Data:** 06 de outubro de 2025  
**Projeto Supabase ID:** `uygwwqhjhozyljuxcgkd`  
**Status:** ✅ Configurado

---

## 📋 Informações do Projeto

### URLs Importantes
- **Dashboard:** https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd
- **API URL:** https://uygwwqhjhozyljuxcgkd.supabase.co
- **Table Editor:** https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/editor
- **SQL Editor:** https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql

---

## 🔑 Variáveis de Ambiente Necessárias

### Arquivo `.env` (Criar na raiz do projeto)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://uygwwqhjhozyljuxcgkd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

### Como Obter as Chaves

1. Acesse: https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/settings/api
2. Copie os valores:
   - **URL:** Já está correto acima
   - **anon/public key:** Copie e cole no lugar de `your_anon_key_here`

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **camara_fria_items**
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- nome (text)
- quantidade (numeric)
- unidade (text)
- expiry_date (date)
- categoria (text)
- notas (text)
- unit_cost (numeric) -- Para análise ABC
- annual_demand (numeric) -- Para análise ABC
- ordering_cost (numeric)
- carrying_cost_percentage (numeric)
- lead_time_days (integer)
- abc_category (text) -- A, B ou C
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 2. **bebidas_items**
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- nome (text)
- quantidade (numeric)
- unidade (text)
- expiry_date (date)
- categoria (text)
- notas (text)
- unit_cost (numeric)
- annual_demand (numeric)
- ordering_cost (numeric)
- carrying_cost_percentage (numeric)
- lead_time_days (integer)
- abc_category (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 3. **estoque_seco_items**
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- nome (text)
- quantidade (numeric)
- unidade (text)
- expiry_date (date)
- categoria (text)
- notas (text)
- unit_cost (numeric)
- annual_demand (numeric)
- ordering_cost (numeric)
- carrying_cost_percentage (numeric)
- lead_time_days (integer)
- abc_category (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 4. **descartaveis_items**
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- nome (text)
- quantidade (numeric)
- unidade (text)
- expiry_date (date)
- categoria (text)
- notas (text)
- unit_cost (numeric)
- annual_demand (numeric)
- ordering_cost (numeric)
- carrying_cost_percentage (numeric)
- lead_time_days (integer)
- abc_category (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 5. **camara_refrigerada_items**
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- nome (text)
- quantidade (numeric)
- unidade (text)
- expiry_date (date)
- origem (text) -- 'camara_fria'
- categoria (text)
- notas (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 6. **historico** (Todas as tabelas)
```sql
- id (uuid, PK)
- user_id (uuid)
- item_id (uuid)
- tipo (text) -- 'adicionar', 'editar', 'remover', 'transferir'
- nome_item (text)
- quantidade_anterior (numeric)
- quantidade_nova (numeric)
- detalhes (jsonb)
- created_at (timestamptz)
```

#### 7. **expiry_alert_configs**
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- days_before_expiry (integer)
- enabled (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 8. **orders**
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- order_number (text, unique)
- supplier (text)
- status (text) -- 'pending', 'approved', 'in_transit', 'delivered', 'cancelled'
- total_cost (numeric)
- notes (text)
- expected_delivery_date (date)
- actual_delivery_date (date)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 9. **order_items**
```sql
- id (uuid, PK)
- order_id (uuid, FK → orders)
- product_name (text)
- quantity (numeric)
- unit (text)
- unit_cost (numeric)
- total_cost (numeric)
- category (text)
- notes (text)
- created_at (timestamptz)
```

---

## 🔐 Row Level Security (RLS)

### Políticas Implementadas

Todas as tabelas possuem RLS habilitado com as seguintes políticas:

#### SELECT Policy
```sql
CREATE POLICY "Users can view their own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);
```

#### INSERT Policy
```sql
CREATE POLICY "Users can insert their own data"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### UPDATE Policy
```sql
CREATE POLICY "Users can update their own data"
ON table_name FOR UPDATE
USING (auth.uid() = user_id);
```

#### DELETE Policy
```sql
CREATE POLICY "Users can delete their own data"
ON table_name FOR DELETE
USING (auth.uid() = user_id);
```

---

## 📊 Migrations Disponíveis

### Aplicadas
- ✅ Multi-tenant setup
- ✅ RLS policies
- ✅ ABC Analysis fields
- ✅ Expiry alerts
- ✅ Orders system
- ✅ Histórico completo

### Comandos para Aplicar Migrations

```bash
# Ver migrations disponíveis
npm run db:migrations

# Aplicar todas as migrations
npm run db:push

# Aplicar migration específica (via SQL Editor)
# Copie o conteúdo do arquivo .sql e execute no Supabase Dashboard
```

---

## 🚀 Scripts SQL Úteis

### 1. Configurar Produtos para Análise ABC

```sql
-- Atualizar produtos da câmara fria com dados ABC
UPDATE camara_fria_items
SET 
    unit_cost = CASE 
        WHEN nome ILIKE '%carne%' THEN 35.00
        WHEN nome ILIKE '%peixe%' THEN 45.00
        WHEN nome ILIKE '%camarão%' THEN 55.00
        ELSE 25.00
    END,
    annual_demand = CASE 
        WHEN nome ILIKE '%carne%' THEN 1500
        WHEN nome ILIKE '%peixe%' THEN 800
        WHEN nome ILIKE '%camarão%' THEN 600
        ELSE 1200
    END,
    ordering_cost = 100.00,
    carrying_cost_percentage = 25.00,
    lead_time_days = 7
WHERE user_id = auth.uid()
AND nome IS NOT NULL;

-- Atualizar bebidas com dados ABC
UPDATE bebidas_items
SET 
    unit_cost = CASE 
        WHEN nome ILIKE '%refrigerante%' THEN 5.00
        WHEN nome ILIKE '%suco%' THEN 8.00
        WHEN nome ILIKE '%cerveja%' THEN 4.50
        WHEN nome ILIKE '%água%' THEN 2.00
        ELSE 6.00
    END,
    annual_demand = CASE 
        WHEN nome ILIKE '%refrigerante%' THEN 5000
        WHEN nome ILIKE '%cerveja%' THEN 8000
        WHEN nome ILIKE '%água%' THEN 10000
        ELSE 3000
    END,
    ordering_cost = 50.00,
    carrying_cost_percentage = 20.00,
    lead_time_days = 3
WHERE user_id = auth.uid()
AND nome IS NOT NULL;
```

### 2. Verificar Dados ABC

```sql
-- Ver todos os produtos com dados ABC
SELECT 
    nome,
    unit_cost,
    annual_demand,
    (unit_cost * annual_demand) as annual_value,
    abc_category,
    ordering_cost,
    carrying_cost_percentage,
    lead_time_days
FROM camara_fria_items
WHERE user_id = auth.uid()
ORDER BY (unit_cost * annual_demand) DESC;
```

### 3. Criar Configuração de Alertas

```sql
-- Inserir configuração padrão de alertas
INSERT INTO expiry_alert_configs (user_id, days_before_expiry, enabled)
VALUES (auth.uid(), 7, true)
ON CONFLICT (user_id) DO UPDATE
SET days_before_expiry = 7, enabled = true;
```

### 4. Verificar Itens Próximos ao Vencimento

```sql
-- Ver itens que vencem em breve
SELECT 
    nome,
    quantidade,
    unidade,
    expiry_date,
    (expiry_date - CURRENT_DATE) as dias_restantes,
    'camara_fria' as origem
FROM camara_fria_items
WHERE user_id = auth.uid()
AND expiry_date IS NOT NULL
AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY expiry_date ASC;
```

---

## 🔧 Troubleshooting

### Problema: "Missing Supabase environment variables"

**Solução:**
1. Certifique-se de ter o arquivo `.env` na raiz do projeto
2. Verifique se as variáveis estão corretas
3. Reinicie o servidor de desenvolvimento

### Problema: "Row Level Security policy violation"

**Solução:**
1. Verifique se o usuário está autenticado
2. Execute os scripts RLS disponíveis:
   ```bash
   npm run db:fix-rls
   ```

### Problema: "Cannot read properties of null"

**Solução:**
1. Limpe o cache do navegador
2. Faça logout e login novamente
3. Verifique se as tabelas existem no Supabase

---

## 📚 Documentação Adicional

### Arquivos de Referência
- `FIX_RLS_RECURSION.sql` - Correção de RLS
- `MULTI_TENANT_COMPLETE_MIGRATION.sql` - Setup multi-tenant
- `DIAGNOSTICO_RLS.sql` - Diagnóstico de problemas
- `APLICAR_APENAS_ABC.sql` - Setup da Análise ABC

### Links Úteis
- **Supabase Docs:** https://supabase.com/docs
- **Supabase JS Client:** https://supabase.com/docs/reference/javascript
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## ✅ Checklist de Configuração

- [ ] Criar arquivo `.env` com as variáveis corretas
- [ ] Verificar acesso ao dashboard do Supabase
- [ ] Confirmar que as tabelas existem
- [ ] Verificar se RLS está habilitado
- [ ] Testar autenticação (login/logout)
- [ ] Adicionar produtos de teste
- [ ] Configurar dados ABC em alguns produtos
- [ ] Testar Análise ABC
- [ ] Configurar alertas de vencimento
- [ ] Verificar se o histórico está funcionando

---

## 🎯 Próximos Passos

1. **Criar arquivo `.env`** com suas credenciais do Supabase
2. **Reiniciar o servidor:** `npm run dev`
3. **Fazer login** no sistema
4. **Adicionar produtos** para teste
5. **Configurar análise ABC** conforme documentação em `_COMECE_AQUI.md`

---

**Última atualização:** 06 de outubro de 2025  
**Status:** ✅ Sistema configurado e pronto para uso


