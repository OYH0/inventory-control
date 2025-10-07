import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GlobalStats {
  active_orgs: number;
  total_orgs: number;
  total_users: number;
  active_users: number;
  camara_fria_count: number;
  camara_refrigerada_count: number;
  estoque_seco_count: number;
  bebidas_count: number;
  descartaveis_count: number;
  total_orders: number;
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
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

      // Buscar estatísticas
      const { data, error: fetchError } = await supabase
        .from('admin_global_stats')
        .select('*')
        .single();

      if (fetchError) throw fetchError;

      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

