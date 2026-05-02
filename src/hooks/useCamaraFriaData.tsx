import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUnit } from '@/contexts/UnitContext';
import { toast } from '@/hooks/use-toast';
import { useQRCodeGenerator } from '@/hooks/useQRCodeGenerator';

export interface CamaraFriaItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  peso_kg?: number;
  data_entrada?: string;
  data_validade?: string;
  temperatura?: number;
  temperatura_ideal?: number;
  fornecedor?: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
  minimo?: number;
  preco_unitario?: number;
}

export function useCamaraFriaData(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [items, setItems] = useState<CamaraFriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CamaraFriaItem | null>(null);
  const { user } = useAuth();
  const { accessibleUnits } = useUnit();
  const { generateQRCodeData } = useQRCodeGenerator();
  const mountedRef = useRef(true);
  const loggedRef = useRef(false);
  const pendingOperationRef = useRef(false);

  const fetchItems = useCallback(async () => {
    if (!user || !mountedRef.current || pendingOperationRef.current) return;

    if (!loggedRef.current) {
      console.log('=== FETCH INICIAL DA CÂMARA FRIA ===');
      loggedRef.current = true;
    }

    if (accessibleUnits.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('camara_fria_items')
        .select('*')
        .order('nome');

      // Defesa em profundidade: sempre restringe ao accessibleUnits do usuário.
      // Se houver unidade específica selecionada e ela for permitida, usa-a; senão usa todas as permitidas.
      if (selectedUnidade && selectedUnidade !== 'todas' && accessibleUnits.includes(selectedUnidade)) {
        query = query.eq('unidade', selectedUnidade);
      } else {
        query = query.in('unidade', accessibleUnits);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (!mountedRef.current) return;
      
      // Map the database data to our interface
      const mappedItems: CamaraFriaItem[] = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        quantidade: Number(item.quantidade),
        unidade: 'pç', // Sempre exibir como 'pç' no frontend
        categoria: item.categoria,
        peso_kg: undefined,
        data_entrada: item.data_entrada,
        data_validade: item.data_validade,
        temperatura: undefined,
        temperatura_ideal: item.temperatura_ideal || undefined,
        fornecedor: item.fornecedor,
        observacoes: item.observacoes,
        unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza',
        minimo: item.minimo || 5,
        preco_unitario: item.preco_unitario || undefined,
      }));
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      if (mountedRef.current) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os itens da câmara fria.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, selectedUnidade, accessibleUnits]);

  useEffect(() => {
    if (user) {
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [user, fetchItems]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addItem = async (newItem: Omit<CamaraFriaItem, 'id'> & { unidade_item?: 'juazeiro_norte' | 'fortaleza' }) => {
    if (!user || pendingOperationRef.current) return;

    pendingOperationRef.current = true;

    try {
      console.log('=== ADICIONANDO ITEM ===');
      console.log('Item recebido:', newItem);

      // Validações
      if (!newItem.nome || newItem.nome.trim() === '') {
        throw new Error('Nome do item é obrigatório');
      }

      if (newItem.quantidade < 0) {
        throw new Error('Quantidade não pode ser negativa');
      }

      const unidadeProposta = newItem.unidade_item;
      const unidadeAlvo =
        unidadeProposta && accessibleUnits.includes(unidadeProposta)
          ? unidadeProposta
          : accessibleUnits[0];

      if (!unidadeAlvo) {
        throw new Error('Sem unidade acessível para inserir item');
      }

      const itemToInsert = {
        nome: newItem.nome.trim(),
        quantidade: Number(newItem.quantidade),
        categoria: newItem.categoria,
        minimo: newItem.minimo || 5,
        data_entrada: new Date().toISOString().split('T')[0],
        data_validade: newItem.data_validade,
        temperatura_ideal: newItem.temperatura_ideal,
        fornecedor: newItem.fornecedor?.trim() || null,
        observacoes: newItem.observacoes?.trim() || null,
        preco_unitario: newItem.preco_unitario,
        user_id: user.id,
        unidade: unidadeAlvo,
        // Campos ABC
        unit_cost: (newItem as any).unit_cost || null,
        annual_demand: (newItem as any).annual_demand || null,
        ordering_cost: (newItem as any).ordering_cost || null,
        carrying_cost_percentage: (newItem as any).carrying_cost_percentage || null,
        lead_time_days: (newItem as any).lead_time_days || null
      };

      console.log('Item para inserir no banco:', itemToInsert);

      const { data, error } = await supabase
        .from('camara_fria_items')
        .insert([itemToInsert])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Item inserido no banco:', data);

      const mappedData = {
        ...data,
        quantidade: Number(data.quantidade),
        unidade: 'pç', // Sempre exibir como 'pç' no frontend
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza',
        minimo: data.minimo || 5,
        peso_kg: undefined,
        temperatura: undefined,
        temperatura_ideal: data.temperatura_ideal || undefined,
        preco_unitario: data.preco_unitario || undefined
      };
      
      setItems(prev => [...prev, mappedData]);
      setLastAddedItem(mappedData);
      
      // Gerar QR codes para o item apenas se quantidade > 0
      if (Number(newItem.quantidade) > 0) {
        const qrCodesData = generateQRCodeData(mappedData, 'CF', Number(newItem.quantidade));
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
      }
      
      toast({
        title: "Item adicionado",
        description: Number(newItem.quantidade) > 0 
          ? `${newItem.nome} foi adicionado ao estoque! QR codes serão gerados.`
          : `${newItem.nome} foi adicionado ao estoque!`,
      });

      return mappedData;
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: error instanceof Error ? error.message : "Não foi possível adicionar o item.",
        variant: "destructive",
      });
      throw error;
    } finally {
      pendingOperationRef.current = false;
    }
  };

  const updateItemQuantity = async (id: string, newQuantity: number) => {
    if (pendingOperationRef.current) return;

    pendingOperationRef.current = true;

    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) {
        throw new Error('Item não encontrado');
      }

      if (newQuantity < 0) {
        throw new Error('Quantidade não pode ser negativa');
      }

      console.log('=== ATUALIZANDO QUANTIDADE ===');
      console.log('Quantidade atual:', currentItem.quantidade);
      console.log('Nova quantidade:', newQuantity);

      const { error } = await supabase
        .from('camara_fria_items')
        .update({ 
          quantidade: Number(newQuantity),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantidade: Number(newQuantity) } : item
      ));

      const quantityDifference = Number(newQuantity) - currentItem.quantidade;

      if (quantityDifference > 0) {
        const updatedItem = { ...currentItem, quantidade: Number(newQuantity) };
        setLastAddedItem(updatedItem);
        
        const qrCodesData = generateQRCodeData(updatedItem, 'CF', quantityDifference);
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
      }

      toast({
        title: "Quantidade atualizada",
        description: `Quantidade de ${currentItem.nome} atualizada para ${newQuantity}`,
      });

      return {
        item: currentItem,
        quantityDifference,
        newQuantity: Number(newQuantity)
      };
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Erro ao atualizar quantidade",
        description: error instanceof Error ? error.message : "Não foi possível atualizar a quantidade.",
        variant: "destructive",
      });
      throw error;
    } finally {
      pendingOperationRef.current = false;
    }
  };

  const deleteItem = async (id: string) => {
    if (pendingOperationRef.current) return;

    pendingOperationRef.current = true;

    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) {
        throw new Error('Item não encontrado');
      }

      const { error } = await supabase
        .from('camara_fria_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Item removido",
        description: "Item foi removido do estoque.",
      });

      return currentItem;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Erro ao remover item",
        description: error instanceof Error ? error.message : "Não foi possível remover o item.",
        variant: "destructive",
      });
      throw error;
    } finally {
      pendingOperationRef.current = false;
    }
  };

  const transferToRefrigerada = async (item: CamaraFriaItem) => {
    if (pendingOperationRef.current) return;

    pendingOperationRef.current = true;

    try {
      const unidadeAlvo =
        item.unidade_item && accessibleUnits.includes(item.unidade_item)
          ? item.unidade_item
          : accessibleUnits[0];

      if (!unidadeAlvo) {
        throw new Error('Sem unidade acessível para transferir item');
      }

      const newItem = {
        nome: item.nome,
        quantidade: item.quantidade,
        unidade: unidadeAlvo,
        categoria: item.categoria,
        user_id: user.id
      };

      const { error: insertError } = await supabase
        .from('camara_refrigerada_items')
        .insert([newItem]);

      if (insertError) throw insertError;

      // Remover o item da câmara fria apenas se a inserção foi bem-sucedida
      await deleteItem(item.id);

      toast({
        title: "Item transferido",
        description: `${item.nome} foi transferido para a câmara refrigerada.`,
      });
    } catch (error) {
      console.error('Error transferring item:', error);
      toast({
        title: "Erro ao transferir item",
        description: error instanceof Error ? error.message : "Não foi possível transferir o item para a câmara refrigerada.",
        variant: "destructive",
      });
    } finally {
      pendingOperationRef.current = false;
    }
  };

  const transferItemsToUnidade = async (itemIds: string[], targetUnidade: 'juazeiro_norte' | 'fortaleza') => {
    if (pendingOperationRef.current) return;

    pendingOperationRef.current = true;

    try {
      // .select() força o retorno das linhas atualizadas. Sem isso, RLS pode
      // bloquear silenciosamente (zero rows) e o toast mente "sucesso".
      const { data, error } = await supabase
        .from('camara_fria_items')
        .update({
          unidade: targetUnidade,
          updated_at: new Date().toISOString()
        })
        .in('id', itemIds)
        .select('id');

      if (error) throw error;

      const updated = data?.length ?? 0;
      if (updated === 0) {
        throw new Error('Nenhum item foi transferido. Verifique suas permissões na unidade de destino.');
      }
      if (updated < itemIds.length) {
        throw new Error(`Só ${updated} de ${itemIds.length} itens foram transferidos. RLS pode estar bloqueando os demais.`);
      }

      // Atualizar o estado local
      setItems(prev => prev.map(item =>
        itemIds.includes(item.id)
          ? { ...item, unidade_item: targetUnidade }
          : item
      ));

      // Refetch para refletir possível remoção do filtro server-side.
      void fetchItems();

      toast({
        title: "Transferência realizada",
        description: `${updated} item(ns) transferido(s) para ${targetUnidade === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza'}.`,
      });
    } catch (error) {
      console.error('Error transferring items:', error);
      toast({
        title: "Erro na transferência",
        description: error instanceof Error ? error.message : "Não foi possível transferir os itens.",
        variant: "destructive",
      });
    } finally {
      pendingOperationRef.current = false;
    }
  };

  return {
    items,
    loading,
    addItem,
    updateItemQuantity,
    deleteItem,
    transferToRefrigerada,
    transferItemsToUnidade,
    fetchItems,
    qrCodes,
    showQRGenerator,
    setShowQRGenerator,
    lastAddedItem
  };
}

