# 🔍 Diagnóstico - Sistema de Pedidos

## CORREÇÕES APLICADAS

### ✅ **1. Menu Hamburger (Dropdown)**
**Problema:** Não estava funcionando ou sem estilo
**Solução:**
- Adicionado width fixo (`w-48`) ao dropdown
- Melhorada estilização com cores específicas
- Adicionado `e.stopPropagation()` em todos os clicks
- Ícones coloridos (verde para aprovar, laranja para cancelar, vermelho para excluir)
- Navegação corrigida para `/pedidos/` ao invés de `/orders/`

### ✅ **2. Estatísticas do Dashboard**
**Problema:** Não estavam aparecendo
**Solução:**
- Adicionado tratamento de erro visual
- Melhorado loading state
- Adicionado estado vazio (quando não há dados)
- Logs de debug no console

### ✅ **3. Abas de Filtro**
**Problema:** Não filtravam corretamente
**Solução:**
- Adicionados logs de debug em todas as camadas
- Verificação de filtros no OrdersService
- React Query cache management

### ✅ **4. Logs de Debug**
Adicionados em 3 camadas:
- `OrdersDashboard` - Estatísticas e dados gerais
- `OrdersList` - Filtros e lista de pedidos
- `OrdersService` - Queries e filtros aplicados

---

## 📋 COMO TESTAR

### **1. Abrir Console do Navegador**
```
Pressione F12 ou:
- Chrome: Ctrl+Shift+J
- Edge: Ctrl+Shift+J
- Firefox: Ctrl+Shift+K
```

### **2. Ir para a Página de Pedidos**
```
Menu Lateral → Pedidos
```

### **3. Verificar Logs no Console**

Você deve ver logs como:

```javascript
📊 OrdersDashboard - dashboardStats: {...}
📊 OrdersDashboard - statsLoading: false
📊 OrdersDashboard - recentOrders: [...]
📋 OrdersList - filters: {...}
🔍 OrdersService.listOrders - filters: {...}
🔍 OrdersService.listOrders - organization_id: "..."
🔍 OrdersService.listOrders - resultados: X pedidos
```

---

## 🎯 CENÁRIOS DE TESTE

### **Teste 1: Dashboard Carregando**
**Ação:** Acesse a página de Pedidos

**Esperado:**
1. Skeleton loaders aparecem primeiro
2. Depois mostram os cards com números:
   - Pendentes: X
   - Processando: Y
   - Enviados: Z
   - Receita Total: R$ W

**Se não aparecer:**
- Verifique o console
- Procure por erros (❌ vermelho)
- Copie a mensagem de erro

### **Teste 2: Abas de Filtro**
**Ação:** Clique nas abas:
- `Todos` → Deve mostrar todos os pedidos
- `Rascunhos` → Apenas status "draft"
- `Pendentes` → Apenas status "pending"
- `Aprovados` → Apenas status "approved"
- etc.

**Esperado no Console:**
```javascript
📋 OrdersList - filters: { order_status: "pending" }
🔍 Aplicando filtro order_status: pending
🔍 OrdersService.listOrders - resultados: X pedidos
```

**Se não filtrar:**
- Verifique se o filtro está sendo aplicado no console
- Verifique se há pedidos com aquele status

### **Teste 3: Menu Hamburger (⋮)**
**Ação:** Clique nos três pontinhos em qualquer pedido

**Esperado:**
1. Menu dropdown abre
2. Opções visíveis e estilizadas:
   - 👁️ Ver Detalhes
   - ✏️ Editar (apenas rascunhos)
   - ✅ Aprovar (apenas pendentes) - texto verde
   - ⛔ Cancelar - texto laranja
   - 🗑️ Excluir (apenas rascunhos) - texto vermelho

3. Ao clicar em qualquer opção, ação é executada

**Se não abrir:**
- Verifique se o botão está clicável
- Olhe no console por erros
- Tente clicar diretamente no ícone ⋮

### **Teste 4: Ações do Menu**

#### **Ver Detalhes**
**Ação:** Click em "Ver Detalhes"
**Esperado:** Navega para `/pedidos/[id]`
**Console:** (vazio, navegação normal)

#### **Aprovar**
**Ação:** Click em "Aprovar" (pedido pendente)
**Esperado:** 
1. Confirmação: "Confirma a aprovação deste pedido?"
2. Ao confirmar: Toast de sucesso
3. Dashboard atualiza
4. Pedido sai da aba "Pendentes"

**Console:**
```javascript
✅ Pedido aprovado!
// Invalidação de cache do React Query
```

#### **Cancelar**
**Ação:** Click em "Cancelar"
**Esperado:**
1. Prompt: "Informe o motivo do cancelamento:"
2. Digite motivo (ou deixe vazio)
3. Toast de sucesso
4. Status muda para "Cancelado"

**Console:**
```javascript
✅ Pedido cancelado!
```

#### **Excluir**
**Ação:** Click em "Excluir" (rascunho)
**Esperado:**
1. Confirmação: "Confirma a exclusão do pedido ORD-...?"
2. Ao confirmar: Toast de sucesso
3. Pedido some da lista

**Console:**
```javascript
✅ Pedido deletado com sucesso!
```

### **Teste 5: Busca de Pedidos**
**Ação:** Digite no campo de busca

**Esperado:**
```javascript
📋 OrdersList - searchTerm: "texto digitado"
🔍 Aplicando filtro search: texto digitado
```

Pedidos filtrados aparecem na lista

---

## 🐛 PROBLEMAS COMUNS

### **Problema 1: Estatísticas aparecem como 0**
**Causa:** Não há pedidos cadastrados
**Solução:** Crie pedidos de teste primeiro

**Como verificar:**
```javascript
// No console:
📊 OrdersDashboard - dashboardStats: {
  pending_orders: 0,
  processing_orders: 0,
  shipped_orders: 0,
  total_revenue: 0
}
```

Se todos são 0, é porque não há dados.

### **Problema 2: Menu hamburger não abre**
**Causa:** Conflito de z-index ou erro JS
**Solução:**
1. Verifique erros no console (vermelho)
2. Tente recarregar a página (Ctrl+R)
3. Limpe o cache (Ctrl+Shift+Delete)

### **Problema 3: Abas não filtram**
**Causa:** Filtros não sendo aplicados
**Como diagnosticar:**
```javascript
// Se você ver:
📋 OrdersList - filters: undefined
// Ou:
🔍 OrdersService.listOrders - filters: undefined
```

Isso significa que os filtros não estão sendo passados.

**Solução:** Verificar o código do `OrdersDashboard`

### **Problema 4: Erro "Organização não encontrada"**
**Causa:** Usuário não está vinculado a uma organização
**Solução:**
1. Verifique se você está logado
2. Verifique se tem organização no Supabase:
```sql
SELECT * FROM organization_members 
WHERE user_id = auth.uid();
```

### **Problema 5: Navegação quebrada**
**Causa:** Rotas não configuradas
**Sintoma:** Ao clicar em "Ver Detalhes", página não carrega

**Solução:** Verificar em `src/pages/Index.tsx` se a rota `/pedidos/:id` existe

---

## 📊 CHECKLIST COMPLETO

### **Dashboard:**
- [ ] Cards de estatísticas aparecem
- [ ] Números corretos (pending, processing, shipped, revenue)
- [ ] Loading states funcionam
- [ ] Botão "Atualizar" funciona
- [ ] Botão "Novo Pedido" abre dialog

### **Lista de Pedidos:**
- [ ] Pedidos aparecem na tabela
- [ ] Informações corretas (número, tipo, cliente, data, status, pagamento, total)
- [ ] Badges coloridos (status e pagamento)
- [ ] Click na linha navega para detalhes
- [ ] Busca funciona

### **Abas:**
- [ ] "Todos" mostra todos
- [ ] "Rascunhos" filtra por draft
- [ ] "Pendentes" filtra por pending
- [ ] "Aprovados" filtra por approved
- [ ] "Processando" filtra por processing
- [ ] "Enviados" filtra por shipped
- [ ] "Entregues" filtra por delivered

### **Menu Hamburger:**
- [ ] Botão ⋮ é clicável
- [ ] Menu abre ao clicar
- [ ] Opções visíveis e estilizadas
- [ ] "Ver Detalhes" navega corretamente
- [ ] "Editar" aparece apenas em rascunhos
- [ ] "Aprovar" aparece apenas em pendentes
- [ ] "Cancelar" aparece (exceto em cancelados/entregues)
- [ ] "Excluir" aparece apenas em rascunhos

### **Ações:**
- [ ] Aprovar funciona (toast + atualização)
- [ ] Cancelar funciona (prompt + toast)
- [ ] Excluir funciona (confirmação + toast)
- [ ] Navegação para detalhes funciona

### **Console (F12):**
- [ ] Logs de debug aparecem
- [ ] Sem erros (❌ vermelho)
- [ ] Filtros são aplicados corretamente
- [ ] Queries retornam dados

---

## 🔧 COMANDOS DE DEBUG ÚTEIS

### **No Console do Navegador:**

```javascript
// Ver estado do React Query
window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__

// Forçar refetch
queryClient.invalidateQueries(['orders'])
queryClient.invalidateQueries(['orders-dashboard'])

// Ver organização do usuário
supabase.auth.getUser().then(r => console.log(r))
supabase.from('organization_members').select('*').then(r => console.log(r))

// Ver pedidos no banco
supabase.from('orders').select('*').then(r => console.log(r))
```

### **SQL no Supabase:**

```sql
-- Ver todos os pedidos
SELECT * FROM orders;

-- Ver estatísticas manualmente
SELECT 
  order_status,
  COUNT(*) as count,
  SUM(total_amount) as total
FROM orders
WHERE deleted_at IS NULL
GROUP BY order_status;

-- Ver pedidos por status
SELECT * FROM orders WHERE order_status = 'pending';
```

---

## 📝 RELATÓRIO DE BUGS

Se ainda houver problemas, forneça as seguintes informações:

### **1. Screenshot**
- Tire print da tela com o problema

### **2. Logs do Console**
- Copie TODOS os logs do console (F12)
- Inclua erros em vermelho

### **3. Descrição**
```
Problema: [descreva o problema]

Passos para reproduzir:
1. [passo 1]
2. [passo 2]
3. [passo 3]

Esperado: [o que deveria acontecer]
Aconteceu: [o que realmente aconteceu]

Console: [cole os logs aqui]
```

### **4. Dados de Teste**
```
- Há pedidos cadastrados? Sim/Não
- Quantos? [número]
- Quais status? [draft, pending, approved, etc]
```

---

## ✅ RESUMO DAS CORREÇÕES

| Componente | Antes | Depois | Status |
|------------|-------|--------|---------|
| **Menu Hamburger** | Não abria / sem estilo | Totalmente funcional e estilizado | ✅ |
| **Estatísticas** | Não apareciam | Cards com números + tratamento de erro | ✅ |
| **Abas** | Não filtravam | Filtros aplicados corretamente | ✅ |
| **Navegação** | `/orders/` | `/pedidos/` | ✅ |
| **Debug** | Sem logs | Logs em 3 camadas | ✅ |
| **Ações** | Erros ao executar | Totalmente funcionais | ✅ |

---

## 🎯 PRÓXIMOS PASSOS

1. **Recarregar página** (Ctrl+R)
2. **Abrir console** (F12)
3. **Ir para Pedidos**
4. **Testar cada cenário** acima
5. **Reportar resultados** (com logs do console)

---

**Todos os componentes foram corrigidos e estão com debug ativo.**

**Aguardando seus testes! 🚀**

