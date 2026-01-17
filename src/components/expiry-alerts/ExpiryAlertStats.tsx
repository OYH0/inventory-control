import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Clock, Package } from 'lucide-react';
import type { AlertStats } from '@/services/ExpiryAlertService';

interface ExpiryAlertStatsProps {
  stats?: AlertStats;
  isLoading: boolean;
}

export function ExpiryAlertStats({ stats, isLoading }: ExpiryAlertStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalAlerts = (stats?.critical_alerts || 0) + (stats?.high_alerts || 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Critical Alerts */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            {stats?.critical_alerts || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requerem ação imediata
          </p>
        </CardContent>
      </Card>

      {/* High Priority */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
          <TrendingUp className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {stats?.high_alerts || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Monitoramento necessário
          </p>
        </CardContent>
      </Card>

      {/* Total Products */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
          <Package className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            {totalAlerts}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Produtos monitorados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

