// =====================================================
// COMPONENT: ABCDashboard - Dashboard principal de Análise ABC
// =====================================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Play, Settings, BarChart3, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { useABCAnalysis } from '@/hooks/useABCAnalysis';
import ABCCategoryCard from './ABCCategoryCard';
import ABCParetoChart from './ABCParetoChart';
import ABCProductsTable from './ABCProductsTable';
import ABCRecommendations from './ABCRecommendations';
import { Skeleton } from '@/components/ui/skeleton';

export function ABCDashboard() {
  const {
    summary,
    paretoData,
    recommendations,
    categoryStats,
    isLoading,
    summaryLoading,
    paretoLoading,
    recommendationsLoading,
    hasData,
    classify,
    isClassifying,
    refresh
  } = useABCAnalysis();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calcular eficiência de Pareto
  const paretoEfficiency = summary?.pareto_efficiency || 0;
  const isParetoEfficient = paretoEfficiency >= 75; // 75% ou mais é considerado eficiente
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise ABC de Inventário</h1>
          <p className="text-muted-foreground mt-1">
            Classificação de produtos baseada no Princípio de Pareto (80/20)
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
            onClick={() => classify()}
            disabled={isClassifying}
            size="sm"
          >
            <Play className={`h-4 w-4 mr-2 ${isClassifying ? 'animate-pulse' : ''}`} />
            {isClassifying ? 'Classificando...' : 'Classificar Agora'}
          </Button>
        </div>
      </div>
      
      {/* Alertas */}
      {!hasData && !isLoading && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Configure seus produtos primeiro</AlertTitle>
          <AlertDescription>
            Para utilizar a Análise ABC, configure os custos unitários (unit_cost) e demanda anual (annual_demand) 
            nos seus produtos. Depois, execute a classificação clicando em "Classificar Agora".
          </AlertDescription>
        </Alert>
      )}
      
      {hasData && !isParetoEfficient && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção: Distribuição ABC não ideal</AlertTitle>
          <AlertDescription>
            Sua eficiência de Pareto está em {paretoEfficiency.toFixed(1)}%. 
            O ideal é que a categoria A represente cerca de 80% do valor com 20% dos produtos.
            Revise seus dados e custos.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Cards de resumo */}
      {summaryLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[250px] mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[150px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : hasData ? (
        <div className="grid gap-6 md:grid-cols-3">
          <ABCCategoryCard
            category="A"
            count={categoryStats.A.count}
            percentage={categoryStats.A.percentage}
            value={categoryStats.A.value}
            valuePercentage={categoryStats.A.value_percentage}
          />
          <ABCCategoryCard
            category="B"
            count={categoryStats.B.count}
            percentage={categoryStats.B.percentage}
            value={categoryStats.B.value}
            valuePercentage={categoryStats.B.value_percentage}
          />
          <ABCCategoryCard
            category="C"
            count={categoryStats.C.count}
            percentage={categoryStats.C.percentage}
            value={categoryStats.C.value}
            valuePercentage={categoryStats.C.value_percentage}
          />
        </div>
      ) : null}
      
      {/* Tabs de conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Métricas principais */}
          {hasData && (
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total de Produtos</CardDescription>
                  <CardTitle className="text-3xl">{summary?.total_products || 0}</CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Valor Total Inventário</CardDescription>
                  <CardTitle className="text-2xl">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(summary?.total_inventory_value || 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Eficiência de Pareto</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {paretoEfficiency.toFixed(1)}%
                    {isParetoEfficient ? (
                      <span className="text-green-600 text-sm">✓</span>
                    ) : (
                      <span className="text-red-600 text-sm">⚠</span>
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Última Análise</CardDescription>
                  <CardTitle className="text-lg">
                    {summary?.last_analysis_date 
                      ? new Date(summary.last_analysis_date).toLocaleDateString('pt-BR')
                      : 'Nunca'}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}
          
          {/* Gráfico de Pareto */}
          <ABCParetoChart data={paretoData} isLoading={paretoLoading} />
          
          {/* Informações adicionais */}
          {hasData && (
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Princípio de Pareto (80/20)</CardTitle>
                <CardDescription>
                  Entenda a classificação ABC do seu inventário
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">Categoria A - Alto Valor</h4>
                  <p className="text-sm text-red-700">
                    Representa aproximadamente 20% dos produtos e 80% do valor total. 
                    Requer controle rigoroso, monitoramento constante e revisão semanal.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Categoria B - Valor Médio</h4>
                  <p className="text-sm text-yellow-700">
                    Representa aproximadamente 30% dos produtos e 15% do valor total. 
                    Requer controle moderado e revisão mensal.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Categoria C - Baixo Valor</h4>
                  <p className="text-sm text-green-700">
                    Representa aproximadamente 50% dos produtos e 5% do valor total. 
                    Requer controle simples e revisão trimestral.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Produtos */}
        <TabsContent value="products" className="mt-6">
          <ABCProductsTable />
        </TabsContent>
        
        {/* Recomendações */}
        <TabsContent value="recommendations" className="space-y-6 mt-6">
          <ABCRecommendations 
            recommendations={recommendations} 
            isLoading={recommendationsLoading}
          />
        </TabsContent>
        
        {/* Configurações */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Análise ABC</CardTitle>
              <CardDescription>
                Configure os parâmetros de classificação e análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Em desenvolvimento</AlertTitle>
                <AlertDescription>
                  A página de configurações está em desenvolvimento. 
                  Por enquanto, as configurações padrão estão sendo utilizadas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ABCDashboard;

