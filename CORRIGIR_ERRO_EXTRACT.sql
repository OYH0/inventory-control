-- =====================================================
-- CORREÇÃO: Função calculate_days_until_expiry
-- Execute isso para corrigir o erro de EXTRACT
-- =====================================================

-- Remover função antiga
DROP FUNCTION IF EXISTS public.calculate_days_until_expiry(DATE);

-- Criar função corrigida
CREATE OR REPLACE FUNCTION public.calculate_days_until_expiry(expiry_date DATE)
RETURNS INTEGER AS $$
BEGIN
    -- Correção: usar simples subtração de datas que retorna INTEGER
    RETURN (expiry_date - CURRENT_DATE);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Testar a função
SELECT calculate_days_until_expiry(CURRENT_DATE + 5) as teste_5_dias;
SELECT calculate_days_until_expiry(CURRENT_DATE - 2) as teste_vencido;

-- Agora tente gerar os alertas novamente
SELECT * FROM generate_expiry_alerts();

