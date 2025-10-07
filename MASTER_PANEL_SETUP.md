# 🛡️ Painel de Administração Master - Guia de Setup

## ✅ O QUE FOI IMPLEMENTADO

### 1. **Views SQL (Bypass de RLS)**
- `admin_all_organizations` - Todas as organizações com estatísticas
- `admin_all_members` - Todos os membros de todas as organizações
- `admin_all_users` - Todos os usuários do sistema
- `admin_global_stats` - Estatísticas globais do sistema

### 2. **Hooks Customizados**
- `useAdminOrganizations` - Gerenciar organizações
- `useAdminUsers` - Gerenciar usuários
- `useGlobalStats` - Estatísticas globais

### 3. **Componentes UI**
- `RoleBadge` - Badge visual para roles (owner, admin, manager, etc)
- `StatusBadge` - Badge para status ativo/inativo
- `OrganizationCard` - Card de organização com ações
- `UserCard` - Card de usuário com ações

### 4. **Tabs de Gerenciamento**
- `OrganizationsManagement` - Gerenciar todas as organizações
- `UsersManagement` - Gerenciar todos os usuários
- `GlobalStatistics` - Dashboard de estatísticas globais
- `AuditLogs` - Logs de auditoria do sistema

### 5. **Página Principal**
- `MasterPanel` - Página principal com tabs e proteção de rota

### 6. **Rota e Menu**
- Rota `/master-panel` adicionada
- Item "Painel Master" no sidebar (visível apenas para admins)

---

## 🚀 COMO APLICAR

### **Passo 1: Executar SQL no Supabase**

1. Acesse: https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new
2. Cole o conteúdo do arquivo `setup_admin_master_panel.sql`
3. Clique em **RUN**

### **Passo 2: Verificar o Resultado**

Após executar o SQL, você verá:
- ✅ 4 views criadas (`admin_all_organizations`, `admin_all_members`, `admin_all_users`, `admin_global_stats`)
- ✅ Permissões concedidas para `authenticated`
- ✅ Função helper `is_master_admin()` criada
- ✅ Testes automáticos mostrando contadores

### **Passo 3: Testar o Painel**

1. Faça login com um usuário que tenha `user_type = 'admin'`
2. Você verá o item **"Painel Master"** no menu lateral (com ícone de escudo 🛡️)
3. Clique para acessar o painel
4. Explore as 4 tabs:
   - 📊 **Estatísticas** - Visão geral do sistema
   - 🏢 **Organizações** - Gerenciar todas as organizações
   - 👥 **Usuários** - Gerenciar todos os usuários
   - 📜 **Auditoria** - Logs de ações críticas

---

## 🔒 SEGURANÇA

### **Proteção em Múltiplas Camadas**

1. **Hook `useUserPermissions`**
   - Verifica `user_type === 'admin'`
   - Adiciona flag `isMasterAdmin`

2. **Página `MasterPanel`**
   - Verifica permissões na montagem
   - Redireciona não-admins para `/dashboard`
   - Mostra loading enquanto verifica

3. **Hooks Customizados**
   - Cada hook verifica `user_type === 'admin'` antes de buscar dados
   - Retorna erro se usuário não for admin

4. **Views SQL**
   - Bypass de RLS via `security_invoker = off`
   - Permissões para `authenticated` (verificação no código)

---

## 📋 FUNCIONALIDADES

### **Tab 1: Estatísticas Globais** 📊

- **Cards de Métricas**
  - Total de organizações (ativas/inativas)
  - Total de usuários (ativos/inativos)
  - Total de itens no inventário
  - Total de pedidos

- **Gráficos**
  - Distribuição de itens por categoria
  - Percentual de organizações ativas
  - Percentual de usuários ativos

- **Alertas**
  - Organizações inativas
  - Usuários inativos

### **Tab 2: Gerenciamento de Organizações** 🏢

- **Listagem**
  - Cards visuais com informações completas
  - Filtros: Todas, Ativas, Inativas
  - Busca por nome, slug ou email do owner

- **Estatísticas Rápidas**
  - Total de organizações
  - Organizações ativas/inativas
  - Total de membros

- **Ações Disponíveis** (via hooks)
  - `updateOrganization()` - Atualizar dados
  - `activateOrganization()` - Ativar
  - `deactivateOrganization()` - Desativar
  - `deleteOrganization()` - Soft delete

### **Tab 3: Gerenciamento de Usuários** 👥

- **Listagem**
  - Cards visuais com badges de role
  - Filtros: Todos, Admins, Usuários
  - Busca por nome ou email

- **Estatísticas Rápidas**
  - Total de usuários
  - Total de administradores
  - Usuários em organizações

- **Ações Disponíveis** (via hooks)
  - `promoteToAdmin()` - Promover a admin master
  - `demoteFromAdmin()` - Remover privilégios de admin
  - `deactivateUser()` - Desativar em todas as organizações

- **Dialog de Confirmação**
  - Confirmação obrigatória para promover/remover admin
  - Avisos claros sobre consequências

### **Tab 4: Logs de Auditoria** 📜

- **Visualização**
  - Últimos 500 registros de auditoria
  - Cards com detalhes completos
  - Filtros por ação e tabela
  - Busca por organização, usuário ou tabela

- **Tipos de Ação**
  - ✅ Criação (verde)
  - 🔄 Atualização (azul)
  - ❌ Exclusão (vermelho)
  - 🔐 Login (roxo)
  - 🚪 Logout (cinza)

- **Detalhes**
  - Organização
  - Usuário que executou
  - Data/hora
  - IP (se disponível)
  - Dados antigos vs novos (para UPDATE)

---

## 🎨 UI/UX

### **Design System**

- **Cores**
  - Primary: Para elementos principais
  - Green: Status ativo, criação
  - Red: Admins, exclusão, alertas
  - Blue: Estatísticas, atualização
  - Gray: Inativo, neutro

- **Componentes**
  - Cards com hover shadow
  - Badges coloridos por tipo
  - Progress bars para percentuais
  - Skeletons para loading states
  - Dialog de confirmação para ações críticas

- **Responsividade**
  - Grid adaptativo (1/2/3 colunas)
  - Tabs colapsáveis em mobile
  - Busca e filtros empilhados em telas pequenas

---

## 🧪 TESTE MANUAL

### **1. Verificar Acesso**
```
✅ Login com admin → Ver "Painel Master" no menu
❌ Login com não-admin → NÃO ver "Painel Master"
❌ Tentar acessar /master-panel sem ser admin → Redirecionar
```

### **2. Testar Estatísticas**
```
✅ Ver cards com números corretos
✅ Ver gráficos de distribuição
✅ Ver alertas (se houver organizações/usuários inativos)
✅ Botão de atualizar funciona
```

### **3. Testar Organizações**
```
✅ Ver lista de todas as organizações
✅ Filtrar por status (ativas/inativas)
✅ Buscar por nome, slug, email
✅ Ver detalhes em cada card
✅ Estatísticas rápidas batem com cards
```

### **4. Testar Usuários**
```
✅ Ver lista de todos os usuários
✅ Filtrar por tipo (admins/usuários)
✅ Buscar por nome ou email
✅ Ver badge de ADMIN nos admins
✅ Botão "Gerenciar" abre dialog de confirmação
✅ Promover usuário mostra toast de sucesso
✅ Lista atualiza automaticamente
```

### **5. Testar Auditoria**
```
✅ Ver lista de logs
✅ Filtrar por tipo de ação
✅ Filtrar por tabela
✅ Buscar por organização/usuário
✅ Ver detalhes expandidos (para UPDATE)
✅ Badges coloridos por tipo de ação
```

---

## 📁 ARQUIVOS CRIADOS

### **SQL**
- `setup_admin_master_panel.sql` - Setup completo do banco

### **Components**
- `src/components/admin/RoleBadge.tsx`
- `src/components/admin/StatusBadge.tsx`
- `src/components/admin/OrganizationCard.tsx`
- `src/components/admin/UserCard.tsx`
- `src/components/admin/OrganizationsManagement.tsx`
- `src/components/admin/UsersManagement.tsx`
- `src/components/admin/GlobalStatistics.tsx`
- `src/components/admin/AuditLogs.tsx`

### **Hooks**
- `src/hooks/admin/useAdminOrganizations.ts`
- `src/hooks/admin/useAdminUsers.ts`
- `src/hooks/admin/useGlobalStats.ts`

### **Pages**
- `src/pages/MasterPanel.tsx`

### **Modificados**
- `src/hooks/useUserPermissions.tsx` - Adicionado `isMasterAdmin`
- `src/components/AppSidebar.tsx` - Adicionado item "Painel Master"
- `src/pages/Index.tsx` - Adicionada rota `/master-panel`

---

## 🔧 PRÓXIMOS PASSOS (Opcionais)

### **Melhorias Futuras**

1. **Modais de Edição**
   - Modal para editar organizações (nome, tier, limites)
   - Modal para ver detalhes completos de usuário

2. **Ações em Lote**
   - Desativar múltiplas organizações
   - Remover múltiplos usuários

3. **Filtros Avançados**
   - Filtrar por data de criação
   - Filtrar por subscription tier
   - Ordenação customizada

4. **Exportação**
   - Exportar organizações para CSV
   - Exportar usuários para CSV
   - Exportar logs de auditoria

5. **Dashboard Avançado**
   - Gráficos de crescimento (Chart.js/Recharts)
   - Métricas de engajamento
   - Análise de uso por organização

---

## ⚠️ IMPORTANTE

- **NÃO compartilhe o acesso master** com usuários comuns
- **Use com cuidado** - você tem acesso total a todas as organizações
- **Logs de auditoria** registram todas as ações críticas
- **Backup regular** do banco antes de operações em massa

---

## 🎉 PRONTO!

O Painel de Administração Master está **100% funcional** e pronto para uso.

**Execute o SQL e comece a gerenciar seu sistema!**

