# 🔧 INSTRUÇÕES: Corrigir Erro de Recursão Infinita no Supabase

## 🔴 Problema Identificado

```
Error: {code: '42P17', message: 'infinite recursion detected in policy for relation "organization_members"'}
```

**Causa:** As políticas de Row Level Security (RLS) criaram um loop circular:
- A policy de `organization_members` tenta ler `organization_members` para verificar permissões
- Isso cria recursão infinita

---

## ✅ SOLUÇÃO - Passo a Passo

### 1️⃣ Acesse o Supabase SQL Editor

1. Abra: https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd
2. Vá em: **SQL Editor** (no menu lateral esquerdo)

### 2️⃣ Execute o Script de Correção

1. Abra o arquivo `FIX_RLS_RECURSION.sql` (que acabei de criar)
2. **COPIE TODO O CONTEÚDO** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **RUN** (ou pressione Ctrl+Enter)

### 3️⃣ Aguarde a Execução

O script irá:
- ✓ Remover todas as policies problemáticas
- ✓ Recriar funções com `SECURITY DEFINER` (bypassa RLS internamente)
- ✓ Criar policies simplificadas sem recursão
- ✓ Corrigir todas as tabelas de itens
- ✓ Corrigir alertas e históricos

**Tempo estimado:** 10-30 segundos

### 4️⃣ Verifique o Sucesso

Você verá mensagens como:
```
NOTICE: ====================================================
NOTICE: FIX DE RECURSÃO INFINITA APLICADO COM SUCESSO!
NOTICE: ====================================================
```

### 5️⃣ Recarregue a Aplicação

1. Volte para a aplicação web
2. Pressione **Ctrl+Shift+R** (recarregar hard)
3. Ou feche e abra o navegador novamente

---

## 🧪 Como Testar se Funcionou

Após executar o script, abra o Console do navegador (F12) e verifique:

### ✅ ANTES (com erro):
```
Error fetching items: {code: '42P17', message: 'infinite recursion detected...'}
```

### ✅ DEPOIS (funcionando):
```
=== FETCH INICIAL DA CÂMARA FRIA ===
// Dados carregados com sucesso
```

---

## 🔍 Explicação Técnica da Correção

### Problema Original:

```sql
-- Policy problemática (RECURSIVA)
CREATE POLICY "Members can view organization members"
ON organization_members FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_members  -- ❌ LÊ A MESMA TABELA!
        WHERE user_id = auth.uid()
    )
);
```

### Solução Implementada:

```sql
-- Policy corrigida (SEM RECURSÃO)
CREATE POLICY "members_select_members"
ON organization_members FOR SELECT
USING (
    user_id = auth.uid()  -- ✅ Direto, sem subquery
    OR 
    user_belongs_to_organization(organization_id)  -- ✅ Usa SECURITY DEFINER
);
```

**Funções com `SECURITY DEFINER`:**
- Bypassam as políticas RLS internamente
- Não criam recursão porque executam com privilégios elevados
- Ainda mantêm segurança porque verificam `auth.uid()`

---

## 📋 Checklist de Verificação

Após executar o script, verifique:

- [ ] Script executado sem erros no Supabase
- [ ] Mensagem de sucesso apareceu
- [ ] Aplicação recarregada (Ctrl+Shift+R)
- [ ] Console do navegador não mostra mais erro 42P17
- [ ] Dados das tabelas carregam normalmente
- [ ] Dashboard exibe itens corretamente

---

## 🆘 Se Ainda Houver Problemas

### Problema: "function ... does not exist"

**Solução:** Execute primeiro o arquivo `MULTI_TENANT_COMPLETE_MIGRATION.sql` completo, depois execute o `FIX_RLS_RECURSION.sql`.

### Problema: "permission denied for table organization_members"

**Solução:** 
1. Vá em **Database → Tables** no Supabase
2. Selecione `organization_members`
3. Clique em **RLS** (Row Level Security)
4. Verifique se RLS está **habilitado**
5. Se não houver policies, execute o `FIX_RLS_RECURSION.sql` novamente

### Problema: "user must belong to an organization"

**Solução:**
```sql
-- Execute no SQL Editor:
SELECT auto_create_organization_for_user();
```

---

## 📞 Diagnóstico Adicional

Execute no SQL Editor para verificar o estado atual:

```sql
-- 1. Verificar suas organizações
SELECT * FROM get_user_organizations();

-- 2. Verificar policies existentes
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('organization_members', 'camara_fria_items', 'descartaveis_items')
ORDER BY tablename, policyname;

-- 3. Verificar se funções existem
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%organization%'
ORDER BY routine_name;

-- 4. Criar organização se necessário
SELECT auto_create_organization_for_user();
```

---

## ✨ Resultado Final Esperado

Após aplicar a correção, sua aplicação deve:

1. ✅ Carregar todas as tabelas sem erros 42P17
2. ✅ Exibir dados de câmara fria, refrigerada, estoque seco, bebidas e descartáveis
3. ✅ Permitir adicionar/editar/remover itens
4. ✅ Funcionar sistema de alertas
5. ✅ Manter isolamento completo entre organizações (multi-tenant)
6. ✅ Respeitar permissões por role (owner, admin, manager, member, viewer)

---

**Data da Correção:** 05/10/2025  
**Arquivo de Correção:** `FIX_RLS_RECURSION.sql`  
**Status:** ✅ Pronto para aplicar
