-- ============================================================================
-- VERIFICAÇÃO E CORREÇÃO DA TABELA alert_configurations
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'alert_configurations'
) as tabela_existe;

-- 2. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'alert_configurations'
ORDER BY ordinal_position;

-- 3. VERIFICAR POLÍTICAS RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'alert_configurations';

-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'alert_configurations';

-- 5. TESTAR INSERÇÃO (apenas teste - não comita)
BEGIN;
    INSERT INTO alert_configurations (
        user_id,
        warning_days,
        critical_days,
        notification_frequency,
        notification_time,
        notification_channels,
        is_active
    ) VALUES (
        auth.uid(), -- Seu user_id atual
        30,
        7,
        'daily',
        '09:00',
        to_jsonb(ARRAY['in_app']::text[]),
        true
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        warning_days = EXCLUDED.warning_days,
        critical_days = EXCLUDED.critical_days,
        updated_at = NOW();
    
    SELECT * FROM alert_configurations WHERE user_id = auth.uid();
ROLLBACK; -- Desfaz a inserção de teste

-- ============================================================================
-- SE A TABELA NÃO EXISTIR OU ESTIVER INCOMPLETA, EXECUTE:
-- ============================================================================

-- Recriar políticas RLS (se necessário)
DROP POLICY IF EXISTS "Users can view own config" ON alert_configurations;
DROP POLICY IF EXISTS "Users can insert own config" ON alert_configurations;
DROP POLICY IF EXISTS "Users can update own config" ON alert_configurations;

CREATE POLICY "Users can view own config"
    ON alert_configurations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config"
    ON alert_configurations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config"
    ON alert_configurations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Garantir que RLS está ativo
ALTER TABLE alert_configurations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CRIAR CONFIGURAÇÃO PADRÃO PARA O USUÁRIO ATUAL
-- Execute isso para criar sua configuração inicial
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
) VALUES (
    auth.uid(),
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
    updated_at = NOW();

-- Verificar se foi criado
SELECT * FROM alert_configurations WHERE user_id = auth.uid();

-- ============================================================================
-- TESTE DE ATUALIZAÇÃO
-- ============================================================================

-- Testar atualização manual
UPDATE alert_configurations
SET 
    warning_days = 45,
    critical_days = 10,
    updated_at = NOW()
WHERE user_id = auth.uid();

-- Verificar resultado
SELECT * FROM alert_configurations WHERE user_id = auth.uid();

