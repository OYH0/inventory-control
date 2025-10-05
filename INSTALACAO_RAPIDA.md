# 🚀 Instalação Rápida - Sistema de Alertas de Vencimento

## ⚡ Aplicar Migration via Dashboard (5 minutos)

### **Passo 1: Acessar Supabase Dashboard**

1. Abra seu navegador
2. Acesse: https://supabase.com/dashboard
3. Faça login
4. Selecione seu projeto de inventário

---

### **Passo 2: Abrir SQL Editor**

1. No menu lateral esquerdo, clique em **"SQL Editor"** (ícone </> )
2. Clique em **"New Query"** (botão verde no canto superior direito)

---

### **Passo 3: Copiar e Executar Migration**

1. **Abra o arquivo da migration:**
   - Navegue para: `C:\Users\vboxuser\Downloads\inventory-control\supabase\migrations\20250104000000_expiry_alerts_system.sql`
   - Abra com qualquer editor de texto (Notepad, VSCode, etc.)

2. **Copie TODO o conteúdo do arquivo** (Ctrl+A, Ctrl+C)

3. **Cole no SQL Editor do Supabase** (Ctrl+V)

4. **Clique em "Run"** (botão verde no canto inferior direito)

5. **Aguarde a execução** (pode levar 10-30 segundos)

6. **Verifique se apareceu:** `Success. No rows returned`

---

### **Passo 4: Verificar Instalação**

Execute no SQL Editor (New Query):

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%alert%';
```

**Resultado esperado:**

| table_name |
|------------|
| expiry_alerts |
| alert_configurations |
| alert_history |

✅ **Se ver essas 3 tabelas, está funcionando!**

---

### **Passo 5: Gerar Alertas Iniciais**

Execute no SQL Editor:

```sql
-- Gerar alertas para produtos existentes
SELECT * FROM generate_expiry_alerts();
```

**Resultado esperado:**

| alerts_generated | critical_count | expired_count |
|------------------|----------------|---------------|
| 5 | 1 | 0 |

*(Números variam conforme seus produtos)*

---

### **Passo 6: Testar no Frontend**

1. **Iniciar aplicação:**
   ```
   npm run dev
   ```

2. **Abrir navegador:**
   ```
   http://localhost:5173
   ```

3. **Fazer login**

4. **Clicar no menu "Alertas de Vencimento"** (ícone de sino 🔔)

5. **Você deve ver:**
   - Dashboard com estatísticas
   - Cards de alertas (se houver produtos vencendo)
   - Botão "Verificar Agora"

---

## 🎉 Pronto!

Seu sistema de alertas está funcionando!

---

## ❌ Troubleshooting

### **Erro: "relation does not exist"**

**Causa:** Migration não foi aplicada corretamente.

**Solução:**
1. Limpar possíveis migrations parciais:
   ```sql
   DROP TABLE IF EXISTS expiry_alerts CASCADE;
   DROP TABLE IF EXISTS alert_configurations CASCADE;
   DROP TABLE IF EXISTS alert_history CASCADE;
   DROP VIEW IF EXISTS expiry_alerts_dashboard CASCADE;
   ```

2. Copiar e executar a migration novamente

---

### **Erro: "permission denied"**

**Causa:** RLS policies não foram criadas.

**Solução:**
1. Verificar se você está logado como admin no Supabase
2. Re-executar apenas a seção de RLS policies da migration

---

### **Nenhum alerta aparece no dashboard**

**Causa:** Produtos não têm `data_validade` preenchida.

**Solução:**
1. Adicionar datas de validade nos produtos:
   ```sql
   -- Exemplo: atualizar um produto para vencer em 5 dias
   UPDATE camara_fria_items 
   SET data_validade = CURRENT_DATE + 5
   WHERE id = 'seu-id-aqui';
   ```

2. Executar novamente:
   ```sql
   SELECT * FROM generate_expiry_alerts();
   ```

---

## 📞 Próximos Passos

1. ✅ **Configurar alertas personalizados**
   - No dashboard, clique em "Configurações"
   - Ajuste os dias de aviso (warning_days) e crítico (critical_days)

2. ✅ **Configurar automação** (opcional)
   - Ver: `docs/QUICK_START_EXPIRY_ALERTS.md`
   - Seção: "Configuração de Automação"

3. ✅ **Explorar funcionalidades**
   - Timeline de vencimentos
   - Filtros por localização/prioridade
   - Dispensar alertas com motivo

---

## 🆘 Precisa de Ajuda?

Consulte a documentação completa em:
- `docs/EXPIRY_ALERTS_SYSTEM.md` - Documentação técnica
- `docs/QUICK_START_EXPIRY_ALERTS.md` - Guia rápido de uso

---

**Boa gestão de estoque!** 🚀

