-- =====================================================
-- MIGRATION: SISTEMA MULTI-TENANT COMPLETO
-- Data: 04/10/2025
-- Descrição: Implementação completa de multi-tenancy
-- Segurança: RLS obrigatório, isolamento total de dados
-- =====================================================

-- ============================================
-- PARTE 1: ESTRUTURA DE ORGANIZAÇÕES
-- ============================================

-- 1.1 Criar tabela de organizações
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL CHECK (length(name) >= 3 AND length(name) <= 100),
    slug TEXT UNIQUE NOT NULL CHECK (slug ~* '^[a-z0-9-]+$'),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    -- Configurações
    is_active BOOLEAN DEFAULT true NOT NULL,
    max_users INTEGER DEFAULT 10 CHECK (max_users > 0),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Customizações
    logo_url TEXT,
    primary_color TEXT DEFAULT '#FF6B00',
    settings JSONB DEFAULT '{
        "inventory": {"allow_negative_stock": false, "require_batch_number": false},
        "alerts": {"enabled": true, "default_warning_days": 30, "default_critical_days": 7},
        "notifications": {"email": true, "push": true, "in_app": true}
    }'::jsonb,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_active ON public.organizations(is_active) WHERE deleted_at IS NULL;

-- Comentários
COMMENT ON TABLE public.organizations IS 'Organizações/Empresas do sistema - Isolamento total de dados';
COMMENT ON COLUMN public.organizations.slug IS 'Identificador único amigável (URL-safe)';

-- 1.2 Criar enum de roles
DO $$ BEGIN
    CREATE TYPE public.organization_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.3 Criar tabela de membros
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.organization_role DEFAULT 'member' NOT NULL,
    
    -- Permissões granulares por módulo
    permissions JSONB DEFAULT '{
        "inventory": {"read": true, "write": true, "delete": false, "transfer": false},
        "alerts": {"read": true, "write": true, "delete": false},
        "reports": {"read": true, "write": false, "delete": false},
        "settings": {"read": false, "write": false, "delete": false},
        "members": {"read": false, "write": false, "delete": false}
    }'::jsonb,
    
    -- Status de convite
    is_active BOOLEAN DEFAULT true NOT NULL,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    joined_at TIMESTAMP WITH TIME ZONE,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Constraint: usuário único por organização
    UNIQUE(organization_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.organization_members(organization_id, role);

COMMENT ON TABLE public.organization_members IS 'Membros e seus papéis nas organizações';

-- ============================================
-- PARTE 2: ADICIONAR organization_id EM TODAS AS TABELAS
-- ============================================

-- 2.1 Tabelas de Itens
ALTER TABLE public.camara_fria_items 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.camara_refrigerada_items 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.estoque_seco_items 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.bebidas_items 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.descartaveis_items 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 2.2 Tabelas de Histórico
ALTER TABLE public.camara_fria_historico 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.camara_refrigerada_historico 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.estoque_seco_historico 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.descartaveis_historico 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 2.3 Sistema de Alertas
ALTER TABLE public.expiry_alerts 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.alert_configurations 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.alert_history 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- ============================================
-- PARTE 3: CRIAR ÍNDICES COMPOSTOS
-- ============================================

-- Índices críticos para performance com tenant isolation
CREATE INDEX IF NOT EXISTS idx_camara_fria_org_user ON public.camara_fria_items(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_camara_fria_org_unidade ON public.camara_fria_items(organization_id, unidade_item);

CREATE INDEX IF NOT EXISTS idx_camara_refrigerada_org_user ON public.camara_refrigerada_items(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_camara_refrigerada_org_unidade ON public.camara_refrigerada_items(organization_id, unidade);

CREATE INDEX IF NOT EXISTS idx_estoque_seco_org_user ON public.estoque_seco_items(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_estoque_seco_org_unidade ON public.estoque_seco_items(organization_id, unidade);

CREATE INDEX IF NOT EXISTS idx_bebidas_org_user ON public.bebidas_items(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_descartaveis_org_user ON public.descartaveis_items(organization_id, user_id);

CREATE INDEX IF NOT EXISTS idx_expiry_alerts_org ON public.expiry_alerts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_alert_config_org_user ON public.alert_configurations(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_org ON public.alert_history(organization_id, created_at DESC);

-- ============================================
-- PARTE 4: FUNÇÕES DE CONTEXTO E SEGURANÇA
-- ============================================

-- 4.1 Função para obter organization_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT organization_id INTO v_org_id
    FROM public.organization_members
    WHERE user_id = auth.uid()
      AND is_active = true
    LIMIT 1;
    
    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_user_organization_id() IS 'Retorna organization_id do usuário autenticado atual';

-- 4.2 Função para verificar se usuário pertence à organização
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.organization_members
        WHERE organization_id = p_org_id
          AND user_id = auth.uid()
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.user_belongs_to_organization(UUID) IS 'Verifica se usuário pertence à organização especificada';

-- 4.3 Função para verificar role do usuário
CREATE OR REPLACE FUNCTION public.user_has_role(p_org_id UUID, p_required_role public.organization_role)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_role public.organization_role;
BEGIN
    SELECT role INTO v_user_role
    FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
      AND is_active = true;
    
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

COMMENT ON FUNCTION public.user_has_role(UUID, organization_role) IS 'Verifica se usuário tem role necessária na organização';

-- 4.4 Função para verificar permissão granular
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
    -- Buscar role e permissões
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

COMMENT ON FUNCTION public.user_has_permission(UUID, TEXT, TEXT) IS 'Verifica permissão granular do usuário (módulo + ação)';

-- 4.5 Função para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(p_org_id UUID)
RETURNS public.organization_role AS $$
DECLARE
    v_role public.organization_role;
BEGIN
    SELECT role INTO v_role
    FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
      AND is_active = true;
    
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Retorna role do usuário na organização';

-- 4.6 Função para listar organizações do usuário
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS TABLE (
    org_id UUID,
    org_name TEXT,
    org_slug TEXT,
    user_role public.organization_role,
    is_owner BOOLEAN,
    member_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as org_id,
        o.name as org_name,
        o.slug as org_slug,
        om.role as user_role,
        (o.owner_id = auth.uid()) as is_owner,
        COUNT(om2.id) as member_count
    FROM public.organizations o
    INNER JOIN public.organization_members om ON om.organization_id = o.id
    LEFT JOIN public.organization_members om2 ON om2.organization_id = o.id AND om2.is_active = true
    WHERE om.user_id = auth.uid()
      AND om.is_active = true
      AND o.deleted_at IS NULL
      AND o.is_active = true
    GROUP BY o.id, o.name, o.slug, om.role, o.owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_user_organizations() IS 'Lista todas as organizações que o usuário participa';

-- ============================================
-- PARTE 5: RLS POLICIES - ORGANIZATIONS
-- ============================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários veem apenas organizações que são membros
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
CREATE POLICY "Users can view their organizations"
ON public.organizations FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid() AND is_active = true
    )
    AND deleted_at IS NULL
);

-- Policy: Usuários autenticados podem criar organizações
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Policy: Apenas owner/admin podem atualizar
DROP POLICY IF EXISTS "Owners and admins can update organizations" ON public.organizations;
CREATE POLICY "Owners and admins can update organizations"
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

-- Policy: Apenas owner pode deletar
DROP POLICY IF EXISTS "Owners can delete organizations" ON public.organizations;
CREATE POLICY "Owners can delete organizations"
ON public.organizations FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- ============================================
-- PARTE 6: RLS POLICIES - ORGANIZATION MEMBERS
-- ============================================

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Policy: Membros veem outros membros da mesma org
DROP POLICY IF EXISTS "Members can view organization members" ON public.organization_members;
CREATE POLICY "Members can view organization members"
ON public.organization_members FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Policy: Owner/Admin podem adicionar membros
DROP POLICY IF EXISTS "Admins can insert members" ON public.organization_members;
CREATE POLICY "Admins can insert members"
ON public.organization_members FOR INSERT
TO authenticated
WITH CHECK (
    user_has_role(organization_id, 'admin')
);

-- Policy: Owner/Admin podem atualizar membros
DROP POLICY IF EXISTS "Admins can update members" ON public.organization_members;
CREATE POLICY "Admins can update members"
ON public.organization_members FOR UPDATE
TO authenticated
USING (user_has_role(organization_id, 'admin'))
WITH CHECK (user_has_role(organization_id, 'admin'));

-- Policy: Owner/Admin podem remover membros OU usuário pode sair
DROP POLICY IF EXISTS "Admins can delete members or users can leave" ON public.organization_members;
CREATE POLICY "Admins can delete members or users can leave"
ON public.organization_members FOR DELETE
TO authenticated
USING (
    user_has_role(organization_id, 'admin')
    OR user_id = auth.uid()
);

-- ============================================
-- PARTE 7: RLS POLICIES - TABELAS DE ITENS
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
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
        
        -- SELECT: Ver itens da organização
        EXECUTE format('
            DROP POLICY IF EXISTS "Users can view organization items" ON public.%I;
            CREATE POLICY "Users can view organization items"
            ON public.%I FOR SELECT
            TO authenticated
            USING (
                organization_id IN (
                    SELECT organization_id 
                    FROM public.organization_members 
                    WHERE user_id = auth.uid() AND is_active = true
                )
            );
        ', v_table, v_table);
        
        -- INSERT: Adicionar com permissão
        EXECUTE format('
            DROP POLICY IF EXISTS "Users can insert with permission" ON public.%I;
            CREATE POLICY "Users can insert with permission"
            ON public.%I FOR INSERT
            TO authenticated
            WITH CHECK (
                user_has_permission(organization_id, ''inventory'', ''write'')
                AND organization_id = get_user_organization_id()
            );
        ', v_table, v_table);
        
        -- UPDATE: Atualizar com permissão
        EXECUTE format('
            DROP POLICY IF EXISTS "Users can update with permission" ON public.%I;
            CREATE POLICY "Users can update with permission"
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
            DROP POLICY IF EXISTS "Users can delete with permission" ON public.%I;
            CREATE POLICY "Users can delete with permission"
            ON public.%I FOR DELETE
            TO authenticated
            USING (
                user_has_permission(organization_id, ''inventory'', ''delete'')
            );
        ', v_table, v_table);
    END LOOP;
END $$;

-- ============================================
-- PARTE 8: RLS POLICIES - ALERTAS
-- ============================================

ALTER TABLE public.expiry_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configurations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view org alerts" ON public.expiry_alerts;
CREATE POLICY "Users view org alerts"
ON public.expiry_alerts FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

DROP POLICY IF EXISTS "System inserts alerts" ON public.expiry_alerts;
CREATE POLICY "System inserts alerts"
ON public.expiry_alerts FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

DROP POLICY IF EXISTS "Users update alerts with permission" ON public.expiry_alerts;
CREATE POLICY "Users update alerts with permission"
ON public.expiry_alerts FOR UPDATE
TO authenticated
USING (
    user_has_permission(organization_id, 'alerts', 'write')
);

DROP POLICY IF EXISTS "Users manage alert config" ON public.alert_configurations;
CREATE POLICY "Users manage alert config"
ON public.alert_configurations FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid() AND is_active = true
    )
)
WITH CHECK (organization_id = get_user_organization_id());

-- ============================================
-- PARTE 9: TRIGGERS E VALIDAÇÕES
-- ============================================

-- 9.1 Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organizations_updated_at ON public.organizations;
CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS org_members_updated_at ON public.organization_members;
CREATE TRIGGER org_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9.2 Trigger para prevenir remoção do owner
CREATE OR REPLACE FUNCTION public.prevent_owner_removal()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role = 'owner' THEN
        RAISE EXCEPTION 'Cannot remove or demote organization owner. Transfer ownership first.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_owner_removal_trigger ON public.organization_members;
CREATE TRIGGER prevent_owner_removal_trigger
    BEFORE DELETE OR UPDATE ON public.organization_members
    FOR EACH ROW 
    WHEN (OLD.role = 'owner')
    EXECUTE FUNCTION public.prevent_owner_removal();

-- 9.3 Trigger para garantir organization_id
CREATE OR REPLACE FUNCTION public.ensure_organization_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.organization_id IS NULL THEN
        NEW.organization_id := get_user_organization_id();
        
        IF NEW.organization_id IS NULL THEN
            RAISE EXCEPTION 'User must belong to an organization';
        END IF;
    END IF;
    
    IF NOT user_belongs_to_organization(NEW.organization_id) THEN
        RAISE EXCEPTION 'User does not belong to organization %', NEW.organization_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger em todas as tabelas de itens
DO $$
DECLARE
    v_table TEXT;
    v_tables TEXT[] := ARRAY[
        'camara_fria_items',
        'camara_refrigerada_items',
        'estoque_seco_items',
        'bebidas_items',
        'descartaveis_items',
        'expiry_alerts'
    ];
BEGIN
    FOREACH v_table IN ARRAY v_tables LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS ensure_organization_id_trigger ON public.%I;
            CREATE TRIGGER ensure_organization_id_trigger
                BEFORE INSERT ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.ensure_organization_id();
        ', v_table, v_table);
    END LOOP;
END $$;

-- 9.4 Trigger para criar membro owner automaticamente
CREATE OR REPLACE FUNCTION public.create_owner_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.organization_members (
        organization_id,
        user_id,
        role,
        is_active,
        joined_at,
        permissions
    ) VALUES (
        NEW.id,
        NEW.owner_id,
        'owner',
        true,
        NOW(),
        '{
            "inventory": {"read": true, "write": true, "delete": true, "transfer": true},
            "alerts": {"read": true, "write": true, "delete": true},
            "reports": {"read": true, "write": true, "delete": true},
            "settings": {"read": true, "write": true, "delete": true},
            "members": {"read": true, "write": true, "delete": true}
        }'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_owner_member_trigger ON public.organizations;
CREATE TRIGGER create_owner_member_trigger
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.create_owner_member();

-- ============================================
-- PARTE 10: VIEWS DE SEGURANÇA
-- ============================================

-- 10.1 View: Minhas organizações
CREATE OR REPLACE VIEW public.my_organizations AS
SELECT 
    o.*,
    om.role as my_role,
    om.permissions as my_permissions,
    (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id AND is_active = true) as member_count
FROM public.organizations o
INNER JOIN public.organization_members om ON om.organization_id = o.id
WHERE om.user_id = auth.uid()
  AND om.is_active = true
  AND o.deleted_at IS NULL;

-- 10.2 View: Estatísticas da organização
CREATE OR REPLACE VIEW public.organization_stats AS
SELECT 
    o.id as organization_id,
    o.name,
    COUNT(DISTINCT om.user_id) as total_members,
    (SELECT COUNT(*) FROM camara_fria_items WHERE organization_id = o.id) as camara_fria_count,
    (SELECT COUNT(*) FROM camara_refrigerada_items WHERE organization_id = o.id) as camara_refrigerada_count,
    (SELECT COUNT(*) FROM estoque_seco_items WHERE organization_id = o.id) as estoque_seco_count,
    (SELECT COUNT(*) FROM bebidas_items WHERE organization_id = o.id) as bebidas_count,
    (SELECT COUNT(*) FROM descartaveis_items WHERE organization_id = o.id) as descartaveis_count,
    (SELECT COUNT(*) FROM expiry_alerts WHERE organization_id = o.id AND status = 'pending') as pending_alerts,
    o.created_at,
    o.subscription_tier
FROM public.organizations o
LEFT JOIN public.organization_members om ON om.organization_id = o.id AND om.is_active = true
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, o.created_at, o.subscription_tier;

-- ============================================
-- PARTE 11: FUNÇÕES DE MIGRAÇÃO E UTILIDADE
-- ============================================

-- 11.1 Migrar dados existentes para uma organização
CREATE OR REPLACE FUNCTION public.migrate_user_data_to_organization(
    p_user_id UUID,
    p_organization_id UUID
)
RETURNS TEXT AS $$
DECLARE
    v_count INTEGER := 0;
    v_total INTEGER := 0;
BEGIN
    -- Verificar se usuário pertence à organização
    IF NOT user_belongs_to_organization(p_organization_id) THEN
        RETURN 'ERROR: User is not a member of this organization';
    END IF;
    
    -- Camara Fria
    UPDATE public.camara_fria_items
    SET organization_id = p_organization_id
    WHERE user_id = p_user_id AND organization_id IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_total := v_total + v_count;
    
    -- Camara Refrigerada
    UPDATE public.camara_refrigerada_items
    SET organization_id = p_organization_id
    WHERE user_id = p_user_id AND organization_id IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_total := v_total + v_count;
    
    -- Estoque Seco
    UPDATE public.estoque_seco_items
    SET organization_id = p_organization_id
    WHERE user_id = p_user_id AND organization_id IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_total := v_total + v_count;
    
    -- Bebidas
    UPDATE public.bebidas_items
    SET organization_id = p_organization_id
    WHERE user_id = p_user_id AND organization_id IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_total := v_total + v_count;
    
    -- Descartáveis
    UPDATE public.descartaveis_items
    SET organization_id = p_organization_id
    WHERE user_id = p_user_id AND organization_id IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_total := v_total + v_count;
    
    -- Históricos
    UPDATE public.camara_fria_historico
    SET organization_id = p_organization_id
    WHERE user_id = p_user_id AND organization_id IS NULL;
    
    UPDATE public.camara_refrigerada_historico
    SET organization_id = p_organization_id
    WHERE user_id = p_user_id AND organization_id IS NULL;
    
    UPDATE public.estoque_seco_historico
    SET organization_id = p_organization_id
    WHERE user_id = p_user_id AND organization_id IS NULL;
    
    UPDATE public.descartaveis_historico
    SET organization_id = p_organization_id
    WHERE user_id = p_user_id AND organization_id IS NULL;
    
    RETURN format('SUCCESS: Migrated %s items for user to organization %s', v_total, p_organization_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.migrate_user_data_to_organization(UUID, UUID) IS 'Migra dados de um usuário para uma organização';

-- 11.2 Criar organização automaticamente para usuário
CREATE OR REPLACE FUNCTION public.auto_create_organization_for_user()
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_org_id UUID;
    v_org_name TEXT;
    v_org_slug TEXT;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;
    
    -- Verificar se já tem organização
    SELECT organization_id INTO v_org_id
    FROM public.organization_members
    WHERE user_id = v_user_id AND is_active = true
    LIMIT 1;
    
    IF v_org_id IS NOT NULL THEN
        RETURN v_org_id;
    END IF;
    
    -- Buscar email do usuário
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;
    
    -- Gerar nome e slug da organização
    v_org_name := COALESCE(
        split_part(v_user_email, '@', 1),
        'Organização ' || substring(v_user_id::text, 1, 8)
    );
    v_org_slug := lower(regexp_replace(v_org_name, '[^a-z0-9]+', '-', 'gi')) || '-' || substring(md5(v_user_id::text), 1, 8);
    
    -- Criar organização
    INSERT INTO public.organizations (
        name,
        slug,
        owner_id,
        is_active
    ) VALUES (
        v_org_name,
        v_org_slug,
        v_user_id,
        true
    ) RETURNING id INTO v_org_id;
    
    -- Migrar dados existentes
    PERFORM migrate_user_data_to_organization(v_user_id, v_org_id);
    
    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.auto_create_organization_for_user() IS 'Cria organização automaticamente para usuário no primeiro login';

-- 11.3 Transferir propriedade da organização
CREATE OR REPLACE FUNCTION public.transfer_organization_ownership(
    p_org_id UUID,
    p_new_owner_id UUID
)
RETURNS TEXT AS $$
DECLARE
    v_current_owner_id UUID;
BEGIN
    -- Verificar se é o owner atual
    SELECT owner_id INTO v_current_owner_id
    FROM public.organizations
    WHERE id = p_org_id;
    
    IF v_current_owner_id != auth.uid() THEN
        RETURN 'ERROR: Only current owner can transfer ownership';
    END IF;
    
    -- Verificar se novo owner é membro
    IF NOT user_belongs_to_organization(p_org_id) THEN
        RETURN 'ERROR: New owner must be a member of the organization';
    END IF;
    
    -- Atualizar owner da organização
    UPDATE public.organizations
    SET owner_id = p_new_owner_id
    WHERE id = p_org_id;
    
    -- Atualizar role do novo owner
    UPDATE public.organization_members
    SET role = 'owner'
    WHERE organization_id = p_org_id
      AND user_id = p_new_owner_id;
    
    -- Downgrade do owner anterior para admin
    UPDATE public.organization_members
    SET role = 'admin'
    WHERE organization_id = p_org_id
      AND user_id = v_current_owner_id;
    
    RETURN format('SUCCESS: Ownership transferred to user %s', p_new_owner_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.transfer_organization_ownership(UUID, UUID) IS 'Transfere propriedade da organização para outro membro';

-- ============================================
-- PARTE 12: MENSAGENS FINAIS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'MIGRATION MULTI-TENANT COMPLETA!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tabelas criadas:';
    RAISE NOTICE '  - organizations (organizações/empresas)';
    RAISE NOTICE '  - organization_members (membros e permissões)';
    RAISE NOTICE '';
    RAISE NOTICE 'Colunas adicionadas:';
    RAISE NOTICE '  - organization_id em TODAS as tabelas de items';
    RAISE NOTICE '  - organization_id em TODAS as tabelas de histórico';
    RAISE NOTICE '  - organization_id em tabelas de alertas';
    RAISE NOTICE '';
    RAISE NOTICE 'Funções criadas:';
    RAISE NOTICE '  - get_user_organization_id()';
    RAISE NOTICE '  - user_belongs_to_organization(UUID)';
    RAISE NOTICE '  - user_has_role(UUID, organization_role)';
    RAISE NOTICE '  - user_has_permission(UUID, TEXT, TEXT)';
    RAISE NOTICE '  - get_user_role(UUID)';
    RAISE NOTICE '  - get_user_organizations()';
    RAISE NOTICE '  - migrate_user_data_to_organization(UUID, UUID)';
    RAISE NOTICE '  - auto_create_organization_for_user()';
    RAISE NOTICE '  - transfer_organization_ownership(UUID, UUID)';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS Policies criadas para ISOLAMENTO TOTAL!';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '  1. Executar: SELECT auto_create_organization_for_user();';
    RAISE NOTICE '  2. Verificar: SELECT * FROM my_organizations;';
    RAISE NOTICE '  3. Verificar: SELECT * FROM organization_stats;';
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
END $$;


