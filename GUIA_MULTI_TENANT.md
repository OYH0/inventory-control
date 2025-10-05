# 🏢 GUIA COMPLETO - SISTEMA MULTI-TENANT

## 📋 ÍNDICE
1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Funções Disponíveis](#funções-disponíveis)
4. [Como Usar](#como-usar)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Permissões e Roles](#permissões-e-roles)
7. [Segurança (RLS)](#segurança-rls)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

### O que é Multi-Tenancy?
Sistema onde múltiplas organizações (empresas/estabelecimentos) compartilham a mesma aplicação, mas com **isolamento total de dados**.

### Estrutura Hierárquica
```
Organização (Empresa)
├── Owner (Dono)
├── Admin (Administrador)
├── Manager (Gerente)
├── Member (Membro)
└── Viewer (Visualizador)
```

### Recursos Implementados
- ✅ **Isolamento Total de Dados** - RLS no nível do banco
- ✅ **Roles Hierárquicas** - 5 níveis de permissão
- ✅ **Permissões Granulares** - Por módulo e ação
- ✅ **Multi-unidades** - Suporte a múltiplas lojas/unidades
- ✅ **Auditoria Completa** - Timestamps e histórico
- ✅ **Soft Delete** - Dados nunca são perdidos
- ✅ **Auto-setup** - Criação automática no primeiro login

---

## 🚀 INSTALAÇÃO

### Passo 1: Aplicar Migration
```sql
-- No SQL Editor do Supabase, execute:
-- (Cole todo o conteúdo de MULTI_TENANT_COMPLETE_MIGRATION.sql)
```

### Passo 2: Criar Organização Automaticamente
```sql
-- Para cada usuário existente, execute:
SELECT auto_create_organization_for_user();
```

### Passo 3: Verificar Instalação
```sql
-- Ver suas organizações
SELECT * FROM my_organizations;

-- Ver estatísticas
SELECT * FROM organization_stats;

-- Verificar funções
SELECT get_user_organization_id();
SELECT * FROM get_user_organizations();
```

---

## 📚 FUNÇÕES DISPONÍVEIS

### 1. **get_user_organization_id()**
Retorna o UUID da organização do usuário autenticado.

```sql
SELECT get_user_organization_id();
-- Retorna: 'abc-123-def-456'
```

**Uso no código:**
```typescript
const { data } = await supabase.rpc('get_user_organization_id');
const orgId = data;
```

---

### 2. **user_belongs_to_organization(org_id)**
Verifica se o usuário pertence à organização.

```sql
SELECT user_belongs_to_organization('abc-123-def-456');
-- Retorna: true ou false
```

**Uso no código:**
```typescript
const { data } = await supabase.rpc('user_belongs_to_organization', {
  p_org_id: orgId
});
if (data) {
  console.log('Usuário é membro desta organização');
}
```

---

### 3. **user_has_role(org_id, required_role)**
Verifica se o usuário tem a role necessária (ou superior).

```sql
SELECT user_has_role('abc-123', 'admin');
-- Retorna: true se for owner ou admin
```

**Hierarquia de Roles:**
- `owner` > `admin` > `manager` > `member` > `viewer`

**Uso no código:**
```typescript
const { data } = await supabase.rpc('user_has_role', {
  p_org_id: orgId,
  p_required_role: 'manager'
});
```

---

### 4. **user_has_permission(org_id, module, action)**
Verifica permissão granular para módulo e ação específicos.

```sql
SELECT user_has_permission('abc-123', 'inventory', 'write');
-- Retorna: true ou false
```

**Módulos disponíveis:**
- `inventory` - Gerenciamento de estoque
- `alerts` - Sistema de alertas
- `reports` - Relatórios
- `settings` - Configurações
- `members` - Gerenciamento de membros

**Ações disponíveis:**
- `read` - Visualizar
- `write` - Criar/Editar
- `delete` - Deletar
- `transfer` - Transferir entre unidades

**Uso no código:**
```typescript
const { data } = await supabase.rpc('user_has_permission', {
  p_org_id: orgId,
  p_module: 'inventory',
  p_action: 'delete'
});
```

---

### 5. **get_user_role(org_id)**
Retorna a role do usuário na organização.

```sql
SELECT get_user_role('abc-123');
-- Retorna: 'admin', 'manager', etc.
```

**Uso no código:**
```typescript
const { data } = await supabase.rpc('get_user_role', {
  p_org_id: orgId
});
console.log('Minha role:', data); // 'admin'
```

---

### 6. **get_user_organizations()**
Lista todas as organizações que o usuário participa.

```sql
SELECT * FROM get_user_organizations();
```

**Retorna:**
```
org_id | org_name        | org_slug  | user_role | is_owner | member_count
-------|-----------------|-----------|-----------|----------|-------------
abc    | Minha Empresa   | minha-emp | owner     | true     | 5
def    | Outra Empresa   | outra-emp | member    | false    | 12
```

**Uso no código:**
```typescript
const { data: organizations } = await supabase.rpc('get_user_organizations');
organizations.forEach(org => {
  console.log(`${org.org_name} - ${org.user_role}`);
});
```

---

### 7. **migrate_user_data_to_organization(user_id, org_id)**
Migra dados existentes de um usuário para uma organização.

```sql
SELECT migrate_user_data_to_organization(
  'user-uuid',
  'org-uuid'
);
-- Retorna: 'SUCCESS: Migrated 150 items...'
```

**Uso:**
- Executar UMA VEZ após criar a organização
- Migra automaticamente todos os items e históricos
- Apenas para dados sem `organization_id`

---

### 8. **auto_create_organization_for_user()**
Cria automaticamente uma organização para o usuário atual.

```sql
SELECT auto_create_organization_for_user();
-- Retorna: UUID da nova organização
```

**Comportamento:**
- Se já tem organização → retorna a existente
- Se não tem → cria automaticamente
- Nomeia com base no email do usuário
- Migra todos os dados existentes

**Uso no código:**
```typescript
// No primeiro login do usuário
const { data: orgId } = await supabase.rpc('auto_create_organization_for_user');
localStorage.setItem('currentOrgId', orgId);
```

---

### 9. **transfer_organization_ownership(org_id, new_owner_id)**
Transfere propriedade da organização para outro membro.

```sql
SELECT transfer_organization_ownership(
  'org-uuid',
  'new-owner-uuid'
);
-- Retorna: 'SUCCESS: Ownership transferred...'
```

**Requisitos:**
- Apenas o owner atual pode transferir
- Novo owner deve ser membro da organização
- Owner anterior vira `admin` automaticamente

---

## 💼 COMO USAR

### Caso de Uso 1: Setup Inicial (Frontend)

```typescript
// 1. No login/signup, criar organização automaticamente
async function setupUserOrganization() {
  const { data: orgId } = await supabase.rpc('auto_create_organization_for_user');
  
  if (!orgId) {
    console.error('Falha ao criar organização');
    return;
  }
  
  // Armazenar org_id globalmente
  localStorage.setItem('currentOrgId', orgId);
  
  // Buscar detalhes
  const { data: orgs } = await supabase.rpc('get_user_organizations');
  console.log('Minhas organizações:', orgs);
}

// Chamar no App.tsx ou após autenticação
useEffect(() => {
  if (user) {
    setupUserOrganization();
  }
}, [user]);
```

---

### Caso de Uso 2: Verificar Permissões

```typescript
// Hook personalizado para verificar permissões
export function usePermission(module: string, action: string) {
  const [hasPermission, setHasPermission] = useState(false);
  const orgId = localStorage.getItem('currentOrgId');
  
  useEffect(() => {
    async function checkPermission() {
      const { data } = await supabase.rpc('user_has_permission', {
        p_org_id: orgId,
        p_module: module,
        p_action: action
      });
      setHasPermission(data);
    }
    checkPermission();
  }, [module, action, orgId]);
  
  return hasPermission;
}

// Uso no componente
function InventoryPage() {
  const canDelete = usePermission('inventory', 'delete');
  
  return (
    <div>
      {canDelete && (
        <Button onClick={handleDelete}>Deletar</Button>
      )}
    </div>
  );
}
```

---

### Caso de Uso 3: Inserir Dados (Automático)

```typescript
// O organization_id é adicionado AUTOMATICAMENTE pelo trigger!
async function addItem() {
  const { data, error } = await supabase
    .from('camara_fria_items')
    .insert({
      nome: 'Produto X',
      quantidade: 10,
      categoria: 'Bovina'
      // organization_id é adicionado automaticamente!
    });
}
```

---

### Caso de Uso 4: Listar Organizações (Dropdown)

```typescript
function OrganizationSelector() {
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState('');
  
  useEffect(() => {
    async function loadOrgs() {
      const { data } = await supabase.rpc('get_user_organizations');
      setOrganizations(data || []);
      
      // Selecionar primeira organização
      if (data && data.length > 0) {
        setCurrentOrg(data[0].org_id);
        localStorage.setItem('currentOrgId', data[0].org_id);
      }
    }
    loadOrgs();
  }, []);
  
  return (
    <select value={currentOrg} onChange={(e) => {
      setCurrentOrg(e.target.value);
      localStorage.setItem('currentOrgId', e.target.value);
      window.location.reload(); // Recarregar dados
    }}>
      {organizations.map(org => (
        <option key={org.org_id} value={org.org_id}>
          {org.org_name} ({org.user_role})
        </option>
      ))}
    </select>
  );
}
```

---

## 🔐 PERMISSÕES E ROLES

### Tabela de Permissões Padrão

| Role    | Inventory | Alerts | Reports | Settings | Members |
|---------|-----------|--------|---------|----------|---------|
| Owner   | ✅✅✅✅   | ✅✅✅  | ✅✅✅   | ✅✅✅    | ✅✅✅   |
| Admin   | ✅✅✅✅   | ✅✅✅  | ✅✅✅   | ✅✅✅    | ✅✅✅   |
| Manager | ✅✅❌✅   | ✅✅❌  | ✅✅❌   | ❌❌❌    | ❌❌❌   |
| Member  | ✅✅❌❌   | ✅✅❌  | ✅❌❌   | ❌❌❌    | ❌❌❌   |
| Viewer  | ✅❌❌❌   | ✅❌❌  | ✅❌❌   | ❌❌❌    | ❌❌❌   |

**Legenda:**
- ✅ = Permitido
- ❌ = Negado
- Sequência: Read / Write / Delete / Extra (Transfer ou Manage)

---

### Customizar Permissões

```sql
-- Atualizar permissões de um membro específico
UPDATE organization_members
SET permissions = '{
  "inventory": {"read": true, "write": true, "delete": false, "transfer": false},
  "alerts": {"read": true, "write": false, "delete": false}
}'::jsonb
WHERE organization_id = 'org-uuid'
  AND user_id = 'user-uuid';
```

---

## 🛡️ SEGURANÇA (RLS)

### Como Funciona?

**Row Level Security (RLS)** garante que:
1. Usuários só veem dados da SUA organização
2. Queries são automaticamente filtradas
3. Impossível acessar dados de outra org (mesmo via SQL injection)

### Exemplo Prático

```sql
-- Usuário executa:
SELECT * FROM camara_fria_items;

-- PostgreSQL automaticamente converte para:
SELECT * FROM camara_fria_items
WHERE organization_id IN (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = true
);
```

**Resultado:** Isolamento TOTAL e AUTOMÁTICO! 🔒

---

## 🔧 TROUBLESHOOTING

### Problema 1: "User must belong to an organization"

**Causa:** Usuário não tem organização

**Solução:**
```sql
SELECT auto_create_organization_for_user();
```

---

### Problema 2: Dados não aparecem após migration

**Causa:** `organization_id` ainda é NULL

**Solução:**
```sql
SELECT migrate_user_data_to_organization(
  (SELECT id FROM auth.users WHERE email = 'seu@email.com'),
  (SELECT id FROM organizations WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'seu@email.com'))
);
```

---

### Problema 3: "Permission denied"

**Causa:** Permissões insuficientes

**Solução:**
```sql
-- Verificar sua role
SELECT get_user_role(get_user_organization_id());

-- Verificar permissões específicas
SELECT user_has_permission(
  get_user_organization_id(),
  'inventory',
  'delete'
);

-- Se necessário, owner/admin pode atualizar permissões
```

---

### Problema 4: Não consigo ver meus dados antigos

**Causa:** Dados não foram migrados

**Solução:**
```sql
-- Ver dados sem org (DEBUG ONLY)
SELECT * FROM camara_fria_items WHERE organization_id IS NULL;

-- Migrar todos
SELECT migrate_user_data_to_organization(
  auth.uid(),
  get_user_organization_id()
);
```

---

## 📊 QUERIES ÚTEIS

### Ver todas as organizações (Admin)
```sql
SELECT * FROM organizations WHERE deleted_at IS NULL;
```

### Ver membros de uma organização
```sql
SELECT 
  om.role,
  u.email,
  om.is_active,
  om.joined_at
FROM organization_members om
JOIN auth.users u ON u.id = om.user_id
WHERE om.organization_id = 'org-uuid';
```

### Estatísticas gerais
```sql
SELECT * FROM organization_stats;
```

### Contar items por organização
```sql
SELECT 
  o.name,
  (SELECT COUNT(*) FROM camara_fria_items WHERE organization_id = o.id) as total_items
FROM organizations o;
```

---

## ✅ CHECKLIST FINAL

- [ ] Migration aplicada com sucesso
- [ ] Função `auto_create_organization_for_user()` executada
- [ ] Verificado: `SELECT * FROM my_organizations;` retorna dados
- [ ] Frontend atualizado para usar `get_user_organization_id()`
- [ ] Componente de seleção de organização implementado
- [ ] Permissões verificadas com `user_has_permission()`
- [ ] Dados antigos migrados
- [ ] RLS testado (usuários não veem dados de outras orgs)
- [ ] Teste de criação de items (organization_id automático)
- [ ] Documentação para a equipe

---

## 🎉 PRONTO!

Seu sistema agora é **MULTI-TENANT** com:
- ✅ Isolamento total de dados
- ✅ Permissões granulares
- ✅ RLS automático
- ✅ 9 funções utilitárias
- ✅ Pronto para produção!

**Dúvidas?** Consulte este guia ou teste as funções no SQL Editor.


