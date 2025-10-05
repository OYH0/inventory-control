# 🔧 Aplicar Migration - Passo a Passo

## ⚠️ IMPORTANTE: Execute na ordem exata

Execute cada bloco SQL separadamente no **SQL Editor** do Supabase.

---

## 📝 PASSO 1: Criar ENUMs

```sql
-- Criar tipos ENUM
DO $$ BEGIN
    CREATE TYPE public.alert_type AS ENUM ('near_expiry', 'expired', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.notification_method AS ENUM ('email', 'sms', 'push', 'in_app');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.alert_status AS ENUM ('pending', 'sent', 'read', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.alert_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.notification_frequency AS ENUM ('realtime', 'daily', 'weekly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
```

**✅ Verificar:** Deve retornar "Success. No rows returned"

---

## 📝 PASSO 2: Adicionar Campos nas Tabelas Existentes

```sql
-- Adicionar campos de alerta nas tabelas de itens
ALTER TABLE public.camara_fria_items 
ADD COLUMN IF NOT EXISTS alert_threshold_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS batch_number TEXT,
ADD COLUMN IF NOT EXISTS manufacturing_date DATE;

ALTER TABLE public.camara_refrigerada_items 
ADD COLUMN IF NOT EXISTS alert_threshold_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS batch_number TEXT,
ADD COLUMN IF NOT EXISTS manufacturing_date DATE;

ALTER TABLE public.estoque_seco_items 
ADD COLUMN IF NOT EXISTS alert_threshold_days INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS batch_number TEXT,
ADD COLUMN IF NOT EXISTS manufacturing_date DATE;

ALTER TABLE public.bebidas_items 
ADD COLUMN IF NOT EXISTS alert_threshold_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS batch_number TEXT,
ADD COLUMN IF NOT EXISTS manufacturing_date DATE;

ALTER TABLE public.descartaveis_items 
ADD COLUMN IF NOT EXISTS alert_threshold_days INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS batch_number TEXT,
ADD COLUMN IF NOT EXISTS manufacturing_date DATE;
```

**✅ Verificar:** Deve retornar "Success. No rows returned"

---

## 📝 PASSO 3: Criar Tabela de Alertas

```sql
-- Criar tabela de alertas
CREATE TABLE IF NOT EXISTS public.expiry_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_table TEXT NOT NULL CHECK (item_table IN (
        'camara_fria_items',
        'camara_refrigerada_items',
        'estoque_seco_items',
        'bebidas_items',
        'descartaveis_items'
    )),
    item_id UUID NOT NULL,
    item_name TEXT NOT NULL,
    item_category TEXT,
    batch_number TEXT,
    expiry_date DATE NOT NULL,
    alert_type public.alert_type NOT NULL,
    days_until_expiry INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    estimated_value DECIMAL(10,2),
    notification_method public.notification_method NOT NULL DEFAULT 'in_app',
    recipient_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.alert_status NOT NULL DEFAULT 'pending',
    priority public.alert_priority NOT NULL DEFAULT 'medium',
    location public.unidade,
    metadata JSONB DEFAULT '{}',
    alert_sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    dismissed_by UUID REFERENCES public.profiles(id),
    dismissal_reason TEXT,
    action_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_item ON public.expiry_alerts(item_table, item_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_type ON public.expiry_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_status ON public.expiry_alerts(status);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_priority ON public.expiry_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_recipient ON public.expiry_alerts(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_expiry_date ON public.expiry_alerts(expiry_date);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_location ON public.expiry_alerts(location);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_created_at ON public.expiry_alerts(created_at DESC);
```

**✅ Verificar:** Deve retornar "Success. No rows returned"

---

## 📝 PASSO 4: Criar Tabela de Configurações

```sql
-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS public.alert_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    warning_days INTEGER DEFAULT 30 CHECK (warning_days >= 0),
    critical_days INTEGER DEFAULT 7 CHECK (critical_days >= 0),
    notification_channels JSONB DEFAULT '["in_app"]',
    notification_frequency public.notification_frequency DEFAULT 'realtime',
    notification_time TIME DEFAULT '09:00:00',
    is_active BOOLEAN DEFAULT true,
    alert_for_all_locations BOOLEAN DEFAULT false,
    specific_locations public.unidade[],
    alert_categories TEXT[],
    min_value_threshold DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_alert_config_user ON public.alert_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_config_active ON public.alert_configurations(is_active);
```

**✅ Verificar:** Deve retornar "Success. No rows returned"

---

## 📝 PASSO 5: Criar Tabela de Histórico

```sql
-- Criar tabela de histórico de alertas
CREATE TABLE IF NOT EXISTS public.alert_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_id UUID REFERENCES public.expiry_alerts(id) ON DELETE CASCADE,
    status_change public.alert_status NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_history_alert ON public.alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_created ON public.alert_history(created_at DESC);
```

**✅ Verificar:** Deve retornar "Success. No rows returned"

---

## 📝 PASSO 6: Criar Funções SQL

```sql
-- Função para calcular dias até vencimento
CREATE OR REPLACE FUNCTION public.calculate_days_until_expiry(expiry_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(DAY FROM (expiry_date - CURRENT_DATE));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para determinar prioridade
CREATE OR REPLACE FUNCTION public.determine_alert_priority(days_until_expiry INTEGER)
RETURNS public.alert_priority AS $$
BEGIN
    IF days_until_expiry < 0 THEN
        RETURN 'critical'::public.alert_priority;
    ELSIF days_until_expiry <= 7 THEN
        RETURN 'critical'::public.alert_priority;
    ELSIF days_until_expiry <= 15 THEN
        RETURN 'high'::public.alert_priority;
    ELSIF days_until_expiry <= 30 THEN
        RETURN 'medium'::public.alert_priority;
    ELSE
        RETURN 'low'::public.alert_priority;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para determinar tipo de alerta
CREATE OR REPLACE FUNCTION public.determine_alert_type(days_until_expiry INTEGER)
RETURNS public.alert_type AS $$
BEGIN
    IF days_until_expiry < 0 THEN
        RETURN 'expired'::public.alert_type;
    ELSIF days_until_expiry <= 7 THEN
        RETURN 'critical'::public.alert_type;
    ELSE
        RETURN 'near_expiry'::public.alert_type;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**✅ Verificar:** Deve retornar "Success. No rows returned"

---

## 📝 PASSO 7: Criar Função Principal (generate_expiry_alerts)

⚠️ **ATENÇÃO:** Esta é a função mais importante!

```sql
CREATE OR REPLACE FUNCTION public.generate_expiry_alerts()
RETURNS TABLE(
    alerts_generated INTEGER,
    critical_count INTEGER,
    expired_count INTEGER
) AS $$
DECLARE
    v_alerts_generated INTEGER := 0;
    v_critical_count INTEGER := 0;
    v_expired_count INTEGER := 0;
    v_item RECORD;
    v_alert_exists BOOLEAN;
    v_days_until_expiry INTEGER;
    v_alert_type public.alert_type;
    v_priority public.alert_priority;
BEGIN
    -- Process Bebidas items
    FOR v_item IN 
        SELECT 
            'bebidas_items' as table_name,
            id,
            nome,
            categoria,
            batch_number,
            data_validade,
            quantidade,
            preco_unitario,
            unidade_item as unidade,
            alert_threshold_days,
            user_id
        FROM public.bebidas_items
        WHERE data_validade IS NOT NULL
            AND quantidade > 0
            AND data_validade <= CURRENT_DATE + INTERVAL '90 days'
    LOOP
        v_days_until_expiry := public.calculate_days_until_expiry(v_item.data_validade);
        
        IF v_days_until_expiry <= COALESCE(v_item.alert_threshold_days, 30) THEN
            SELECT EXISTS(
                SELECT 1 FROM public.expiry_alerts
                WHERE item_table = v_item.table_name
                    AND item_id = v_item.id
                    AND DATE(created_at) = CURRENT_DATE
                    AND status != 'dismissed'
            ) INTO v_alert_exists;
            
            IF NOT v_alert_exists THEN
                v_alert_type := public.determine_alert_type(v_days_until_expiry);
                v_priority := public.determine_alert_priority(v_days_until_expiry);
                
                INSERT INTO public.expiry_alerts (
                    item_table,
                    item_id,
                    item_name,
                    item_category,
                    batch_number,
                    expiry_date,
                    alert_type,
                    days_until_expiry,
                    quantity,
                    estimated_value,
                    priority,
                    location,
                    recipient_user_id,
                    metadata
                ) VALUES (
                    v_item.table_name,
                    v_item.id,
                    v_item.nome,
                    v_item.categoria,
                    v_item.batch_number,
                    v_item.data_validade,
                    v_alert_type,
                    v_days_until_expiry,
                    v_item.quantidade,
                    v_item.quantidade * COALESCE(v_item.preco_unitario, 0),
                    v_priority,
                    v_item.unidade::public.unidade,
                    v_item.user_id,
                    jsonb_build_object(
                        'generated_at', now(),
                        'source', 'automatic_scan'
                    )
                );
                
                v_alerts_generated := v_alerts_generated + 1;
                
                IF v_alert_type = 'critical' THEN
                    v_critical_count := v_critical_count + 1;
                ELSIF v_alert_type = 'expired' THEN
                    v_expired_count := v_expired_count + 1;
                END IF;
            END IF;
        END IF;
    END LOOP;
    
    -- Process Camara Fria items
    FOR v_item IN 
        SELECT 
            'camara_fria_items' as table_name,
            id,
            nome,
            categoria,
            batch_number,
            data_validade,
            quantidade,
            preco_unitario,
            unidade,
            alert_threshold_days,
            user_id
        FROM public.camara_fria_items
        WHERE data_validade IS NOT NULL
            AND quantidade > 0
            AND data_validade <= CURRENT_DATE + INTERVAL '90 days'
    LOOP
        v_days_until_expiry := public.calculate_days_until_expiry(v_item.data_validade);
        
        IF v_days_until_expiry <= COALESCE(v_item.alert_threshold_days, 30) THEN
            SELECT EXISTS(
                SELECT 1 FROM public.expiry_alerts
                WHERE item_table = v_item.table_name
                    AND item_id = v_item.id
                    AND DATE(created_at) = CURRENT_DATE
                    AND status != 'dismissed'
            ) INTO v_alert_exists;
            
            IF NOT v_alert_exists THEN
                v_alert_type := public.determine_alert_type(v_days_until_expiry);
                v_priority := public.determine_alert_priority(v_days_until_expiry);
                
                INSERT INTO public.expiry_alerts (
                    item_table,
                    item_id,
                    item_name,
                    item_category,
                    batch_number,
                    expiry_date,
                    alert_type,
                    days_until_expiry,
                    quantity,
                    estimated_value,
                    priority,
                    location,
                    recipient_user_id,
                    metadata
                ) VALUES (
                    v_item.table_name,
                    v_item.id,
                    v_item.nome,
                    v_item.categoria,
                    v_item.batch_number,
                    v_item.data_validade,
                    v_alert_type,
                    v_days_until_expiry,
                    v_item.quantidade,
                    v_item.quantidade * COALESCE(v_item.preco_unitario, 0),
                    v_priority,
                    v_item.unidade,
                    v_item.user_id,
                    jsonb_build_object(
                        'generated_at', now(),
                        'source', 'automatic_scan'
                    )
                );
                
                v_alerts_generated := v_alerts_generated + 1;
                
                IF v_alert_type = 'critical' THEN
                    v_critical_count := v_critical_count + 1;
                ELSIF v_alert_type = 'expired' THEN
                    v_expired_count := v_expired_count + 1;
                END IF;
            END IF;
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT v_alerts_generated, v_critical_count, v_expired_count;
END;
$$ LANGUAGE plpgsql;
```

**✅ Verificar:** Deve retornar "Success. No rows returned"

---

## 📝 PASSO 8: Criar View de Dashboard

```sql
-- Criar view para estatísticas
CREATE OR REPLACE VIEW public.expiry_alerts_dashboard AS
SELECT
    COUNT(*) FILTER (WHERE status != 'dismissed') as total_active_alerts,
    COUNT(*) FILTER (WHERE priority = 'critical' AND status != 'dismissed') as critical_alerts,
    COUNT(*) FILTER (WHERE priority = 'high' AND status != 'dismissed') as high_alerts,
    COUNT(*) FILTER (WHERE alert_type = 'expired' AND status != 'dismissed') as expired_items,
    SUM(estimated_value) FILTER (WHERE status != 'dismissed') as total_value_at_risk,
    SUM(estimated_value) FILTER (WHERE priority = 'critical' AND status != 'dismissed') as critical_value_at_risk,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_notifications,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as alerts_today
FROM public.expiry_alerts;
```

**✅ Verificar:** Deve retornar "Success. No rows returned"

---

## 📝 PASSO 9: Habilitar RLS

```sql
-- Habilitar Row Level Security
ALTER TABLE public.expiry_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- Políticas para expiry_alerts
DROP POLICY IF EXISTS "Users can view own alerts" ON public.expiry_alerts;
CREATE POLICY "Users can view own alerts"
    ON public.expiry_alerts FOR SELECT
    USING (
        auth.uid() = recipient_user_id OR
        auth.uid() IN (SELECT id FROM public.profiles WHERE user_type = 'admin')
    );

DROP POLICY IF EXISTS "Users can update own alerts" ON public.expiry_alerts;
CREATE POLICY "Users can update own alerts"
    ON public.expiry_alerts FOR UPDATE
    USING (auth.uid() = recipient_user_id);

DROP POLICY IF EXISTS "System can insert alerts" ON public.expiry_alerts;
CREATE POLICY "System can insert alerts"
    ON public.expiry_alerts FOR INSERT
    WITH CHECK (true);

-- Políticas para alert_configurations
DROP POLICY IF EXISTS "Users can manage own config" ON public.alert_configurations;
CREATE POLICY "Users can manage own config"
    ON public.alert_configurations FOR ALL
    USING (auth.uid() = user_id);

-- Políticas para alert_history
DROP POLICY IF EXISTS "Users can view alert history" ON public.alert_history;
CREATE POLICY "Users can view alert history"
    ON public.alert_history FOR SELECT
    USING (
        alert_id IN (
            SELECT id FROM public.expiry_alerts 
            WHERE recipient_user_id = auth.uid()
        )
    );
```

**✅ Verificar:** Deve retornar "Success. No rows returned"

---

## 📝 PASSO 10: Testar a Instalação

```sql
-- Teste 1: Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%alert%';

-- Deve retornar:
-- expiry_alerts
-- alert_configurations
-- alert_history

-- Teste 2: Testar função
SELECT * FROM generate_expiry_alerts();

-- Deve retornar algo como:
-- alerts_generated | critical_count | expired_count
-- 0                | 0              | 0

-- Teste 3: Ver estatísticas
SELECT * FROM expiry_alerts_dashboard;

-- Deve retornar uma linha com estatísticas zeradas
```

---

## ✅ PRONTO!

Se todos os passos retornaram "Success", a migration está completa!

**Próximo passo:** Adicione produtos com data de validade ou execute `TESTE_ALERTAS_DADOS.sql`

