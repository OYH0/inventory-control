import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  subscription_tier: string | null;
  max_users: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  member_count: number;
  total_items: number;
}

export function useAdminOrganizations() {
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
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

      // Buscar organizações usando a view admin
      const { data, error: fetchError } = await supabase
        .from('admin_all_organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setOrganizations(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar organizações';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (id: string, updates: Partial<AdminOrganization>) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Organização atualizada com sucesso');
      await fetchOrganizations();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar organização';
      toast.error(message);
      throw err;
    }
  };

  const deactivateOrganization = async (id: string) => {
    return updateOrganization(id, { is_active: false });
  };

  const activateOrganization = async (id: string) => {
    return updateOrganization(id, { is_active: true });
  };

  const deleteOrganization = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Organização removida com sucesso');
      await fetchOrganizations();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover organização';
      toast.error(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
    refetch: fetchOrganizations,
    updateOrganization,
    deactivateOrganization,
    activateOrganization,
    deleteOrganization,
  };
}

