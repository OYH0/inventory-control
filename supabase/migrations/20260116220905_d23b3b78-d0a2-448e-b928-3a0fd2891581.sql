-- Criar tabela para armazenar permissões de unidade por usuário
CREATE TABLE public.user_unit_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    unidade public.unidade NOT NULL,
    can_view BOOLEAN DEFAULT true,
    can_modify BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, unidade)
);

-- Habilitar RLS
ALTER TABLE public.user_unit_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Usuários podem ver suas próprias permissões
CREATE POLICY "Users can view their own unit permissions"
ON public.user_unit_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins podem ver todas as permissões
CREATE POLICY "Admins can view all unit permissions"
ON public.user_unit_permissions
FOR SELECT
USING (public.is_admin());

-- Admins podem inserir permissões
CREATE POLICY "Admins can insert unit permissions"
ON public.user_unit_permissions
FOR INSERT
WITH CHECK (public.is_admin());

-- Admins podem atualizar permissões
CREATE POLICY "Admins can update unit permissions"
ON public.user_unit_permissions
FOR UPDATE
USING (public.is_admin());

-- Admins podem deletar permissões
CREATE POLICY "Admins can delete unit permissions"
ON public.user_unit_permissions
FOR DELETE
USING (public.is_admin());

-- Criar índice para melhor performance
CREATE INDEX idx_user_unit_permissions_user_id ON public.user_unit_permissions(user_id);

-- Função para verificar se usuário tem acesso a uma unidade
CREATE OR REPLACE FUNCTION public.user_has_unit_access(p_user_id UUID, p_unidade public.unidade)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Admins têm acesso a todas as unidades
    SELECT 1 FROM public.profiles 
    WHERE id = p_user_id AND user_type = 'admin'
  ) OR EXISTS (
    -- Ou usuário tem permissão explícita
    SELECT 1 FROM public.user_unit_permissions 
    WHERE user_id = p_user_id AND unidade = p_unidade AND can_view = true
  )
$$;

-- Função para obter unidades acessíveis por um usuário
CREATE OR REPLACE FUNCTION public.get_user_accessible_units(p_user_id UUID)
RETURNS SETOF public.unidade
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Se for admin, retorna todas as unidades
  SELECT unnest(ARRAY['juazeiro_norte', 'fortaleza']::public.unidade[])
  WHERE EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND user_type = 'admin')
  
  UNION
  
  -- Caso contrário, retorna apenas as unidades com permissão
  SELECT unidade FROM public.user_unit_permissions 
  WHERE user_id = p_user_id AND can_view = true
$$;

-- Migrar dados existentes: dar permissão da unidade_responsavel para usuários existentes
INSERT INTO public.user_unit_permissions (user_id, unidade, can_view, can_modify)
SELECT 
  id, 
  unidade_responsavel,
  true,
  CASE WHEN user_type IN ('admin', 'gerente') THEN true ELSE false END
FROM public.profiles
WHERE unidade_responsavel IS NOT NULL AND user_type != 'admin'
ON CONFLICT (user_id, unidade) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_unit_permissions_updated_at
BEFORE UPDATE ON public.user_unit_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();