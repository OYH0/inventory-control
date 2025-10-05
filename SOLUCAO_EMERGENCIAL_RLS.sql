-- =====================================================
-- SOLUÇÃO EMERGENCIAL - DESABILITAR RLS TEMPORARIAMENTE
-- ⚠️ ATENÇÃO: Use apenas para desenvolvimento/testes
-- ⚠️ NÃO USE EM PRODUÇÃO sem entender as implicações
-- =====================================================

-- Esta solução desabilita RLS temporariamente para permitir
-- que você acesse os dados enquanto aplica o fix definitivo

-- ============================================
-- OPÇÃO 1: DESABILITAR RLS EM TABELAS ESPECÍFICAS
-- ============================================

-- Desabilita RLS nas tabelas de itens
ALTER TABLE public.camara_fria_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.camara_refrigerada_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_seco_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bebidas_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.descartaveis_items DISABLE ROW LEVEL SECURITY;

-- Desabilita RLS nas tabelas de organizações
ALTER TABLE public.organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Desabilita RLS nos alertas
ALTER TABLE public.expiry_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configurations DISABLE ROW LEVEL SECURITY;

-- Desabilita RLS nos históricos
ALTER TABLE public.camara_fria_historico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.camara_refrigerada_historico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_seco_historico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.descartaveis_historico DISABLE ROW LEVEL SECURITY;

-- ============================================
-- MENSAGEM
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE '⚠️  RLS DESABILITADO TEMPORARIAMENTE';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'O que isso significa:';
    RAISE NOTICE '  - Todos os usuários autenticados veem TODOS os dados';
    RAISE NOTICE '  - Não há mais isolamento entre organizações';
    RAISE NOTICE '  - O erro 42P17 deve desaparecer';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE:';
    RAISE NOTICE '  - Use apenas para desenvolvimento/testes';
    RAISE NOTICE '  - Aplique o FIX_RLS_RECURSION.sql o mais rápido possível';
    RAISE NOTICE '';
    RAISE NOTICE 'Para reativar RLS corretamente:';
    RAISE NOTICE '  1. Execute: FIX_RLS_RECURSION.sql';
    RAISE NOTICE '  2. RLS será reabilitado automaticamente';
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
END $$;

-- ============================================
-- PARA REABILITAR RLS (após aplicar o fix correto)
-- ============================================

/*
-- Descomente e execute após aplicar FIX_RLS_RECURSION.sql:

ALTER TABLE public.camara_fria_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camara_refrigerada_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_seco_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bebidas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descartaveis_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expiry_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camara_fria_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camara_refrigerada_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_seco_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descartaveis_historico ENABLE ROW LEVEL SECURITY;
*/
