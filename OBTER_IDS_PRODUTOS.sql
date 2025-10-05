-- =====================================================
-- OBTER IDS DE PRODUTOS PARA PEDIDOS
-- Execute este SQL no SQL Editor do Supabase
-- =====================================================

-- ============================================
-- PRODUTOS DO ESTOQUE SECO
-- ============================================
SELECT 
  id,
  nome,
  quantidade,
  unidade,
  preco_unitario,
  categoria
FROM estoque_seco_items 
WHERE organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid()
  LIMIT 1
)
AND quantidade > 0
ORDER BY nome
LIMIT 20;

-- ============================================
-- PRODUTOS DA CÂMARA FRIA
-- ============================================
-- Descomente se quiser ver produtos da câmara fria:
/*
SELECT 
  id,
  nome,
  quantidade,
  unidade,
  preco_unitario,
  categoria
FROM camara_fria_items 
WHERE organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid()
  LIMIT 1
)
AND quantidade > 0
ORDER BY nome
LIMIT 20;
*/

-- ============================================
-- PRODUTOS DA CÂMARA REFRIGERADA
-- ============================================
-- Descomente se quiser ver produtos da câmara refrigerada:
/*
SELECT 
  id,
  nome,
  quantidade,
  unidade,
  preco_unitario,
  categoria
FROM camara_refrigerada_items 
WHERE organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid()
  LIMIT 1
)
AND quantidade > 0
ORDER BY nome
LIMIT 20;
*/

-- ============================================
-- BEBIDAS
-- ============================================
-- Descomente se quiser ver bebidas:
/*
SELECT 
  id,
  nome,
  quantidade,
  unidade,
  preco_unitario,
  categoria
FROM bebidas_items 
WHERE organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid()
  LIMIT 1
)
AND quantidade > 0
ORDER BY nome
LIMIT 20;
*/

-- ============================================
-- DESCARTÁVEIS
-- ============================================
-- Descomente se quiser ver descartáveis:
/*
SELECT 
  id,
  nome,
  quantidade,
  unidade,
  preco_unitario,
  categoria
FROM descartaveis_items 
WHERE organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid()
  LIMIT 1
)
AND quantidade > 0
ORDER BY nome
LIMIT 20;
*/

-- ============================================
-- TODOS OS PRODUTOS (CONSOLIDADO)
-- ============================================
-- Descomente para ver todos os produtos de todas as tabelas:
/*
SELECT 
  'estoque_seco_items' as tabela,
  id,
  nome,
  quantidade,
  preco_unitario
FROM estoque_seco_items 
WHERE organization_id = (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() LIMIT 1)

UNION ALL

SELECT 
  'camara_fria_items' as tabela,
  id,
  nome,
  quantidade,
  preco_unitario
FROM camara_fria_items 
WHERE organization_id = (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() LIMIT 1)

UNION ALL

SELECT 
  'camara_refrigerada_items' as tabela,
  id,
  nome,
  quantidade,
  preco_unitario
FROM camara_refrigerada_items 
WHERE organization_id = (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() LIMIT 1)

UNION ALL

SELECT 
  'bebidas_items' as tabela,
  id,
  nome,
  quantidade,
  preco_unitario
FROM bebidas_items 
WHERE organization_id = (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() LIMIT 1)

UNION ALL

SELECT 
  'descartaveis_items' as tabela,
  id,
  nome,
  quantidade,
  preco_unitario
FROM descartaveis_items 
WHERE organization_id = (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() LIMIT 1)

ORDER BY nome
LIMIT 50;
*/

-- ============================================
-- INSTRUÇÕES
-- ============================================
-- 1. Copie o UUID da coluna "id" de um produto
-- 2. No formulário de criar pedido, cole o UUID no campo "ID do Item"
-- 3. Formato esperado: 12345678-1234-1234-1234-123456789012

