import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Snowflake, 
  Thermometer,
  Wine,
  FileText,
  Activity,
  ShoppingCart,
  DollarSign,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUnit } from '@/contexts/UnitContext';
import { useCamaraFriaData } from '@/hooks/useCamaraFriaData';
import { useCamaraFriaHistorico } from '@/hooks/useCamaraFriaHistorico';
import { useEstoqueSecoData } from '@/hooks/useEstoqueSecoData';
import { useDescartaveisData } from '@/hooks/useDescartaveisData';
import { useBebidas } from '@/hooks/useBebidas';
import { useCamaraRefrigeradaData } from '@/hooks/useCamaraRefrigeradaData';

// Paleta dos gráficos alinhada ao design system (âmbar, esmeralda, info, etc.)
const CHART_COLORS = [
  'hsl(25 90% 50%)',   // primary âmbar
  'hsl(158 70% 38%)',  // accent esmeralda
  'hsl(217 75% 55%)',  // info azul
  'hsl(38 92% 55%)',   // warning quente
  'hsl(280 65% 55%)',  // roxo complementar
  'hsl(340 75% 55%)',  // rosa choque
  'hsl(180 60% 40%)',  // teal
  'hsl(15 80% 55%)',   // coral
];
const CHART_ENTRADA = 'hsl(158 70% 38%)';
const CHART_SAIDA = 'hsl(0 75% 52%)';

export function Dashboard() {
  const isMobile = useIsMobile();
  const { selectedUnit } = useUnit();
  // Dashboard respeita o seletor global. null = todas as acessíveis.
  const filtro: 'juazeiro_norte' | 'fortaleza' | 'todas' = selectedUnit ?? 'todas';

  const { items: camaraFriaItems } = useCamaraFriaData(filtro);
  const { historico: camaraFriaHistorico } = useCamaraFriaHistorico(filtro);
  const { items: estoqueSecoItems } = useEstoqueSecoData();
  const { items: descartaveisItems } = useDescartaveisData(filtro);
  const { items: bebidasItems } = useBebidas();
  const { items: camaraRefrigeradaItems } = useCamaraRefrigeradaData(filtro);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalItems = camaraFriaItems.length + estoqueSecoItems.length + descartaveisItems.length + bebidasItems.length + camaraRefrigeradaItems.length;
    
    const lowStockItems = [
      ...camaraFriaItems.filter(item => item.quantidade <= (item.minimo || 5)),
      ...estoqueSecoItems.filter(item => item.quantidade <= (item.minimo || 5)),
      ...descartaveisItems.filter(item => item.quantidade <= (item.minimo || 10)),
      ...bebidasItems.filter(item => item.quantidade <= (item.minimo || 20))
    ];

    const totalValue = [
      ...camaraFriaItems.map(item => (item.preco_unitario || 0) * item.quantidade),
      ...estoqueSecoItems.map(item => (item.preco_unitario || 0) * item.quantidade),
      ...bebidasItems.map(item => (item.preco_unitario || 0) * item.quantidade)
    ].reduce((sum, value) => sum + value, 0);

    const recentMovements = camaraFriaHistorico.filter(item => {
      const itemDate = new Date(item.data_operacao || '');
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return itemDate >= sevenDaysAgo;
    }).length;

    return {
      totalItems,
      lowStockCount: lowStockItems.length,
      totalValue,
      recentMovements,
      categories: {
        camaraFria: camaraFriaItems.length,
        estoqueSeco: estoqueSecoItems.length,
        descartaveis: descartaveisItems.length,
        bebidas: bebidasItems.length,
        camaraRefrigerada: camaraRefrigeradaItems.length
      }
    };
  }, [camaraFriaItems, estoqueSecoItems, descartaveisItems, bebidasItems, camaraRefrigeradaItems, camaraFriaHistorico]);

  // Dados das carnes mais utilizadas (baseado nas saídas da câmara fria)
  const topUsedMeats = useMemo(() => {
    const meatUsage = camaraFriaHistorico
      .filter(item => item.tipo === 'saida')
      .reduce((acc, item) => {
        const existing = acc.find(a => a.name === item.item_nome);
        if (existing) {
          existing.value += item.quantidade;
        } else {
          acc.push({ 
            name: item.item_nome, 
            value: item.quantidade,
            color: CHART_COLORS[acc.length % CHART_COLORS.length]
          });
        }
        return acc;
      }, [] as any[])
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 carnes mais utilizadas

    return meatUsage;
  }, [camaraFriaHistorico]);

  // Dados para resumo de categorias (cores alinhadas ao design system)
  const categoryData = useMemo(() => [
    { name: 'Câmara Fria', value: stats.categories.camaraFria, icon: Snowflake, color: 'hsl(217 75% 55%)' },
    { name: 'Estoque Seco', value: stats.categories.estoqueSeco, icon: Package, color: 'hsl(38 92% 55%)' },
    { name: 'Descartáveis', value: stats.categories.descartaveis, icon: FileText, color: 'hsl(158 70% 38%)' },
    { name: 'Bebidas', value: stats.categories.bebidas, icon: Wine, color: 'hsl(25 90% 50%)' },
    { name: 'Câmara Refrigerada', value: stats.categories.camaraRefrigerada, icon: Thermometer, color: 'hsl(280 65% 55%)' }
  ].filter(item => item.value > 0), [stats.categories]);

  // Análise de movimentação por dia (últimos 7 dias)
  const movementAnalysis = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayMovements = camaraFriaHistorico.filter(item => 
        item.data_operacao?.split('T')[0] === date
      );

      const entradas = dayMovements.filter(item => item.tipo === 'entrada').length;
      const saidas = dayMovements.filter(item => item.tipo === 'saida').length;

      return {
        date,
        day: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        entradas,
        saidas,
        total: entradas + saidas
      };
    });
  }, [camaraFriaHistorico]);

  // Top itens mais movimentados
  const topMovedItems = useMemo(() => {
    const itemMovements = camaraFriaHistorico.reduce((acc, movement) => {
      const key = movement.item_nome;
      if (!acc[key]) {
        acc[key] = { nome: key, total: 0, entradas: 0, saidas: 0 };
      }
      acc[key].total += movement.quantidade;
      if (movement.tipo === 'entrada') {
        acc[key].entradas += movement.quantidade;
      } else {
        acc[key].saidas += movement.quantidade;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(itemMovements)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 5);
  }, [camaraFriaHistorico]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Layout Mobile - Elementos principais no topo */}
      {isMobile && (
        <div className="space-y-6">
          {/* Carnes Mais Utilizadas - Mobile First */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-info" />
                Carnes Mais Utilizadas
              </CardTitle>
              <CardDescription>
                Carnes com maior quantidade de saídas da câmara fria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {topUsedMeats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topUsedMeats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        strokeWidth={2}
                        stroke="#ffffff"
                      >
                        {topUsedMeats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} utilizados`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma saída de carne registrada</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Movimentações - Mobile */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                Movimentações (7 dias)
              </CardTitle>
              <CardDescription>
                Entradas e saídas registradas nos últimos dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={movementAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} ${name === 'entradas' ? 'entradas' : 'saídas'}`, 
                        name === 'entradas' ? 'Entradas' : 'Saídas'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="entradas"
                      stackId="1"
                      stroke={CHART_ENTRADA}
                      fill={CHART_ENTRADA}
                      fillOpacity={0.55}
                    />
                    <Area
                      type="monotone"
                      dataKey="saidas"
                      stackId="1"
                      stroke={CHART_SAIDA}
                      fill={CHART_SAIDA}
                      fillOpacity={0.55}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Itens Mais Movimentados - Mobile */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-warning" />
                Itens Mais Movimentados
              </CardTitle>
              <CardDescription>
                Produtos com maior quantidade de entradas e saídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topMovedItems.length > 0 ? (
                <div className="space-y-4">
                  {topMovedItems.map((item: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.entradas} entradas • {item.saidas} saídas
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {item.total} total
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma movimentação registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Total de Itens</p>
                <p className="font-display text-3xl font-bold mt-1.5 text-foreground tabular-nums">{stats.totalItems}</p>
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Activity className="w-3 h-3" />
                  Todos os estoques
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Baixo Estoque</p>
                <p className="font-display text-3xl font-bold mt-1.5 text-destructive tabular-nums">{stats.lowStockCount}</p>
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  Requer atenção
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Movimentações</p>
                <p className="font-display text-3xl font-bold mt-1.5 text-success tabular-nums">{stats.recentMovements}</p>
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Últimos 7 dias
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais - Desktop Only */}
      {!isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carnes Mais Utilizadas */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-blue-500" />
              Carnes Mais Utilizadas
            </CardTitle>
            <CardDescription>
              Carnes com maior quantidade de saídas da câmara fria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {topUsedMeats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topUsedMeats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#ffffff"
                    >
                      {topUsedMeats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} utilizados`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma saída de carne registrada</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Movimentações dos Últimos 7 Dias */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-success" />
              Movimentações (7 dias)
            </CardTitle>
            <CardDescription>
              Entradas e saídas registradas nos últimos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movementAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} ${name === 'entradas' ? 'entradas' : 'saídas'}`, 
                      name === 'entradas' ? 'Entradas' : 'Saídas'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="entradas" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="saidas" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Seção de Insights e Alertas - Desktop Only */}
      {!isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Itens Movimentados */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-warning" />
              Itens Mais Movimentados
            </CardTitle>
            <CardDescription>
              Produtos com maior quantidade de entradas e saídas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topMovedItems.length > 0 ? (
              <div className="space-y-4">
                {topMovedItems.map((item: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.entradas} entradas • {item.saidas} saídas
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {item.total} total
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma movimentação registrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo por Categoria */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-info" />
              Resumo de Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/60">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `color-mix(in srgb, ${category.color} 14%, transparent)` }}
                      >
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">{category.value} itens</p>
                      </div>
                    </div>
                    <div
                      className="w-1.5 h-9 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Alertas de Baixo Estoque */}
      {stats.lowStockCount > 0 && (
        <Card className="card-elevated border-l-4 border-l-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Baixo Estoque ({stats.lowStockCount} itens)
            </CardTitle>
            <CardDescription className="text-destructive">
              Itens que precisam de reposição urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ...camaraFriaItems.filter(item => item.quantidade <= (item.minimo || 5)).slice(0, 6),
                ...estoqueSecoItems.filter(item => item.quantidade <= (item.minimo || 5)).slice(0, 3),
                ...bebidasItems.filter(item => item.quantidade <= (item.minimo || 20)).slice(0, 3)
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-destructive/30">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-foreground">{item.nome}</p>
                    <p className="text-xs text-destructive tabular-nums">
                      {item.quantidade} / {item.minimo || 5} mín.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}