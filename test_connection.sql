-- Teste de Conexão com Supabase
-- Lista todas as tabelas e contagem de registros

\echo '=== TESTE DE CONEXÃO SUPABASE ==='
\echo ''

-- Informações do banco
SELECT 
  current_database() as banco,
  current_user as usuario,
  version() as versao_postgres;

\echo ''
\echo '=== TABELAS DISPONÍVEIS ==='
\echo ''

-- Listar tabelas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo '=== CONTAGEM DE REGISTROS POR TABELA ==='
\echo ''

-- Contar registros em cada tabela
SELECT 
  'camara_fria_items' as tabela,
  COUNT(*) as total
FROM camara_fria_items
UNION ALL
SELECT 
  'bebidas_items',
  COUNT(*)
FROM bebidas_items
UNION ALL
SELECT 
  'estoque_seco_items',
  COUNT(*)
FROM estoque_seco_items
UNION ALL
SELECT 
  'descartaveis_items',
  COUNT(*)
FROM descartaveis_items
UNION ALL
SELECT 
  'camara_refrigerada_items',
  COUNT(*)
FROM camara_refrigerada_items
ORDER BY tabela;

\echo ''
\echo '=== PRODUTOS COM ANÁLISE ABC ==='
\echo ''

-- Ver produtos com campos ABC preenchidos
SELECT 
  'camara_fria' as origem,
  COUNT(*) FILTER (WHERE unit_cost IS NOT NULL) as com_custo,
  COUNT(*) FILTER (WHERE annual_demand IS NOT NULL) as com_demanda,
  COUNT(*) FILTER (WHERE abc_category IS NOT NULL) as classificados
FROM camara_fria_items
UNION ALL
SELECT 
  'bebidas',
  COUNT(*) FILTER (WHERE unit_cost IS NOT NULL),
  COUNT(*) FILTER (WHERE annual_demand IS NOT NULL),
  COUNT(*) FILTER (WHERE abc_category IS NOT NULL)
FROM bebidas_items;

\echo ''
\echo '=== TESTE CONCLUÍDO ✅ ==='

