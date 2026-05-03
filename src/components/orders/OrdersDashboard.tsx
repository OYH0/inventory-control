// =====================================================
// COMPONENT: OrdersDashboard - Dashboard de Pedidos
// =====================================================

import { useState } from 'react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  RefreshCw, 
  ShoppingCart, 
  Package, 
  Truck, 
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import OrdersList from './OrdersList';
import CreateOrderDialog from './CreateOrderDialog';

export function OrdersDashboard() {
  const {
    dashboardStats,
    recentOrders,
    statsLoading,
    refresh,
    isLoading,
    ordersError
  } = useOrders();
  
  const [activeTab, setActiveTab] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Debug logging
  React.useEffect(() => {
    console.log('📊 OrdersDashboard - dashboardStats:', dashboardStats);
    console.log('📊 OrdersDashboard - statsLoading:', statsLoading);
    console.log('📊 OrdersDashboard - recentOrders:', recentOrders);
    console.log('📊 OrdersDashboard - ordersError:', ordersError);
  }, [dashboardStats, statsLoading, recentOrders, ordersError]);
  
  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };
  
  return (
    <div className="space-y-6 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Gerenciamento de Pedidos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie pedidos de compra, venda e transferência
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="bg-warm-gradient text-white border-0 shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[150px] mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : ordersError ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive font-medium">Erro ao carregar estatísticas</p>
              <p className="text-sm text-muted-foreground mt-2">
                {ordersError instanceof Error ? ordersError.message : 'Erro desconhecido'}
              </p>
              <Button onClick={refresh} className="mt-4" size="sm">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : dashboardStats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Pendentes', value: dashboardStats.pending_orders, hint: 'Aguardando aprovação', Icon: ShoppingCart, tone: 'warning' as const },
            { label: 'Processando', value: dashboardStats.processing_orders, hint: 'Em processamento', Icon: Package, tone: 'info' as const },
            { label: 'Enviados', value: dashboardStats.shipped_orders, hint: 'Em trânsito', Icon: Truck, tone: 'accent' as const },
            { label: 'Receita Total', value: formatCurrency(dashboardStats.total_revenue), hint: 'Pedidos aprovados', Icon: DollarSign, tone: 'primary' as const },
          ].map(({ label, value, hint, Icon, tone }) => (
            <Card key={label} className="card-elevated">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      {label}
                    </p>
                    <p className="font-display text-2xl font-bold mt-1.5 text-foreground tabular-nums truncate">
                      {value}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground truncate">{hint}</p>
                  </div>
                  <div
                    className={
                      tone === 'warning' ? 'w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0'
                      : tone === 'info' ? 'w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0'
                      : tone === 'accent' ? 'w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0'
                      : 'w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0'
                    }
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">Nenhuma estatística disponível ainda</p>
              <p className="text-sm text-muted-foreground mt-2">
                Crie seu primeiro pedido para ver as estatísticas
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Receita Hoje + Recentes */}
      {dashboardStats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="card-elevated">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Receita Hoje
                  </p>
                  <p className="font-display text-2xl font-bold mt-1.5 text-foreground tabular-nums truncate">
                    {formatCurrency(dashboardStats.today_revenue)}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {dashboardStats.today_orders} pedidos hoje
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Pedidos Recentes
                  </p>
                  <p className="font-display text-2xl font-bold mt-1.5 text-foreground tabular-nums">
                    {recentOrders.length}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Últimos 10 pedidos</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Tabs de Pedidos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="draft">Rascunhos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="processing">Processando</TabsTrigger>
          <TabsTrigger value="shipped">Enviados</TabsTrigger>
          <TabsTrigger value="delivered">Entregues</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <OrdersList />
        </TabsContent>
        
        <TabsContent value="draft" className="mt-6">
          <OrdersList filters={{ order_status: 'draft' }} />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <OrdersList filters={{ order_status: 'pending' }} />
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          <OrdersList filters={{ order_status: 'approved' }} />
        </TabsContent>
        
        <TabsContent value="processing" className="mt-6">
          <OrdersList filters={{ order_status: 'processing' }} />
        </TabsContent>
        
        <TabsContent value="shipped" className="mt-6">
          <OrdersList filters={{ order_status: 'shipped' }} />
        </TabsContent>
        
        <TabsContent value="delivered" className="mt-6">
          <OrdersList filters={{ order_status: 'delivered' }} />
        </TabsContent>
      </Tabs>
      
      {/* Dialog de Criar Pedido */}
      <CreateOrderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

export default OrdersDashboard;

