# ⚡ QUICK START: Executar Migrations Automaticamente

> **NOVO:** Scripts automatizados para minimizar erros operacionais!

---

## 🎯 SOLUÇÃO MAIS RÁPIDA (3 Opções)

### 1️⃣ Via NPM (Mais Simples)

```bash
# Setup (primeira vez)
npm run db:setup

# Aplicar fix
npm run db:fix-rls
```

**Pronto em 30 segundos!** ✅

---

### 2️⃣ Via PowerShell (Interativo)

```powershell
# Fix rápido
.\scripts\quick-fix-rls.ps1
```

**Ou menu completo:**
```powershell
.\scripts\apply-migrations.ps1
```

---

### 3️⃣ Via CMD/Batch (Windows)

```batch
REM Fix rápido
scripts\quick-fix-rls.bat
```

**Ou menu completo:**
```batch
scripts\apply-migrations.bat
```

---

## 📋 COMANDOS NPM DISPONÍVEIS

```bash
# Setup inicial (login)
npm run db:setup

# Aplicar FIX de recursão RLS ⭐ RECOMENDADO
npm run db:fix-rls

# Aplicar migration multi-tenant completa
npm run db:multi-tenant

# Diagnóstico completo do banco
npm run db:diagnostico

# Aplicar todas migrations pendentes
npm run db:push

# Listar migrations aplicadas
npm run db:migrations
```

---

## 🚀 PRIMEIRO USO

```bash
# 1. Login no Supabase (primeira vez)
npm run db:setup

# 2. Aplicar fix de recursão RLS
npm run db:fix-rls

# 3. Recarregar aplicação
# Pressione Ctrl+Shift+R no navegador

# ✅ Pronto!
```

---

## 📁 SCRIPTS CRIADOS

### PowerShell:
- `scripts/apply-migrations.ps1` - Menu interativo completo
- `scripts/quick-fix-rls.ps1` - Aplica fix rapidamente
- `scripts/setup-supabase.ps1` - Setup e login automático

### Batch/CMD:
- `scripts/apply-migrations.bat` - Menu interativo completo
- `scripts/quick-fix-rls.bat` - Aplica fix rapidamente

### NPM Scripts:
- 6 comandos adicionados ao `package.json`

---

## 📖 DOCUMENTAÇÃO COMPLETA

- **`scripts/README.md`** - Documentação detalhada dos scripts
- **`EXECUTAR_MIGRATIONS.md`** - Guia completo de uso
- **`_LEIA_PRIMEIRO_RLS.md`** - Overview do problema RLS
- **`_INDICE_SOLUCAO_RLS.md`** - Índice de todos os arquivos

---

## 🎯 CASOS DE USO

### Resolver Erro 42P17:
```bash
npm run db:fix-rls
```

### Setup Multi-Tenant:
```bash
npm run db:multi-tenant
npm run db:fix-rls
```

### Diagnóstico:
```bash
npm run db:diagnostico
```

---

## ✅ VANTAGENS

- ✅ **Sem erros operacionais** - Scripts validam tudo
- ✅ **Rápido** - 30 segundos para aplicar
- ✅ **Seguro** - Confirmações para operações críticas
- ✅ **Repetível** - Mesmo processo sempre
- ✅ **Auditável** - Logs automáticos

---

## 🆘 PROBLEMAS?

### "Supabase not found"
```bash
npm install -g supabase
```

### "Not authenticated"
```bash
npm run db:setup
```

### PowerShell não executa
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎯 RECOMENDAÇÃO

**Para uso diário:**
```bash
npm run db:fix-rls
```

**Para operações complexas:**
```powershell
.\scripts\apply-migrations.ps1
```

---

**Data:** 05/10/2025  
**Status:** ✅ Pronto para uso

**🚀 Comece agora:**
```bash
npm run db:setup
npm run db:fix-rls
```
