# 🔔 Sistema de Alertas de Vencimento Automáticos

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Instalação e Configuração](#instalação-e-configuração)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [API e Serviços](#api-e-serviços)
6. [Componentes Frontend](#componentes-frontend)
7. [Automação e Cron Jobs](#automação-e-cron-jobs)
8. [Testes](#testes)
9. [Troubleshooting](#troubleshooting)
10. [Roadmap](#roadmap)

---

## 🎯 Visão Geral

O Sistema de Alertas de Vencimento é uma solução completa e automatizada para monitoramento proativo de produtos próximos da data de vencimento no sistema de controle de inventário.

### **Principais Características**

✅ **Monitoramento Automático**: Verifica continuamente todos os produtos em estoque  
✅ **Alertas Multi-Nível**: Crítico, Alto, Médio e Baixo baseado em dias até vencimento  
✅ **Notificações em Tempo Real**: Via WebSocket/Polling com badges visuais  
✅ **Dashboard Interativo**: Visualização completa com estatísticas e timeline  
✅ **Configurações Personalizáveis**: Cada usuário define seus próprios thresholds  
✅ **Histórico de Auditoria**: Todas as ações são registradas para compliance  
✅ **Multi-localização**: Suporta múltiplas unidades/depósitos  
✅ **Valor em Risco**: Calcula automaticamente o impacto financeiro  

---

## 🏗️ Arquitetura

### **Stack Tecnológico**

- **Backend**: Supabase (PostgreSQL + Functions)
- **Frontend**: React + TypeScript + TanStack Query
- **Notificações**: Real-time via Supabase Realtime
- **Agendamento**: Supabase Edge Functions (planejado)
- **Cache**: TanStack Query com staleTime de 30s

### **Fluxo de Dados**

```
┌─────────────────────────────────────────────────────────────┐
│                    Cron Job / Manual Trigger                 │
│                   (Verifica produtos vencendo)               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Função: generate_expiry_alerts()                │
│  • Escaneia todas as tabelas de inventário                  │
│  • Calcula dias até vencimento                              │
│  • Determina prioridade e tipo de alerta                    │
│  • Evita duplicação (verifica alertas existentes)           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Insere em expiry_alerts                     │
│  • Trigger registra em audit_log                            │
│  • Realtime notifica clientes conectados                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Frontend React App                        │
│  • useExpiryAlerts hook recebe update em tempo real         │
│  • Toast notification para alertas críticos                 │
│  • Badge atualiza contador automaticamente                  │
│  • Dashboard refresh automático                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Instalação e Configuração

### **1. Executar Migration no Supabase**

```bash
# Aplicar a migration principal
cd inventory-control
supabase migration up 20250104000000_expiry_alerts_system
```

### **2. Verificar Instalação**

Execute no SQL Editor do Supabase:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%alert%';

-- Deve retornar:
-- expiry_alerts
-- alert_configurations
-- alert_history
-- expiry_alerts_dashboard (view)
```

### **3. Configurar Agendamento (Edge Function)**

**Arquivo**: `supabase/functions/check-expiry-alerts/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Call the expiry check function
    const { data, error } = await supabase.rpc('generate_expiry_alerts')
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        ...data[0] 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

**Deploy Edge Function:**

```bash
supabase functions deploy check-expiry-alerts
```

**Agendar com Supabase Cron (pg_cron):**

```sql
-- Executar a cada hora
SELECT cron.schedule(
    'check-expiry-alerts-hourly',
    '0 * * * *',  -- Every hour at minute 0
    $$
    SELECT net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-expiry-alerts',
        headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    );
    $$
);
```

### **4. Variáveis de Ambiente**

Adicione ao `.env`:

```env
# Expiry Alerts Configuration
VITE_ALERT_REFRESH_INTERVAL=60000  # 1 minute
VITE_ENABLE_REALTIME_ALERTS=true
VITE_ALERT_SOUND_ENABLED=false
```

---

## 🗄️ Estrutura do Banco de Dados

### **Tabela: expiry_alerts**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Primary key |
| item_table | TEXT | Tabela de origem do item |
| item_id | UUID | ID do item |
| item_name | TEXT | Nome do produto |
| item_category | TEXT | Categoria |
| batch_number | TEXT | Número do lote |
| expiry_date | DATE | Data de vencimento |
| alert_type | ENUM | near_expiry, expired, critical |
| days_until_expiry | INTEGER | Dias restantes |
| quantity | INTEGER | Quantidade em estoque |
| estimated_value | DECIMAL | Valor em risco (qty * preço) |
| notification_method | ENUM | email, sms, push, in_app |
| recipient_user_id | UUID | FK para profiles |
| status | ENUM | pending, sent, read, dismissed |
| priority | ENUM | low, medium, high, critical |
| location | unidade | Localização (juazeiro_norte/fortaleza) |
| metadata | JSONB | Dados adicionais |
| alert_sent_at | TIMESTAMP | Quando foi enviado |
| read_at | TIMESTAMP | Quando foi lido |
| dismissed_at | TIMESTAMP | Quando foi dispensado |
| dismissed_by | UUID | FK para profiles |
| dismissal_reason | TEXT | Motivo da dispensa |
| action_taken | TEXT | Ação tomada |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

**Índices:**
- `idx_expiry_alerts_item` (item_table, item_id)
- `idx_expiry_alerts_type` (alert_type)
- `idx_expiry_alerts_status` (status)
- `idx_expiry_alerts_priority` (priority)
- `idx_expiry_alerts_recipient` (recipient_user_id)
- `idx_expiry_alerts_expiry_date` (expiry_date)
- `idx_expiry_alerts_location` (location)

### **Tabela: alert_configurations**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Primary key |
| user_id | UUID | FK para profiles (UNIQUE) |
| warning_days | INTEGER | Dias para alerta amarelo (default: 30) |
| critical_days | INTEGER | Dias para alerta vermelho (default: 7) |
| notification_channels | JSONB | Array de canais ['in_app', 'email'] |
| notification_frequency | ENUM | realtime, daily, weekly |
| notification_time | TIME | Horário do envio (default: 09:00) |
| is_active | BOOLEAN | Se alertas estão ativos |
| alert_for_all_locations | BOOLEAN | Se monitora todas as localizações |
| specific_locations | unidade[] | Localizações específicas |
| alert_categories | TEXT[] | Categorias específicas |
| min_value_threshold | DECIMAL | Valor mínimo para alertar |

### **View: expiry_alerts_dashboard**

Agregação para estatísticas do dashboard:

```sql
SELECT
    COUNT(*) FILTER (WHERE status != 'dismissed') as total_active_alerts,
    COUNT(*) FILTER (WHERE priority = 'critical' AND status != 'dismissed') as critical_alerts,
    COUNT(*) FILTER (WHERE priority = 'high' AND status != 'dismissed') as high_alerts,
    COUNT(*) FILTER (WHERE alert_type = 'expired' AND status != 'dismissed') as expired_items,
    SUM(estimated_value) FILTER (WHERE status != 'dismissed') as total_value_at_risk,
    SUM(estimated_value) FILTER (WHERE priority = 'critical' AND status != 'dismissed') as critical_value_at_risk,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_notifications,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as alerts_today
FROM expiry_alerts;
```

---

## 🔧 API e Serviços

### **ExpiryAlertService**

**Métodos Principais:**

#### `checkExpiringProducts()`
```typescript
const result = await expiryAlertService.checkExpiringProducts();
// Returns: { alerts_generated: 15, critical_count: 3, expired_count: 1 }
```

#### `getAlerts(params)`
```typescript
const { data, total } = await expiryAlertService.getAlerts({
  status: ['pending', 'sent'],
  priority: 'critical',
  location: 'juazeiro_norte',
  page: 1,
  per_page: 50
});
```

#### `dismissAlert(id, userId, reason, action)`
```typescript
await expiryAlertService.dismissAlert(
  'alert-uuid',
  'user-uuid',
  'Produto vendido',
  'Aplicado desconto de 30%'
);
```

#### `getDashboardStats()`
```typescript
const stats = await expiryAlertService.getDashboardStats();
// Returns: AlertStats object
```

---

## 🎨 Componentes Frontend

### **Hierarquia de Componentes**

```
ExpiryAlertDashboard
├── ExpiryAlertStats (KPIs no topo)
├── ExpiryAlertFilters (Filtros de busca)
├── Tabs
│   ├── Critical Tab
│   │   └── ExpiryAlertCard (lista)
│   ├── High Tab
│   │   └── ExpiryAlertCard (lista)
│   ├── Timeline Tab
│   │   └── ExpiryAlertTimeline (calendário)
│   └── All Tab
│       └── ExpiryAlertCard (lista + pagination)
└── ExpiryAlertSettings (modal/página de config)
```

### **Hooks Disponíveis**

#### `useExpiryAlerts()`
```typescript
const {
  alerts,         // ExpiryAlert[]
  total,          // number
  isLoading,      // boolean
  page,           // number
  totalPages,     // number
  setPage,        // (page: number) => void
  markAsRead,     // (id: string) => void
  dismissAlert,   // (id, reason?, action?) => void
  generateAlerts, // () => void
  refetch         // () => void
} = useExpiryAlerts({
  status: ['pending'],
  autoRefresh: true,
  refreshInterval: 60000
});
```

#### `useAlertStats()`
```typescript
const { data: stats, isLoading } = useAlertStats();
```

#### `useAlertConfiguration()`
```typescript
const { config, updateConfig, isUpdating } = useAlertConfiguration();
```

---

## ⚙️ Automação e Cron Jobs

### **Opção 1: Supabase Edge Function + pg_cron (Recomendado)**

Já documentado na seção de Instalação.

### **Opção 2: External Cron (Node.js/Deno)**

**Script**: `scripts/check-expiry-alerts.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkExpiryAlerts() {
  console.log('[Cron] Starting expiry check...')
  
  const { data, error } = await supabase.rpc('generate_expiry_alerts')
  
  if (error) {
    console.error('[Cron] Error:', error)
    process.exit(1)
  }
  
  console.log('[Cron] Complete:', data[0])
}

checkExpiryAlerts()
```

**Crontab:**
```cron
# Every hour at minute 0
0 * * * * /usr/bin/node /path/to/scripts/check-expiry-alerts.ts >> /var/log/expiry-alerts.log 2>&1

# Daily at 9 AM
0 9 * * * /usr/bin/node /path/to/scripts/check-expiry-alerts.ts

# Weekly cleanup (Sunday 2 AM)
0 2 * * 0 /usr/bin/node /path/to/scripts/cleanup-old-alerts.ts --days=90
```

---

## 🧪 Testes

### **Setup de Teste**

```typescript
// tests/expiry-alerts.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { expiryAlertService } from '@/services/ExpiryAlertService'

describe('ExpiryAlertService', () => {
  it('should calculate days until expiry correctly', () => {
    // Test implementation
  })
  
  it('should determine correct alert priority', () => {
    // Test implementation
  })
  
  it('should not create duplicate alerts', async () => {
    // Test implementation
  })
})
```

### **Executar Testes**

```bash
npm run test
```

---

## 🔍 Troubleshooting

### **Problema: Alertas não estão sendo gerados**

**Solução:**
1. Verificar se produtos têm `data_validade` preenchida
2. Conferir se `alert_threshold_days` está configurado
3. Executar manualmente: `SELECT * FROM generate_expiry_alerts();`
4. Verificar logs: `SELECT * FROM audit_log WHERE table_name = 'expiry_alerts';`

### **Problema: Notificações não aparecem em tempo real**

**Solução:**
1. Verificar conexão WebSocket no DevTools (Network tab)
2. Confirmar que Supabase Realtime está habilitado no projeto
3. Verificar RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'expiry_alerts';`

### **Problema: Performance lenta ao carregar alertas**

**Solução:**
1. Verificar índices: `\d expiry_alerts` (psql)
2. Analisar query plan: `EXPLAIN ANALYZE SELECT * FROM expiry_alerts WHERE status != 'dismissed';`
3. Aumentar `staleTime` no useQuery para 60s

---

## 🗺️ Roadmap

### **Versão 2.0 (Q1 2025)**
- [ ] Integração com SendGrid para emails
- [ ] Notificações push via Firebase Cloud Messaging
- [ ] SMS via Twilio
- [ ] Exportação de relatórios em Excel/CSV
- [ ] Machine Learning para previsão de demanda

### **Versão 2.1 (Q2 2025)**
- [ ] Sugestões automáticas de ações (desconto, promoção)
- [ ] Integração com sistema de vendas
- [ ] API webhook para integrações externas
- [ ] Dashboard executivo com análise de tendências

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte este documento primeiro
2. Verifique logs em `audit_log` e `alert_history`
3. Abra issue no repositório com detalhes completos

---

**Versão:** 1.0.0  
**Data:** 04 de Janeiro de 2025  
**Autor:** Equipe de Desenvolvimento

