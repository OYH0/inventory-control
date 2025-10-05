// =====================================================
// COMPONENT: ABCRecommendations - Recomendações estratégicas por categoria
// =====================================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import type { CategoryRecommendations } from '@/types/abc-analysis';
import { Skeleton } from '@/components/ui/skeleton';

interface ABCRecommendationsProps {
  recommendations?: CategoryRecommendations;
  isLoading?: boolean;
}

export function ABCRecommendations({ recommendations, isLoading }: ABCRecommendationsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[250px] mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!recommendations) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhuma recomendação disponível
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Categoria A */}
      <Card className="border-red-200 border-2">
        <CardHeader className="bg-red-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Categoria A</CardTitle>
            <Badge className="bg-red-500 text-white">Alto Valor</Badge>
          </div>
          <CardDescription>
            Controle rigoroso e monitoramento constante
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Frequência de reordenamento */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Frequência de Pedido</p>
                <p className="text-sm text-muted-foreground">
                  {recommendations.A.reorder_frequency === 'weekly' ? 'Semanal' : 
                   recommendations.A.reorder_frequency === 'monthly' ? 'Mensal' : 
                   'Trimestral'}
                </p>
              </div>
            </div>
            
            {/* Safety stock */}
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Safety Stock</p>
                <p className="text-sm text-muted-foreground">
                  {recommendations.A.safety_stock_level}% do consumo
                </p>
              </div>
            </div>
            
            {/* Prioridade */}
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Prioridade</p>
                <p className="text-sm text-muted-foreground">
                  {recommendations.A.monitoring_priority === 'high' ? 'Alta' : 
                   recommendations.A.monitoring_priority === 'medium' ? 'Média' : 
                   'Baixa'}
                </p>
              </div>
            </div>
            
            {/* Ações sugeridas */}
            <div className="border-t pt-4 mt-4">
              <p className="font-medium text-sm mb-3">Ações Recomendadas:</p>
              <ul className="space-y-2">
                {recommendations.A.suggested_actions.slice(0, 4).map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Categoria B */}
      <Card className="border-yellow-200 border-2">
        <CardHeader className="bg-yellow-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Categoria B</CardTitle>
            <Badge className="bg-yellow-500 text-white">Valor Médio</Badge>
          </div>
          <CardDescription>
            Controle moderado com revisões regulares
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Frequência de reordenamento */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Frequência de Pedido</p>
                <p className="text-sm text-muted-foreground">
                  {recommendations.B.reorder_frequency === 'weekly' ? 'Semanal' : 
                   recommendations.B.reorder_frequency === 'monthly' ? 'Mensal' : 
                   'Trimestral'}
                </p>
              </div>
            </div>
            
            {/* Safety stock */}
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Safety Stock</p>
                <p className="text-sm text-muted-foreground">
                  {recommendations.B.safety_stock_level}% do consumo
                </p>
              </div>
            </div>
            
            {/* Prioridade */}
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Prioridade</p>
                <p className="text-sm text-muted-foreground">
                  {recommendations.B.monitoring_priority === 'high' ? 'Alta' : 
                   recommendations.B.monitoring_priority === 'medium' ? 'Média' : 
                   'Baixa'}
                </p>
              </div>
            </div>
            
            {/* Ações sugeridas */}
            <div className="border-t pt-4 mt-4">
              <p className="font-medium text-sm mb-3">Ações Recomendadas:</p>
              <ul className="space-y-2">
                {recommendations.B.suggested_actions.slice(0, 4).map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Categoria C */}
      <Card className="border-green-200 border-2">
        <CardHeader className="bg-green-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Categoria C</CardTitle>
            <Badge className="bg-green-500 text-white">Baixo Valor</Badge>
          </div>
          <CardDescription>
            Controle simples e eficiente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Frequência de reordenamento */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Frequência de Pedido</p>
                <p className="text-sm text-muted-foreground">
                  {recommendations.C.reorder_frequency === 'weekly' ? 'Semanal' : 
                   recommendations.C.reorder_frequency === 'monthly' ? 'Mensal' : 
                   'Trimestral'}
                </p>
              </div>
            </div>
            
            {/* Safety stock */}
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Safety Stock</p>
                <p className="text-sm text-muted-foreground">
                  {recommendations.C.safety_stock_level}% do consumo
                </p>
              </div>
            </div>
            
            {/* Prioridade */}
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Prioridade</p>
                <p className="text-sm text-muted-foreground">
                  {recommendations.C.monitoring_priority === 'high' ? 'Alta' : 
                   recommendations.C.monitoring_priority === 'medium' ? 'Média' : 
                   'Baixa'}
                </p>
              </div>
            </div>
            
            {/* Ações sugeridas */}
            <div className="border-t pt-4 mt-4">
              <p className="font-medium text-sm mb-3">Ações Recomendadas:</p>
              <ul className="space-y-2">
                {recommendations.C.suggested_actions.slice(0, 4).map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ABCRecommendations;

