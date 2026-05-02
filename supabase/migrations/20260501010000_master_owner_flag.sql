-- =====================================================================
-- Bandeira MASTER (dono) — bypass de restrições de unidade
--
-- 1. Adiciona coluna `is_master` em profiles.
-- 2. Cria função `is_master()` que retorna true se o user atual é master.
-- 3. Atualiza `user_can_access_unit()` para retornar true se is_master().
-- 4. Auto-marca o email oyh013@gmail.com como master (apenas se ainda não há).
--
-- Idempotente.
-- =====================================================================

-- 1) Coluna is_master
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_master boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_is_master_idx
  ON public.profiles (is_master)
  WHERE is_master = true;

-- 2) Função is_master() — usuário autenticado tem flag master?
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_master = true
  );
END;
$$;

-- 3) Atualiza user_can_access_unit para considerar is_master
CREATE OR REPLACE FUNCTION public.user_can_access_unit(p_unidade text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Master ignora todas as restrições.
  IF public.is_master() THEN
    RETURN true;
  END IF;

  -- Admin ainda tem acesso amplo (mas agora respeita unidade_responsavel via frontend).
  IF public.is_admin() THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_unit_permissions
    WHERE user_id = auth.uid()
      AND unidade::text = p_unidade
      AND can_view = true
  );
END;
$$;

-- 4) Auto-claim para o dono inicial (oyh013@gmail.com)
--    Roda apenas se ainda não houver nenhum master no sistema.
DO $$
DECLARE
  v_master_count integer;
  v_owner_id uuid;
BEGIN
  SELECT COUNT(*) INTO v_master_count FROM public.profiles WHERE is_master = true;

  IF v_master_count = 0 THEN
    SELECT id INTO v_owner_id
    FROM public.profiles
    WHERE email = 'oyh013@gmail.com'
    LIMIT 1;

    IF v_owner_id IS NOT NULL THEN
      UPDATE public.profiles
      SET is_master = true,
          user_type = 'admin'
      WHERE id = v_owner_id;
      RAISE NOTICE 'Master flag claimed by oyh013@gmail.com (id=%)', v_owner_id;
    ELSE
      RAISE NOTICE 'Profile com email oyh013@gmail.com não encontrado — marque manualmente: UPDATE profiles SET is_master=true WHERE email=''<email>'';';
    END IF;
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.is_master IS
  'Flag MASTER: usuário com bypass total das regras de isolamento por unidade. Apenas outro master pode marcar/desmarcar. Não pode ser deletado pelo painel.';

COMMENT ON FUNCTION public.is_master() IS
  'Retorna true se o usuário autenticado tem profiles.is_master = true.';
