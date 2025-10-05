# 🚀 COMO APLICAR AS MIGRATIONS VIA DASHBOARD

## ⚠️ PROBLEMA DETECTADO

Há conflito entre migrations locais e remotas no histórico. A solução mais rápida e segura é aplicar via Dashboard do Supabase.

---

## 📋 PASSO A PASSO

### 1️⃣ FIX DE RECURSÃO RLS (PRIORITÁRIO)

**1. Abra o SQL Editor:**
```
https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new
```

**2. Copie o arquivo:**
Abra: `FIX_RLS_RECURSION.sql` (405 linhas)

**3. Cole no SQL Editor**

**4. Clique em RUN**

**Resultado esperado:**
```
NOTICE: ====================================================
NOTICE: FIX DE RECURSÃO INFINITA APLICADO COM SUCESSO!
NOTICE: ====================================================
```

⏱️ **Tempo:** ~30 segundos

---

### 2️⃣ SISTEMA DE ANÁLISE ABC

**1. Abra o SQL Editor novamente**

**2. Copie o arquivo:**
Abra: `supabase/migrations/20250105000000_abc_analysis_system.sql` (800 linhas)

**3. Cole no SQL Editor**

**4. Clique em RUN**

**Resultado esperado:**
```
NOTICE: ====================================================
NOTICE: SISTEMA DE ANÁLISE ABC CRIADO COM SUCESSO!
NOTICE: ====================================================
NOTICE: Tabelas criadas:
NOTICE:   ✓ abc_configurations
NOTICE:   ✓ abc_analysis_history
NOTICE:   ✓ product_abc_changes
NOTICE: Colunas ABC adicionadas a 5 tabelas
```

⏱️ **Tempo:** ~30 segundos

---

## ✅ VERIFICAÇÃO

Após aplicar ambas, execute no SQL Editor:

```sql
-- Verificar tabelas ABC
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%abc%';

-- Deve retornar:
-- abc_configurations
-- abc_analysis_history
-- product_abc_changes

-- Verificar colunas adicionadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'camara_fria_items'
  AND column_name IN ('unit_cost', 'annual_demand', 'abc_category', 'eoq');

-- Deve retornar 4 colunas

-- Verificar funções criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%abc%'
  OR routine_name LIKE '%eoq%';

-- Deve retornar múltiplas funções
```

---

## 🎯 ALTERNATIVA: VIA PSQL (Avançado)

Se preferir usar linha de comando:

```powershell
# Obter connection string
$dbUrl = "postgresql://postgres:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"

# Aplicar FIX RLS
psql $dbUrl -f FIX_RLS_RECURSION.sql

# Aplicar ABC
psql $dbUrl -f supabase/migrations/20250105000000_abc_analysis_system.sql
```

---

## 🆘 SE DER ERRO

### Erro: "relation already exists"

Algumas tabelas já existem. **Solução:**

1. Encontre a linha com erro
2. Comente a linha com `--` no início
3. Execute novamente

### Erro: "function already exists"

Algumas funções já existem. **Solução:**

```sql
-- Adicione OR REPLACE na função
CREATE OR REPLACE FUNCTION nome_funcao()
```

### Erro: "permission denied"

Você não tem permissão. **Solução:**

Execute como superuser ou peça ao owner do projeto.

---

## 🎉 APÓS APLICAR COM SUCESSO

### Recarregue a aplicação:
```
Ctrl+Shift+R no navegador
```

### Verifique o console (F12):
- ✅ Não deve mais ter erro 42P17
- ✅ Dados devem carregar normalmente

### Configure produtos para ABC:
```typescript
import ABCAnalysisService from '@/services/ABCAnalysisService';

// Exemplo: Atualizar produto
await supabase
  .from('camara_fria_items')
  .update({
    unit_cost: 25.50,
    annual_demand: 1200,
    ordering_cost: 100.00
  })
  .eq('id', 'produto-id');

// Executar classificação
const result = await ABCAnalysisService.performFullClassification();
console.log(result);
```

---

## 📊 PRÓXIMOS PASSOS

1. ✅ Aplicar FIX_RLS_RECURSION.sql
2. ✅ Aplicar sistema ABC
3. ✅ Recarregar aplicação
4. 📝 Configurar custos nos produtos
5. 🔄 Executar primeira classificação ABC
6. 📈 Ver dashboard de análise

---

**Data:** 05/10/2025  
**Método:** Dashboard Supabase SQL Editor  
**Tempo total:** ~5 minutos  
**Dificuldade:** Baixa (copiar/colar)

---

## 🔗 LINKS RÁPIDOS

- **SQL Editor:** https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new
- **Database Settings:** https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/settings/database
- **API Logs:** https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/logs/postgres-logs

---

**✨ Dica:** Abra os 2 arquivos SQL em abas separadas do seu editor antes de copiar para facilitar!
