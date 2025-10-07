-- ============================================
-- SETUP: Painel de Administração Master
-- Views e permissões para admins visualizarem tudo
-- ============================================

-- Dropar views existentes primeiro
DROP VIEW IF EXISTS public.admin_all_organizations CASCADE;
DROP VIEW IF EXISTS public.admin_all_members CASCADE;
DROP VIEW IF EXISTS public.admin_all_users CASCADE;
DROP VIEW IF EXISTS public.admin_global_stats CASCADE;

-- 1. View para organizações (bypass RLS)
CREATE VIEW public.admin_all_organizations AS
SELECT 
  o.*,
  p.full_name as owner_name,
  p.email as owner_email,
  (SELECT COUNT(*) 
   FROM organization_members 
   WHERE organization_id = o.id AND is_active = true) as member_count,
  (SELECT COUNT(*) FROM camara_fria_items WHERE organization_id = o.id) +
  (SELECT COUNT(*) FROM camara_refrigerada_items WHERE organization_id = o.id) +
  (SELECT COUNT(*) FROM estoque_seco_items WHERE organization_id = o.id) +
  (SELECT COUNT(*) FROM bebidas_items WHERE organization_id = o.id) +
  (SELECT COUNT(*) FROM descartaveis_items WHERE organization_id = o.id) as total_items
FROM public.organizations o
LEFT JOIN public.profiles p ON p.id = o.owner_id;

-- 2. View para membros de organizações (bypass RLS)
CREATE VIEW public.admin_all_members AS
SELECT 
  om.*,
  o.name as org_name,
  o.slug as org_slug,
  p.full_name as user_name,
  p.email as user_email,
  p.user_type
FROM public.organization_members om
JOIN public.organizations o ON o.id = om.organization_id
JOIN public.profiles p ON p.id = om.user_id;

-- 3. View para usuários com estatísticas
CREATE VIEW public.admin_all_users AS
SELECT 
  p.*,
  (SELECT COUNT(DISTINCT organization_id) 
   FROM organization_members 
   WHERE user_id = p.id AND is_active = true) as org_count,
  (SELECT array_agg(DISTINCT o.name) 
   FROM organization_members om
   JOIN organizations o ON o.id = om.organization_id
   WHERE om.user_id = p.id AND om.is_active = true) as organizations
FROM public.profiles p;

-- 4. View para estatísticas globais
CREATE VIEW public.admin_global_stats AS
SELECT 
  (SELECT COUNT(*) FROM organizations WHERE is_active = true AND deleted_at IS NULL) as active_orgs,
  (SELECT COUNT(*) FROM organizations WHERE deleted_at IS NULL) as total_orgs,
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(DISTINCT user_id) FROM organization_members WHERE is_active = true) as active_users,
  (SELECT COUNT(*) FROM camara_fria_items) as camara_fria_count,
  (SELECT COUNT(*) FROM camara_refrigerada_items) as camara_refrigerada_count,
  (SELECT COUNT(*) FROM estoque_seco_items) as estoque_seco_count,
  (SELECT COUNT(*) FROM bebidas_items) as bebidas_count,
  (SELECT COUNT(*) FROM descartaveis_items) as descartaveis_count,
  (SELECT COUNT(*) FROM orders) as total_orders;

-- 5. Dar permissões para authenticated users (o código verificará se é admin)
GRANT SELECT ON public.admin_all_organizations TO authenticated;
GRANT SELECT ON public.admin_all_members TO authenticated;
GRANT SELECT ON public.admin_all_users TO authenticated;
GRANT SELECT ON public.admin_global_stats TO authenticated;

-- 6. Função helper para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_master_admin(user_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id_param 
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

