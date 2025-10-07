# 🚀 MASTER PANEL - FUNCIONALIDADES AVANÇADAS

## ✅ IMPLEMENTADO ATÉ AGORA

### **Componentes UI Auxiliares** ✅
- ✅ `RoleSelector.tsx` - Seletor de roles com ícones e descrições
- ✅ `PasswordGenerator.tsx` - Gerador de senhas seguras com copiar
- ✅ `CreateOrganizationDialog.tsx` - Dialog completo para criar organizações

### **Funcionalidades do CreateOrganizationDialog** ✅
- ✅ Formulário em 2 colunas (informações básicas | configurações)
- ✅ Geração automática de slug a partir do nome
- ✅ Validação de slug único antes de criar
- ✅ Verificação de email do owner existente
- ✅ Seletor de cor primária com preview
- ✅ Configuração de tier de assinatura
- ✅ Toggle de status ativo/inativo
- ✅ Campo de observações
- ✅ Criação automática do owner como membro
- ✅ Loading states e tratamento de erros

---

## 📋 PRÓXIMOS PASSOS

### **1. Integrar CreateOrganizationDialog** 🔄

No arquivo `src/components/admin/OrganizationsManagement.tsx`, adicionar:

```typescript
import { CreateOrganizationDialog } from './CreateOrganizationDialog';

// No componente, adicionar antes dos filtros:
<div className="flex justify-between items-center mb-6">
  <div>
    <h3 className="text-lg font-semibold">Gerenciamento de Organizações</h3>
    <p className="text-sm text-muted-foreground">
      {organizations.length} organização(ões) cadastrada(s)
    </p>
  </div>
  <CreateOrganizationDialog onSuccess={refetch} />
</div>
```

### **2. Criar EditOrganizationDialog** 📝

Arquivo: `src/components/admin/EditOrganizationDialog.tsx`

**Funcionalidades necessárias:**
- Abrir com dados pré-preenchidos da organização
- Permitir edição de todos os campos (exceto ID)
- Warning ao alterar slug
- Seção "Informações Não Editáveis" (data criação, total membros, total itens)
- Botão "Transferir Ownership" (abre sub-dialog)
- Salvar alterações com `updateOrganization()` do hook

### **3. Criar CreateUserDialog** 👤

Arquivo: `src/components/admin/CreateUserDialog.tsx`

**Estrutura:**
```typescript
import { PasswordGenerator } from './PasswordGenerator';
import { RoleSelector } from './RoleSelector';

// Formulário com:
- Email (required, único)
- Nome Completo (required)
- PasswordGenerator component
- Select user_type (user | admin)
- Select unidade_responsavel
- Autocomplete de organizações (opcional)
- RoleSelector (se org selecionada)
- Checkbox "Enviar email de boas-vindas"
```

**IMPORTANTE:**  
Como Vite não tem API routes nativamente, precisamos usar uma abordagem diferente:

**Opção A:** Criar função no frontend que usa `supabase.auth.admin` (não recomendado - expõe service key)

**Opção B:** Usar Supabase Edge Functions:
```bash
# Criar edge function
supabase functions new create-user

# Implementar em supabase/functions/create-user/index.ts
```

**Opção C (Recomendada):** Adicionar note explicativa de que esta funcionalidade requer backend:
```
⚠️ Criar usuário requer Service Role Key no backend.
Configure Supabase Edge Functions ou adicione um backend Node.js.
```

### **4. Criar EditUserDialog** ✏️

Arquivo: `src/components/admin/EditUserDialog.tsx`

**3 Seções:**

**A) Informações Básicas**
- Nome Completo (editável)
- Email (readonly)
- Unidade Responsável (editável)
- Tipo de Usuário (select: user/admin)
- Status da Conta (toggle)

**B) Organizações e Roles**
```typescript
<div className="space-y-4">
  <Label>Organizações do Usuário</Label>
  {userOrganizations.map(org => (
    <Card key={org.id} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{org.org_name}</p>
          <p className="text-xs text-muted-foreground">{org.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleSelector 
            value={org.role} 
            onChange={(newRole) => handleRoleChange(org.id, newRole)}
          />
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => handleRemoveFromOrg(org.id)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  ))}
  <Button onClick={handleAddToOrg}>
    <Plus className="w-4 h-4 mr-2" />
    Adicionar a Organização
  </Button>
</div>
```

**C) Ações Avançadas**
```typescript
<div className="space-y-2 border-t pt-4">
  <Button variant="outline" onClick={handleResetPassword}>
    <Mail className="w-4 h-4 mr-2" />
    Enviar Reset de Senha
  </Button>
  <Button variant="outline" onClick={handleForceLogout}>
    <LogOut className="w-4 h-4 mr-2" />
    Forçar Logout
  </Button>
  <Button variant="outline" onClick={handleDeactivateGlobally}>
    <Ban className="w-4 h-4 mr-2" />
    Desativar Globalmente
  </Button>
  <Button variant="destructive" onClick={handleDeleteUser}>
    <Trash2 className="w-4 h-4 mr-2" />
    Deletar Usuário
  </Button>
</div>
```

### **5. Atualizar Hooks** 🪝

**src/hooks/admin/useAdminOrganizations.ts**

Adicionar funções:
```typescript
const transferOwnership = async (orgId: string, newOwnerId: string) => {
  // 1. Atualizar owner_id na tabela organizations
  // 2. Atualizar role do novo owner para 'owner'
  // 3. Rebaixar antigo owner para 'admin'
  // 4. Log de auditoria
};
```

**src/hooks/admin/useAdminUsers.ts**

Adicionar funções:
```typescript
const updateUserRoleInOrg = async (userId: string, orgId: string, newRole: OrganizationRole) => {
  // Atualizar role em organization_members
  // Log de auditoria
};

const removeUserFromOrg = async (userId: string, orgId: string) => {
  // Verificar se não é único owner
  // Deletar de organization_members
  // Log de auditoria
};

const addUserToOrg = async (userId: string, orgId: string, role: OrganizationRole) => {
  // Inserir em organization_members
  // Log de auditoria
};

const resetPassword = async (userId: string) => {
  // Usar supabase.auth.admin.updateUser para enviar reset email
};

const deactivateGlobally = async (userId: string) => {
  // Update is_active = false em todos os organization_members
};
```

### **6. Integrar Dialogs nas Tabs** 🔗

**OrganizationsManagement.tsx:**
```typescript
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { EditOrganizationDialog } from './EditOrganizationDialog';

const [editingOrg, setEditingOrg] = useState<AdminOrganization | null>(null);

// No header:
<CreateOrganizationDialog onSuccess={refetch} />

// No handleEdit:
const handleEdit = (org: AdminOrganization) => {
  setEditingOrg(org);
};

// Após a listagem:
{editingOrg && (
  <EditOrganizationDialog 
    organization={editingOrg}
    onClose={() => setEditingOrg(null)}
    onSuccess={refetch}
  />
)}
```

**UsersManagement.tsx:**
```typescript
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';

const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

// Similar à implementação acima
```

### **7. Variável de Ambiente** 🔐

Adicionar ao `.env.local`:
```env
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

⚠️ **ATENÇÃO:** 
- NUNCA commitar este arquivo
- Para produção, usar Supabase Edge Functions ao invés de expor a service key no frontend

---

## 📊 PROGRESSO ATUAL

**Componentes Criados:** 3/8 (37.5%)
- ✅ RoleSelector
- ✅ PasswordGenerator
- ✅ CreateOrganizationDialog
- ⏳ EditOrganizationDialog
- ⏳ CreateUserDialog
- ⏳ EditUserDialog

**Hooks Atualizados:** 0/2 (0%)
- ⏳ useAdminOrganizations (+ transferOwnership)
- ⏳ useAdminUsers (+ múltiplas funções)

**Integrações:** 0/2 (0%)
- ⏳ OrganizationsManagement
- ⏳ UsersManagement

---

## 🎯 RESUMO DO QUE FALTA

1. **Criar EditOrganizationDialog** (similar ao Create, com dados pré-preenchidos)
2. **Criar CreateUserDialog** (com PasswordGenerator e RoleSelector)
3. **Criar EditUserDialog** (3 seções: Info, Orgs, Ações)
4. **Atualizar hooks** com novas funções CRUD
5. **Integrar dialogs** nas tabs de gerenciamento
6. **Testar** todas as funcionalidades end-to-end

---

## 💡 RECOMENDAÇÕES

**Para criar usuários:**
Use Supabase Edge Functions ao invés de expor service key:

```bash
supabase functions new create-admin-user
```

Em `supabase/functions/create-admin-user/index.ts`:
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Validar que requisição vem de admin
  // Criar usuário
  // Retornar resultado
});
```

**Deploy:**
```bash
supabase functions deploy create-admin-user
```

**Chamar do frontend:**
```typescript
const { data, error } = await supabase.functions.invoke('create-admin-user', {
  body: { email, fullName, password, userType }
});
```

---

## ✨ RESULTADO FINAL ESPERADO

Após completar todos os passos, o Master Admin poderá:

✅ **Organizações:**
- Criar novas organizações do zero
- Editar todas as informações
- Transferir ownership
- Desativar/reativar
- Soft delete

✅ **Usuários:**
- Criar novos usuários com credenciais
- Editar perfis
- Promover/remover admin (user_type)
- Gerenciar roles por organização
- Adicionar/remover de organizações
- Resetar senha, forçar logout
- Desativar/deletar usuários

Todas as ações registradas em `organization_audit_log`!

