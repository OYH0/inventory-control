import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUnit } from '@/contexts/UnitContext';
import { supabase } from '@/integrations/supabase/client';

export interface HistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  data_operacao: string;
  observacoes?: string;
  user_id: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useBebidasHistorico(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { accessibleUnits, selectedUnit } = useUnit();
  const pendingRequestRef = useRef<boolean>(false);

  const addHistoricoItem = useCallback(async (item: Omit<HistoricoItem, 'id' | 'data_operacao' | 'user_id'>) => {
    if (!user) return;

    try {
      const unidadeProposta = item.unidade_item ?? selectedUnit ?? undefined;
      const unidadeParaSalvar =
        unidadeProposta && accessibleUnits.includes(unidadeProposta)
          ? unidadeProposta
          : accessibleUnits[0];

      if (!unidadeParaSalvar) {
        throw new Error('Sem unidade acessível para registrar histórico');
      }

      // Tenta inserir com a coluna `unidade_item`. Se a migration de isolamento
      // ainda não tiver sido aplicada, o banco pode rejeitar a coluna —
      // nesse caso fazemos fallback para insert sem a coluna.
      const baseData = {
        user_id: user.id,
        item_nome: item.item_nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: item.tipo,
        observacoes: item.observacoes || null,
      };

      let { data, error } = await supabase
        .from('bebidas_historico')
        .insert([{ ...baseData, unidade_item: unidadeParaSalvar }])
        .select()
        .single();

      if (error && /unidade_item/.test(error.message ?? '')) {
        const fallback = await supabase
          .from('bebidas_historico')
          .insert([baseData])
          .select()
          .single();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;

      const newHistoricoItem: HistoricoItem = {
        ...data,
        tipo: data.tipo as 'entrada' | 'saida',
        data_operacao: data.data_operacao,
        unidade_item: (data as any).unidade_item ?? unidadeParaSalvar,
      };

      setHistorico(prev => [newHistoricoItem, ...prev]);

      return newHistoricoItem;
    } catch (error) {
      console.error('Error adding historico item:', error);
      toast({
        title: "Erro ao adicionar ao histórico",
        description: "Não foi possível adicionar o item ao histórico.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, accessibleUnits, selectedUnit]);

  const fetchHistorico = useCallback(async () => {
    if (!user || pendingRequestRef.current) return;

    if (accessibleUnits.length === 0) {
      setHistorico([]);
      setLoading(false);
      return;
    }

    pendingRequestRef.current = true;
    setLoading(true);

    try {
      let query = supabase
        .from('bebidas_historico')
        .select('*')
        .order('data_operacao', { ascending: false });

      const unidadeAlvo = selectedUnidade && selectedUnidade !== 'todas'
        ? selectedUnidade
        : selectedUnit ?? undefined;

      // Filtro principal: coluna `unidade_item`. Se a coluna não existir
      // no banco (migration pendente), fazemos fallback para isolar por user_id.
      if (unidadeAlvo && accessibleUnits.includes(unidadeAlvo)) {
        query = query.eq('unidade_item', unidadeAlvo);
      } else {
        query = query.in('unidade_item', accessibleUnits);
      }

      let { data, error } = await query;

      if (error && /unidade_item/.test(error.message ?? '')) {
        // Migration ainda não aplicada — isola por user_id como fallback seguro.
        const fallback = await supabase
          .from('bebidas_historico')
          .select('*')
          .eq('user_id', user.id)
          .order('data_operacao', { ascending: false });
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;

      const mappedData = (data || []).map(item => ({
        ...item,
        tipo: item.tipo as 'entrada' | 'saida',
        unidade_item: (item as any).unidade_item ?? undefined,
      }));

      setHistorico(mappedData);
    } catch (error) {
      console.error('Error fetching historico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      pendingRequestRef.current = false;
    }
  }, [user, selectedUnidade, selectedUnit, accessibleUnits]);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  return {
    historico,
    loading,
    addHistoricoItem,
    fetchHistorico
  };
}
