// =====================================================
// COMPONENT: ABCCategoryCard - Card de resumo por categoria
// =====================================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Package } from 'lucide-react';
import type { ABCCategory } from '@/types/abc-analysis';

interface ABCCategoryCardProps {
  category: ABCCategory;
  count: number;
  percentage: number;
  value: number;
  valuePercentage: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

const categoryConfig = {
  A: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Categoria A - Alto Valor',
    description: 'Itens críticos que representam 80% do valor'
  },
  B: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: 'Categoria B - Valor Médio',
    description: 'Itens importantes com controle moderado'
  },
  C: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Categoria C - Baixo Valor',
    description: 'Itens de baixo impacto financeiro'
  }
};

export function ABCCategoryCard({
  category,
  count,
  percentage,
  value,
  valuePercentage,
  trend,
  trendValue
}: ABCCategoryCardProps) {
  const config = categoryConfig[category];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const TrendIcon = trend === 'up' 
    ? TrendingUp 
    : trend === 'down' 
    ? TrendingDown 
    : Minus;
  
  return (
    <Card className={`${config.borderColor} border-2 hover:shadow-lg transition-shadow`}>
      <CardHeader className={`${config.bgLight} pb-3`}>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold">
              {config.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
          <Badge 
            className={`${config.color} text-white text-2xl font-bold px-4 py-2`}
          >
            {category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Quantidade de produtos */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className={`h-5 w-5 ${config.textColor}`} />
            <span className="text-sm text-muted-foreground">Produtos:</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-sm text-muted-foreground">
              {percentage.toFixed(1)}% do total
            </p>
          </div>
        </div>
        
        {/* Valor total */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor Anual:</span>
            <div className="text-right">
              <p className={`text-xl font-bold ${config.textColor}`}>
                {formatCurrency(value)}
              </p>
              <p className="text-sm text-muted-foreground">
                {valuePercentage.toFixed(1)}% do valor total
              </p>
            </div>
          </div>
        </div>
        
        {/* Tendência */}
        {trend && trendValue !== undefined && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tendência:</span>
              <div className="flex items-center gap-2">
                <TrendIcon 
                  className={`h-4 w-4 ${
                    trend === 'up' ? 'text-green-600' : 
                    trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`} 
                />
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ABCCategoryCard;

