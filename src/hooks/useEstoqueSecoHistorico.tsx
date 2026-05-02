import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUnit } from '@/contexts/UnitContext';
import { toast } from '@/hooks/use-toast';

export interface EstoqueSecoHistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  data_operacao: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useEstoqueSecoHistorico(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [historico, setHistorico] = useState<EstoqueSecoHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { accessibleUnits, selectedUnit } = useUnit();
  const pendingRequestRef = useRef<boolean>(false);
  const lastInsertRef = useRef<{ item: string, quantidade: number, tipo: string, timestamp: number } | null>(null);

  const fetchHistorico = useCallback(async () => {
    if (!user || pendingRequestRef.current) return;

    if (accessibleUnits.length === 0) {
      setHistorico([]);
      setLoading(false);
      return;
    }

    pendingRequestRef.current = true;

    try {
      let query = supabase
        .from('estoque_seco_historico')
        .select('id,item_nome,quantidade,categoria,tipo,data_operacao,observacoes,unidade')
        .order('data_operacao', { ascending: false });

      // Aceita selectedUnidade explícito; senão alinha com selectedUnit do contexto.
      const unidadeAlvo = selectedUnidade && selectedUnidade !== 'todas'
        ? selectedUnidade
        : selectedUnit ?? undefined;

      if (unidadeAlvo && accessibleUnits.includes(unidadeAlvo)) {
        query = query.eq('unidade', unidadeAlvo);
      } else {
        query = query.in('unidade', accessibleUnits);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedHistorico: EstoqueSecoHistoricoItem[] = (data || []).map(item => ({
        id: item.id,
        item_nome: item.item_nome,
        quantidade: Number(item.quantidade),
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: item.tipo as 'entrada' | 'saida',
        data_operacao: item.data_operacao,
        observacoes: item.observacoes,
        unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza',
      }));

      setHistorico(mappedHistorico);
    } catch (error) {
      console.error('Error fetching history:', error);
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

  const addHistoricoItem = async (item: Omit<EstoqueSecoHistoricoItem, 'id' | 'data_operacao'>) => {
    if (!user || pendingRequestRef.current) return;

    const now = Date.now();

    const recentDuplicate = historico.find(h =>
      h.item_nome === item.item_nome &&
      h.quantidade === item.quantidade &&
      h.tipo === item.tipo &&
      new Date(h.data_operacao).getTime() > (now - 5000)
    );

    if (recentDuplicate) return;

    if (lastInsertRef.current &&
        lastInsertRef.current.item === item.item_nome &&
        lastInsertRef.current.quantidade === item.quantidade &&
        lastInsertRef.current.tipo === item.tipo &&
        (now - lastInsertRef.current.timestamp) < 3000) {
      return;
    }

    pendingRequestRef.current = true;
    lastInsertRef.current = {
      item: item.item_nome,
      quantidade: item.quantidade,
      tipo: item.tipo,
      timestamp: now
    };

    try {
      const unidadeProposta = item.unidade_item ?? selectedUnit ?? undefined;
      const unidadeParaSalvar =
        unidadeProposta && accessibleUnits.includes(unidadeProposta)
          ? unidadeProposta
          : accessibleUnits[0];

      if (!unidadeParaSalvar) {
        throw new Error('Sem unidade acessível para registrar histórico');
      }

      const itemParaInserir = {
        item_nome: item.item_nome,
        quantidade: Number(item.quantidade),
        categoria: item.categoria,
        tipo: item.tipo,
        observacoes: item.observacoes,
        user_id: user.id,
        unidade: unidadeParaSalvar
      };

      const { data, error } = await supabase
        .from('estoque_seco_historico')
        .insert([itemParaInserir])
        .select('id,item_nome,quantidade,categoria,tipo,data_operacao,observacoes,unidade')
        .single();

      if (error) throw error;

      const mappedItem: EstoqueSecoHistoricoItem = {
        id: data.id,
        item_nome: data.item_nome,
        quantidade: Number(data.quantidade),
        unidade: data.unidade,
        categoria: data.categoria,
        tipo: data.tipo as 'entrada' | 'saida',
        data_operacao: data.data_operacao,
        observacoes: data.observacoes,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza',
      };

      setHistorico(prev => [mappedItem, ...prev]);
    } catch (error) {
      console.error('Error adding history item:', error);
      toast({
        title: "Erro ao registrar histórico",
        description: "Não foi possível registrar a operação no histórico.",
        variant: "destructive",
      });
    } finally {
      pendingRequestRef.current = false;
    }
  };

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
