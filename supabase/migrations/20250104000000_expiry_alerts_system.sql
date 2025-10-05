-- =====================================================
-- MIGRATION: EXPIRY ALERTS SYSTEM
-- Version: 1.0.0
-- Date: 2025-01-04
-- Description: Complete expiry alert system with notifications
-- =====================================================

-- 1. CREATE ENUM TYPES
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

-- 2. ADD EXPIRY TRACKING FIELDS TO EXISTING TABLES
-- Add alert_threshold_days to all item tables if not exists
DO $$ BEGIN
    ALTER TABLE public.camara_fria_items 
    ADD COLUMN IF NOT EXISTS alert_threshold_days INTEGER DEFAULT 30,
    ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS batch_number TEXT,
    ADD COLUMN IF NOT EXISTS manufacturing_date DATE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.camara_refrigerada_items 
    ADD COLUMN IF NOT EXISTS alert_threshold_days INTEGER DEFAULT 7,
    ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS batch_number TEXT,
    ADD COLUMN IF NOT EXISTS manufacturing_date DATE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.estoque_seco_items 
    ADD COLUMN IF NOT EXISTS alert_threshold_days INTEGER DEFAULT 60,
    ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS batch_number TEXT,
    ADD COLUMN IF NOT EXISTS manufacturing_date DATE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.bebidas_items 
    ADD COLUMN IF NOT EXISTS alert_threshold_days INTEGER DEFAULT 30,
    ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS batch_number TEXT,
    ADD COLUMN IF NOT EXISTS manufacturing_date DATE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.descartaveis_items 
    ADD COLUMN IF NOT EXISTS alert_threshold_days INTEGER DEFAULT 90,
    ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS batch_number TEXT,
    ADD COLUMN IF NOT EXISTS manufacturing_date DATE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 3. CREATE EXPIRY_ALERTS TABLE
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_item ON public.expiry_alerts(item_table, item_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_type ON public.expiry_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_status ON public.expiry_alerts(status);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_priority ON public.expiry_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_recipient ON public.expiry_alerts(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_expiry_date ON public.expiry_alerts(expiry_date);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_location ON public.expiry_alerts(location);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_created_at ON public.expiry_alerts(created_at DESC);

-- 4. CREATE ALERT_CONFIGURATIONS TABLE
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

-- 5. CREATE ALERT_HISTORY TABLE (for audit trail)
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

-- 6. CREATE FUNCTION TO CALCULATE DAYS UNTIL EXPIRY
CREATE OR REPLACE FUNCTION public.calculate_days_until_expiry(expiry_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(DAY FROM (expiry_date - CURRENT_DATE));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. CREATE FUNCTION TO DETERMINE ALERT PRIORITY
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

-- 8. CREATE FUNCTION TO DETERMINE ALERT TYPE
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

-- 9. CREATE FUNCTION TO CHECK AND GENERATE ALERTS
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
        
        -- Only create alert if within threshold
        IF v_days_until_expiry <= COALESCE(v_item.alert_threshold_days, 30) THEN
            -- Check if alert already exists for this item today
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
    
    -- Repeat for other tables (Bebidas, Estoque Seco, etc.)
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
    
    RETURN QUERY SELECT v_alerts_generated, v_critical_count, v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- 10. CREATE VIEW FOR DASHBOARD STATS
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

-- 11. CREATE TRIGGER FOR AUTOMATIC ALERT HISTORY
CREATE OR REPLACE FUNCTION public.track_alert_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.alert_history (
            alert_id,
            status_change,
            changed_by,
            notes
        ) VALUES (
            NEW.id,
            NEW.status,
            NEW.dismissed_by,
            CASE 
                WHEN NEW.status = 'dismissed' THEN NEW.dismissal_reason
                ELSE NULL
            END
        );
    END IF;
    
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_alert_status_history ON public.expiry_alerts;
CREATE TRIGGER trigger_alert_status_history
    BEFORE UPDATE ON public.expiry_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.track_alert_status_change();

-- 12. CREATE RLS POLICIES
ALTER TABLE public.expiry_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view own alerts"
    ON public.expiry_alerts FOR SELECT
    USING (
        auth.uid() = recipient_user_id OR
        auth.uid() IN (SELECT id FROM public.profiles WHERE user_type = 'admin')
    );

-- Users can update their own alerts (mark as read/dismissed)
CREATE POLICY "Users can update own alerts"
    ON public.expiry_alerts FOR UPDATE
    USING (auth.uid() = recipient_user_id OR public.can_modify());

-- System can insert alerts
CREATE POLICY "System can insert alerts"
    ON public.expiry_alerts FOR INSERT
    WITH CHECK (true);

-- Users can manage their own configurations
CREATE POLICY "Users can manage own config"
    ON public.alert_configurations FOR ALL
    USING (auth.uid() = user_id);

-- Users can view alert history
CREATE POLICY "Users can view alert history"
    ON public.alert_history FOR SELECT
    USING (
        alert_id IN (
            SELECT id FROM public.expiry_alerts 
            WHERE recipient_user_id = auth.uid()
        ) OR public.is_admin()
    );

-- 13. CREATE FUNCTION TO CLEANUP OLD DISMISSED ALERTS
CREATE OR REPLACE FUNCTION public.cleanup_old_alerts(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.expiry_alerts
    WHERE status = 'dismissed'
        AND dismissed_at < CURRENT_DATE - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 14. CREATE DEFAULT ALERT CONFIGURATIONS FOR EXISTING USERS
INSERT INTO public.alert_configurations (
    user_id,
    warning_days,
    critical_days,
    notification_channels,
    notification_frequency,
    is_active
)
SELECT 
    id,
    30,
    7,
    '["in_app"]'::jsonb,
    'daily'::public.notification_frequency,
    true
FROM public.profiles
WHERE NOT EXISTS (
    SELECT 1 FROM public.alert_configurations 
    WHERE alert_configurations.user_id = profiles.id
);

-- 15. GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE ON public.expiry_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alert_configurations TO authenticated;
GRANT SELECT ON public.alert_history TO authenticated;
GRANT SELECT ON public.expiry_alerts_dashboard TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.expiry_alerts IS 'Stores expiry alerts for all inventory items';
COMMENT ON TABLE public.alert_configurations IS 'User-specific alert configuration and preferences';
COMMENT ON TABLE public.alert_history IS 'Audit trail for alert status changes';
COMMENT ON FUNCTION public.generate_expiry_alerts() IS 'Scans all items and generates expiry alerts based on thresholds';
COMMENT ON FUNCTION public.cleanup_old_alerts(INTEGER) IS 'Removes dismissed alerts older than specified days';

