# 📦 Sistema de Gerenciamento de Pedidos

Sistema completo de gerenciamento de pedidos para compras, vendas, transferências e ajustes de inventário.

## 🚀 Como Usar

### 1. **Aplicar a Migration SQL**

Execute o arquivo `ORDERS_MIGRATION.sql` no **SQL Editor do Supabase**:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Cole o conteúdo do arquivo `ORDERS_MIGRATION.sql`
5. Clique em **RUN**

Isso criará:
- ✅ Tabelas: `orders`, `order_items`, `order_status_history`
- ✅ ENUMs: `order_type`, `order_status`, `payment_status`
- ✅ Funções: geração de número de pedido, cálculo de totais
- ✅ Triggers: atualização automática de estoque
- ✅ RLS Policies: segurança multi-tenant
- ✅ View: `orders_dashboard` para estatísticas

### 2. **Adicionar Rota no Sistema**

Adicione a rota de pedidos no seu arquivo de rotas (geralmente `src/App.tsx` ou `src/Router.tsx`):

```tsx
import Orders from '@/pages/Orders';

// Adicione na configuração de rotas:
<Route path="/orders" element={<Orders />} />
```

### 3. **Adicionar no Menu de Navegação**

Adicione um link para pedidos no seu sidebar ou menu:

```tsx
import { ShoppingCart } from 'lucide-react';

<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <Link to="/orders">
      <ShoppingCart className="h-4 w-4" />
      <span>Pedidos</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>
```

### 4. **Acessar o Sistema**

Navegue para `/orders` na sua aplicação para acessar o dashboard de pedidos.

---

## 📋 Funcionalidades

### ✅ Dashboard Completo

- **Cards de Estatísticas**
  - Pedidos pendentes
  - Pedidos em processamento
  - Pedidos enviados
  - Receita total
  - Receita do dia
  - Pedidos do dia

- **Filtros por Status**
  - Todos
  - Rascunhos
  - Pendentes
  - Aprovados
  - Processando
  - Enviados
  - Entregues

### ✅ Gerenciamento de Pedidos

- **Criar Pedidos**
  - Compra (purchase)
  - Venda (sale)
  - Transferência (transfer)
  - Ajuste (adjustment)

- **Operações**
  - Visualizar detalhes
  - Editar rascunhos
  - Aprovar pedidos
  - Cancelar pedidos
  - Excluir rascunhos

- **Tracking**
  - Histórico de status
  - Data de entrega esperada/real
  - Número de rastreamento
  - Transportadora

### ✅ Itens do Pedido

- Adicionar múltiplos itens
- Referência a qualquer tabela de inventário
- Quantidade, preço, desconto, taxa
- Cálculo automático de totais

### ✅ Automação

- **Geração automática de número de pedido**
  - Formato: `ORD-YYYYMM-XXXXX`
  - Exemplo: `ORD-202510-00001`

- **Cálculo automático de totais**
  - Subtotal dos itens
  - Impostos
  - Descontos
  - Frete
  - Total final

- **Atualização automática de estoque**
  - **Venda aprovada**: Deduz do estoque
  - **Compra entregue**: Adiciona ao estoque

- **Histórico de status**
  - Registra automaticamente todas as mudanças
  - Rastreamento de quem alterou
  - Timestamp de cada mudança

---

## 🏗️ Arquitetura

### **Camadas**

```
src/
├── types/
│   └── orders.ts           # Tipos TypeScript
├── services/
│   └── OrdersService.ts    # Lógica de negócio
├── hooks/
│   └── useOrders.tsx       # Estado e mutations (React Query)
├── components/
│   └── orders/
│       ├── OrdersDashboard.tsx   # Dashboard principal
│       ├── OrdersList.tsx        # Lista de pedidos
│       └── CreateOrderDialog.tsx # Criar pedido
└── pages/
    └── Orders.tsx          # Página principal
```

### **Fluxo de Dados**

```
UI Component
    ↓
useOrders Hook (React Query)
    ↓
OrdersService (Business Logic)
    ↓
Supabase Client
    ↓
Database (RLS + Triggers)
```

---

## 🔐 Segurança

### **Row Level Security (RLS)**

Todas as tabelas têm RLS habilitado:

- ✅ Usuários veem apenas pedidos da sua organização
- ✅ Apenas membros ativos podem acessar
- ✅ Isolamento completo multi-tenant

### **Permissões**

- **Visualizar**: Todos os membros da organização
- **Criar/Editar**: Usuários com permissão de escrita em inventário
- **Aprovar/Cancelar**: Apenas gerentes e administradores

---

## 📊 Tipos de Pedidos

### 1. **Compra (Purchase)**
- Pedido de compra de fornecedores
- Ao ser marcado como "entregue", **adiciona** ao estoque

### 2. **Venda (Sale)**
- Pedido de venda para clientes
- Ao ser aprovado, **deduz** do estoque

### 3. **Transferência (Transfer)**
- Transferência entre localizações (Juazeiro Norte ↔ Fortaleza)
- Movimentação interna

### 4. **Ajuste (Adjustment)**
- Ajustes de inventário
- Correções de estoque

---

## 📈 Status do Pedido

| Status | Descrição |
|--------|-----------|
| `draft` | Rascunho (pode editar/excluir) |
| `pending` | Pendente de aprovação |
| `approved` | Aprovado (estoque atualizado para vendas) |
| `processing` | Em processamento |
| `shipped` | Enviado/em trânsito |
| `delivered` | Entregue (estoque atualizado para compras) |
| `cancelled` | Cancelado |
| `returned` | Devolvido |

---

## 💡 Exemplos de Uso

### **Criar Pedido de Compra**

```typescript
import { useOrders } from '@/hooks/useOrders';

const { createOrder } = useOrders();

createOrder({
  order_type: 'purchase',
  supplier_customer_name: 'Fornecedor XYZ',
  expected_delivery_date: '2025-10-15',
  items: [
    {
      item_table: 'estoque_seco_items',
      item_id: 'uuid-do-item',
      item_name: 'Arroz 5kg',
      quantity: 100,
      unit_price: 25.50
    }
  ],
  notes: 'Pedido urgente'
});
```

### **Aprovar Pedido**

```typescript
const { approveOrder } = useOrders();

approveOrder('order-id');
// Automaticamente atualiza estoque se for venda
```

### **Cancelar Pedido**

```typescript
const { cancelOrder } = useOrders();

cancelOrder('order-id', 'Produto fora de estoque');
```

---

## 🎨 Customização

### **Cores de Status**

Edite em `src/types/orders.ts`:

```typescript
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'gray',
  pending: 'yellow',
  approved: 'blue',
  // ...
};
```

### **Labels**

Customize os rótulos em português:

```typescript
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  purchase: 'Compra',
  sale: 'Venda',
  // ...
};
```

---

## 🔧 Troubleshooting

### **Erro: "null value in column 'organization_id'"**

- **Causa**: Usuário não está associado a uma organização
- **Solução**: Verifique a tabela `organization_members`

### **Erro: "permission denied for table orders"**

- **Causa**: RLS policies não aplicadas corretamente
- **Solução**: Execute novamente o SQL de criação das policies

### **Estoque não atualiza automaticamente**

- **Causa**: Trigger não foi criado ou teve erro
- **Solução**: Verifique os logs do Supabase e reaplique os triggers

---

## 📚 Referências

- **Supabase Docs**: https://supabase.com/docs
- **React Query**: https://tanstack.com/query/latest
- **Shadcn UI**: https://ui.shadcn.com/

---

## 🎯 Próximos Passos

### **Melhorias Futuras**

- [ ] Página de detalhes do pedido
- [ ] Edição de pedidos existentes
- [ ] Exportação de pedidos (PDF/Excel)
- [ ] Relatórios avançados
- [ ] Integração com impressora térmica
- [ ] Notificações por email/SMS
- [ ] API webhooks para integrações

### **Funcionalidades Avançadas**

- [ ] Workflow de aprovação multi-nível
- [ ] Orçamentos (quotes)
- [ ] Pedidos recorrentes
- [ ] Integração com pagamento online
- [ ] Previsão de demanda com IA
- [ ] Otimização de rotas de entrega

---

## 🤝 Contribuindo

Para adicionar novas funcionalidades:

1. Atualize os tipos em `src/types/orders.ts`
2. Adicione métodos em `OrdersService.ts`
3. Crie mutations em `useOrders.tsx`
4. Adicione componentes UI
5. Teste e documente

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do browser (console)
2. Verifique os logs do Supabase
3. Revise as RLS policies
4. Verifique as permissões do usuário

---

**Sistema desenvolvido seguindo as melhores práticas:**
- ✅ Arquitetura MVC/MVVM
- ✅ Princípios SOLID
- ✅ TypeScript com tipagem forte
- ✅ Validações completas
- ✅ Tratamento de erros robusto
- ✅ Multi-tenant seguro
- ✅ Performance otimizada

🎉 **Sistema de Pedidos pronto para produção!**

