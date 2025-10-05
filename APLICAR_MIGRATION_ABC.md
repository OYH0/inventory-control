# 🚀 Como Aplicar a Migration ABC Manualmente

## Problema
O comando `supabase db push` está tentando aplicar migrations antigas que já foram executadas, causando conflito.

## ✅ SOLUÇÃO RÁPIDA (3 minutos)

### 📋 Passo 1: Acessar o Supabase Dashboard
1. Abra seu navegador
2. Acesse: **https://supabase.com/dashboard**
3. Faça login se necessário
4. Selecione seu projeto: **uygwwqhjhozyljuxcgkd**

### 📝 Passo 2: Abrir SQL Editor
1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New query** (botão verde no canto superior direito)

### 📄 Passo 3: Copiar e Colar o SQL
1. Abra o arquivo: **`APLICAR_APENAS_ABC.sql`** (está na raiz do projeto)
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** do Supabase (Ctrl+V)

### ▶️ Passo 4: Executar
1. Clique no botão **Run** (ou pressione **Ctrl+Enter**)
2. Aguarde 5-10 segundos
3. Você verá uma tabela com os resultados mostrando quantos produtos têm dados ABC

### ✅ Passo 5: Verificar Sucesso
Se você ver uma tabela como esta, funcionou:
```
tabela                      | produtos_com_abc
----------------------------|------------------
camara_fria_items          | 5
camara_refrigerada_items   | 3
estoque_seco_items         | 10
bebidas_items              | 2
descartaveis_items         | 0
```

## 🎯 O que a Migration Faz

1. **Cria função** `calculate_annual_consumption_value()`
   - Calcula automaticamente: `annual_consumption_value = unit_cost × annual_demand`

2. **Cria triggers** em todas as tabelas:
   - `camara_fria_items`
   - `camara_refrigerada_items`
   - `estoque_seco_items`
   - `bebidas_items`
   - `descartaveis_items`

3. **Atualiza produtos existentes** que já têm dados mas não foram calculados

## ✅ Após Aplicar

1. **Adicione um produto** com:
   - `unit_cost`: 10.00
   - `annual_demand`: 100
   
2. O campo `annual_consumption_value` será **automaticamente** = 1000.00

3. Vá para **Análise ABC** e clique em **"Classificar Agora"**

4. Seus produtos aparecerão na lista!

## 🔄 Alternativa: Aplicar via CLI (se preferir)

Se quiser tentar via CLI novamente, use este comando que pula as migrations já aplicadas:

```bash
supabase db push --linked --include-all
```

Ou marque manualmente as migrations antigas como aplicadas e rode apenas a nova.

## 📞 Suporte

Se tiver dúvidas, o SQL completo está em:
`supabase/migrations/20251005000000_auto_calculate_abc_fields.sql`
