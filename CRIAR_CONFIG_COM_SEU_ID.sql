-- ============================================================================
-- CRIAR CONFIGURAÇÃO DE ALERTAS - VERSÃO CORRIGIDA
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================================

-- PASSO 1: Verificar se você está autenticado
SELECT 
    auth.uid() as seu_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ VOCÊ NÃO ESTÁ AUTENTICADO! Faça login primeiro.'
        ELSE '✅ Autenticado com sucesso!'
    END as status;

-- ============================================================================
-- Se o resultado acima mostrar NULL, você precisa:
-- 1. Ir para: Authentication → Users no Supabase Dashboard
-- 2. Copiar o UUID de um usuário existente
-- 3. Usar esse UUID no script abaixo
-- ============================================================================

-- PASSO 2: Ver todos os usuários disponíveis
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- OPÇÃO A: Se auth.uid() funcionar (você está logado no app)
-- ============================================================================

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Tentar pegar o user_id do contexto de autenticação
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE '❌ auth.uid() retornou NULL. Use a OPÇÃO B abaixo.';
    ELSE
        RAISE NOTICE '✅ User ID encontrado: %', v_user_id;
        
        -- Inserir/atualizar configuração
        INSERT INTO alert_configurations (
            user_id,
            warning_days,
            critical_days,
            notification_frequency,
            notification_time,
            notification_channels,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            30,
            7,
            'daily',
            '09:00',
            to_jsonb(ARRAY['in_app']::text[]),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET
            warning_days = 30,
            critical_days = 7,
            notification_frequency = 'daily',
            notification_time = '09:00',
            notification_channels = to_jsonb(ARRAY['in_app']::text[]),
            is_active = true,
            updated_at = NOW();
        
        RAISE NOTICE '✅ Configuração criada/atualizada com sucesso!';
    END IF;
END $$;

-- Verificar resultado
SELECT * FROM alert_configurations;

-- ============================================================================
-- OPÇÃO B: Se auth.uid() não funcionar (SQL Editor do Dashboard)
-- SUBSTITUA 'SEU-USER-ID-AQUI' pelo ID real do usuário
-- ============================================================================

-- 1. PRIMEIRO: Copie seu user_id da tabela profiles ou auth.users
SELECT id, email, full_name FROM profiles ORDER BY created_at DESC;

-- 2. DEPOIS: Cole o ID na linha abaixo (substitua 'SEU-USER-ID-AQUI')
DO $$
DECLARE
    v_user_id uuid := 'SEU-USER-ID-AQUI'::uuid;  -- ⚠️ SUBSTITUA AQUI!
BEGIN
    RAISE NOTICE 'Criando configuração para user_id: %', v_user_id;
    
    INSERT INTO alert_configurations (
        user_id,
        warning_days,
        critical_days,
        notification_frequency,
        notification_time,
        notification_channels,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        30,
        7,
        'daily',
        '09:00',
        to_jsonb(ARRAY['in_app']::text[]),
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        warning_days = 30,
        critical_days = 7,
        notification_frequency = 'daily',
        notification_time = '09:00',
        notification_channels = to_jsonb(ARRAY['in_app']::text[]),
        is_active = true,
        updated_at = NOW();
    
    RAISE NOTICE '✅ Configuração criada com sucesso!';
END $$;

-- Verificar resultado final
SELECT 
    id,
    user_id,
    warning_days,
    critical_days,
    notification_frequency,
    notification_time,
    notification_channels,
    is_active,
    created_at,
    updated_at
FROM alert_configurations
ORDER BY created_at DESC;

-- ============================================================================
-- OPÇÃO C: Criar configuração para TODOS os usuários existentes
-- ============================================================================

INSERT INTO alert_configurations (
    user_id,
    warning_days,
    critical_days,
    notification_frequency,
    notification_time,
    notification_channels,
    is_active,
    created_at,
    updated_at
)
SELECT 
    id as user_id,
    30 as warning_days,
    7 as critical_days,
    'daily' as notification_frequency,
    '09:00' as notification_time,
    to_jsonb(ARRAY['in_app']::text[]) as notification_channels,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM profiles
WHERE id NOT IN (SELECT user_id FROM alert_configurations)
ON CONFLICT (user_id) DO NOTHING;

-- Verificar quantas configurações foram criadas
SELECT 
    COUNT(*) as total_configs,
    COUNT(CASE WHEN is_active THEN 1 END) as ativas,
    COUNT(CASE WHEN NOT is_active THEN 1 END) as inativas
FROM alert_configurations;

-- Ver todas as configurações
SELECT 
    ac.id,
    p.email,
    p.full_name,
    ac.warning_days,
    ac.critical_days,
    ac.is_active
FROM alert_configurations ac
JOIN profiles p ON p.id = ac.user_id
ORDER BY p.email;

