/**
 * useExpiryAlerts Hook
 * React hook for managing expiry alerts with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expiryAlertService, type ExpiryAlert, type AlertStats } from '@/services/ExpiryAlertService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

type AlertStatus = 'pending' | 'sent' | 'read' | 'dismissed';
type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

interface UseExpiryAlertsParams {
  status?: AlertStatus | AlertStatus[];
  priority?: AlertPriority | AlertPriority[];
  location?: 'juazeiro_norte' | 'fortaleza';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useExpiryAlerts(params: UseExpiryAlertsParams = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 50;

  // Fetch alerts with filters
  const {
    data: alertsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['expiry-alerts', user?.id, params, page],
    queryFn: async () => {
      if (!user) return { data: [], total: 0 };
      
      return await expiryAlertService.getAlerts({
        ...params,
        user_id: user.id,
        page,
        per_page: perPage
      });
    },
    enabled: !!user,
    refetchInterval: params.autoRefresh ? (params.refreshInterval || 60000) : false,
    staleTime: 30000 // 30 seconds
  });

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('expiry-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expiry_alerts',
          filter: `recipient_user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[useExpiryAlerts] Real-time update:', payload);
          
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['expiry-alerts'] });
          queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
          
          // Show toast for new alerts
          if (payload.eventType === 'INSERT') {
            const alert = payload.new as ExpiryAlert;
            if (alert.priority === 'critical') {
              toast({
                title: '⚠️ Alerta Crítico de Vencimento',
                description: `${alert.item_name} vence em ${alert.days_until_expiry} dias`,
                variant: 'destructive'
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      if (!user) throw new Error('User not authenticated');
      await expiryAlertService.markAsRead(alertId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expiry-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    },
    onError: (error) => {
      console.error('[useExpiryAlerts] Error marking as read:', error);
      toast({
        title: 'Erro ao marcar alerta',
        description: 'Não foi possível marcar o alerta como lido',
        variant: 'destructive'
      });
    }
  });

  // Dismiss alert mutation
  const dismissAlertMutation = useMutation({
    mutationFn: async ({
      alertId,
      reason,
      action
    }: {
      alertId: string;
      reason?: string;
      action?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      await expiryAlertService.dismissAlert(alertId, user.id, reason, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expiry-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      toast({
        title: 'Alerta dispensado',
        description: 'O alerta foi marcado como dispensado com sucesso'
      });
    },
    onError: (error) => {
      console.error('[useExpiryAlerts] Error dismissing alert:', error);
      toast({
        title: 'Erro ao dispensar alerta',
        description: 'Não foi possível dispensar o alerta',
        variant: 'destructive'
      });
    }
  });

  // Generate alerts manually
  const generateAlertsMutation = useMutation({
    mutationFn: async () => {
      return await expiryAlertService.checkExpiringProducts();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['expiry-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      toast({
        title: 'Verificação concluída',
        description: `${result.alerts_generated} novos alertas gerados (${result.critical_count} críticos)`
      });
    },
    onError: (error) => {
      console.error('[useExpiryAlerts] Error generating alerts:', error);
      toast({
        title: 'Erro na verificação',
        description: 'Não foi possível verificar os produtos',
        variant: 'destructive'
      });
    }
  });

  const markAsRead = useCallback((alertId: string) => {
    markAsReadMutation.mutate(alertId);
  }, [markAsReadMutation]);

  const dismissAlert = useCallback(
    (alertId: string, reason?: string, action?: string) => {
      dismissAlertMutation.mutate({ alertId, reason, action });
    },
    [dismissAlertMutation]
  );

  const generateAlerts = useCallback(() => {
    generateAlertsMutation.mutate();
  }, [generateAlertsMutation]);

  return {
    alerts: alertsData?.data || [],
    total: alertsData?.total || 0,
    isLoading,
    error,
    page,
    perPage,
    totalPages: Math.ceil((alertsData?.total || 0) / perPage),
    setPage,
    refetch,
    markAsRead,
    dismissAlert,
    generateAlerts,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDismissing: dismissAlertMutation.isPending,
    isGenerating: generateAlertsMutation.isPending
  };
}

export function useAlertStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['alert-stats', user?.id],
    queryFn: async () => {
      return await expiryAlertService.getDashboardStats();
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000
  });
}

export function useAlertConfiguration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['alert-config', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('[useAlertConfiguration] No user found');
        return null;
      }
      console.log('[useAlertConfiguration] Fetching config for user:', user.id);
      const result = await expiryAlertService.getAlertConfiguration(user.id);
      console.log('[useAlertConfiguration] Config fetched:', result);
      return result;
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    retry: 2
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<any>) => {
      if (!user) {
        console.error('[useAlertConfiguration] No user authenticated');
        throw new Error('User not authenticated');
      }
      console.log('[useAlertConfiguration] Updating config for user:', user.id);
      console.log('[useAlertConfiguration] New config:', newConfig);
      
      const result = await expiryAlertService.updateAlertConfiguration(user.id, newConfig);
      console.log('[useAlertConfiguration] Config updated successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('[useAlertConfiguration] Mutation success, invalidating queries');
      // Invalidate both specific user and general queries
      queryClient.invalidateQueries({ queryKey: ['alert-config', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['alert-config'] });
      
      // Update the cache immediately with optimistic update
      queryClient.setQueryData(['alert-config', user?.id], data);
      
      toast({
        title: '✓ Configurações salvas',
        description: 'Suas preferências de alerta foram atualizadas com sucesso'
      });
    },
    onError: (error: any) => {
      console.error('[useAlertConfiguration] Error updating config:', error);
      console.error('[useAlertConfiguration] Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response
      });
      
      toast({
        title: 'Erro ao salvar configurações',
        description: error?.message || 'Não foi possível atualizar suas preferências. Verifique o console para mais detalhes.',
        variant: 'destructive'
      });
    }
  });

  return {
    config,
    isLoading,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending
  };
}

