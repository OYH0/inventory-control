// =====================================================
// COMPONENT: ABCParetoChart - Gráfico de Pareto ABC
// =====================================================

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ABCParetoDataPoint } from '@/types/abc-analysis';

interface ABCParetoChartProps {
  data?: ABCParetoDataPoint[];
  isLoading?: boolean;
}

export function ABCParetoChart({ data, isLoading }: ABCParetoChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Limitar a 50 produtos para melhor visualização
    return data.slice(0, 50).map((item, index) => ({
      name: item.product_name.substring(0, 20) + (item.product_name.length > 20 ? '...' : ''),
      fullName: item.product_name,
      sku: item.product_sku,
      valor: item.annual_value,
      acumulado: item.cumulative_percentage,
      category: item.category,
      index: index + 1
    }));
  }, [data]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'A': return '#ef4444'; // red-500
      case 'B': return '#f59e0b'; // yellow-500
      case 'C': return '#10b981'; // green-500
      default: return '#6b7280'; // gray-500
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[400px] mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Pareto</CardTitle>
          <CardDescription>
            Nenhum dado disponível para exibir
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg">Configure custos e demanda nos produtos</p>
            <p className="text-sm mt-2">e execute a classificação ABC</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Pareto - Análise ABC</CardTitle>
        <CardDescription>
          Distribuição de valor por produto (Princípio 80/20)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            
            <XAxis 
              dataKey="index"
              label={{ 
                value: 'Produtos (ordenados por valor)', 
                position: 'insideBottom', 
                offset: -10 
              }}
              tick={{ fontSize: 12 }}
            />
            
            <YAxis 
              yAxisId="left"
              label={{ 
                value: 'Valor Anual (R$)', 
                angle: -90, 
                position: 'insideLeft' 
              }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              label={{ 
                value: '% Acumulado', 
                angle: 90, 
                position: 'insideRight' 
              }}
              tickFormatter={(value) => `${value}%`}
            />
            
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value: any, name: string, props: any) => {
                if (name === 'Valor Anual') {
                  return [formatCurrency(value), name];
                }
                if (name === '% Acumulado') {
                  return [`${value.toFixed(2)}%`, name];
                }
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const item = payload[0].payload;
                  return (
                    <div>
                      <p className="font-bold">{item.fullName}</p>
                      {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                      <p className="text-xs">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-1" 
                          style={{ backgroundColor: getCategoryColor(item.category) }}
                        />
                        Categoria {item.category}
                      </p>
                    </div>
                  );
                }
                return label;
              }}
            />
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            
            {/* Linhas de referência para thresholds */}
            <ReferenceLine 
              yAxisId="right" 
              y={80} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label={{ value: 'Categoria A (80%)', position: 'right', fill: '#ef4444' }}
            />
            
            <ReferenceLine 
              yAxisId="right" 
              y={95} 
              stroke="#f59e0b" 
              strokeDasharray="3 3"
              label={{ value: 'Categoria B (95%)', position: 'right', fill: '#f59e0b' }}
            />
            
            {/* Barras de valor */}
            <Bar
              yAxisId="left"
              dataKey="valor"
              name="Valor Anual"
              fill={(entry: any) => getCategoryColor(entry.category)}
              radius={[4, 4, 0, 0]}
            />
            
            {/* Linha acumulada */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="acumulado"
              name="% Acumulado"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Legenda de cores */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-muted-foreground">Categoria A (Alto Valor)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-sm text-muted-foreground">Categoria B (Valor Médio)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-muted-foreground">Categoria C (Baixo Valor)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ABCParetoChart;

