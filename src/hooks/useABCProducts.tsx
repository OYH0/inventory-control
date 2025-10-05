// =====================================================
// HOOK: useABCProducts - Hook para listar produtos ABC
// =====================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ABCCategory, ProductABCData } from '@/types/abc-analysis';
import { useState } from 'react';

interface UseABCProductsOptions {
  category?: ABCCategory;
  search?: string;
  sortBy?: 'value' | 'name' | 'demand';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
}

export function useABCProducts(options: UseABCProductsOptions = {}) {
  const {
    category,
    search = '',
    sortBy = 'value',
    sortOrder = 'desc',
    pageSize = 50
  } = options;
  
  const [page, setPage] = useState(1);
  
  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['abc-products', category, search, sortBy, sortOrder, page],
    queryFn: async () => {
      let query = supabase
        .from('abc_analysis_consolidated')
        .select('*', { count: 'exact' });
      
      // Filter by category
      if (category) {
        query = query.eq('abc_category', category);
      }
      
      // Search
      if (search) {
        query = query.ilike('product_name', `%${search}%`);
      }
      
      // Sort
      const orderColumn = sortBy === 'value' 
        ? 'annual_consumption_value'
        : sortBy === 'demand'
        ? 'annual_demand'
        : 'product_name';
      
      query = query.order(orderColumn, { 
        ascending: sortOrder === 'asc' 
      });
      
      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        data: data as ProductABCData[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
    staleTime: 1000 * 60 * 2 // 2 minutos
  });
  
  return {
    products: products?.data || [],
    total: products?.total || 0,
    page,
    totalPages: products?.totalPages || 0,
    pageSize,
    
    isLoading,
    error,
    
    // Pagination
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    goToPage: (newPage: number) => setPage(newPage),
    
    // Refresh
    refetch
  };
}

export default useABCProducts;

