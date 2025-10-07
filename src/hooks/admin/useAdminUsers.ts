import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'user';
  unidade_responsavel: string | null;
  created_at: string;
  updated_at: string;
  org_count: number;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se usuário é admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profile?.user_type !== 'admin') {
        throw new Error('Acesso negado: apenas administradores');
      }

      // Buscar usuários usando a view admin
      const { data, error: fetchError } = await supabase
        .from('admin_all_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar usuários';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: 'admin' })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuário promovido a administrador');
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao promover usuário';
      toast.error(message);
      throw err;
    }
  };

  const demoteFromAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: 'user' })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Privilégios de administrador removidos');
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover privilégios';
      toast.error(message);
      throw err;
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      // Desativar em todas as organizações
      const { error } = await supabase
        .from('organization_members')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Usuário desativado em todas as organizações');
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao desativar usuário';
      toast.error(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    promoteToAdmin,
    demoteFromAdmin,
    deactivateUser,
  };
}

