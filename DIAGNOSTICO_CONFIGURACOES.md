# 🔧 DIAGNÓSTICO E CORREÇÃO - Configurações de Alertas

## ✅ MELHORIAS IMPLEMENTADAS

### 1. **Componente ExpiryAlertSettings.tsx**
- ✅ Validações completas nos campos
- ✅ Feedback visual de mudanças não salvas
- ✅ Tratamento de erros robusto
- ✅ Logs detalhados para debug
- ✅ Limites de valores nos inputs
- ✅ Card de status mostrando dados do banco
- ✅ Indicador de "Alterações não salvas"
- ✅ Botão desabilitado quando não há mudanças

### 2. **Hook useAlertConfiguration**
- ✅ Logs detalhados em cada etapa
- ✅ Retry logic (2 tentativas)
- ✅ Cache otimizado (30 segundos)
- ✅ Atualização otimista do cache
- ✅ Invalidação correta das queries
- ✅ Tratamento de erros melhorado

### 3. **Service ExpiryAlertService.ts**
- ✅ Verifica se config existe antes de atualizar
- ✅ Usa UPDATE se existe, INSERT se não existe
- ✅ Logs detalhados de cada operação
- ✅ Tratamento completo de erros

---

## 🔍 COMO DIAGNOSTICAR PROBLEMAS

### **Passo 1: Verifique o Console do Navegador**

Abra o DevTools (F12) e vá para a aba **Console**. Você verá logs como:

```
[useAlertConfiguration] Fetching config for user: abc-123
[useAlertConfiguration] Config fetched: { id: 1, warning_days: 30, ... }
[ExpiryAlertSettings] Config loaded: { ... }
```

**O que procurar:**
- ❌ Erros em vermelho (especialmente relacionados ao Supabase)
- ⚠️ Warnings sobre políticas RLS
- ℹ️ Logs mostrando que a config foi carregada

---

### **Passo 2: Verifique a Aba Network**

1. Abra DevTools (F12)
2. Vá para a aba **Network**
3. Filtre por "supabase"
4. Tente salvar uma configuração

**O que verificar:**
- ✅ Request para `/rest/v1/alert_configurations` com status 200 ou 201
- ❌ Status 400, 401, 403 ou 500 indica problema
- 🔍 Clique no request e veja a resposta em "Response"

---

### **Passo 3: Verifique o Card de Status**

Na aba de Configurações, você verá um card azul no topo mostrando:

```
✓ Configuração carregada do banco
ID: 123
Última atualização: 04/10/2025 14:30:15
```

**Se este card não aparecer:**
- ❌ A configuração não está sendo carregada do banco
- Vá para o Passo 4 (SQL)

---

## 🗄️ VERIFICAÇÃO DO BANCO DE DADOS

### **Execute o Script de Verificação**

1. Vá para: **Supabase Dashboard** → **SQL Editor**
2. Cole o conteúdo do arquivo `VERIFICAR_TABELA_CONFIGS.sql`
3. Execute seção por seção

### **Resultados Esperados:**

**Verificação 1 - Tabela existe:**
```sql
tabela_existe
-------------
true
```
Se for `false`, a tabela não existe! Execute o `APLICAR_AGORA.sql` novamente.

**Verificação 2 - Colunas:**
```
column_name              | data_type
-------------------------|------------
id                       | uuid
user_id                  | uuid
warning_days             | integer
critical_days            | integer
notification_frequency   | text
notification_time        | text
notification_channels    | ARRAY
is_active                | boolean
created_at               | timestamp
updated_at               | timestamp
```

**Verificação 3 - Políticas RLS:**
Deve mostrar 3 políticas:
- `Users can view own config` (SELECT)
- `Users can insert own config` (INSERT)
- `Users can update own config` (UPDATE)

Se não houver políticas, execute a seção de recriação no script.

---

## 🚀 SOLUÇÃO RÁPIDA

### **Se nada está funcionando:**

```sql
-- 1. Execute no SQL Editor do Supabase
-- Criar/atualizar configuração para o usuário atual

INSERT INTO alert_configurations (
    user_id,
    warning_days,
    critical_days,
    notification_frequency,
    notification_time,
    notification_channels,
    is_active,
    created_at,
    updated_at
) VALUES (
    auth.uid(),
    30,
    7,
    'daily',
    '09:00',
    to_jsonb(ARRAY['in_app']::text[]),
    true,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
    warning_days = 30,
    critical_days = 7,
    notification_frequency = 'daily',
    notification_time = '09:00',
    notification_channels = to_jsonb(ARRAY['in_app']::text[]),
    is_active = true,
    updated_at = NOW();

-- 2. Verificar se foi criado
SELECT * FROM alert_configurations WHERE user_id = auth.uid();
```

**Agora volte para a aba de Configurações e recarregue a página (F5).**

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Marque cada item conforme verifica:

### **Frontend:**
- [ ] Console do navegador não mostra erros em vermelho
- [ ] Logs `[useAlertConfiguration]` aparecem no console
- [ ] Card azul de status aparece na página
- [ ] Campos de input permitem digitação
- [ ] Badge "Alterações não salvas" aparece ao editar
- [ ] Botão "Salvar" fica habilitado ao fazer mudanças

### **Backend/Database:**
- [ ] Tabela `alert_configurations` existe
- [ ] RLS está habilitado na tabela
- [ ] 3 políticas RLS estão ativas
- [ ] Registro existe para seu `user_id`
- [ ] `auth.uid()` retorna seu ID corretamente

### **Network:**
- [ ] Request GET para carregar config retorna 200
- [ ] Request POST/PATCH para salvar retorna 200/201
- [ ] Não há erros 401 (autenticação) ou 403 (permissão)

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### **Problema 1: "Não consigo editar os campos"**

**Causa:** Estado não está sendo atualizado

**Solução:**
- Verifique console por erros
- Confirme que `config` está sendo carregado (veja o card azul)
- Tente recarregar a página (F5)

---

### **Problema 2: "Alterações não são salvas"**

**Causa provável:** Erro no banco de dados

**Como verificar:**
1. Abra Console do navegador
2. Tente salvar
3. Procure por erro `[ExpiryAlertService]` ou `[useAlertConfiguration]`

**Soluções:**
- Execute `VERIFICAR_TABELA_CONFIGS.sql`
- Verifique políticas RLS
- Confirme que `auth.uid()` funciona

---

### **Problema 3: "Card de status não aparece"**

**Causa:** Configuração não carregou do banco

**Solução:**
1. Execute o SQL de criação manual (veja "Solução Rápida")
2. Recarregue a página
3. Verifique se apareceu

---

### **Problema 4: "Erro 401 ou 403"**

**Causa:** Problema de autenticação ou permissão

**Solução:**
```sql
-- Verificar se você está autenticado
SELECT auth.uid();

-- Se retornar NULL, você não está logado
-- Faça logout e login novamente
```

---

### **Problema 5: "Botão Salvar sempre desabilitado"**

**Causa:** Lógica de detecção de mudanças

**Solução:**
- Faça uma mudança significativa (ex: mude 30 dias para 45)
- O badge "Alterações não salvas" deve aparecer
- Se não aparecer, verifique console por erros

---

## 🎯 TESTE FINAL

Após todas as correções:

1. ✅ Acesse: **Configurações** → Aba **Alertas de Vencimento**
2. ✅ Veja o card azul com informações do banco
3. ✅ Mude **Dias de Aviso** de 30 para 45
4. ✅ Veja o badge "Alterações não salvas"
5. ✅ Clique em "Salvar Configurações"
6. ✅ Veja o toast verde "✓ Configurações salvas"
7. ✅ Badge muda para "✓ Tudo salvo"
8. ✅ Recarregue a página (F5)
9. ✅ Valor 45 ainda está lá

**Se todos os passos funcionarem, está 100% funcional!** ✨

---

## 📞 DEBUG AVANÇADO

Se ainda houver problemas, execute no Console do navegador:

```javascript
// Ver configuração atual no cache
const queryClient = window.__REACT_QUERY_DEVTOOLS_CLIENT__;
console.log('Config em cache:', queryClient.getQueryData(['alert-config']));

// Ver estado do React Query
console.log('Todas queries:', queryClient.getQueryCache().getAll());

// Forçar refetch
queryClient.invalidateQueries(['alert-config']);
```

---

## ✅ RESUMO DAS CORREÇÕES FEITAS

1. **Validações completas** - Impede valores inválidos
2. **Feedback visual** - Usuário sabe o que está acontecendo
3. **Logs detalhados** - Fácil identificar problemas
4. **Tratamento de erros** - Mensagens claras
5. **Cache otimizado** - Performance melhorada
6. **Atualização otimista** - UI responde instantaneamente

---

**🎉 Sistema de configurações agora é production-ready!**

