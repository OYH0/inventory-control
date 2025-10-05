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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie pedidos de compra, venda e transferência
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="sm"
          >
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
          {/* Pedidos Pendentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pendentes
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.pending_orders}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>
          
          {/* Processando */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Processando
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.processing_orders}
              </div>
              <p className="text-xs text-muted-foreground">
                Em processamento
              </p>
            </CardContent>
          </Card>
          
          {/* Enviados */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Enviados
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.shipped_orders}
              </div>
              <p className="text-xs text-muted-foreground">
                Em trânsito
              </p>
            </CardContent>
          </Card>
          
          {/* Receita Total */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardStats.total_revenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pedidos aprovados
              </p>
            </CardContent>
          </Card>
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
      
      {/* Receita Hoje */}
      {dashboardStats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Hoje
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardStats.today_revenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.today_orders} pedidos hoje
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Recentes
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentOrders.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 10 pedidos
              </p>
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

