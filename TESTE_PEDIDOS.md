# 🧪 Guia de Teste - Sistema de Pedidos

## ✅ Sistema Instalado e Configurado!

### 📋 **O que foi configurado:**

1. ✅ **Migration SQL aplicada** no Supabase
   - Tabelas criadas: `orders`, `order_items`, `order_status_history`
   - Triggers e funções configurados
   - RLS policies ativas

2. ✅ **Rotas adicionadas** no sistema
   - Rota: `/pedidos`
   - Menu: "Pedidos" com ícone de carrinho

3. ✅ **Componentes integrados**
   - Dashboard de pedidos
   - Lista de pedidos
   - Formulário de criação

---

## 🚀 Como Testar (10 minutos)

### **Passo 1: Iniciar o Servidor de Desenvolvimento**

```powershell
npm run dev
```

Aguarde o servidor iniciar (geralmente em http://localhost:8080)

---

### **Passo 2: Acessar o Sistema**

1. Abra o navegador em: http://localhost:8080
2. Faça login com suas credenciais
3. No menu lateral, clique em **"Pedidos"** (ícone de carrinho de compras)

---

### **Passo 3: Explorar o Dashboard**

Você verá:

- **📊 4 Cards de Estatísticas:**
  - Pedidos Pendentes
  - Pedidos Processando
  - Pedidos Enviados
  - Receita Total

- **📈 2 Cards de Receita:**
  - Receita Hoje
  - Pedidos Recentes

- **📑 Tabs de Filtros:**
  - Todos
  - Rascunhos
  - Pendentes
  - Aprovados
  - Processando
  - Enviados
  - Entregues

---

### **Passo 4: Criar Primeiro Pedido**

#### **4.1. Clicar em "Novo Pedido"**

#### **4.2. Preencher o Formulário:**

**Informações Básicas:**
- **Tipo de Pedido**: Selecione "Compra" ou "Venda"
- **Data de Entrega Prevista**: Escolha uma data futura
- **Fornecedor/Cliente**: Digite "Fornecedor Teste LTDA"

**Importante:** Para adicionar itens, você precisa de produtos existentes no seu inventário.

#### **4.3. Obter IDs de Produtos (Use um dos métodos):**

**Método 1 - Via SQL Editor do Supabase:**

```sql
-- Pegar alguns produtos do estoque seco
SELECT id, nome, preco_unitario 
FROM estoque_seco_items 
WHERE organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid() 
  LIMIT 1
)
LIMIT 5;
```

**Método 2 - Via Console do Browser:**

1. Abra o Console do navegador (F12)
2. Vá para a aba "Network"
3. Acesse "Estoque Seco" no menu
4. Veja as requisições e copie alguns IDs de produtos

**Método 3 - Criar produto de teste:**

```sql
-- Criar produto de teste
INSERT INTO estoque_seco_items (
  nome, 
  quantidade, 
  unidade, 
  categoria, 
  preco_unitario,
  user_id,
  organization_id
) VALUES (
  'Produto Teste para Pedido',
  100,
  'un',
  'Teste',
  25.50,
  auth.uid(),
  (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() LIMIT 1)
)
RETURNING id, nome, preco_unitario;
```

#### **4.4. Adicionar Itens ao Pedido:**

1. Clique em **"Adicionar Item"**
2. Preencha:
   - **Tabela**: Estoque Seco
   - **Nome**: Nome do produto
   - **ID do Item**: Cole o UUID do produto
   - **Quantidade**: 10
   - **Preço Unitário**: 25.50

3. Adicione mais itens se desejar
4. Clique em **"Criar Pedido"**

---

### **Passo 5: Verificar o Pedido Criado**

Após criar, você verá:

- ✅ Toast de sucesso: "Pedido ORD-202510-00001 criado com sucesso!"
- ✅ Pedido aparece na lista
- ✅ Status: "Rascunho" (badge cinza)
- ✅ Pagamento: "Não Pago"
- ✅ Total calculado automaticamente

---

### **Passo 6: Testar Operações**

#### **6.1. Ver Detalhes**
- Clique nos 3 pontinhos (⋮) ao lado do pedido
- Selecione **"Ver Detalhes"**

#### **6.2. Aprovar Pedido**
- Clique nos 3 pontinhos (⋮)
- Selecione **"Aprovar"**
- Confirme
- ✅ Status muda para "Aprovado"

#### **6.3. Verificar Atualização de Estoque**
- Se for pedido de **VENDA** e foi **APROVADO**:
  - Vá em "Estoque Seco"
  - Verifique que a quantidade foi **deduzida**

#### **6.4. Cancelar Pedido**
- Clique nos 3 pontinhos (⋮)
- Selecione **"Cancelar"**
- Digite o motivo: "Teste de cancelamento"
- Confirme
- ✅ Status muda para "Cancelado" (badge vermelho)

---

### **Passo 7: Testar Filtros**

1. **Criar múltiplos pedidos** com diferentes status
2. Clique nas **tabs** para filtrar:
   - Rascunhos
   - Pendentes
   - Aprovados
   - etc.

3. Use a **barra de busca** para procurar por:
   - Número do pedido
   - Nome do fornecedor/cliente
   - Observações

---

### **Passo 8: Verificar Dashboard de Estatísticas**

Após criar vários pedidos:

- ✅ **Cards são atualizados automaticamente**
- ✅ **Receita total** é calculada (apenas pedidos aprovados)
- ✅ **Receita hoje** mostra pedidos do dia
- ✅ **Contadores** refletem os status corretamente

---

## 🧪 Testes Avançados

### **Teste 1: Pedido de Compra**

```
Tipo: Compra
Status: Draft → Pending → Approved → Processing → Delivered

Ao marcar como "Delivered":
✅ Estoque é AUMENTADO automaticamente
```

### **Teste 2: Pedido de Venda**

```
Tipo: Venda
Status: Draft → Pending → Approved

Ao aprovar:
✅ Estoque é REDUZIDO automaticamente
```

### **Teste 3: Transferência**

```
Tipo: Transferência
De: Juazeiro Norte
Para: Fortaleza

✅ Movimentação entre localizações
```

### **Teste 4: Histórico de Status**

```
1. Crie um pedido
2. Mude o status várias vezes
3. Verifique o histórico no banco:

SELECT * FROM order_status_history 
WHERE order_id = 'seu-order-id'
ORDER BY created_at DESC;
```

---

## 🎯 Checklist de Testes

### **Funcionalidades Básicas**
- [ ] Criar pedido de compra
- [ ] Criar pedido de venda
- [ ] Criar pedido de transferência
- [ ] Adicionar múltiplos itens
- [ ] Visualizar lista de pedidos
- [ ] Buscar pedidos

### **Operações**
- [ ] Aprovar pedido
- [ ] Cancelar pedido
- [ ] Editar rascunho
- [ ] Excluir rascunho

### **Automações**
- [ ] Número de pedido gerado automaticamente
- [ ] Totais calculados corretamente
- [ ] Estoque atualizado em vendas
- [ ] Estoque atualizado em compras
- [ ] Histórico de status registrado

### **Dashboard**
- [ ] Cards de estatísticas corretos
- [ ] Receita calculada corretamente
- [ ] Filtros funcionando
- [ ] Busca funcionando

### **UI/UX**
- [ ] Toast notifications aparecem
- [ ] Loading states funcionam
- [ ] Badges de status com cores corretas
- [ ] Responsivo (mobile e desktop)

---

## 🐛 Problemas Comuns e Soluções

### **Erro: "null value in column 'item_id'"**
- **Causa**: ID do produto inválido ou não existe
- **Solução**: Use IDs reais do seu inventário

### **Erro: "Permission denied"**
- **Causa**: RLS policies não aplicadas
- **Solução**: Reaplique o SQL da migration

### **Estoque não atualiza**
- **Causa**: Triggers não foram criados
- **Solução**: Verifique se os triggers existem:
  ```sql
  SELECT trigger_name FROM information_schema.triggers 
  WHERE event_object_table = 'orders';
  ```

### **Dashboard vazio**
- **Causa**: Nenhum pedido criado ainda
- **Solução**: Normal! Crie alguns pedidos

---

## 📊 Verificar no Banco de Dados

### **Ver todos os pedidos:**
```sql
SELECT 
  order_number,
  order_type,
  order_status,
  total_amount,
  created_at
FROM orders
ORDER BY created_at DESC;
```

### **Ver itens de um pedido:**
```sql
SELECT * FROM order_items 
WHERE order_id = 'seu-order-id';
```

### **Ver estatísticas:**
```sql
SELECT * FROM orders_dashboard;
```

### **Ver histórico:**
```sql
SELECT * FROM order_status_history 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🎉 Teste Completo!

Se você conseguiu:
- ✅ Criar pedidos
- ✅ Ver na lista
- ✅ Aprovar/Cancelar
- ✅ Ver estatísticas atualizadas
- ✅ Estoque sendo atualizado

**🎊 PARABÉNS! O sistema está funcionando perfeitamente!**

---

## 📈 Próximos Passos

1. **Personalizar cores e labels**
   - Edite `src/types/orders.ts`

2. **Adicionar mais campos**
   - Endereço de entrega completo
   - Tracking avançado
   - Múltiplos pagamentos

3. **Relatórios**
   - Exportar para PDF/Excel
   - Gráficos de vendas
   - Análise de fornecedores

4. **Integrações**
   - Email de confirmação
   - SMS de tracking
   - API para terceiros

---

## 💡 Dicas Pro

- **Use atalhos**: Ctrl+K para busca rápida
- **Filtros salvos**: Marque seus filtros favoritos
- **Pedidos recorrentes**: Duplique pedidos existentes
- **Bulk actions**: Selecione múltiplos para ações em massa

---

**🚀 Sistema de Pedidos - Pronto para Produção!**

Desenvolvido com ❤️ seguindo as melhores práticas enterprise.

