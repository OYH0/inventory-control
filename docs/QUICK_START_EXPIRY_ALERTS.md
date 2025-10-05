# 🚀 Guia Rápido - Sistema de Alertas de Vencimento

## ⚡ Início Rápido (5 minutos)

### **1. Aplicar Migration**

```bash
cd inventory-control
supabase migration up 20250104000000_expiry_alerts_system
```

### **2. Verificar Instalação**

No SQL Editor do Supabase:

```sql
SELECT * FROM expiry_alerts_dashboard;
```

Se retornar dados (mesmo que zerados), está funcionando! ✅

### **3. Gerar Alertas Manualmente**

No SQL Editor:

```sql
SELECT * FROM generate_expiry_alerts();
```

Deve retornar algo como:

```
alerts_generated | critical_count | expired_count
----------------+----------------+--------------
       15       |       3        |      1
```

### **4. Acessar Dashboard**

1. Abra o app: `http://localhost:5173`
2. Faça login
3. Clique em **"Alertas de Vencimento"** na sidebar (ícone de sino 🔔)

---

## 📋 Cenários de Uso Comum

### **Cenário 1: Configurar Alertas Personalizados**

1. Acesse **Alertas de Vencimento**
2. Clique em **"Configurações"** (canto superior direito)
3. Ajuste:
   - **Alerta de Aviso**: 30 dias (padrão)
   - **Alerta Crítico**: 7 dias (padrão)
4. Clique em **"Salvar Configurações"**

### **Cenário 2: Dispensar um Alerta**

1. Localize o alerta na lista
2. Clique no **X** no canto do card
3. Preencha:
   - **Motivo**: "Produto foi vendido"
   - **Ação Tomada**: "Aplicado desconto de 30%"
4. Clique em **"Confirmar"**

O alerta será marcado como dispensado e removido da visualização ativa.

### **Cenário 3: Ver Timeline de Vencimentos**

1. Acesse **Alertas de Vencimento**
2. Clique na aba **"Timeline"**
3. Visualize produtos vencendo por data
4. Produtos com vencimento hoje aparecem destacados em azul
5. Produtos vencidos aparecem em vermelho

### **Cenário 4: Filtrar Alertas**

Use os filtros disponíveis:

- **Localização**: Juazeiro do Norte / Fortaleza / Todas
- **Prioridade**: Crítico / Alto / Médio / Baixo / Todas
- **Status**: Pendente / Enviado / Lido / Dispensado / Todos

### **Cenário 5: Forçar Verificação Manual**

Clique no botão **"Verificar Agora"** (ícone de refresh) no topo do dashboard.

Isso força uma nova varredura de todos os produtos imediatamente.

---

## 🎯 Interpretando Prioridades

| Prioridade | Dias até Vencimento | Cor | Ação Recomendada |
|------------|---------------------|-----|------------------|
| **Crítico** | 0-7 dias | 🔴 Vermelho | Ação imediata: desconto, doação ou descarte |
| **Alto** | 8-15 dias | 🟠 Laranja | Planejar promoção ou transferência |
| **Médio** | 16-30 dias | 🟡 Amarelo | Monitorar vendas |
| **Baixo** | 31+ dias | ⚪ Branco | Sem ação necessária |

---

## 📊 Estatísticas do Dashboard

### **Card 1: Alertas Críticos**
Produtos que **requerem ação imediata** (vencendo em até 7 dias).

### **Card 2: Alta Prioridade**
Produtos que precisam de **monitoramento próximo** (8-15 dias).

### **Card 3: Valor em Risco**
Total estimado em R$ de produtos que podem vencer.  
**Cálculo**: `quantidade × preço_unitário`

### **Card 4: Alertas Hoje**
Novos alertas gerados nas **últimas 24 horas**.

---

## 🔔 Notificações em Tempo Real

O sistema monitora novos alertas automaticamente:

- **Alertas Críticos**: Toast vermelho aparece automaticamente
- **Badge no Menu**: Atualiza o contador em tempo real
- **Refresh Automático**: Dashboard atualiza a cada 1 minuto

---

## ⚙️ Configuração de Automação

### **Opção 1: Supabase Edge Function (Recomendado)**

**Criar função:**

```bash
supabase functions new check-expiry-alerts
```

**Arquivo**: `supabase/functions/check-expiry-alerts/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data, error } = await supabase.rpc('generate_expiry_alerts')
  
  if (error) throw error
  
  return new Response(JSON.stringify({ success: true, ...data[0] }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Deploy:**

```bash
supabase functions deploy check-expiry-alerts
```

**Agendar (SQL):**

```sql
SELECT cron.schedule(
    'check-expiry-alerts-hourly',
    '0 * * * *',
    $$
    SELECT net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-expiry-alerts',
        headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    );
    $$
);
```

### **Opção 2: Cron Externo (Servidor)**

**Script Node.js**: `scripts/check-alerts.js`

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAlerts() {
  const { data, error } = await supabase.rpc('generate_expiry_alerts')
  if (error) throw error
  console.log('Alertas gerados:', data[0])
}

checkAlerts()
```

**Crontab:**

```bash
# A cada hora
0 * * * * /usr/bin/node /path/to/scripts/check-alerts.js
```

---

## 🐛 Troubleshooting Rápido

### **"Nenhum alerta encontrado"**

**Verificar:**
1. Produtos têm `data_validade` preenchida?
2. `alert_threshold_days` está configurado nas tabelas?
3. Executar: `SELECT * FROM generate_expiry_alerts();`

### **"Alertas não atualizam em tempo real"**

**Verificar:**
1. Realtime está habilitado no Supabase? (Settings → API → Realtime)
2. RLS policies estão corretas? Ver documentação completa

### **"Muitos alertas duplicados"**

**Limpar:**

```sql
-- Remover alertas antigos (dispensados há mais de 90 dias)
SELECT cleanup_old_alerts(90);

-- OU apagar tudo e recomeçar
DELETE FROM expiry_alerts;
SELECT * FROM generate_expiry_alerts();
```

---

## 📞 Próximos Passos

1. ✅ **Configurar seus thresholds personalizados**
2. ✅ **Configurar automação (cron)**
3. ✅ **Testar fluxo de dispensa de alertas**
4. ✅ **Explorar timeline e filtros**
5. 📚 **Ler documentação completa**: `docs/EXPIRY_ALERTS_SYSTEM.md`

---

## 🎉 Pronto!

Seu sistema de alertas de vencimento está funcionando.

Para dúvidas ou problemas, consulte a documentação completa ou abra um issue.

**Bom controle de estoque!** 🚀

