-- =====================================================
-- APLICAR APENAS MIGRATION ABC
-- Execute este SQL no SQL Editor do Supabase
-- =====================================================

-- ============================================
-- FUNÇÃO: Calcular annual_consumption_value
-- ============================================

CREATE OR REPLACE FUNCTION calculate_annual_consumption_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular annual_consumption_value se unit_cost e annual_demand existirem
  IF NEW.unit_cost IS NOT NULL AND NEW.annual_demand IS NOT NULL THEN
    NEW.annual_consumption_value := NEW.unit_cost * NEW.annual_demand;
  ELSE
    NEW.annual_consumption_value := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS: Aplicar em todas as tabelas
-- ============================================

-- Câmara Fria
DROP TRIGGER IF EXISTS trigger_calculate_abc_camara_fria ON camara_fria_items;
CREATE TRIGGER trigger_calculate_abc_camara_fria
  BEFORE INSERT OR UPDATE OF unit_cost, annual_demand
  ON camara_fria_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_annual_consumption_value();

-- Câmara Refrigerada
DROP TRIGGER IF EXISTS trigger_calculate_abc_camara_refrigerada ON camara_refrigerada_items;
CREATE TRIGGER trigger_calculate_abc_camara_refrigerada
  BEFORE INSERT OR UPDATE OF unit_cost, annual_demand
  ON camara_refrigerada_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_annual_consumption_value();

-- Estoque Seco
DROP TRIGGER IF EXISTS trigger_calculate_abc_estoque_seco ON estoque_seco_items;
CREATE TRIGGER trigger_calculate_abc_estoque_seco
  BEFORE INSERT OR UPDATE OF unit_cost, annual_demand
  ON estoque_seco_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_annual_consumption_value();

-- Bebidas
DROP TRIGGER IF EXISTS trigger_calculate_abc_bebidas ON bebidas_items;
CREATE TRIGGER trigger_calculate_abc_bebidas
  BEFORE INSERT OR UPDATE OF unit_cost, annual_demand
  ON bebidas_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_annual_consumption_value();

-- Descartáveis
DROP TRIGGER IF EXISTS trigger_calculate_abc_descartaveis ON descartaveis_items;
CREATE TRIGGER trigger_calculate_abc_descartaveis
  BEFORE INSERT OR UPDATE OF unit_cost, annual_demand
  ON descartaveis_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_annual_consumption_value();

-- ============================================
-- ATUALIZAR PRODUTOS EXISTENTES
-- ============================================

-- Atualizar produtos que já têm unit_cost e annual_demand mas não têm annual_consumption_value
UPDATE camara_fria_items
SET annual_consumption_value = unit_cost * annual_demand
WHERE unit_cost IS NOT NULL 
  AND annual_demand IS NOT NULL 
  AND (annual_consumption_value IS NULL OR annual_consumption_value = 0);

UPDATE camara_refrigerada_items
SET annual_consumption_value = unit_cost * annual_demand
WHERE unit_cost IS NOT NULL 
  AND annual_demand IS NOT NULL 
  AND (annual_consumption_value IS NULL OR annual_consumption_value = 0);

UPDATE estoque_seco_items
SET annual_consumption_value = unit_cost * annual_demand
WHERE unit_cost IS NOT NULL 
  AND annual_demand IS NOT NULL 
  AND (annual_consumption_value IS NULL OR annual_consumption_value = 0);

UPDATE bebidas_items
SET annual_consumption_value = unit_cost * annual_demand
WHERE unit_cost IS NOT NULL 
  AND annual_demand IS NOT NULL 
  AND (annual_consumption_value IS NULL OR annual_consumption_value = 0);

UPDATE descartaveis_items
SET annual_consumption_value = unit_cost * annual_demand
WHERE unit_cost IS NOT NULL 
  AND annual_demand IS NOT NULL 
  AND (annual_consumption_value IS NULL OR annual_consumption_value = 0);

-- ============================================
-- VERIFICAR RESULTADOS
-- ============================================

-- Ver quantos produtos foram atualizados
SELECT 
  'camara_fria_items' as tabela,
  COUNT(*) as produtos_com_abc
FROM camara_fria_items
WHERE annual_consumption_value > 0

UNION ALL

SELECT 
  'camara_refrigerada_items',
  COUNT(*)
FROM camara_refrigerada_items
WHERE annual_consumption_value > 0

UNION ALL

SELECT 
  'estoque_seco_items',
  COUNT(*)
FROM estoque_seco_items
WHERE annual_consumption_value > 0

UNION ALL

SELECT 
  'bebidas_items',
  COUNT(*)
FROM bebidas_items
WHERE annual_consumption_value > 0

UNION ALL

SELECT 
  'descartaveis_items',
  COUNT(*)
FROM descartaveis_items
WHERE annual_consumption_value > 0;
