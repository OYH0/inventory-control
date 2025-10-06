-- ============================================
-- DIAGNÓSTICO COMPLETO DO SUPABASE
-- ============================================

\echo '================================================'
\echo '🔍 DIAGNÓSTICO COMPLETO DO BANCO DE DADOS'
\echo '================================================'
\echo ''

-- ============================================
-- 1. INFORMAÇÕES GERAIS
-- ============================================
\echo '1️⃣ INFORMAÇÕES GERAIS'
\echo '-------------------'

SELECT 
  current_database() as "Banco de Dados",
  current_user as "Usuário Atual",
  inet_server_addr() as "IP Servidor",
  version() as "Versão PostgreSQL";

\echo ''

-- ============================================
-- 2. LISTAR TODAS AS TABELAS
-- ============================================
\echo '2️⃣ TABELAS DO SCHEMA PUBLIC'
\echo '-------------------'

SELECT 
  schemaname as "Schema",
  tablename as "Tabela",
  tableowner as "Proprietário",
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "Tamanho"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''

-- ============================================
-- 3. VERIFICAR RLS (ROW LEVEL SECURITY)
-- ============================================
\echo '3️⃣ STATUS DO RLS (Row Level Security)'
\echo '-------------------'

SELECT 
  schemaname as "Schema",
  tablename as "Tabela",
  CASE WHEN rowsecurity THEN '✅ HABILITADO' ELSE '❌ DESABILITADO' END as "RLS Status"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''

-- ============================================
-- 4. POLÍTICAS RLS POR TABELA
-- ============================================
\echo '4️⃣ POLÍTICAS RLS CONFIGURADAS'
\echo '-------------------'

SELECT 
  schemaname as "Schema",
  tablename as "Tabela",
  policyname as "Nome da Política",
  cmd as "Comando",
  CASE 
    WHEN qual IS NOT NULL THEN 'Com USING'
    ELSE 'Sem USING'
  END as "Status",
  roles as "Roles"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

\echo ''

-- ============================================
-- 5. CONTAGEM DE REGISTROS
-- ============================================
\echo '5️⃣ CONTAGEM DE REGISTROS POR TABELA'
\echo '-------------------'

DO $$
DECLARE
  r RECORD;
  v_count INTEGER;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE '%_old%'
    ORDER BY tablename
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', r.tablename) INTO v_count;
      RAISE NOTICE '📊 % : % registros', rpad(r.tablename, 40), v_count;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ % : Erro ao contar', r.tablename;
    END;
  END LOOP;
END $$;

\echo ''

-- ============================================
-- 6. VERIFICAR CAMPOS ABC
-- ============================================
\echo '6️⃣ CAMPOS DE ANÁLISE ABC'
\echo '-------------------'

-- Câmara Fria
SELECT 
  'camara_fria_items' as "Tabela",
  COUNT(*) as "Total de Itens",
  COUNT(unit_cost) as "Com Custo Unitário",
  COUNT(annual_demand) as "Com Demanda Anual",
  COUNT(ordering_cost) as "Com Custo de Pedido",
  COUNT(carrying_cost_percentage) as "Com % Custo Manutenção",
  COUNT(lead_time_days) as "Com Lead Time",
  COUNT(abc_category) as "Com Categoria ABC"
FROM camara_fria_items
UNION ALL
-- Bebidas
SELECT 
  'bebidas_items',
  COUNT(*),
  COUNT(unit_cost),
  COUNT(annual_demand),
  COUNT(ordering_cost),
  COUNT(carrying_cost_percentage),
  COUNT(lead_time_days),
  COUNT(abc_category)
FROM bebidas_items
UNION ALL
-- Estoque Seco
SELECT 
  'estoque_seco_items',
  COUNT(*),
  COUNT(unit_cost),
  COUNT(annual_demand),
  COUNT(ordering_cost),
  COUNT(carrying_cost_percentage),
  COUNT(lead_time_days),
  COUNT(abc_category)
FROM estoque_seco_items
UNION ALL
-- Descartáveis
SELECT 
  'descartaveis_items',
  COUNT(*),
  COUNT(unit_cost),
  COUNT(annual_demand),
  COUNT(ordering_cost),
  COUNT(carrying_cost_percentage),
  COUNT(lead_time_days),
  COUNT(abc_category)
FROM descartaveis_items;

\echo ''

-- ============================================
-- 7. VERIFICAR ÍNDICES
-- ============================================
\echo '7️⃣ ÍNDICES CRIADOS'
\echo '-------------------'

SELECT 
  schemaname as "Schema",
  tablename as "Tabela",
  indexname as "Nome do Índice",
  indexdef as "Definição"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''

-- ============================================
-- 8. VERIFICAR TRIGGERS
-- ============================================
\echo '8️⃣ TRIGGERS CONFIGURADOS'
\echo '-------------------'

SELECT 
  trigger_schema as "Schema",
  event_object_table as "Tabela",
  trigger_name as "Nome do Trigger",
  event_manipulation as "Evento",
  action_timing as "Timing"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

\echo ''

-- ============================================
-- 9. VERIFICAR FOREIGN KEYS
-- ============================================
\echo '9️⃣ FOREIGN KEYS'
\echo '-------------------'

SELECT
  tc.table_name as "Tabela",
  kcu.column_name as "Coluna",
  ccu.table_name AS "Tabela Referenciada",
  ccu.column_name AS "Coluna Referenciada",
  tc.constraint_name as "Nome da Constraint"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

\echo ''

-- ============================================
-- 10. VERIFICAR FUNÇÕES CUSTOMIZADAS
-- ============================================
\echo '🔟 FUNÇÕES CUSTOMIZADAS'
\echo '-------------------'

SELECT 
  routine_schema as "Schema",
  routine_name as "Nome da Função",
  routine_type as "Tipo",
  data_type as "Retorno"
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

\echo ''

-- ============================================
-- 11. VERIFICAR HISTÓRICO
-- ============================================
\echo '1️⃣1️⃣ TABELAS DE HISTÓRICO'
\echo '-------------------'

SELECT 
  'camara_fria_historico' as "Tabela",
  COUNT(*) as "Total de Registros",
  COUNT(DISTINCT tipo) as "Tipos Diferentes",
  COUNT(DISTINCT user_id) as "Usuários Diferentes",
  MIN(created_at) as "Primeiro Registro",
  MAX(created_at) as "Último Registro"
FROM camara_fria_historico
WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'camara_fria_historico')
UNION ALL
SELECT 
  'bebidas_historico',
  COUNT(*),
  COUNT(DISTINCT tipo),
  COUNT(DISTINCT user_id),
  MIN(created_at),
  MAX(created_at)
FROM bebidas_historico
WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bebidas_historico')
UNION ALL
SELECT 
  'estoque_seco_historico',
  COUNT(*),
  COUNT(DISTINCT tipo),
  COUNT(DISTINCT user_id),
  MIN(created_at),
  MAX(created_at)
FROM estoque_seco_historico
WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'estoque_seco_historico');

\echo ''

-- ============================================
-- 12. VERIFICAR ALERTAS
-- ============================================
\echo '1️⃣2️⃣ CONFIGURAÇÕES DE ALERTAS'
\echo '-------------------'

SELECT 
  id,
  user_id,
  days_before_expiry as "Dias Antes Vencimento",
  CASE WHEN enabled THEN '✅ Ativo' ELSE '❌ Inativo' END as "Status",
  created_at as "Criado em",
  updated_at as "Atualizado em"
FROM expiry_alert_configs
ORDER BY created_at DESC
LIMIT 10;

\echo ''

-- ============================================
-- 13. VERIFICAR PRODUTOS VENCENDO
-- ============================================
\echo '1️⃣3️⃣ PRODUTOS PRÓXIMOS AO VENCIMENTO'
\echo '-------------------'

-- Câmara Fria
SELECT 
  'camara_fria' as "Origem",
  nome as "Produto",
  data_validade as "Validade",
  (data_validade - CURRENT_DATE) as "Dias Restantes"
FROM camara_fria_items
WHERE data_validade IS NOT NULL
  AND data_validade BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY data_validade
LIMIT 5;

\echo ''

-- ============================================
-- 14. VERIFICAR PEDIDOS
-- ============================================
\echo '1️⃣4️⃣ SISTEMA DE PEDIDOS'
\echo '-------------------'

SELECT 
  COUNT(*) as "Total de Pedidos",
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as "Pendentes",
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as "Aprovados",
  COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as "Em Trânsito",
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as "Entregues",
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as "Cancelados",
  SUM(total_cost) as "Valor Total"
FROM orders
WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'orders');

\echo ''

-- ============================================
-- 15. VERIFICAR USUÁRIOS
-- ============================================
\echo '1️⃣5️⃣ ESTATÍSTICAS DE USUÁRIOS'
\echo '-------------------'

SELECT 
  COUNT(DISTINCT user_id) as "Total de Usuários Únicos"
FROM camara_fria_items;

\echo ''

-- ============================================
-- 16. VERIFICAR ERROS COMUNS
-- ============================================
\echo '1️⃣6️⃣ VERIFICAÇÃO DE ERROS COMUNS'
\echo '-------------------'

-- Verificar produtos sem unidade
SELECT 
  'Produtos sem unidade' as "Possível Erro",
  COUNT(*) as "Quantidade"
FROM (
  SELECT id FROM camara_fria_items WHERE unidade IS NULL OR unidade = ''
  UNION ALL
  SELECT id FROM bebidas_items WHERE unidade IS NULL OR unidade = ''
  UNION ALL
  SELECT id FROM estoque_seco_items WHERE unidade IS NULL OR unidade = ''
) sub;

-- Verificar produtos com quantidade negativa
SELECT 
  'Produtos com quantidade negativa' as "Possível Erro",
  COUNT(*) as "Quantidade"
FROM (
  SELECT id FROM camara_fria_items WHERE quantidade < 0
  UNION ALL
  SELECT id FROM bebidas_items WHERE quantidade < 0
  UNION ALL
  SELECT id FROM estoque_seco_items WHERE quantidade < 0
) sub;

-- Verificar produtos sem nome
SELECT 
  'Produtos sem nome' as "Possível Erro",
  COUNT(*) as "Quantidade"
FROM (
  SELECT id FROM camara_fria_items WHERE nome IS NULL OR nome = ''
  UNION ALL
  SELECT id FROM bebidas_items WHERE nome IS NULL OR nome = ''
  UNION ALL
  SELECT id FROM estoque_seco_items WHERE nome IS NULL OR nome = ''
) sub;

\echo ''
\echo '================================================'
\echo '✅ DIAGNÓSTICO COMPLETO FINALIZADO'
\echo '================================================'

