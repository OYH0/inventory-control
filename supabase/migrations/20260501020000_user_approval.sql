-- =====================================================================
-- Fluxo de aprovação de cadastros.
-- Novos usuários ficam is_approved = false até master/admin aprovar.
-- Backfill: todos os usuários existentes são marcados como aprovados,
-- e qualquer master é sempre considerado aprovado.
-- =====================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_is_approved_idx
  ON public.profiles (is_approved)
  WHERE is_approved = false;

-- Backfill: tudo que já existe = aprovado.
UPDATE public.profiles SET is_approved = true WHERE is_approved = false;

-- Garante que master sempre é aprovado.
UPDATE public.profiles SET is_approved = true WHERE is_master = true;

COMMENT ON COLUMN public.profiles.is_approved IS
  'Cadastros novos ficam false até master/admin aprovar pelo painel. Bloqueia o acesso à aplicação no frontend (ProtectedRoute) e nada além de leitura do próprio profile.';
