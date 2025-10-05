# 🚀 Scripts de Automação de Migrations

Scripts automatizados para aplicar migrations no Supabase de forma segura e sem erros operacionais.

---

## 📁 Arquivos Disponíveis

| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| `apply-migrations.ps1` | Menu completo de migrations (PowerShell) | Principal |
| `apply-migrations.bat` | Menu completo de migrations (CMD) | Principal |
| `quick-fix-rls.ps1` | Aplica FIX_RLS_RECURSION rapidamente (PowerShell) | Quick fix |
| `quick-fix-rls.bat` | Aplica FIX_RLS_RECURSION rapidamente (CMD) | Quick fix |
| `setup-supabase.ps1` | Instala e faz login no Supabase CLI | Setup inicial |

---

## 🎯 QUICK START (Mais Rápido)

### Windows PowerShell:

```powershell
# 1. Fazer login no Supabase (primeira vez)
.\scripts\setup-supabase.ps1

# 2. Aplicar fix de recursão RLS
.\scripts\quick-fix-rls.ps1
```

### Windows CMD:

```batch
REM 1. Fazer login no Supabase (primeira vez)
supabase login

REM 2. Aplicar fix de recursão RLS
scripts\quick-fix-rls.bat
```

**Pronto!** Em 30 segundos seu problema está resolvido.

---

## 📋 MENU COMPLETO (Todas as Opções)

### Windows PowerShell:

```powershell
.\scripts\apply-migrations.ps1
```

### Windows CMD:

```batch
scripts\apply-migrations.bat
```

**Menu de opções:**
1. 🔧 Aplicar FIX de Recursão RLS ← **Recomendado para erro 42P17**
2. 📦 Aplicar Migration Multi-Tenant Completa
3. 🔍 Diagnóstico do banco de dados
4. ⚡ Aplicar Solução Emergencial (dev only)
5. 📊 Listar migrations aplicadas
6. 🆕 Aplicar todas as migrations pendentes
7. 🚪 Sair

---

## 🔧 SETUP INICIAL (Primeira Vez)

### 1. Instalar Supabase CLI

**Opção A - PowerShell (recomendado):**
```powershell
.\scripts\setup-supabase.ps1
```

**Opção B - Manual:**
```powershell
npm install -g supabase
```

**Opção C - Usar via NPX (sem instalar):**
```powershell
# Não precisa instalar, mas cada comando será mais lento
npx supabase --help
```

### 2. Fazer Login

```powershell
supabase login
```

Seu navegador abrirá automaticamente para autenticação.

### 3. Verificar Conexão

```powershell
supabase projects list
```

Deve mostrar o projeto: `uygwwqhjhozyljuxcgkd`

---

## 🎯 Casos de Uso

### Erro 42P17 (Recursão Infinita)

```powershell
# PowerShell (30 segundos)
.\scripts\quick-fix-rls.ps1

# Ou CMD
scripts\quick-fix-rls.bat
```

### Aplicar Migration Completa Multi-Tenant

```powershell
# PowerShell
.\scripts\apply-migrations.ps1
# Escolha opção 2

# Ou CMD
scripts\apply-migrations.bat
REM Escolha opção 2
```

### Ver Estado Atual do Banco

```powershell
# PowerShell
.\scripts\apply-migrations.ps1
# Escolha opção 3 (Diagnóstico)

# Ou CMD
scripts\apply-migrations.bat
REM Escolha opção 3
```

### Aplicar Todas Migrations Pendentes

```powershell
# PowerShell
.\scripts\apply-migrations.ps1
# Escolha opção 6

# Ou CMD
scripts\apply-migrations.bat
REM Escolha opção 6
```

---

## 🛡️ Segurança e Boas Práticas

### ✅ Scripts Fazem:
- Verificam se você está na raiz do projeto
- Confirmam antes de operações destrutivas
- Usam arquivos temporários quando necessário
- Exibem mensagens claras de erro/sucesso
- Validam se Supabase CLI está instalado

### ⚠️ Avisos Importantes:

1. **Solução Emergencial (opção 4):**
   - ⚠️ DESABILITA segurança RLS
   - ⚠️ Use APENAS em desenvolvimento
   - ⚠️ Aplique o fix correto depois

2. **Migration Multi-Tenant (opção 2):**
   - ⚠️ Modifica estrutura completa do banco
   - ⚠️ Requer confirmação explícita (digite "SIM")
   - ⚠️ Pode levar até 60 segundos

3. **Produção:**
   - ✅ Teste em ambiente de desenvolvimento primeiro
   - ✅ Faça backup antes de operações grandes
   - ✅ Use opção 5 para verificar migrations aplicadas

---

## 🐛 Troubleshooting

### Erro: "Supabase CLI não encontrado"

**Solução:**
```powershell
# Instalar globalmente
npm install -g supabase

# Ou usar via npx
npx supabase --version
```

### Erro: "Permission denied" ou "Não foi possível executar"

**Solução PowerShell:**
```powershell
# Permitir execução de scripts (apenas primeira vez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Depois execute normalmente
.\scripts\apply-migrations.ps1
```

### Erro: "Project not found" ou "Not authenticated"

**Solução:**
```powershell
# Fazer login novamente
supabase login

# Verificar projetos
supabase projects list

# Se não aparecer, linkar manualmente
supabase link --project-ref uygwwqhjhozyljuxcgkd
```

### Script não executa (nada acontece)

**Solução CMD:**
```batch
REM Executar com caminho completo
cd C:\Users\vboxuser\Downloads\inventory-control
scripts\quick-fix-rls.bat
```

**Solução PowerShell:**
```powershell
# Usar .\ no início
.\scripts\quick-fix-rls.ps1

# Ou caminho completo
C:\Users\vboxuser\Downloads\inventory-control\scripts\quick-fix-rls.ps1
```

### Erro: "Failed to execute SQL"

**Causas comuns:**
1. Syntax error no arquivo SQL
2. Função/tabela já existe
3. Permissões insuficientes

**Solução:**
```powershell
# Ver logs detalhados
.\scripts\apply-migrations.ps1
# Escolha opção 3 (Diagnóstico)

# Verificar arquivo SQL manualmente
code FIX_RLS_RECURSION.sql
```

---

## 📊 Como Funcionam os Scripts

### 1. Verificações Iniciais
- ✅ Está na raiz do projeto?
- ✅ Supabase CLI instalado?
- ✅ Arquivo SQL existe?

### 2. Execução
- 📤 Conecta ao projeto Supabase remoto
- 📝 Lê arquivo SQL
- 🚀 Executa via `supabase db execute`
- ✅ Verifica sucesso/erro

### 3. Feedback
- 🟢 Mensagens de sucesso (verde)
- 🔴 Mensagens de erro (vermelho)
- 🟡 Avisos (amarelo)
- 🔵 Informações (azul/cyan)

---

## 🔄 Fluxo Recomendado

### Para Resolver Erro 42P17:

```
1. Setup (primeira vez)
   └─ .\scripts\setup-supabase.ps1
   
2. Quick Fix (30s)
   └─ .\scripts\quick-fix-rls.ps1
   
3. Verificar
   └─ Recarregar app (Ctrl+Shift+R)
   └─ Verificar console (sem erro 42P17)
   
4. Opcional: Diagnóstico
   └─ .\scripts\apply-migrations.ps1 (opção 3)
```

### Para Setup Completo Multi-Tenant:

```
1. Setup (primeira vez)
   └─ .\scripts\setup-supabase.ps1
   
2. Migration Completa
   └─ .\scripts\apply-migrations.ps1 (opção 2)
   
3. Fix de Recursão
   └─ .\scripts\apply-migrations.ps1 (opção 1)
   
4. Diagnóstico
   └─ .\scripts\apply-migrations.ps1 (opção 3)
   
5. Verificar app
   └─ Recarregar e testar
```

---

## 📝 Comandos Manuais (Referência)

Se preferir executar manualmente:

```powershell
# Login
supabase login

# Executar arquivo SQL específico
supabase db execute --file FIX_RLS_RECURSION.sql --project-ref uygwwqhjhozyljuxcgkd

# Listar migrations
supabase migration list --project-ref uygwwqhjhozyljuxcgkd

# Aplicar migrations pendentes
supabase db push --project-ref uygwwqhjhozyljuxcgkd

# Ver status do projeto
supabase projects list

# Ver logs
supabase db logs --project-ref uygwwqhjhozyljuxcgkd
```

---

## 🎯 Vantagens dos Scripts

### ✅ Automatização
- Sem copiar/colar manual no Supabase Dashboard
- Sem erros de digitação
- Processo repetível e confiável

### ✅ Segurança
- Confirmações antes de operações destrutivas
- Validações automáticas
- Mensagens claras de erro

### ✅ Produtividade
- Quick fix em 30 segundos
- Menu interativo fácil de usar
- Não precisa abrir navegador

### ✅ Auditoria
- Logs automáticos
- Rastreamento de execução
- Fácil troubleshooting

---

## 📚 Arquivos Relacionados

Os scripts aplicam estes arquivos SQL (que devem estar na raiz):

- `FIX_RLS_RECURSION.sql` - Correção de recursão RLS
- `MULTI_TENANT_COMPLETE_MIGRATION.sql` - Setup multi-tenant completo
- `DIAGNOSTICO_RLS.sql` - Diagnóstico do banco
- `SOLUCAO_EMERGENCIAL_RLS.sql` - Solução temporária (dev only)

**Documentação:**
- `_LEIA_PRIMEIRO_RLS.md` - Overview geral
- `_INDICE_SOLUCAO_RLS.md` - Índice completo
- `GUIA_DECISAO_RLS.md` - Qual solução usar
- `RESUMO_ERRO_RLS.md` - Visão geral do problema
- `INSTRUCOES_FIX_RLS.md` - Guia detalhado

---

## 🆘 Suporte

### Problemas com Scripts:
1. Leia seção **Troubleshooting** acima
2. Verifique se está na raiz do projeto
3. Confirme que Supabase CLI está instalado
4. Tente fazer login novamente

### Problemas com Migrations:
1. Execute diagnóstico (opção 3 no menu)
2. Leia `INSTRUCOES_FIX_RLS.md`
3. Verifique logs no Supabase Dashboard

---

## ✨ Exemplos de Uso

### Exemplo 1: Primeira vez no projeto

```powershell
# 1. Setup
.\scripts\setup-supabase.ps1
# (navegador abre para login)

# 2. Aplicar fix
.\scripts\quick-fix-rls.ps1
# ✅ FIX APLICADO COM SUCESSO!

# 3. Recarregar app
# Pressione Ctrl+Shift+R no navegador
```

### Exemplo 2: Desenvolv continuando trabalho

```powershell
# Aplicar fix rapidamente
.\scripts\quick-fix-rls.ps1
# ✅ Pronto em 30 segundos
```

### Exemplo 3: Setup completo multi-tenant

```powershell
# Menu completo
.\scripts\apply-migrations.ps1

# Escolher:
# → 2 (Multi-tenant completo)
# → Digitar "SIM" para confirmar
# → Aguardar ~60 segundos
# ✅ Sucesso

# Depois:
# → 1 (Fix de recursão)
# ✅ Sucesso

# Verificar:
# → 3 (Diagnóstico)
# → Revisar resultados
```

---

**Data:** 05/10/2025  
**Versão:** 1.0  
**Status:** ✅ Scripts prontos para uso

---

**🚀 COMECE AGORA:**

```powershell
# PowerShell (recomendado)
.\scripts\quick-fix-rls.ps1

# Ou CMD
scripts\quick-fix-rls.bat
```
