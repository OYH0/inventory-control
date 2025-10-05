# 🔧 Correção: Campos ABC não são salvos no banco

## 🔍 Problema
Quando você preenche os campos ABC (unit_cost, annual_demand, etc) ao adicionar um item, eles não são salvos no banco de dados.

## 📋 Causa
Os hooks de dados (`useBebidas`, `useEstoqueSecoData`, `useCamaraFriaData`, etc) não estão incluindo os campos ABC no objeto de insert.

## ✅ Solução

Você precisa adicionar os campos ABC em **5 arquivos de hooks**:

### 1. `src/hooks/useEstoqueSecoData.tsx`
**Linha ~76-88**, substitua o `itemToInsert` por:

```typescript
const itemToInsert = {
  nome: newItem.nome,
  quantidade: Number(newItem.quantidade),
  categoria: newItem.categoria,
  minimo: newItem.minimo,
  data_entrada: new Date().toISOString().split('T')[0],
  data_validade: newItem.data_validade,
  preco_unitario: newItem.preco_unitario,
  fornecedor: newItem.fornecedor,
  observacoes: newItem.observacoes,
  user_id: user.id,
  unidade: newItem.unidade_item || 'juazeiro_norte',
  // Campos ABC
  unit_cost: (newItem as any).unit_cost,
  annual_demand: (newItem as any).annual_demand,
  ordering_cost: (newItem as any).ordering_cost,
  carrying_cost_percentage: (newItem as any).carrying_cost_percentage,
  lead_time_days: (newItem as any).lead_time_days
};
```

### 2. `src/hooks/useBebidas.tsx`
**Linha ~128-143**, substitua o `itemData` por:

```typescript
const itemData = {
  user_id: user.id,
  nome: newItem.nome.trim(),
  quantidade: Number(newItem.quantidade),
  unidade: newItem.unidade || 'un',
  categoria: newItem.categoria,
  data_entrada: newItem.data_entrada || new Date().toISOString().split('T')[0],
  data_validade: newItem.data_validade || null,
  temperatura: newItem.temperatura || null,
  temperatura_ideal: newItem.temperatura_ideal || null,
  fornecedor: newItem.fornecedor?.trim() || null,
  observacoes: newItem.observacoes?.trim() || null,
  unidade_item: newItem.unidade_item || 'juazeiro_norte',
  minimo: newItem.minimo || 10,
  preco_unitario: newItem.preco_unitario || null,
  // Campos ABC
  unit_cost: (newItem as any).unit_cost || null,
  annual_demand: (newItem as any).annual_demand || null,
  ordering_cost: (newItem as any).ordering_cost || null,
  carrying_cost_percentage: (newItem as any).carrying_cost_percentage || null,
  lead_time_days: (newItem as any).lead_time_days || null
};
```

### 3. `src/hooks/useCamaraFriaData.tsx`
Procure a função `addItem` e adicione os campos ABC no objeto de insert:

```typescript
const itemToInsert = {
  // ... campos existentes ...
  // Campos ABC
  unit_cost: (newItem as any).unit_cost,
  annual_demand: (newItem as any).annual_demand,
  ordering_cost: (newItem as any).ordering_cost,
  carrying_cost_percentage: (newItem as any).carrying_cost_percentage,
  lead_time_days: (newItem as any).lead_time_days
};
```

### 4. `src/hooks/useCamaraRefrigeradaData.tsx`
Mesma alteração - adicione os campos ABC no insert.

### 5. `src/hooks/useDescartaveisData.tsx`
Mesma alteração - adicione os campos ABC no insert.

## 🚀 Após Aplicar

1. **Teste**: Adicione um novo item com:
   - unit_cost: 10.00
   - annual_demand: 100

2. **Verifique no Supabase**:
   - Vá para Table Editor
   - Abra a tabela (ex: estoque_seco_items)
   - Veja se os campos `unit_cost`, `annual_demand` e `annual_consumption_value` foram preenchidos

3. **Vá para Análise ABC**:
   - Clique em "Classificar Agora"
   - Seu produto aparecerá na lista!

## 📝 Exemplo Completo (useEstoqueSecoData.tsx)

```typescript
const addItem = async (newItem: Omit<EstoqueSecoItem, 'id'> & { 
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
  unit_cost?: number;
  annual_demand?: number;
  ordering_cost?: number;
  carrying_cost_percentage?: number;
  lead_time_days?: number;
}) => {
  if (!user) return;

  try {
    const itemToInsert = {
      nome: newItem.nome,
      quantidade: Number(newItem.quantidade),
      categoria: newItem.categoria,
      minimo: newItem.minimo,
      data_entrada: new Date().toISOString().split('T')[0],
      data_validade: newItem.data_validade,
      preco_unitario: newItem.preco_unitario,
      fornecedor: newItem.fornecedor,
      observacoes: newItem.observacoes,
      user_id: user.id,
      unidade: newItem.unidade_item || 'juazeiro_norte',
      // Campos ABC - ADICIONAR ESTAS LINHAS
      unit_cost: newItem.unit_cost,
      annual_demand: newItem.annual_demand,
      ordering_cost: newItem.ordering_cost,
      carrying_cost_percentage: newItem.carrying_cost_percentage,
      lead_time_days: newItem.lead_time_days
    };

    const { data, error } = await supabase
      .from('estoque_seco_items')
      .insert([itemToInsert])
      .select()
      .single();

    if (error) throw error;
    
    // ... resto do código
  }
};
```

## ⚠️ Importante

- Os campos ABC são **opcionais** - se não preenchidos, serão `null`
- O trigger do banco calculará `annual_consumption_value` automaticamente
- Você precisa clicar em "Classificar Agora" para definir a categoria (A/B/C)

## 🔄 Fluxo Completo

1. **Usuário preenche** formulário com campos ABC
2. **Hook salva** no banco (com esta correção)
3. **Trigger calcula** annual_consumption_value automaticamente
4. **Usuário clica** "Classificar Agora" na aba ABC
5. **Sistema define** categoria A/B/C
6. **Produto aparece** na lista ABC

---

**Status**: Aguardando aplicação manual  
**Arquivos afetados**: 5 hooks de dados  
**Tempo estimado**: 10 minutos
