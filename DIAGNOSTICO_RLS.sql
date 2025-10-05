-- =====================================================
-- SCRIPT DE DIAGNÓSTICO - RLS e Multi-Tenant
-- Execute este script para entender o estado atual do banco
-- =====================================================

-- ============================================
-- 1. VERIFICAR POLICIES EXISTENTES
-- ============================================

SELECT 
    '=== POLICIES ATUAIS ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename IN (
    'organization_members',
    'organizations', 
    'camara_fria_items',
    'camara_refrigerada_items',
    'estoque_seco_items',
    'bebidas_items',
    'descartaveis_items',
    'expiry_alerts'
)
ORDER BY tablename, policyname;

-- ============================================
-- 2. VERIFICAR RLS HABILITADO/DESABILITADO
-- ============================================

SELECT 
    '=== STATUS DO RLS POR TABELA ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'organization_members',
    'organizations',
    'camara_fria_items',
    'camara_refrigerada_items',
    'estoque_seco_items',
    'bebidas_items',
    'descartaveis_items',
    'expiry_alerts',
    'alert_configurations'
  )
ORDER BY tablename;

-- ============================================
-- 3. VERIFICAR FUNÇÕES DE SEGURANÇA
-- ============================================

SELECT 
    '=== FUNÇÕES DE ORGANIZAÇÃO ===' as info;

SELECT 
    routine_name,
    routine_type,
    security_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_user_organization_id',
    'user_belongs_to_organization',
    'user_has_role',
    'user_has_permission',
    'get_user_role',
    'get_user_organizations'
  )
ORDER BY routine_name;

-- ============================================
-- 4. VERIFICAR SUAS ORGANIZAÇÕES
-- ============================================

SELECT 
    '=== MINHAS ORGANIZAÇÕES ===' as info;

-- Tenta usar a view se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'my_organizations') THEN
        RAISE NOTICE 'View my_organizations existe, consultando...';
        PERFORM * FROM my_organizations;
    ELSE
        RAISE NOTICE 'View my_organizations NÃO existe';
    END IF;
END $$;

-- Query direta (bypass RLS para diagnóstico)
SELECT 
    o.id,
    o.name,
    o.slug,
    o.owner_id,
    o.is_active,
    o.subscription_tier,
    o.created_at
FROM public.organizations o
WHERE o.deleted_at IS NULL
ORDER BY o.created_at DESC;

-- ============================================
-- 5. VERIFICAR MEMBROS DAS ORGANIZAÇÕES
-- ============================================

SELECT 
    '=== MEMBROS DAS ORGANIZAÇÕES ===' as info;

SELECT 
    om.id,
    om.organization_id,
    om.user_id,
    om.role,
    om.is_active,
    o.name as organization_name,
    CASE 
        WHEN om.user_id = auth.uid() THEN '← VOCÊ'
        ELSE ''
    END as you_marker
FROM public.organization_members om
JOIN public.organizations o ON o.id = om.organization_id
WHERE o.deleted_at IS NULL
ORDER BY o.name, om.role;

-- ============================================
-- 6. VERIFICAR ITENS POR ORGANIZAÇÃO
-- ============================================

SELECT 
    '=== CONTAGEM DE ITENS POR ORGANIZAÇÃO ===' as info;

SELECT 
    o.name as organization,
    (SELECT COUNT(*) FROM public.camara_fria_items WHERE organization_id = o.id) as camara_fria,
    (SELECT COUNT(*) FROM public.camara_refrigerada_items WHERE organization_id = o.id) as camara_refrigerada,
    (SELECT COUNT(*) FROM public.estoque_seco_items WHERE organization_id = o.id) as estoque_seco,
    (SELECT COUNT(*) FROM public.bebidas_items WHERE organization_id = o.id) as bebidas,
    (SELECT COUNT(*) FROM public.descartaveis_items WHERE organization_id = o.id) as descartaveis,
    (SELECT COUNT(*) FROM public.expiry_alerts WHERE organization_id = o.id) as alertas
FROM public.organizations o
WHERE o.deleted_at IS NULL
ORDER BY o.name;

-- ============================================
-- 7. VERIFICAR ITENS SEM ORGANIZAÇÃO
-- ============================================

SELECT 
    '=== ITENS ÓRFÃOS (SEM ORGANIZATION_ID) ===' as info;

SELECT 
    'camara_fria_items' as tabela,
    COUNT(*) as itens_sem_org
FROM public.camara_fria_items
WHERE organization_id IS NULL

UNION ALL

SELECT 
    'camara_refrigerada_items' as tabela,
    COUNT(*) as itens_sem_org
FROM public.camara_refrigerada_items
WHERE organization_id IS NULL

UNION ALL

SELECT 
    'estoque_seco_items' as tabela,
    COUNT(*) as itens_sem_org
FROM public.estoque_seco_items
WHERE organization_id IS NULL

UNION ALL

SELECT 
    'bebidas_items' as tabela,
    COUNT(*) as itens_sem_org
FROM public.bebidas_items
WHERE organization_id IS NULL

UNION ALL

SELECT 
    'descartaveis_items' as tabela,
    COUNT(*) as itens_sem_org
FROM public.descartaveis_items
WHERE organization_id IS NULL;

-- ============================================
-- 8. VERIFICAR USUÁRIO ATUAL
-- ============================================

SELECT 
    '=== INFORMAÇÕES DO USUÁRIO ATUAL ===' as info;

SELECT 
    auth.uid() as user_id,
    auth.email() as user_email,
    (SELECT COUNT(*) FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true) as organizacoes_ativas,
    (SELECT role FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true LIMIT 1) as role_primeira_org;

-- ============================================
-- 9. TESTAR FUNÇÃO get_user_organization_id()
-- ============================================

SELECT 
    '=== TESTE DE FUNÇÃO get_user_organization_id() ===' as info;

DO $$
DECLARE
    v_org_id UUID;
BEGIN
    BEGIN
        SELECT get_user_organization_id() INTO v_org_id;
        RAISE NOTICE 'get_user_organization_id() retornou: %', COALESCE(v_org_id::text, 'NULL');
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERRO ao chamar get_user_organization_id(): %', SQLERRM;
    END;
END $$;

-- ============================================
-- 10. VERIFICAR TRIGGERS
-- ============================================

SELECT 
    '=== TRIGGERS ATIVOS ===' as info;

SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
    'organizations',
    'organization_members',
    'camara_fria_items',
    'camara_refrigerada_items',
    'estoque_seco_items',
    'bebidas_items',
    'descartaveis_items'
  )
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 11. RESUMO FINAL
-- ============================================

SELECT 
    '=== RESUMO DO DIAGNÓSTICO ===' as info;

DO $$
DECLARE
    v_org_count INTEGER;
    v_member_count INTEGER;
    v_rls_enabled_count INTEGER;
    v_policy_count INTEGER;
    v_function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_org_count FROM public.organizations WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO v_member_count FROM public.organization_members WHERE is_active = true;
    SELECT COUNT(*) INTO v_rls_enabled_count FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
    SELECT COUNT(*) INTO v_policy_count FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) INTO v_function_count FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%organization%';
    
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'RESUMO DO DIAGNÓSTICO';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Organizações ativas: %', v_org_count;
    RAISE NOTICE 'Membros ativos: %', v_member_count;
    RAISE NOTICE 'Tabelas com RLS habilitado: %', v_rls_enabled_count;
    RAISE NOTICE 'Policies ativas: %', v_policy_count;
    RAISE NOTICE 'Funções de organização: %', v_function_count;
    RAISE NOTICE '====================================================';
    
    IF v_policy_count = 0 THEN
        RAISE NOTICE '⚠️  ALERTA: Nenhuma policy encontrada!';
        RAISE NOTICE '   Sugestão: Execute FIX_RLS_RECURSION.sql';
    END IF;
    
    IF v_org_count = 0 THEN
        RAISE NOTICE '⚠️  ALERTA: Nenhuma organização encontrada!';
        RAISE NOTICE '   Sugestão: Execute SELECT auto_create_organization_for_user();';
    END IF;
    
    IF v_rls_enabled_count < 5 THEN
        RAISE NOTICE '⚠️  ALERTA: Poucas tabelas com RLS habilitado!';
        RAISE NOTICE '   Tabelas com RLS: %', v_rls_enabled_count;
    END IF;
    
    RAISE NOTICE '====================================================';
END $$;
