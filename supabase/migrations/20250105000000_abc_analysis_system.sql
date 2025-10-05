-- =====================================================
-- MIGRATION: Sistema de Análise ABC de Inventário
-- Data: 05/10/2025
-- Descrição: Implementação completa do sistema ABC
-- Baseado no Princípio de Pareto (80/20)
-- =====================================================

-- ============================================
-- PARTE 1: ENUM TYPES
-- ============================================

-- Categoria ABC
DO $$ BEGIN
    CREATE TYPE public.abc_category_enum AS ENUM ('A', 'B', 'C');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Frequência de classificação
DO $$ BEGIN
    CREATE TYPE public.classification_frequency_enum AS ENUM ('daily', 'weekly', 'monthly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PARTE 2: CONFIGURAÇÕES ABC
-- ============================================

CREATE TABLE IF NOT EXISTS public.abc_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Thresholds de classificação (% valor acumulado)
    category_a_threshold DECIMAL(5,2) DEFAULT 80.00 CHECK (category_a_threshold > 0 AND category_a_threshold < 100),
    category_b_threshold DECIMAL(5,2) DEFAULT 95.00 CHECK (category_b_threshold > category_a_threshold AND category_b_threshold < 100),
    
    -- Configurações de análise
    analysis_period_months INTEGER DEFAULT 12 CHECK (analysis_period_months > 0 AND analysis_period_months <= 36),
    auto_classify BOOLEAN DEFAULT true NOT NULL,
    classification_frequency classification_frequency_enum DEFAULT 'monthly' NOT NULL,
    include_zero_demand BOOLEAN DEFAULT false NOT NULL,
    
    -- Custos padrões
    default_carrying_cost_percentage DECIMAL(5,2) DEFAULT 25.00 CHECK (default_carrying_cost_percentage >= 0),
    default_ordering_cost DECIMAL(8,2) DEFAULT 100.00 CHECK (default_ordering_cost >= 0),
    
    -- Configurações de segurança de estoque (Safety Stock %)
    safety_stock_a_percentage DECIMAL(5,2) DEFAULT 25.00,
    safety_stock_b_percentage DECIMAL(5,2) DEFAULT 15.00,
    safety_stock_c_percentage DECIMAL(5,2) DEFAULT 5.00,
    
    -- Configurações de revisão (dias)
    review_interval_a_days INTEGER DEFAULT 7,
    review_interval_b_days INTEGER DEFAULT 30,
    review_interval_c_days INTEGER DEFAULT 90,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Constraint: Uma configuração por organização
    UNIQUE(organization_id)
);

CREATE INDEX idx_abc_config_org ON public.abc_configurations(organization_id);

COMMENT ON TABLE public.abc_configurations IS 'Configurações de Análise ABC por organização';
COMMENT ON COLUMN public.abc_configurations.category_a_threshold IS 'Threshold Categoria A (padrão 80% do valor)';
COMMENT ON COLUMN public.abc_configurations.category_b_threshold IS 'Threshold Categoria B (padrão 95% do valor)';

-- ============================================
-- PARTE 3: ADICIONAR CAMPOS ABC ÀS TABELAS DE ITENS
-- ============================================

-- Função para adicionar colunas ABC a uma tabela
CREATE OR REPLACE FUNCTION add_abc_columns_to_table(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Custo unitário
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) DEFAULT 0.00 CHECK (unit_cost >= 0)
    ', table_name);
    
    -- Demanda anual (quantidade)
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS annual_demand INTEGER DEFAULT 0 CHECK (annual_demand >= 0)
    ', table_name);
    
    -- Valor de consumo anual (unit_cost × annual_demand)
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS annual_consumption_value DECIMAL(12,2) DEFAULT 0.00 CHECK (annual_consumption_value >= 0)
    ', table_name);
    
    -- Categoria ABC
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS abc_category abc_category_enum
    ', table_name);
    
    -- Data da última classificação
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS abc_classification_date TIMESTAMP WITH TIME ZONE
    ', table_name);
    
    -- Percentual de custo de manutenção
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS carrying_cost_percentage DECIMAL(5,2) DEFAULT 25.00 CHECK (carrying_cost_percentage >= 0)
    ', table_name);
    
    -- Custo de pedido
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS ordering_cost DECIMAL(8,2) DEFAULT 100.00 CHECK (ordering_cost >= 0)
    ', table_name);
    
    -- Lead time em dias
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 7 CHECK (lead_time_days >= 0)
    ', table_name);
    
    -- EOQ (Economic Order Quantity) calculado
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS eoq DECIMAL(10,2)
    ', table_name);
    
    -- Ponto de reordenamento
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS reorder_point DECIMAL(10,2)
    ', table_name);
    
    -- Safety stock
    EXECUTE format('
        ALTER TABLE public.%I 
        ADD COLUMN IF NOT EXISTS safety_stock DECIMAL(10,2)
    ', table_name);
    
    -- Criar índices
    EXECUTE format('
        CREATE INDEX IF NOT EXISTS idx_%I_abc_category ON public.%I(abc_category) WHERE abc_category IS NOT NULL
    ', table_name, table_name);
    
    EXECUTE format('
        CREATE INDEX IF NOT EXISTS idx_%I_annual_value ON public.%I(annual_consumption_value DESC) WHERE annual_consumption_value > 0
    ', table_name, table_name);
    
    EXECUTE format('
        CREATE INDEX IF NOT EXISTS idx_%I_abc_composite ON public.%I(organization_id, abc_category, annual_consumption_value DESC)
    ', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Aplicar aos itens de todas as tabelas
DO $$
DECLARE
    v_tables TEXT[] := ARRAY[
        'camara_fria_items',
        'camara_refrigerada_items',
        'estoque_seco_items',
        'bebidas_items',
        'descartaveis_items'
    ];
    v_table TEXT;
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        PERFORM add_abc_columns_to_table(v_table);
        RAISE NOTICE 'Colunas ABC adicionadas a: %', v_table;
    END LOOP;
END $$;

-- ============================================
-- PARTE 4: HISTÓRICO DE ANÁLISES ABC
-- ============================================

CREATE TABLE IF NOT EXISTS public.abc_analysis_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Informações da análise
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    table_name TEXT NOT NULL,
    
    -- Contagens por categoria
    total_products_analyzed INTEGER NOT NULL CHECK (total_products_analyzed >= 0),
    category_a_count INTEGER NOT NULL CHECK (category_a_count >= 0),
    category_b_count INTEGER NOT NULL CHECK (category_b_count >= 0),
    category_c_count INTEGER NOT NULL CHECK (category_c_count >= 0),
    
    -- Valores por categoria
    category_a_value DECIMAL(15,2) NOT NULL CHECK (category_a_value >= 0),
    category_b_value DECIMAL(15,2) NOT NULL CHECK (category_b_value >= 0),
    category_c_value DECIMAL(15,2) NOT NULL CHECK (category_c_value >= 0),
    total_inventory_value DECIMAL(15,2) NOT NULL CHECK (total_inventory_value >= 0),
    
    -- Percentuais calculados
    category_a_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_inventory_value > 0 THEN (category_a_value / total_inventory_value * 100)
            ELSE 0
        END
    ) STORED,
    category_b_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_inventory_value > 0 THEN (category_b_value / total_inventory_value * 100)
            ELSE 0
        END
    ) STORED,
    category_c_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_inventory_value > 0 THEN (category_c_value / total_inventory_value * 100)
            ELSE 0
        END
    ) STORED,
    
    -- Eficiência de Pareto (quão próximo do 80/20 ideal)
    pareto_efficiency DECIMAL(5,2),
    
    -- Parâmetros usados na análise
    parameters JSONB NOT NULL,
    
    -- Performance
    execution_time_ms INTEGER,
    products_processed_per_second DECIMAL(10,2),
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_abc_history_org_date ON public.abc_analysis_history(organization_id, analysis_date DESC);
CREATE INDEX idx_abc_history_table ON public.abc_analysis_history(table_name, analysis_date DESC);
CREATE INDEX idx_abc_history_status ON public.abc_analysis_history(status) WHERE status != 'completed';

COMMENT ON TABLE public.abc_analysis_history IS 'Histórico de execuções de análises ABC';

-- ============================================
-- PARTE 5: MUDANÇAS DE CATEGORIA ABC
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_abc_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Referência ao produto (genérica para todas as tabelas)
    product_id UUID NOT NULL,
    product_table TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    
    -- Mudança de categoria
    previous_category abc_category_enum,
    new_category abc_category_enum NOT NULL,
    
    -- Valores
    previous_value DECIMAL(12,2),
    new_value DECIMAL(12,2) NOT NULL,
    value_change_percentage DECIMAL(8,2),
    
    -- Análise da mudança
    change_reason TEXT,
    trend_direction TEXT CHECK (trend_direction IN ('upgrade', 'downgrade', 'new', 'unchanged')),
    
    -- Metadata
    analysis_id UUID REFERENCES public.abc_analysis_history(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Flags
    is_significant BOOLEAN DEFAULT false, -- Mudança > 20%
    requires_action BOOLEAN DEFAULT false
);

CREATE INDEX idx_abc_changes_org ON public.product_abc_changes(organization_id, changed_at DESC);
CREATE INDEX idx_abc_changes_product ON public.product_abc_changes(product_table, product_id, changed_at DESC);
CREATE INDEX idx_abc_changes_trend ON public.product_abc_changes(trend_direction) WHERE trend_direction IN ('upgrade', 'downgrade');
CREATE INDEX idx_abc_changes_significant ON public.product_abc_changes(is_significant) WHERE is_significant = true;

COMMENT ON TABLE public.product_abc_changes IS 'Registro de mudanças de categoria ABC dos produtos';

-- ============================================
-- PARTE 6: FUNÇÕES DE CÁLCULO ABC
-- ============================================

-- 6.1 Calcular valor de consumo anual
CREATE OR REPLACE FUNCTION calculate_annual_consumption_value(
    p_table_name TEXT,
    p_organization_id UUID,
    p_period_months INTEGER DEFAULT 12
)
RETURNS TABLE (
    product_id UUID,
    annual_demand INTEGER,
    annual_value DECIMAL(12,2)
) AS $$
BEGIN
    -- Esta função será expandida conforme histórico de movimentações
    -- Por ora, retorna dados atuais
    RETURN QUERY EXECUTE format('
        SELECT 
            id as product_id,
            COALESCE(annual_demand, 0) as annual_demand,
            COALESCE(annual_demand * unit_cost, 0) as annual_value
        FROM public.%I
        WHERE organization_id = $1
          AND (unit_cost > 0 OR annual_demand > 0)
    ', p_table_name)
    USING p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.2 Calcular EOQ (Economic Order Quantity)
CREATE OR REPLACE FUNCTION calculate_eoq(
    p_annual_demand INTEGER,
    p_ordering_cost DECIMAL(8,2),
    p_unit_cost DECIMAL(10,2),
    p_carrying_cost_percentage DECIMAL(5,2)
)
RETURNS TABLE (
    eoq DECIMAL(10,2),
    orders_per_year DECIMAL(8,2),
    time_between_orders_days INTEGER,
    total_annual_cost DECIMAL(12,2)
) AS $$
DECLARE
    v_eoq DECIMAL(10,2);
    v_carrying_cost DECIMAL(10,2);
BEGIN
    -- Evitar divisão por zero
    IF p_unit_cost = 0 OR p_carrying_cost_percentage = 0 OR p_annual_demand = 0 THEN
        RETURN QUERY SELECT 0::DECIMAL(10,2), 0::DECIMAL(8,2), 0::INTEGER, 0::DECIMAL(12,2);
        RETURN;
    END IF;
    
    -- Custo de manutenção anual por unidade
    v_carrying_cost := p_unit_cost * (p_carrying_cost_percentage / 100);
    
    -- Fórmula EOQ: √((2 × D × S) / H)
    -- D = annual demand, S = ordering cost, H = holding cost per unit
    v_eoq := SQRT((2.0 * p_annual_demand * p_ordering_cost) / v_carrying_cost);
    
    RETURN QUERY SELECT 
        ROUND(v_eoq, 2) as eoq,
        ROUND(p_annual_demand / NULLIF(v_eoq, 0), 2) as orders_per_year,
        ROUND(365.0 / NULLIF(p_annual_demand / NULLIF(v_eoq, 0), 0))::INTEGER as time_between_orders_days,
        ROUND(
            (p_annual_demand / NULLIF(v_eoq, 0) * p_ordering_cost) +
            (v_eoq / 2 * v_carrying_cost)
        , 2) as total_annual_cost;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_eoq IS 'Calcula Lote Econômico de Compra (Economic Order Quantity)';

-- 6.3 Calcular ponto de reordenamento
CREATE OR REPLACE FUNCTION calculate_reorder_point(
    p_annual_demand INTEGER,
    p_lead_time_days INTEGER,
    p_safety_stock DECIMAL(10,2)
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_daily_demand DECIMAL(10,2);
BEGIN
    v_daily_demand := p_annual_demand / 365.0;
    RETURN ROUND((v_daily_demand * p_lead_time_days) + p_safety_stock, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6.4 Classificar produtos ABC
CREATE OR REPLACE FUNCTION classify_products_abc(
    p_table_name TEXT,
    p_organization_id UUID,
    p_threshold_a DECIMAL(5,2) DEFAULT 80.00,
    p_threshold_b DECIMAL(5,2) DEFAULT 95.00
)
RETURNS TABLE (
    product_id UUID,
    annual_value DECIMAL(12,2),
    cumulative_percentage DECIMAL(5,2),
    abc_category abc_category_enum
) AS $$
BEGIN
    RETURN QUERY EXECUTE format('
        WITH ranked_products AS (
            SELECT 
                id,
                annual_consumption_value,
                SUM(annual_consumption_value) OVER () as total_value,
                ROW_NUMBER() OVER (ORDER BY annual_consumption_value DESC) as rank
            FROM public.%I
            WHERE organization_id = $1
              AND annual_consumption_value > 0
        ),
        cumulative_products AS (
            SELECT 
                id,
                annual_consumption_value,
                total_value,
                SUM(annual_consumption_value) OVER (ORDER BY rank) as cumulative_value
            FROM ranked_products
        )
        SELECT 
            id as product_id,
            annual_consumption_value as annual_value,
            ROUND((cumulative_value / NULLIF(total_value, 0) * 100)::numeric, 2) as cumulative_percentage,
            CASE 
                WHEN (cumulative_value / NULLIF(total_value, 0) * 100) <= $2 THEN ''A''::abc_category_enum
                WHEN (cumulative_value / NULLIF(total_value, 0) * 100) <= $3 THEN ''B''::abc_category_enum
                ELSE ''C''::abc_category_enum
            END as abc_category
        FROM cumulative_products
        ORDER BY annual_consumption_value DESC
    ', p_table_name)
    USING p_organization_id, p_threshold_a, p_threshold_b;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION classify_products_abc IS 'Classifica produtos em categorias ABC baseado no Princípio de Pareto';

-- ============================================
-- PARTE 7: TRIGGERS E AUTOMAÇÕES
-- ============================================

-- 7.1 Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_abc_configuration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER abc_config_updated_at
    BEFORE UPDATE ON public.abc_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_abc_configuration_timestamp();

-- 7.2 Recalcular EOQ quando dados mudam
CREATE OR REPLACE FUNCTION auto_calculate_eoq()
RETURNS TRIGGER AS $$
DECLARE
    v_eoq_result RECORD;
BEGIN
    -- Calcular EOQ se temos dados suficientes
    IF NEW.annual_demand > 0 AND NEW.unit_cost > 0 AND NEW.ordering_cost > 0 THEN
        SELECT * INTO v_eoq_result
        FROM calculate_eoq(
            NEW.annual_demand,
            NEW.ordering_cost,
            NEW.unit_cost,
            NEW.carrying_cost_percentage
        );
        
        NEW.eoq := v_eoq_result.eoq;
    END IF;
    
    -- Calcular safety stock baseado na categoria
    IF NEW.abc_category IS NOT NULL THEN
        NEW.safety_stock := CASE NEW.abc_category
            WHEN 'A' THEN NEW.annual_demand * 0.25 / 365 * NEW.lead_time_days
            WHEN 'B' THEN NEW.annual_demand * 0.15 / 365 * NEW.lead_time_days
            WHEN 'C' THEN NEW.annual_demand * 0.05 / 365 * NEW.lead_time_days
        END;
        
        -- Calcular ponto de reordenamento
        NEW.reorder_point := calculate_reorder_point(
            NEW.annual_demand,
            NEW.lead_time_days,
            COALESCE(NEW.safety_stock, 0)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas as tabelas de itens
DO $$
DECLARE
    v_tables TEXT[] := ARRAY[
        'camara_fria_items',
        'camara_refrigerada_items',
        'estoque_seco_items',
        'bebidas_items',
        'descartaveis_items'
    ];
    v_table TEXT;
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS auto_eoq_trigger ON public.%I;
            CREATE TRIGGER auto_eoq_trigger
                BEFORE INSERT OR UPDATE OF annual_demand, unit_cost, ordering_cost, carrying_cost_percentage, abc_category, lead_time_days
                ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION auto_calculate_eoq();
        ', v_table, v_table);
        
        RAISE NOTICE 'Trigger EOQ criado para: %', v_table;
    END LOOP;
END $$;

-- ============================================
-- PARTE 8: VIEWS MATERIALIZADAS PARA PERFORMANCE
-- ============================================

-- View consolidada de todos os produtos com análise ABC
CREATE OR REPLACE VIEW public.abc_analysis_consolidated AS
SELECT 
    'camara_fria_items' as source_table,
    id,
    organization_id,
    nome as product_name,
    unit_cost,
    annual_demand,
    annual_consumption_value,
    abc_category,
    abc_classification_date,
    eoq,
    reorder_point,
    safety_stock,
    carrying_cost_percentage,
    ordering_cost,
    lead_time_days
FROM public.camara_fria_items
WHERE annual_consumption_value > 0

UNION ALL

SELECT 
    'camara_refrigerada_items',
    id,
    organization_id,
    nome,
    unit_cost,
    annual_demand,
    annual_consumption_value,
    abc_category,
    abc_classification_date,
    eoq,
    reorder_point,
    safety_stock,
    carrying_cost_percentage,
    ordering_cost,
    lead_time_days
FROM public.camara_refrigerada_items
WHERE annual_consumption_value > 0

UNION ALL

SELECT 
    'estoque_seco_items',
    id,
    organization_id,
    nome,
    unit_cost,
    annual_demand,
    annual_consumption_value,
    abc_category,
    abc_classification_date,
    eoq,
    reorder_point,
    safety_stock,
    carrying_cost_percentage,
    ordering_cost,
    lead_time_days
FROM public.estoque_seco_items
WHERE annual_consumption_value > 0

UNION ALL

SELECT 
    'bebidas_items',
    id,
    organization_id,
    nome,
    unit_cost,
    annual_demand,
    annual_consumption_value,
    abc_category,
    abc_classification_date,
    eoq,
    reorder_point,
    safety_stock,
    carrying_cost_percentage,
    ordering_cost,
    lead_time_days
FROM public.bebidas_items
WHERE annual_consumption_value > 0

UNION ALL

SELECT 
    'descartaveis_items',
    id,
    organization_id,
    nome,
    unit_cost,
    annual_demand,
    annual_consumption_value,
    abc_category,
    abc_classification_date,
    eoq,
    reorder_point,
    safety_stock,
    carrying_cost_percentage,
    ordering_cost,
    lead_time_days
FROM public.descartaveis_items
WHERE annual_consumption_value > 0;

COMMENT ON VIEW public.abc_analysis_consolidated IS 'View consolidada de todos os produtos com dados ABC';

-- ============================================
-- PARTE 9: RLS POLICIES
-- ============================================

-- Configurações ABC
ALTER TABLE public.abc_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_abc_config"
ON public.abc_configurations FOR SELECT
TO authenticated
USING (user_belongs_to_organization(organization_id));

CREATE POLICY "admins_manage_abc_config"
ON public.abc_configurations FOR ALL
TO authenticated
USING (user_has_role(organization_id, 'admin'))
WITH CHECK (user_has_role(organization_id, 'admin'));

-- Histórico de análises
ALTER TABLE public.abc_analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_abc_history"
ON public.abc_analysis_history FOR SELECT
TO authenticated
USING (user_belongs_to_organization(organization_id));

CREATE POLICY "system_insert_abc_history"
ON public.abc_analysis_history FOR INSERT
TO authenticated
WITH CHECK (user_belongs_to_organization(organization_id));

-- Mudanças de categoria
ALTER TABLE public.product_abc_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_abc_changes"
ON public.product_abc_changes FOR SELECT
TO authenticated
USING (user_belongs_to_organization(organization_id));

CREATE POLICY "system_insert_abc_changes"
ON public.product_abc_changes FOR INSERT
TO authenticated
WITH CHECK (user_belongs_to_organization(organization_id));

-- ============================================
-- PARTE 10: SEED DE CONFIGURAÇÃO PADRÃO
-- ============================================

-- Função para criar configuração ABC padrão ao criar organização
CREATE OR REPLACE FUNCTION create_default_abc_configuration()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.abc_configurations (
        organization_id,
        category_a_threshold,
        category_b_threshold,
        analysis_period_months,
        auto_classify,
        classification_frequency
    ) VALUES (
        NEW.id,
        80.00,
        95.00,
        12,
        true,
        'monthly'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_abc_config_on_org_creation
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION create_default_abc_configuration();

-- ============================================
-- MENSAGENS FINAIS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'SISTEMA DE ANÁLISE ABC CRIADO COM SUCESSO!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tabelas criadas:';
    RAISE NOTICE '  ✓ abc_configurations (configurações por org)';
    RAISE NOTICE '  ✓ abc_analysis_history (histórico de análises)';
    RAISE NOTICE '  ✓ product_abc_changes (mudanças de categoria)';
    RAISE NOTICE '';
    RAISE NOTICE 'Colunas ABC adicionadas a:';
    RAISE NOTICE '  ✓ camara_fria_items';
    RAISE NOTICE '  ✓ camara_refrigerada_items';
    RAISE NOTICE '  ✓ estoque_seco_items';
    RAISE NOTICE '  ✓ bebidas_items';
    RAISE NOTICE '  ✓ descartaveis_items';
    RAISE NOTICE '';
    RAISE NOTICE 'Funções criadas:';
    RAISE NOTICE '  ✓ calculate_annual_consumption_value()';
    RAISE NOTICE '  ✓ calculate_eoq() - Lote Econômico';
    RAISE NOTICE '  ✓ calculate_reorder_point()';
    RAISE NOTICE '  ✓ classify_products_abc()';
    RAISE NOTICE '';
    RAISE NOTICE 'Triggers criados:';
    RAISE NOTICE '  ✓ Auto-cálculo de EOQ';
    RAISE NOTICE '  ✓ Auto-cálculo de Safety Stock';
    RAISE NOTICE '  ✓ Auto-cálculo de Reorder Point';
    RAISE NOTICE '';
    RAISE NOTICE 'Views criadas:';
    RAISE NOTICE '  ✓ abc_analysis_consolidated';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '  1. Configurar custos unitários nos produtos';
    RAISE NOTICE '  2. Importar ou calcular demanda anual';
    RAISE NOTICE '  3. Executar primeira classificação ABC';
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
END $$;

