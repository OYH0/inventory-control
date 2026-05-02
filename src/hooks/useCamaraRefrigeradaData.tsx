
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUnit } from '@/contexts/UnitContext';
import { toast } from '@/hooks/use-toast';

export interface CamaraRefrigeradaItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tempo_descongelamento?: string;
  status: 'descongelando' | 'pronto';
  data_entrada?: string;
  temperatura_ideal?: number;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useCamaraRefrigeradaData(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [items, setItems] = useState<CamaraRefrigeradaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { accessibleUnits } = useUnit();
  const mountedRef = useRef(true);
  const loggedRef = useRef(false);

  const fetchItems = useCallback(async (unidadeFiltro?: 'juazeiro_norte' | 'fortaleza' | 'todas') => {
    if (!user || !mountedRef.current) return;

    if (!loggedRef.current) {
      console.log('=== FETCH INICIAL DA CÂMARA REFRIGERADA ===');
      loggedRef.current = true;
    }

    if (accessibleUnits.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('camara_refrigerada_items')
        .select('id,nome,quantidade,categoria,status,data_entrada,temperatura_ideal,observacoes,unidade')
        .order('nome');

      // Defesa em profundidade: sempre restringe ao accessibleUnits do usuário.
      if (unidadeFiltro && unidadeFiltro !== 'todas' && accessibleUnits.includes(unidadeFiltro)) {
        query = query.eq('unidade', unidadeFiltro);
      } else {
        query = query.in('unidade', accessibleUnits);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (!mountedRef.current) return;
      
      // Map the database data to our interface and extract measurement unit from observacoes
      const mappedItems: CamaraRefrigeradaItem[] = (data || []).map(item => {
        // Extract measurement unit from observacoes if it contains unit info
        let unidadeMedida = 'pç';
        if (item.observacoes && item.observacoes.includes('MEDIDA:')) {
          const medidaMatch = item.observacoes.match(/MEDIDA:([^;\s]+)/);
          if (medidaMatch) {
            unidadeMedida = medidaMatch[1];
          }
        }
        
        return {
          id: item.id,
          nome: item.nome,
          quantidade: item.quantidade,
          unidade: unidadeMedida,
          categoria: item.categoria,
          status: item.status as 'descongelando' | 'pronto',
          data_entrada: item.data_entrada,
          temperatura_ideal: item.temperatura_ideal,
          observacoes: item.observacoes,
          unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza',
        };
      });

      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      if (mountedRef.current) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os itens da câmara refrigerada.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, accessibleUnits]);

  useEffect(() => {
    if (user) {
      fetchItems(selectedUnidade);
    } else {
      setLoading(false);
    }
  }, [user, selectedUnidade, fetchItems]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addItem = async (newItem: Omit<CamaraRefrigeradaItem, 'id'>) => {
    if (!user) return;

    try {
      // Include measurement unit info in observacoes
      const observacoesComMedida = `${newItem.observacoes || ''} MEDIDA:${newItem.unidade || 'pç'}`.trim();
      
      const itemToInsert = {
        nome: newItem.nome,
        quantidade: newItem.quantidade,
        unidade: newItem.unidade_item || 'juazeiro_norte',
        categoria: newItem.categoria,
        status: newItem.status || 'descongelando',
        data_entrada: newItem.data_entrada,
        temperatura_ideal: newItem.temperatura_ideal,
        observacoes: observacoesComMedida,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('camara_refrigerada_items')
        .insert([itemToInsert])
        .select('id,nome,quantidade,categoria,status,data_entrada,temperatura_ideal,observacoes,unidade')
        .single();

      if (error) throw error;

      // Add to local state immediately
      const mappedItem = {
        id: data.id,
        nome: data.nome,
        quantidade: data.quantidade,
        unidade: newItem.unidade || 'pç',
        categoria: data.categoria,
        status: data.status as 'descongelando' | 'pronto',
        data_entrada: data.data_entrada,
        temperatura_ideal: data.temperatura_ideal,
        observacoes: data.observacoes,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza',
      };
      
      setItems(prev => [...prev, mappedItem]);
      
      toast({
        title: "Item adicionado à câmara refrigerada",
        description: `${newItem.nome} foi movido para descongelamento na unidade ${newItem.unidade_item === 'fortaleza' ? 'Fortaleza' : 'Juazeiro do Norte'}!`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Não foi possível mover o item para a câmara refrigerada.",
        variant: "destructive",
      });
    }
  };

  const updateItemStatus = async (id: string, status: 'descongelando' | 'pronto') => {
    try {
      const { error } = await supabase
        .from('camara_refrigerada_items')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

setItems(prev => prev.map(item => 
        item.id === id ? { ...item, status } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do item.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('camara_refrigerada_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Item removido",
        description: "Item foi removido da câmara refrigerada.",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Erro ao remover item",
        description: "Não foi possível remover o item.",
        variant: "destructive",
      });
    }
  };

  return {
    items,
    loading,
    addItem,
    updateItemStatus,
    deleteItem,
    fetchItems: () => fetchItems(selectedUnidade)
  };
}
