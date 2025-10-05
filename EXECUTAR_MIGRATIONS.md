# 🚀 COMO EXECUTAR MIGRATIONS AUTOMATICAMENTE

**Objetivo:** Minimizar erros operacionais usando scripts automatizados

---

## ⚡ SOLUÇÃO MAIS RÁPIDA (30 segundos)

### PowerShell (Recomendado):

```powershell
.\scripts\quick-fix-rls.ps1
```

### CMD/Batch:

```batch
scripts\quick-fix-rls.bat
```

### NPM Scripts:

```bash
npm run db:fix-rls
```

**Pronto!** Erro 42P17 resolvido.

---

## 📋 TODAS AS OPÇÕES DISPONÍVEIS

### 1️⃣ Via Scripts Interativos (Mais Fácil)

#### PowerShell:
```powershell
# Menu completo com todas as opções
.\scripts\apply-migrations.ps1
```

#### CMD:
```batch
# Menu completo com todas as opções
scripts\apply-migrations.bat
```

**Menu disponível:**
- 🔧 Aplicar FIX de Recursão RLS
- 📦 Aplicar Migration Multi-Tenant Completa
- 🔍 Diagnóstico do banco de dados
- ⚡ Solução Emergencial (dev only)
- 📊 Listar migrations aplicadas
- 🆕 Aplicar todas migrations pendentes

---

### 2️⃣ Via NPM Scripts (Mais Rápido)

```bash
# Setup inicial (primeira vez)
npm run db:setup

# Aplicar FIX de recursão RLS
npm run db:fix-rls

# Aplicar migration multi-tenant completa
npm run db:multi-tenant

# Executar diagnóstico
npm run db:diagnostico

# Aplicar todas migrations pendentes
npm run db:push

# Listar migrations aplicadas
npm run db:migrations
```

---

### 3️⃣ Via Quick Scripts (Específico)

```powershell
# PowerShell - Fix rápido
.\scripts\quick-fix-rls.ps1

# PowerShell - Setup inicial
.\scripts\setup-supabase.ps1
```

```batch
REM CMD - Fix rápido
scripts\quick-fix-rls.bat
```

---

## 🎯 FLUXO COMPLETO (Primeira Vez)

### Passo 1: Setup Inicial

**Opção A - Script automatizado:**
```powershell
.\scripts\setup-supabase.ps1
```

**Opção B - Manual:**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
npm run db:setup
# Ou: supabase login
```

### Passo 2: Aplicar Fix

**Via NPM (recomendado):**
```bash
npm run db:fix-rls
```

**Via Script:**
```powershell
.\scripts\quick-fix-rls.ps1
```

### Passo 3: Verificar

1. Recarregue a aplicação: **Ctrl+Shift+R**
2. Abra Console (F12)
3. Verifique que não há mais erro `42P17`

### Passo 4: Diagnóstico (Opcional)

```bash
npm run db:diagnostico
```

---

## 🛠️ SETUP INICIAL (Requisitos)

### 1. Instalar Supabase CLI

**Opção A - Global (recomendado):**
```bash
npm install -g supabase
```

**Opção B - Via script:**
```powershell
.\scripts\setup-supabase.ps1
```

**Verificar instalação:**
```bash
supabase --version
```

### 2. Fazer Login

```bash
npm run db:setup
```

Ou diretamente:
```bash
supabase login
```

Seu navegador abrirá para autenticação.

### 3. Verificar Conexão

```bash
npm run db:migrations
```

Deve mostrar as migrations do projeto.

---

## 📊 COMPARAÇÃO DE MÉTODOS

| Método | Facilidade | Velocidade | Requer Setup |
|--------|-----------|------------|--------------|
| **NPM Scripts** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | Sim (login) |
| **Scripts PS1/BAT** | ⭐⭐⭐⭐ | ⚡⚡⚡ | Sim (login) |
| **Quick Scripts** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡ | Sim (login) |
| **Manual (Dashboard)** | ⭐⭐ | ⚡ | Não |

**🏆 Recomendação:** Use **Quick Scripts** para fix único ou **NPM Scripts** para uso frequente

---

## 🎯 CASOS DE USO

### Resolver Erro 42P17 (URGENTE)

```bash
# Mais rápido (10 segundos)
npm run db:fix-rls

# Ou
.\scripts\quick-fix-rls.ps1
```

### Setup Completo Multi-Tenant

```bash
# 1. Migration base
npm run db:multi-tenant

# 2. Fix de recursão
npm run db:fix-rls

# 3. Verificar
npm run db:diagnostico
```

### Desenvolvimento Contínuo

```bash
# Aplicar novas migrations
npm run db:push

# Ver o que foi aplicado
npm run db:migrations
```

### Troubleshooting

```bash
# Diagnóstico completo
npm run db:diagnostico

# Ver logs
supabase db logs --project-ref uygwwqhjhozyljuxcgkd
```

---

## 🐛 TROUBLESHOOTING

### Erro: "command not found: supabase"

**Solução:**
```bash
# Instalar globalmente
npm install -g supabase

# Ou usar via npx
npx supabase --version
```

### Erro: "Not authenticated"

**Solução:**
```bash
npm run db:setup
# Ou: supabase login
```

### Erro: "Project not found"

**Solução:**
```bash
# Verificar projetos
supabase projects list

# Linkar manualmente
supabase link --project-ref uygwwqhjhozyljuxcgkd
```

### PowerShell: "scripts are disabled"

**Solução:**
```powershell
# Permitir execução (apenas primeira vez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "File not found"

**Solução:**
```bash
# Verificar que está na raiz do projeto
cd C:\Users\vboxuser\Downloads\inventory-control

# Verificar arquivos
ls *.sql
```

---

## 📝 NPM SCRIPTS DISPONÍVEIS

Adicionados ao `package.json`:

```json
{
  "scripts": {
    "db:fix-rls": "Aplica FIX_RLS_RECURSION.sql",
    "db:multi-tenant": "Aplica MULTI_TENANT_COMPLETE_MIGRATION.sql",
    "db:diagnostico": "Executa diagnóstico completo",
    "db:push": "Aplica todas migrations pendentes",
    "db:migrations": "Lista migrations aplicadas",
    "db:setup": "Faz login no Supabase"
  }
}
```

**Uso:**
```bash
npm run <nome-do-script>
```

---

## 🎨 OUTPUTS VISUAIS

### ✅ Sucesso:
```
✅ FIX APLICADO COM SUCESSO!

📋 Próximos passos:
  1. Recarregue sua aplicação (Ctrl+Shift+R)
  2. Verifique o console (não deve ter mais erro 42P17)
```

### ❌ Erro:
```
❌ ERRO ao aplicar fix!

💡 Dica: Você fez login no Supabase?
   Execute: npm run db:setup
```

### ⚠️ Aviso:
```
⚠️  ATENÇÃO: Esta migration é extensa e modificará toda estrutura!
Tem certeza? (Digite 'SIM' para confirmar)
```

---

## 🔄 WORKFLOW RECOMENDADO

### Para Desenvolvimento:

```bash
# 1. Setup inicial (primeira vez)
npm run db:setup

# 2. Aplicar fixes necessários
npm run db:fix-rls

# 3. Durante desenvolvimento
npm run db:push  # Aplicar novas migrations

# 4. Antes de commit
npm run db:migrations  # Verificar estado
```

### Para Produção:

```bash
# 1. Backup do banco (via Supabase Dashboard)

# 2. Testar em staging primeiro
npm run db:diagnostico

# 3. Aplicar migration
npm run db:fix-rls

# 4. Verificar
npm run db:diagnostico

# 5. Monitorar logs
supabase db logs --project-ref uygwwqhjhozyljuxcgkd
```

---

## 📚 ARQUIVOS CRIADOS

### Scripts PowerShell:
- `scripts/apply-migrations.ps1` - Menu completo interativo
- `scripts/quick-fix-rls.ps1` - Fix rápido
- `scripts/setup-supabase.ps1` - Setup e login

### Scripts Batch:
- `scripts/apply-migrations.bat` - Menu completo interativo
- `scripts/quick-fix-rls.bat` - Fix rápido

### Documentação:
- `scripts/README.md` - Documentação completa dos scripts
- `EXECUTAR_MIGRATIONS.md` - Este arquivo

### NPM Scripts:
- Adicionados ao `package.json` (6 comandos)

---

## ✨ VANTAGENS DA AUTOMAÇÃO

### ✅ Sem Erros Operacionais:
- Não precisa copiar/colar manualmente
- Validações automáticas
- Confirmações para operações críticas

### ✅ Produtividade:
- Fix em 30 segundos
- Um comando para tudo
- Não precisa abrir navegador

### ✅ Auditoria:
- Logs automáticos
- Rastreamento de execução
- Fácil troubleshooting

### ✅ Repetibilidade:
- Mesmo processo sempre
- Scripts versionados no Git
- Fácil onboarding de novos devs

---

## 🎯 RECOMENDAÇÃO FINAL

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  🥇 MELHOR MÉTODO:                              │
│                                                 │
│     # Setup (primeira vez):                     │
│     .\scripts\setup-supabase.ps1                │
│                                                 │
│     # Uso diário:                               │
│     npm run db:fix-rls                          │
│                                                 │
│  ⏱️  Tempo: 30 segundos                         │
│  ✅ Sem erros operacionais                      │
│  🚀 Pronto para produção                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

**Data:** 05/10/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para uso

---

**🚀 COMECE AGORA:**

```bash
npm run db:fix-rls
```

Ou:

```powershell
.\scripts\quick-fix-rls.ps1
```
