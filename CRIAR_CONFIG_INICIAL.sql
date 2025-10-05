-- ============================================================================
-- CRIAR CONFIGURAÇÃO INICIAL DE ALERTAS
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- Este script cria ou atualiza a configuração de alertas para o usuário atual

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
    auth.uid(),                         -- Seu user_id atual
    30,                                  -- Alertas de aviso: 30 dias antes
    7,                                   -- Alertas críticos: 7 dias antes
    'daily',                             -- Frequência: diária
    '09:00',                             -- Horário: 09:00 da manhã
    to_jsonb(ARRAY['in_app']::text[]),  -- Canais: notificações no app (JSONB)
    true,                                -- Status: ativo
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

-- Verificar se foi criado com sucesso
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
WHERE user_id = auth.uid();

-- Se o resultado acima mostrar seus dados, está FUNCIONANDO! ✅

