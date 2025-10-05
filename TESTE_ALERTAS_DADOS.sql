-- =====================================================
-- SCRIPT DE TESTE: Adicionar Produtos com Vencimento
-- Para testar o Sistema de Alertas de Vencimento
-- =====================================================

-- IMPORTANTE: Substitua 'SEU_USER_ID' pelo seu ID de usuário
-- Para descobrir seu user_id, execute: SELECT auth.uid();

-- ========================================================
-- 1. PRODUTOS COM VENCIMENTO CRÍTICO (próximos 7 dias)
-- ========================================================

-- Bebida vencendo em 3 dias (CRÍTICO)
INSERT INTO bebidas_items (
    nome,
    quantidade,
    unidade,
    categoria,
    data_validade,
    user_id,
    unidade_item,
    minimo,
    preco_unitario,
    fornecedor,
    batch_number,
    alert_threshold_days
) VALUES (
    'Coca-Cola 2L',
    50,
    'un',
    'Refrigerantes',
    CURRENT_DATE + INTERVAL '3 days',
    auth.uid(), -- Usa o usuário atual
    'juazeiro_norte',
    20,
    8.50,
    'Coca-Cola Company',
    'L2025-001',
    30
);

-- Carne vencendo em 5 dias (CRÍTICO)
INSERT INTO camara_fria_items (
    nome,
    quantidade,
    categoria,
    data_validade,
    user_id,
    unidade,
    minimo,
    preco_unitario,
    fornecedor,
    batch_number,
    temperatura_ideal,
    alert_threshold_days
) VALUES (
    'Picanha Angus',
    15,
    'Carnes',
    CURRENT_DATE + INTERVAL '5 days',
    auth.uid(),
    'juazeiro_norte',
    5,
    89.90,
    'Friboi',
    'CARNE-2025-001',
    -18,
    30
);

-- ========================================================
-- 2. PRODUTOS COM VENCIMENTO ALTO (8-15 dias)
-- ========================================================

-- Bebida vencendo em 10 dias (ALTO)
INSERT INTO bebidas_items (
    nome,
    quantidade,
    unidade,
    categoria,
    data_validade,
    user_id,
    unidade_item,
    minimo,
    preco_unitario,
    fornecedor,
    batch_number
) VALUES (
    'Suco de Laranja Natural',
    30,
    'un',
    'Sucos',
    CURRENT_DATE + INTERVAL '10 days',
    auth.uid(),
    'fortaleza',
    15,
    12.90,
    'Del Valle',
    'SUCO-2025-002',
    30
);

-- Carne vencendo em 12 dias (ALTO)
INSERT INTO camara_fria_items (
    nome,
    quantidade,
    categoria,
    data_validade,
    user_id,
    unidade,
    minimo,
    preco_unitario,
    fornecedor,
    batch_number,
    temperatura_ideal
) VALUES (
    'Frango Inteiro Congelado',
    25,
    'Aves',
    CURRENT_DATE + INTERVAL '12 days',
    auth.uid(),
    'juazeiro_norte',
    10,
    18.90,
    'Seara',
    'FRANGO-2025-003',
    -18
);

-- ========================================================
-- 3. PRODUTOS COM VENCIMENTO MÉDIO (16-30 dias)
-- ========================================================

-- Bebida vencendo em 20 dias (MÉDIO)
INSERT INTO bebidas_items (
    nome,
    quantidade,
    unidade,
    categoria,
    data_validade,
    user_id,
    unidade_item,
    minimo,
    preco_unitario,
    fornecedor
) VALUES (
    'Água Mineral 500ml',
    100,
    'un',
    'Água',
    CURRENT_DATE + INTERVAL '20 days',
    auth.uid(),
    'juazeiro_norte',
    50,
    2.50,
    'Crystal'
);

-- ========================================================
-- 4. PRODUTO JÁ VENCIDO (para teste de alertas expirados)
-- ========================================================

-- Bebida vencida há 2 dias (EXPIRADO)
INSERT INTO bebidas_items (
    nome,
    quantidade,
    unidade,
    categoria,
    data_validade,
    user_id,
    unidade_item,
    minimo,
    preco_unitario,
    fornecedor,
    batch_number
) VALUES (
    'Leite Integral 1L',
    5,
    'un',
    'Laticínios',
    CURRENT_DATE - INTERVAL '2 days',
    auth.uid(),
    'fortaleza',
    10,
    5.50,
    'Itambé',
    'LEITE-VENCIDO-001'
);

-- ========================================================
-- 5. GERAR ALERTAS PARA OS PRODUTOS INSERIDOS
-- ========================================================

SELECT * FROM generate_expiry_alerts();

-- ========================================================
-- 6. VERIFICAR ALERTAS CRIADOS
-- ========================================================

SELECT 
    id,
    item_name,
    alert_type,
    priority,
    days_until_expiry,
    quantity,
    estimated_value,
    location,
    created_at
FROM expiry_alerts
ORDER BY priority DESC, days_until_expiry ASC;

-- ========================================================
-- COMANDOS ÚTEIS PARA TESTES
-- ========================================================

-- Ver estatísticas do dashboard:
-- SELECT * FROM expiry_alerts_dashboard;

-- Ver todos os alertas ativos:
-- SELECT * FROM expiry_alerts WHERE status != 'dismissed';

-- Ver produtos com validade definida:
-- SELECT nome, data_validade, quantidade FROM bebidas_items WHERE data_validade IS NOT NULL;
-- SELECT nome, data_validade, quantidade FROM camara_fria_items WHERE data_validade IS NOT NULL;

-- Limpar todos os alertas (se quiser recomeçar):
-- DELETE FROM expiry_alerts;

-- Limpar produtos de teste:
-- DELETE FROM bebidas_items WHERE batch_number LIKE '%2025%';
-- DELETE FROM camara_fria_items WHERE batch_number LIKE '%2025%';

