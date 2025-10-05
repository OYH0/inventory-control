# ⚡ INTEGRAÇÃO RÁPIDA: Análise ABC no Projeto

## 🎯 COMO USAR EM 5 MINUTOS

### 1️⃣ Adicionar Rota (30 segundos)

```tsx
// src/App.tsx
import ABCDashboard from '@/components/abc-analysis/ABCDashboard';

// Adicione a rota
<Route path="/abc-analysis" element={<ABCDashboard />} />
```

### 2️⃣ Adicionar ao Menu (1 minuto)

```tsx
// src/components/AppSidebar.tsx
import { BarChart3 } from 'lucide-react';

// Adicione no menu
<SidebarMenuButton asChild>
  <Link to="/abc-analysis">
    <BarChart3 />
    <span>Análise ABC</span>
  </Link>
</SidebarMenuButton>
```

### 3️⃣ Configurar Produtos (2 minutos)

Atualize alguns produtos com dados ABC via Supabase Dashboard ou código:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Exemplo: Atualizar produto
await supabase
  .from('camara_fria_items')
  .update({
    unit_cost: 25.50,
    annual_demand: 1200,
    ordering_cost: 100.00,
    carrying_cost_percentage: 25.00,
    lead_time_days: 7
  })
  .eq('id', 'produto-id');
```

### 4️⃣ Executar Classificação (30 segundos)

Vá para `/abc-analysis` e clique em **"Classificar Agora"**.

### 5️⃣ Ver Resultados (1 minuto)

✅ Dashboard completo funcionando com:
- Cards de resumo por categoria
- Gráfico de Pareto
- Tabela de produtos
- Recomendações

---

## 🔥 EXEMPLOS DE USO

### Usar Hook em Qualquer Componente

```tsx
import { useABCAnalysis } from '@/hooks/useABCAnalysis';

function MeuComponente() {
  const { summary, classify, isClassifying } = useABCAnalysis();
  
  return (
    <div>
      <h2>Total: {summary?.total_products} produtos</h2>
      <button onClick={() => classify()} disabled={isClassifying}>
        {isClassifying ? 'Classificando...' : 'Classificar'}
      </button>
    </div>
  );
}
```

### Mostrar Categoria em Cards de Produtos

```tsx
import { Badge } from '@/components/ui/badge';

function ProductCard({ product }) {
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'A': return 'bg-red-500';
      case 'B': return 'bg-yellow-500';
      case 'C': return 'bg-green-500';
    }
  };
  
  return (
    <div className="p-4 border rounded">
      <h3>{product.nome}</h3>
      {product.abc_category && (
        <Badge className={getCategoryColor(product.abc_category)}>
          Categoria {product.abc_category}
        </Badge>
      )}
      {product.eoq && (
        <p className="text-sm text-muted-foreground">
          EOQ: {product.eoq} unidades
        </p>
      )}
    </div>
  );
}
```

### Calcular EOQ em Tempo Real

```typescript
import ABCAnalysisService from '@/services/ABCAnalysisService';

function calculateOrderQuantity(product) {
  const eoq = ABCAnalysisService.calculateEOQ({
    annual_demand: product.annual_demand,
    ordering_cost: 100,
    unit_cost: product.unit_cost,
    carrying_cost_percentage: 25
  });
  
  console.log(`EOQ para ${product.nome}: ${eoq.eoq} unidades`);
  console.log(`Pedidos por ano: ${eoq.orders_per_year}`);
  console.log(`Custo total anual: R$ ${eoq.total_annual_cost}`);
}
```

### Listar Produtos por Categoria

```tsx
import { useABCProducts } from '@/hooks/useABCProducts';

function ProdutosCategoriaA() {
  const { products, isLoading } = useABCProducts({
    category: 'A',
    sortBy: 'value',
    sortOrder: 'desc'
  });
  
  if (isLoading) return <div>Carregando...</div>;
  
  return (
    <div>
      <h2>Produtos Categoria A ({products.length})</h2>
      {products.map(p => (
        <div key={p.id}>
          <strong>{p.product_name}</strong>
          <span>R$ {p.annual_consumption_value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 SQL ÚTIL

### Ver Distribuição ABC

```sql
SELECT 
    abc_category,
    COUNT(*) as total_produtos,
    SUM(annual_consumption_value) as valor_total,
    ROUND(AVG(annual_consumption_value), 2) as valor_medio
FROM camara_fria_items
WHERE abc_category IS NOT NULL
GROUP BY abc_category
ORDER BY abc_category;
```

### Ver Top 10 Produtos (Alto Valor)

```sql
SELECT 
    nome,
    abc_category,
    unit_cost,
    annual_demand,
    annual_consumption_value,
    eoq,
    reorder_point
FROM camara_fria_items
WHERE abc_category IS NOT NULL
ORDER BY annual_consumption_value DESC
LIMIT 10;
```

### Atualizar Produtos em Batch

```sql
-- Exemplo: Atualizar todos produtos de uma categoria
UPDATE camara_fria_items
SET 
    unit_cost = 20.00,
    annual_demand = 1000,
    ordering_cost = 100.00
WHERE categoria = 'Carnes';

-- Executar classificação após atualizar
-- (use o botão no dashboard ou código TypeScript)
```

---

## 🎨 CUSTOMIZAÇÃO

### Alterar Thresholds de Categoria

```typescript
import { useABCAnalysis } from '@/hooks/useABCAnalysis';

function Configuracoes() {
  const { config, updateConfiguration, isUpdatingConfig } = useABCAnalysis();
  
  const handleSave = () => {
    updateConfiguration({
      category_a_threshold: 75.00,  // Mudar de 80% para 75%
      category_b_threshold: 90.00   // Mudar de 95% para 90%
    });
  };
  
  return (
    <div>
      <button onClick={handleSave} disabled={isUpdatingConfig}>
        Salvar Configurações
      </button>
    </div>
  );
}
```

### Adicionar Gráfico em Outro Componente

```tsx
import ABCParetoChart from '@/components/abc-analysis/ABCParetoChart';
import { useABCAnalysis } from '@/hooks/useABCAnalysis';

function MinhaPageDeRelatorios() {
  const { paretoData, paretoLoading } = useABCAnalysis();
  
  return (
    <div>
      <h1>Relatórios</h1>
      <ABCParetoChart data={paretoData} isLoading={paretoLoading} />
    </div>
  );
}
```

---

## 🔗 INTEGRAÇÃO COM PÁGINAS EXISTENTES

### Câmara Fria - Adicionar Badge ABC

```tsx
// src/components/camara-fria/CamaraFriaItemCard.tsx

import { Badge } from '@/components/ui/badge';

function CamaraFriaItemCard({ item }) {
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'A': return 'bg-red-500 text-white';
      case 'B': return 'bg-yellow-500 text-white';
      case 'C': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{item.nome}</CardTitle>
        {item.abc_category && (
          <Badge className={getCategoryColor(item.abc_category)}>
            {item.abc_category}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p>Quantidade: {item.quantidade}</p>
        {item.eoq && (
          <p className="text-sm text-muted-foreground">
            Lote Econômico: {item.eoq} unidades
          </p>
        )}
        {item.reorder_point && (
          <p className="text-sm text-muted-foreground">
            Reordenar em: {item.reorder_point} unidades
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Dashboard Principal - Adicionar Card ABC

```tsx
// src/components/Dashboard.tsx

import { useABCAnalysis } from '@/hooks/useABCAnalysis';
import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { summary, isLoading } = useABCAnalysis();
  
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Outros cards do dashboard */}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise ABC
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando...</p>
          ) : summary ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Categoria A:</span>
                <strong>{summary.category_breakdown.A.count} itens</strong>
              </div>
              <div className="flex justify-between">
                <span>Eficiência Pareto:</span>
                <strong>{summary.pareto_efficiency.toFixed(1)}%</strong>
              </div>
              <Link to="/abc-analysis">
                <Button className="w-full mt-4">
                  Ver Análise Completa
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Configure produtos para ver análise
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🎯 CASOS DE USO PRÁTICOS

### 1. Alertar Sobre Produtos Categoria A com Estoque Baixo

```typescript
import { useABCProducts } from '@/hooks/useABCProducts';

function AlertasEstoque() {
  const { products } = useABCProducts({ category: 'A' });
  
  const produtosCriticos = products.filter(p => 
    p.reorder_point && p.quantidade <= p.reorder_point
  );
  
  return (
    <div>
      {produtosCriticos.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Atenção: {produtosCriticos.length} produtos críticos (Categoria A) abaixo do ponto de reordenamento!</AlertTitle>
          <ul>
            {produtosCriticos.map(p => (
              <li key={p.id}>{p.product_name} - Quantidade: {p.quantidade}</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
}
```

### 2. Sugerir Quantidade de Pedido ao Reabastecer

```typescript
function FormularioPedido({ produto }) {
  const eoqSugerido = produto.eoq || calculateDefaultQuantity(produto);
  
  return (
    <form>
      <label>Quantidade a pedir:</label>
      <Input 
        type="number" 
        defaultValue={eoqSugerido}
        min={1}
      />
      <p className="text-sm text-muted-foreground">
        EOQ sugerido: {eoqSugerido} unidades
        {produto.abc_category === 'A' && (
          <span className="text-red-600"> (Produto crítico - Categoria A)</span>
        )}
      </p>
    </form>
  );
}
```

### 3. Relatório de Revisão de Estoque

```typescript
import { useABCProducts } from '@/hooks/useABCProducts';

function RelatorioRevisao() {
  const { products: produtosA } = useABCProducts({ category: 'A' });
  const { products: produtosB } = useABCProducts({ category: 'B' });
  
  const dataAtual = new Date();
  const dataUltimaRevisaoA = new Date(dataAtual.setDate(dataAtual.getDate() - 7));
  const dataUltimaRevisaoB = new Date(dataAtual.setDate(dataAtual.getDate() - 30));
  
  return (
    <div>
      <h2>Produtos para Revisar Esta Semana</h2>
      
      <section>
        <h3>Categoria A (Revisão Semanal)</h3>
        <ul>
          {produtosA.map(p => (
            <li key={p.id}>
              {p.product_name} - Última revisão: {dataUltimaRevisaoA.toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section>
      
      <section>
        <h3>Categoria B (Revisão Mensal)</h3>
        <ul>
          {produtosB.slice(0, 10).map(p => (
            <li key={p.id}>
              {p.product_name} - Última revisão: {dataUltimaRevisaoB.toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

---

## 🚀 DEPLOY

### Verificar Antes do Deploy

```bash
# 1. Rodar testes
npm run test

# 2. Build
npm run build

# 3. Verificar tipos TypeScript
npx tsc --noEmit

# 4. Lint
npm run lint
```

### Checklist Pré-Deploy

- [ ] Migration ABC aplicada no Supabase
- [ ] Produtos configurados com unit_cost e annual_demand
- [ ] Primeira classificação executada
- [ ] Testes passando
- [ ] Build sem erros
- [ ] RLS policies ativas
- [ ] Dashboard carrega corretamente

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **Backend:** `ABC_ANALYSIS_IMPLEMENTATION.md`
- **Frontend:** `ABC_FRONTEND_COMPLETO.md`
- **Quick Start:** `_ABC_QUICK_START.md`
- **Este arquivo:** `INTEGRACAO_ABC_RAPIDA.md`

---

## 🆘 TROUBLESHOOTING

### Erro: "Hook can only be used inside QueryClientProvider"

**Solução:** Certifique-se que o App está envolvido com QueryClientProvider:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Produtos não aparecem no gráfico

**Causa:** Produtos sem `annual_consumption_value > 0`

**Solução:** Configure `unit_cost` e `annual_demand` nos produtos.

### Classificação não funciona

**Causa:** Usuário sem organização

**Solução:** Execute no SQL do Supabase:
```sql
SELECT auto_create_organization_for_user();
```

---

**Data:** 05/10/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para integração

**🚀 Comece agora em 5 minutos!**

