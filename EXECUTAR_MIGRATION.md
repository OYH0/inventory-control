# ⚡ Como Aplicar a Migration (3 minutos)

## 📋 PASSO 1: Copiar o SQL

1. Abra o arquivo: **`APLICAR_AGORA.sql`**
2. Pressione **Ctrl+A** (selecionar tudo)
3. Pressione **Ctrl+C** (copiar)

---

## 🌐 PASSO 2: Abrir Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

---

## ✨ PASSO 3: Executar

1. Cole o SQL (Ctrl+V)
2. Clique no botão verde **"Run"** (canto inferior direito)
3. Aguarde ~10-20 segundos
4. Você verá: ✅ **"Success"** + mensagem de sucesso

---

## 🎉 PRONTO!

Se viu a mensagem de sucesso, **está tudo funcionando!**

### Próximos Passos:

1. **Feche o navegador do sistema** (se estiver aberto)
2. **Abra novamente:** `http://localhost:5173`
3. **Vá em "Alertas de Vencimento"**
4. **Os erros devem ter sumido!** ✅

### Para Adicionar Dados de Teste (Opcional):

No SQL Editor, execute também: **`TESTE_ALERTAS_DADOS.sql`**

Isso criará 6 produtos com vencimentos variados automaticamente.

---

## 🔍 Verificação Rápida

Se quiser confirmar que funcionou, execute no SQL Editor:

```sql
-- Deve retornar 3 tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%alert%';

-- Deve funcionar sem erro
SELECT * FROM generate_expiry_alerts();
```

---

**Qualquer problema, me avise!** 🚀

