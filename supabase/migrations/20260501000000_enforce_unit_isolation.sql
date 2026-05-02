-- =====================================================================
-- Reforça isolamento por unidade (juazeiro_norte / fortaleza).
-- Antes desta migration, as políticas RLS de SELECT em *_items e *_historico
-- usavam apenas `auth.uid() IS NOT NULL` — qualquer usuário autenticado lia
-- dados de TODAS as unidades.
--
-- Esta migration:
--   1. Adiciona coluna `unidade_item` em `bebidas_historico` (estava sem isolamento).
--   2. Cria função helper `user_can_access_unit(p_unidade)` baseada em
--      `user_unit_permissions` + papel admin.
--   3. Substitui todas as policies de SELECT frouxas por policies que filtram
--      pela unidade do registro.
--   4. Aplica a mesma checagem em INSERT/UPDATE/DELETE para evitar gravar
--      em unidade que o usuário não pode acessar.
--
-- Idempotente: usa IF NOT EXISTS / DROP IF EXISTS sempre que possível.
-- =====================================================================

-- 1) Coluna `unidade_item` em bebidas_historico (estava sem isolamento)
ALTER TABLE public.bebidas_historico
  ADD COLUMN IF NOT EXISTS unidade_item text
    CHECK (unidade_item IN ('juazeiro_norte', 'fortaleza'));

-- Backfill: copia user_id → unidade_responsavel do profile do dono
UPDATE public.bebidas_historico bh
SET unidade_item = p.unidade_responsavel::text
FROM public.profiles p
WHERE bh.user_id = p.id
  AND bh.unidade_item IS NULL
  AND p.unidade_responsavel IS NOT NULL;

-- 2) Função helper: usuário tem permissão de visualizar essa unidade?
CREATE OR REPLACE FUNCTION public.user_can_access_unit(p_unidade text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Sem usuário autenticado: nega.
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Admin tem acesso a tudo.
  IF public.is_admin() THEN
    RETURN true;
  END IF;

  -- Usuário comum: precisa estar em user_unit_permissions com can_view = true.
  RETURN EXISTS (
    SELECT 1
    FROM public.user_unit_permissions
    WHERE user_id = auth.uid()
      AND unidade::text = p_unidade
      AND can_view = true
  );
END;
$$;

-- 3) Substitui policies frouxas de SELECT/INSERT/UPDATE/DELETE
--    em todas as tabelas *_items e *_historico que têm coluna `unidade`.

DO $$
DECLARE
  tbl text;
  unit_col text;
  tables_unidade text[] := ARRAY[
    'camara_fria_items',
    'camara_refrigerada_items',
    'estoque_seco_items',
    'descartaveis_items',
    'camara_fria_historico',
    'camara_refrigerada_historico',
    'estoque_seco_historico',
    'descartaveis_historico'
  ];
  tables_unidade_item text[] := ARRAY[
    'bebidas_items',
    'bebidas_historico'
  ];
BEGIN
  -- Loop nas tabelas com coluna `unidade`
  FOREACH tbl IN ARRAY tables_unidade LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    -- Drop policies frouxas conhecidas (nomes variam entre migrations antigas)
    EXECUTE format('DROP POLICY IF EXISTS "Users can view all %s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "view all %I" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "select_%s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "unit_isolation_select_%s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "unit_isolation_insert_%s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "unit_isolation_update_%s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "unit_isolation_delete_%s" ON public.%I', tbl, tbl);

    -- Cria policies isoladas por unidade
    EXECUTE format($p$
      CREATE POLICY "unit_isolation_select_%s"
      ON public.%I
      FOR SELECT
      USING (public.user_can_access_unit(unidade::text))
    $p$, tbl, tbl);

    EXECUTE format($p$
      CREATE POLICY "unit_isolation_insert_%s"
      ON public.%I
      FOR INSERT
      WITH CHECK (public.user_can_access_unit(unidade::text))
    $p$, tbl, tbl);

    EXECUTE format($p$
      CREATE POLICY "unit_isolation_update_%s"
      ON public.%I
      FOR UPDATE
      USING (public.user_can_access_unit(unidade::text))
      WITH CHECK (public.user_can_access_unit(unidade::text))
    $p$, tbl, tbl);

    EXECUTE format($p$
      CREATE POLICY "unit_isolation_delete_%s"
      ON public.%I
      FOR DELETE
      USING (public.user_can_access_unit(unidade::text))
    $p$, tbl, tbl);
  END LOOP;

  -- Loop nas tabelas com coluna `unidade_item`
  FOREACH tbl IN ARRAY tables_unidade_item LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    EXECUTE format('DROP POLICY IF EXISTS "Users can view all %s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "view all %I" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "unit_isolation_select_%s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "unit_isolation_insert_%s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "unit_isolation_update_%s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "unit_isolation_delete_%s" ON public.%I', tbl, tbl);

    EXECUTE format($p$
      CREATE POLICY "unit_isolation_select_%s"
      ON public.%I
      FOR SELECT
      USING (public.user_can_access_unit(unidade_item))
    $p$, tbl, tbl);

    EXECUTE format($p$
      CREATE POLICY "unit_isolation_insert_%s"
      ON public.%I
      FOR INSERT
      WITH CHECK (public.user_can_access_unit(unidade_item))
    $p$, tbl, tbl);

    EXECUTE format($p$
      CREATE POLICY "unit_isolation_update_%s"
      ON public.%I
      FOR UPDATE
      USING (public.user_can_access_unit(unidade_item))
      WITH CHECK (public.user_can_access_unit(unidade_item))
    $p$, tbl, tbl);

    EXECUTE format($p$
      CREATE POLICY "unit_isolation_delete_%s"
      ON public.%I
      FOR DELETE
      USING (public.user_can_access_unit(unidade_item))
    $p$, tbl, tbl);
  END LOOP;
END $$;

-- 4) Garante que TODOS os registros existentes tenham unidade preenchida.
--    Linhas com unidade NULL vazariam (function retornaria false → não aparecem).
--    Backfill em duas etapas para evitar mistura de tipos enum/text:
--    a) Pega da unidade_responsavel do dono (se existir).
--    b) Fallback hardcoded para 'juazeiro_norte' nos restantes.

DO $$
DECLARE
  tbl text;
  tabelas text[] := ARRAY[
    'camara_fria_items',
    'camara_refrigerada_items',
    'estoque_seco_items',
    'descartaveis_items',
    'camara_fria_historico',
    'camara_refrigerada_historico',
    'estoque_seco_historico',
    'descartaveis_historico'
  ];
BEGIN
  FOREACH tbl IN ARRAY tabelas LOOP
    EXECUTE format(
      'UPDATE public.%I t SET unidade = p.unidade_responsavel
       FROM public.profiles p
       WHERE t.user_id = p.id AND t.unidade IS NULL AND p.unidade_responsavel IS NOT NULL',
      tbl
    );
    EXECUTE format(
      'UPDATE public.%I SET unidade = ''juazeiro_norte'' WHERE unidade IS NULL',
      tbl
    );
  END LOOP;
END $$;

UPDATE public.bebidas_items SET unidade_item = p.unidade_responsavel::text
  FROM public.profiles p
  WHERE bebidas_items.user_id = p.id AND bebidas_items.unidade_item IS NULL AND p.unidade_responsavel IS NOT NULL;
UPDATE public.bebidas_items SET unidade_item = 'juazeiro_norte' WHERE unidade_item IS NULL;

UPDATE public.bebidas_historico SET unidade_item = p.unidade_responsavel::text
  FROM public.profiles p
  WHERE bebidas_historico.user_id = p.id AND bebidas_historico.unidade_item IS NULL AND p.unidade_responsavel IS NOT NULL;
UPDATE public.bebidas_historico SET unidade_item = 'juazeiro_norte' WHERE unidade_item IS NULL;

COMMENT ON FUNCTION public.user_can_access_unit(text) IS
  'Retorna true se o usuário autenticado é admin ou tem can_view=true em user_unit_permissions para a unidade dada. Usado nas RLS policies de *_items e *_historico para isolar dados por unidade.';
