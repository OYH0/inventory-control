import { RefreshCw, Building2, Users, Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalStats } from '@/hooks/admin/useGlobalStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export default function GlobalStatistics() {
  const { stats, loading, refetch } = useGlobalStats();

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalItems = 
    stats.camara_fria_count +
    stats.camara_refrigerada_count +
    stats.estoque_seco_count +
    stats.bebidas_count +
    stats.descartaveis_count;

  const activeOrgPercentage = stats.total_orgs > 0 
    ? (stats.active_orgs / stats.total_orgs) * 100 
    : 0;

  const activeUserPercentage = stats.total_users > 0 
    ? (stats.active_users / stats.total_users) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Estatísticas Globais</h2>
          <p className="text-sm text-muted-foreground">Visão geral do sistema</p>
        </div>
        <Button 
          variant="outline"
          onClick={refetch}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Organizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.active_orgs}</p>
                  <p className="text-xs text-muted-foreground">de {stats.total_orgs} ativas</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <Progress value={activeOrgPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{activeOrgPercentage.toFixed(1)}% ativas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.active_users}</p>
                  <p className="text-xs text-muted-foreground">de {stats.total_users} ativos</p>
                </div>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <Progress value={activeUserPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{activeUserPercentage.toFixed(1)}% ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4 text-green-500" />
              Total de Itens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{totalItems.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">no inventário</p>
                </div>
                <Package className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">
                Média: {stats.total_orgs > 0 ? Math.round(totalItems / stats.total_orgs) : 0} por org
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-purple-500" />
              Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.total_orders.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">total</p>
                </div>
                <ShoppingCart className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground">
                Média: {stats.total_orgs > 0 ? Math.round(stats.total_orders / stats.total_orgs) : 0} por org
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Itens por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Itens por Categoria</CardTitle>
          <CardDescription>Quantidade de itens em cada tipo de armazenamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Câmara Fria</span>
                <span className="font-medium">{stats.camara_fria_count.toLocaleString()}</span>
              </div>
              <Progress value={(stats.camara_fria_count / totalItems) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Câmara Refrigerada</span>
                <span className="font-medium">{stats.camara_refrigerada_count.toLocaleString()}</span>
              </div>
              <Progress value={(stats.camara_refrigerada_count / totalItems) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Estoque Seco</span>
                <span className="font-medium">{stats.estoque_seco_count.toLocaleString()}</span>
              </div>
              <Progress value={(stats.estoque_seco_count / totalItems) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bebidas</span>
                <span className="font-medium">{stats.bebidas_count.toLocaleString()}</span>
              </div>
              <Progress value={(stats.bebidas_count / totalItems) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Descartáveis</span>
                <span className="font-medium">{stats.descartaveis_count.toLocaleString()}</span>
              </div>
              <Progress value={(stats.descartaveis_count / totalItems) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Avisos */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Alertas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.active_orgs < stats.total_orgs && (
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
              <p>
                <strong>{stats.total_orgs - stats.active_orgs}</strong> organização(ões) inativa(s)
              </p>
            </div>
          )}
          {stats.active_users < stats.total_users && (
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
              <p>
                <strong>{stats.total_users - stats.active_users}</strong> usuário(s) inativo(s)
              </p>
            </div>
          )}
          {stats.active_orgs === stats.total_orgs && stats.active_users === stats.total_users && (
            <p className="text-sm text-green-600">✓ Nenhum alerta no momento</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

