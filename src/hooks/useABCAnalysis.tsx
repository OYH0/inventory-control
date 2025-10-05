// =====================================================
// HOOK: useABCAnalysis - Hook principal do sistema ABC
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ABCAnalysisService from '@/services/ABCAnalysisService';
import type {
  ABCConfiguration,
  ABCConfigurationInput,
  ABCDashboardSummary,
  ABCParetoDataPoint,
  ABCTrendItem,
  CategoryRecommendations,
  ClassifyProductsRequest,
  ProductABCData
} from '@/types/abc-analysis';

export function useABCAnalysis() {
  const queryClient = useQueryClient();
  
  // ============================================
  // QUERIES
  // ============================================
  
  /**
   * Obter configuração ABC
   */
  const {
    data: config,
    isLoading: configLoading,
    error: configError
  } = useQuery({
    queryKey: ['abc-config'],
    queryFn: () => ABCAnalysisService.getConfiguration(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2
  });
  
  /**
   * Obter resumo do dashboard
   */
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['abc-summary'],
    queryFn: () => ABCAnalysisService.getDashboardSummary(),
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 2
  });
  
  /**
   * Obter dados do gráfico de Pareto
   */
  const {
    data: paretoData,
    isLoading: paretoLoading
  } = useQuery({
    queryKey: ['abc-pareto'],
    queryFn: () => ABCAnalysisService.getParetoChartData(),
    staleTime: 1000 * 60 * 5,
    enabled: !!summary // Só busca se summary existir
  });
  
  /**
   * Obter tendências
   */
  const {
    data: trends,
    isLoading: trendsLoading
  } = useQuery({
    queryKey: ['abc-trends', 'month'],
    queryFn: () => ABCAnalysisService.getTrends('month'),
    staleTime: 1000 * 60 * 10
  });
  
  /**
   * Obter recomendações
   */
  const {
    data: recommendations,
    isLoading: recommendationsLoading
  } = useQuery({
    queryKey: ['abc-recommendations'],
    queryFn: () => ABCAnalysisService.generateAllRecommendations(),
    staleTime: 1000 * 60 * 30 // 30 minutos
  });
  
  // ============================================
  // MUTATIONS
  // ============================================
  
  /**
   * Atualizar configuração
   */
  const updateConfigMutation = useMutation({
    mutationFn: (input: ABCConfigurationInput) => 
      ABCAnalysisService.updateConfiguration(input),
    onSuccess: (data) => {
      queryClient.setQueryData(['abc-config'], data);
      toast.success('Configuração ABC atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar configuração: ${error.message}`);
    }
  });
  
  /**
   * Executar classificação ABC
   */
  const classifyMutation = useMutation({
    mutationFn: (request?: ClassifyProductsRequest) => 
      ABCAnalysisService.performFullClassification(request || {}),
    onMutate: () => {
      toast.loading('Classificando produtos...', { id: 'classify-abc' });
    },
    onSuccess: (result) => {
      toast.dismiss('classify-abc');
      
      if (result.success && result.result) {
        toast.success(
          `Classificação concluída! ${result.result.total_classified} produtos classificados`,
          { duration: 5000 }
        );
        
        // Invalidar queries para recarregar dados
        queryClient.invalidateQueries({ queryKey: ['abc-summary'] });
        queryClient.invalidateQueries({ queryKey: ['abc-pareto'] });
        queryClient.invalidateQueries({ queryKey: ['abc-trends'] });
      } else {
        toast.error(`Erro na classificação: ${result.error}`);
      }
    },
    onError: (error: Error) => {
      toast.dismiss('classify-abc');
      toast.error(`Erro ao classificar produtos: ${error.message}`);
    }
  });
  
  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const isLoading = configLoading || summaryLoading;
  const hasError = configError || summaryError;
  
  const hasData = !!(summary && summary.total_products > 0);
  
  const categoryStats = summary?.category_breakdown || {
    A: { count: 0, percentage: 0, value: 0, value_percentage: 0 },
    B: { count: 0, percentage: 0, value: 0, value_percentage: 0 },
    C: { count: 0, percentage: 0, value: 0, value_percentage: 0 }
  };
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const updateConfiguration = (input: ABCConfigurationInput) => {
    updateConfigMutation.mutate(input);
  };
  
  const classify = (request?: ClassifyProductsRequest) => {
    classifyMutation.mutate(request);
  };
  
  const refresh = () => {
    refetchSummary();
    queryClient.invalidateQueries({ queryKey: ['abc-pareto'] });
    queryClient.invalidateQueries({ queryKey: ['abc-trends'] });
  };
  
  // ============================================
  // RETURN
  // ============================================
  
  return {
    // Data
    config,
    summary,
    paretoData,
    trends,
    recommendations,
    categoryStats,
    
    // Loading states
    isLoading,
    configLoading,
    summaryLoading,
    paretoLoading,
    trendsLoading,
    recommendationsLoading,
    
    // Error states
    hasError,
    configError,
    summaryError,
    
    // Mutations
    classify,
    isClassifying: classifyMutation.isPending,
    classifySuccess: classifyMutation.isSuccess,
    
    updateConfiguration,
    isUpdatingConfig: updateConfigMutation.isPending,
    
    // Helpers
    hasData,
    refresh
  };
}

export default useABCAnalysis;

