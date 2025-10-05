-- =====================================================
-- FIX: RECURSÃO INFINITA NAS POLÍTICAS RLS
-- Problema: organization_members policies referenciam a própria tabela
-- Solução: Simplificar policies e usar auth.uid() diretamente
-- =====================================================

-- ============================================
-- PARTE 1: REMOVER POLÍTICAS PROBLEMÁTICAS
-- ============================================

-- Remover todas as policies existentes que causam recursão
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners and admins can update organizations" ON public.organizations;

DROP POLICY IF EXISTS "Members can view organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Admins can insert members" ON public.organization_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Admins can delete members or users can leave" ON public.organization_members;

-- Remover policies de itens
DO $$
DECLARE
    v_table TEXT;
    v_tables TEXT[] := ARRAY[
        'camara_fria_items',
        'camara_refrigerada_items',
        'estoque_seco_items',
        'bebidas_items',
        'descartaveis_items'
    ];
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can view organization items" ON public.%I', v_table);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert with permission" ON public.%I', v_table);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update with permission" ON public.%I', v_table);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete with permission" ON public.%I', v_table);
    END LOOP;
END $$;

DROP POLICY IF EXISTS "Users view org alerts" ON public.expiry_alerts;
DROP POLICY IF EXISTS "System inserts alerts" ON public.expiry_alerts;
DROP POLICY IF EXISTS "Users update alerts with permission" ON public.expiry_alerts;
DROP POLICY IF EXISTS "Users manage alert config" ON public.alert_configurations;

-- ============================================
-- PARTE 2: RECRIAR FUNÇÕES SEM RECURSÃO
-- ============================================

-- 2.1 Função para obter organization_id do usuário (SEM RECURSÃO)
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
BEGIN
    -- SECURITY DEFINER permite bypass do RLS
    SELECT organization_id INTO v_org_id
    FROM public.organization_members
    WHERE user_id = auth.uid()
      AND is_active = true
    LIMIT 1;
    
    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2.2 Função para verificar se usuário pertence à organização (SEM RECURSÃO)
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- SECURITY DEFINER permite bypass do RLS
    RETURN EXISTS (
        SELECT 1 
        FROM public.organization_members
        WHERE organization_id = p_org_id
          AND user_id = auth.uid()
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2.3 Função para verificar role do usuário (SEM RECURSÃO)
CREATE OR REPLACE FUNCTION public.user_has_role(p_org_id UUID, p_required_role public.organization_role)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_role public.organization_role;
BEGIN
    -- SECURITY DEFINER permite bypass do RLS
    SELECT role INTO v_user_role
    FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
      AND is_active = true;
    
    IF v_user_role IS NULL THEN
        RETURN false;
    END IF;
    
    -- Hierarquia: owner > admin > manager > member > viewer
    RETURN CASE
        WHEN v_user_role = 'owner' THEN true
        WHEN v_user_role = 'admin' AND p_required_role IN ('admin', 'manager', 'member', 'viewer') THEN true
        WHEN v_user_role = 'manager' AND p_required_role IN ('manager', 'member', 'viewer') THEN true
        WHEN v_user_role = 'member' AND p_required_role IN ('member', 'viewer') THEN true
        WHEN v_user_role = 'viewer' AND p_required_role = 'viewer' THEN true
        ELSE false
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2.4 Função para verificar permissão granular (SEM RECURSÃO)
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_org_id UUID, 
    p_module TEXT, 
    p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_permissions JSONB;
    v_role public.organization_role;
BEGIN
    -- SECURITY DEFINER permite bypass do RLS
    SELECT role, permissions INTO v_role, v_permissions
    FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
      AND is_active = true;
    
    -- Owner e Admin têm todas as permissões
    IF v_role IN ('owner', 'admin') THEN
        RETURN true;
    END IF;
    
    -- Verificar permissão específica no JSON
    RETURN COALESCE(
        (v_permissions -> p_module ->> p_action)::boolean, 
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- PARTE 3: POLICIES SIMPLIFICADAS - ORGANIZATIONS
-- ============================================

-- Policy: SELECT - Usuários veem organizações que participam (SEM SUBQUERY RECURSIVA)
CREATE POLICY "users_select_organizations"
ON public.organizations FOR SELECT
TO authenticated
USING (
    -- Usa função SECURITY DEFINER que bypassa RLS
    user_belongs_to_organization(id)
    AND deleted_at IS NULL
);

-- Policy: INSERT - Usuários podem criar organizações
CREATE POLICY "users_insert_organizations"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Policy: UPDATE - Apenas owner/admin podem atualizar
CREATE POLICY "users_update_organizations"
ON public.organizations FOR UPDATE
TO authenticated
USING (
    owner_id = auth.uid() 
    OR user_has_role(id, 'admin')
)
WITH CHECK (
    owner_id = auth.uid() 
    OR user_has_role(id, 'admin')
);

-- Policy: DELETE - Apenas owner pode deletar
CREATE POLICY "users_delete_organizations"
ON public.organizations FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- ============================================
-- PARTE 4: POLICIES SIMPLIFICADAS - ORGANIZATION_MEMBERS
-- ============================================

-- Policy: SELECT - Membros veem outros membros da mesma org (SEM RECURSÃO)
CREATE POLICY "members_select_members"
ON public.organization_members FOR SELECT
TO authenticated
USING (
    -- Permite ver membros da organização se o usuário é membro
    user_id = auth.uid() -- Sempre pode ver seus próprios registros
    OR 
    user_belongs_to_organization(organization_id) -- Ou se pertence à org
);

-- Policy: INSERT - Owner/Admin podem adicionar membros
CREATE POLICY "admins_insert_members"
ON public.organization_members FOR INSERT
TO authenticated
WITH CHECK (
    user_has_role(organization_id, 'admin')
);

-- Policy: UPDATE - Owner/Admin podem atualizar membros
CREATE POLICY "admins_update_members"
ON public.organization_members FOR UPDATE
TO authenticated
USING (user_has_role(organization_id, 'admin'))
WITH CHECK (user_has_role(organization_id, 'admin'));

-- Policy: DELETE - Owner/Admin podem remover OU usuário pode sair
CREATE POLICY "admins_delete_members"
ON public.organization_members FOR DELETE
TO authenticated
USING (
    user_has_role(organization_id, 'admin')
    OR user_id = auth.uid()
);

-- ============================================
-- PARTE 5: POLICIES SIMPLIFICADAS - TABELAS DE ITENS
-- ============================================

DO $$
DECLARE
    v_table TEXT;
    v_tables TEXT[] := ARRAY[
        'camara_fria_items',
        'camara_refrigerada_items',
        'estoque_seco_items',
        'bebidas_items',
        'descartaveis_items'
    ];
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        -- SELECT: Ver itens da organização
        EXECUTE format('
            CREATE POLICY "users_select_%s"
            ON public.%I FOR SELECT
            TO authenticated
            USING (
                user_belongs_to_organization(organization_id)
            );
        ', v_table, v_table);
        
        -- INSERT: Adicionar com permissão
        EXECUTE format('
            CREATE POLICY "users_insert_%s"
            ON public.%I FOR INSERT
            TO authenticated
            WITH CHECK (
                user_has_permission(organization_id, ''inventory'', ''write'')
                AND organization_id = get_user_organization_id()
            );
        ', v_table, v_table);
        
        -- UPDATE: Atualizar com permissão
        EXECUTE format('
            CREATE POLICY "users_update_%s"
            ON public.%I FOR UPDATE
            TO authenticated
            USING (
                user_has_permission(organization_id, ''inventory'', ''write'')
            )
            WITH CHECK (
                user_has_permission(organization_id, ''inventory'', ''write'')
                AND organization_id = get_user_organization_id()
            );
        ', v_table, v_table);
        
        -- DELETE: Deletar com permissão
        EXECUTE format('
            CREATE POLICY "users_delete_%s"
            ON public.%I FOR DELETE
            TO authenticated
            USING (
                user_has_permission(organization_id, ''inventory'', ''delete'')
            );
        ', v_table, v_table);
    END LOOP;
END $$;

-- ============================================
-- PARTE 6: POLICIES SIMPLIFICADAS - ALERTAS
-- ============================================

-- Expiry Alerts
CREATE POLICY "users_select_expiry_alerts"
ON public.expiry_alerts FOR SELECT
TO authenticated
USING (
    user_belongs_to_organization(organization_id)
);

CREATE POLICY "users_insert_expiry_alerts"
ON public.expiry_alerts FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "users_update_expiry_alerts"
ON public.expiry_alerts FOR UPDATE
TO authenticated
USING (
    user_has_permission(organization_id, 'alerts', 'write')
);

-- Alert Configurations
CREATE POLICY "users_manage_alert_config"
ON public.alert_configurations FOR ALL
TO authenticated
USING (
    user_belongs_to_organization(organization_id)
)
WITH CHECK (organization_id = get_user_organization_id());

-- Alert History (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alert_history') THEN
        EXECUTE '
            DROP POLICY IF EXISTS "users_view_alert_history" ON public.alert_history;
            CREATE POLICY "users_view_alert_history"
            ON public.alert_history FOR SELECT
            TO authenticated
            USING (
                user_belongs_to_organization(organization_id)
            );
        ';
    END IF;
END $$;

-- ============================================
-- PARTE 7: POLICIES PARA HISTÓRICOS
-- ============================================

DO $$
DECLARE
    v_table TEXT;
    v_tables TEXT[] := ARRAY[
        'camara_fria_historico',
        'camara_refrigerada_historico',
        'estoque_seco_historico',
        'descartaveis_historico'
    ];
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        -- Verificar se tabela existe e tem organization_id
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = v_table AND column_name = 'organization_id'
        ) THEN
            -- Habilitar RLS se não estiver
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
            
            -- Remover policies antigas
            EXECUTE format('DROP POLICY IF EXISTS "users_select_%s" ON public.%I', v_table, v_table);
            EXECUTE format('DROP POLICY IF EXISTS "users_insert_%s" ON public.%I', v_table, v_table);
            
            -- SELECT: Ver histórico da organização
            EXECUTE format('
                CREATE POLICY "users_select_%s"
                ON public.%I FOR SELECT
                TO authenticated
                USING (
                    user_belongs_to_organization(organization_id)
                );
            ', v_table, v_table);
            
            -- INSERT: Sistema pode inserir histórico
            EXECUTE format('
                CREATE POLICY "users_insert_%s"
                ON public.%I FOR INSERT
                TO authenticated
                WITH CHECK (
                    organization_id = get_user_organization_id()
                );
            ', v_table, v_table);
        END IF;
    END LOOP;
END $$;

-- ============================================
-- PARTE 8: MENSAGEM DE SUCESSO
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'FIX DE RECURSÃO INFINITA APLICADO COM SUCESSO!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Mudanças aplicadas:';
    RAISE NOTICE '  ✓ Funções reforçadas com SECURITY DEFINER';
    RAISE NOTICE '  ✓ Policies reescritas sem subqueries recursivas';
    RAISE NOTICE '  ✓ organization_members agora usa user_id = auth.uid()';
    RAISE NOTICE '  ✓ Todas as tabelas de itens corrigidas';
    RAISE NOTICE '  ✓ Alertas e históricos corrigidos';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '  1. Testar SELECT em organization_members';
    RAISE NOTICE '  2. Testar SELECT em tabelas de itens';
    RAISE NOTICE '  3. Verificar se não há mais erro 42P17';
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
END $$;
