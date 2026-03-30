
-- Inserir perfis faltantes para usuários existentes no auth.users
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data ->> 'full_name', u.email)
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
