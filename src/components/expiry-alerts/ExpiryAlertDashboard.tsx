/**
 * ExpiryAlertDashboard Component
 * Main dashboard for viewing and managing expiry alerts
 * Updated to match Câmara Fria layout
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useExpiryAlerts, useAlertStats } from '@/hooks/useExpiryAlerts';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExpiryAlertCard } from './ExpiryAlertCard';
import { ExpiryAlertStats } from './ExpiryAlertStats';

type AlertStatus = 'pending' | 'sent' | 'read' | 'dismissed';
type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

interface FilterState {
  status?: AlertStatus[];
  priority?: AlertPriority[];
  location?: 'juazeiro_norte' | 'fortaleza';
}

export function ExpiryAlertDashboard() {
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<FilterState>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('Todos');

  const { data: stats, isLoading: statsLoading } = useAlertStats();

  const {
    alerts,
    total,
    isLoading,
    page,
    perPage,
    totalPages,
    setPage,
    refetch,
    markAsRead,
    dismissAlert
  } = useExpiryAlerts({
    ...filters,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute - Verificação automática
  });

  const criticalAlerts = alerts.filter(a => a.priority === 'critical' && a.status !== 'dismissed');

  // Filtrar alertas
  const filteredAlerts = alerts.filter(item => {
    const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesPriority = filterPriority === 'Todos' || item.priority === filterPriority.toLowerCase();
    return matchesSearch && matchesPriority && item.status !== 'dismissed';
  });

  const priorities = ['Todos', 'Critical', 'High', 'Medium', 'Low'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Header Section - Same as Câmara Fria */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 text-white p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Alertas de Vencimento
              </h2>
              <p className="text-sm text-muted-foreground">
                Monitore produtos próximos da data de vencimento
              </p>
            </div>
          </div>
        </div>

        {/* Badge Row - Same as Câmara Fria */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {filteredAlerts.length} {filteredAlerts.length === 1 ? 'tipo' : 'tipos'}
          </Badge>
          {criticalAlerts.length > 0 && (
            <Badge variant="destructive" className="px-3 py-1 text-sm">
              {criticalAlerts.length} baixo estoque
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <ExpiryAlertStats stats={stats} isLoading={statsLoading} />

      {/* Search and Filter - Same as Câmara Fria */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert Grid - Same as Câmara Fria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum alerta encontrado
            </h3>
            <p className="text-sm text-gray-500">
              {searchTerm || filterPriority !== 'Todos'
                ? 'Tente ajustar os filtros'
                : 'Não há alertas de vencimento no momento'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <ExpiryAlertCard
              key={alert.id}
              alert={alert}
              onMarkAsRead={markAsRead}
              onDismiss={dismissAlert}
            />
          ))
        )}
      </div>

      {/* Pagination - Same as Câmara Fria */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
