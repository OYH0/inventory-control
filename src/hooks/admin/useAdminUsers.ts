import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'gerente' | 'viewer';
  unidade_responsavel: 'juazeiro_norte' | 'fortaleza' | null;
  is_master?: boolean;
  is_approved?: boolean;
  created_at: string;
  updated_at: string;
  org_count: number;
}

export interface ApprovePayload {
  userType: 'admin' | 'gerente' | 'viewer';
  unidadeResponsavel: 'juazeiro_norte' | 'fortaleza' | null;
  canViewJuazeiro: boolean;
  canViewFortaleza: boolean;
  canModifyJuazeiro: boolean;
  canModifyFortaleza: boolean;
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

      // Enriquecer com is_master e is_approved (a view pode não ter as colunas).
      const ids = (data || []).map((u: any) => u.id);
      let extraMap = new Map<string, { is_master: boolean; is_approved: boolean }>();
      if (ids.length > 0) {
        const extraRes = await supabase
          .from('profiles')
          .select('id, is_master, is_approved')
          .in('id', ids);
        if (!extraRes.error && extraRes.data) {
          extraMap = new Map(
            extraRes.data.map((p: any) => [
              p.id,
              { is_master: !!p.is_master, is_approved: p.is_approved !== false },
            ])
          );
        }
      }

      const enriched = (data || []).map((u: any) => {
        const extra = extraMap.get(u.id) ?? { is_master: false, is_approved: true };
        return { ...u, ...extra };
      });

      setUsers(enriched);
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
        .update({ user_type: 'viewer' })
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

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (error) {
        // FunctionsHttpError vem com .context contendo response do server
        const ctx = (error as any).context;
        let serverMessage: string | undefined;
        try {
          serverMessage = ctx ? (await ctx.json())?.error : undefined;
        } catch {
          // ignore
        }
        throw new Error(serverMessage || error.message || 'Erro ao deletar usuário');
      }

      if (data?.error) throw new Error(data.error);

      toast.success(`Usuário ${data?.deleted ?? ''} removido completamente`.trim());
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar usuário';
      toast.error(message);
      throw err;
    }
  };

  const approveUser = async (userId: string, payload: ApprovePayload) => {
    try {
      const { error: profErr } = await supabase
        .from('profiles')
        .update({
          is_approved: true,
          user_type: payload.userType,
          unidade_responsavel: payload.unidadeResponsavel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (profErr) throw profErr;

      // Substitui permissões granulares: limpa as antigas e insere as novas marcadas.
      await supabase.from('user_unit_permissions').delete().eq('user_id', userId);

      const rows: Array<{ user_id: string; unidade: 'juazeiro_norte' | 'fortaleza'; can_view: boolean; can_modify: boolean }> = [];
      if (payload.canViewJuazeiro || payload.canModifyJuazeiro) {
        rows.push({
          user_id: userId,
          unidade: 'juazeiro_norte',
          can_view: payload.canViewJuazeiro || payload.canModifyJuazeiro,
          can_modify: payload.canModifyJuazeiro,
        });
      }
      if (payload.canViewFortaleza || payload.canModifyFortaleza) {
        rows.push({
          user_id: userId,
          unidade: 'fortaleza',
          can_view: payload.canViewFortaleza || payload.canModifyFortaleza,
          can_modify: payload.canModifyFortaleza,
        });
      }

      if (rows.length > 0) {
        const { error: permErr } = await supabase.from('user_unit_permissions').insert(rows);
        if (permErr) throw permErr;
      }

      toast.success('Usuário aprovado');
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao aprovar usuário';
      toast.error(message);
      throw err;
    }
  };

  const setMaster = async (userId: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_master: value, ...(value ? { user_type: 'admin' } : {}) })
        .eq('id', userId);

      if (error) throw error;

      toast.success(value ? 'Usuário promovido a MASTER' : 'Bandeira MASTER removida');
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao alterar status master';
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
    deleteUser,
    setMaster,
    approveUser,
  };
}

