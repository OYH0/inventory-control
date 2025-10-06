# 🔐 Instruções para Teste de Login - Supabase

**Data:** 06 de outubro de 2025  
**Projeto:** uygwwqhjhozyljuxcgkd  
**Senha fornecida:** `cecOYH09118`

---

## 📋 Informações do Projeto

- **Projeto ID:** `uygwwqhjhozyljuxcgkd`
- **URL:** `https://uygwwqhjhozyljuxcgkd.supabase.co`
- **Dashboard:** https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd
- **Senha:** `cecOYH09118`

---

## 🚀 Opção 1: Teste Rápido (Interface Web)

### Passo 1: Abrir arquivo de teste

Abra o arquivo no navegador:
```
C:\Users\vboxuser\inventory-control\test-supabase-login.html
```

Ou execute:
```bash
start test-supabase-login.html
```

### Passo 2: Obter a chave anon

1. Acesse: https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/settings/api
2. Faça login no Supabase se necessário
3. Localize a seção **"Project API keys"**
4. Copie a chave **"anon / public"**

### Passo 3: Configurar a chave

No arquivo `test-supabase-login.html`, localize a linha:

```javascript
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...placeholder';
```

Substitua pelo valor copiado do dashboard.

### Passo 4: Testar login

1. Digite o email do usuário
2. A senha já está pré-preenchida: `cecOYH09118`
3. Clique em **"Fazer Login"**
4. Observe os resultados na tela

---

## 🖥️ Opção 2: Teste via Terminal (Node.js)

### Passo 1: Executar script

```bash
cd C:\Users\vboxuser\inventory-control
node test-supabase.js
```

### Passo 2: Seguir instruções

O script irá solicitar:
1. **Chave anon** (obtenha conforme instruções acima)
2. **Email** do usuário
3. **Senha** (padrão: `cecOYH09118` ou digite outra)

### Passo 3: Analisar resultados

O script testará:
- ✅ Conexão com Supabase
- ✅ Login do usuário
- ✅ Acesso ao banco de dados
- ✅ Criação de dados (teste)
- ✅ Políticas RLS

---

## 📝 Opção 3: Configurar Projeto Completo

### Passo 1: Obter chave anon

1. Acesse: https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/settings/api
2. Copie a chave **"anon / public"**

### Passo 2: Criar arquivo .env.local

Crie o arquivo na raiz do projeto:

```bash
cd C:\Users\vboxuser\inventory-control
echo VITE_SUPABASE_URL=https://uygwwqhjhozyljuxcgkd.supabase.co > .env.local
echo VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_AQUI >> .env.local
```

Ou crie manualmente com o conteúdo:

```env
# Configuração Supabase
VITE_SUPABASE_URL=https://uygwwqhjhozyljuxcgkd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon_aqui
```

### Passo 3: Reiniciar servidor

```bash
npm run dev
```

### Passo 4: Fazer login

1. Acesse: http://localhost:8081
2. Use o email cadastrado
3. Use a senha: `cecOYH09118`

---

## 🔍 Como Obter a Chave Anon (Passo a Passo Detalhado)

### 1. Acessar Dashboard do Supabase

Abra no navegador:
```
https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/settings/api
```

### 2. Fazer Login (se necessário)

- Use suas credenciais do Supabase
- Se não tiver acesso, peça ao administrador do projeto

### 3. Localizar as Chaves

Na página, você verá uma seção chamada **"Project API keys"**:

```
Project API keys
├─ Project URL: https://uygwwqhjhozyljuxcgkd.supabase.co
├─ anon / public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [Copiar]
└─ service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [Copiar]
```

### 4. Copiar a Chave Correta

⚠️ **IMPORTANTE:** Copie apenas a chave **"anon / public"**

❌ **NÃO use** a chave "service_role" no frontend!

### 5. Formato da Chave

A chave deve começar com:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Se começar diferente, você copiou a chave errada.

---

## 🧪 Testes a Realizar

### Teste 1: Conexão Básica
```javascript
const supabase = createClient(URL, ANON_KEY);
console.log('Conectado:', supabase ? 'Sim' : 'Não');
```

**Resultado esperado:** ✅ "Conectado: Sim"

### Teste 2: Login
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'seu@email.com',
  password: 'cecOYH09118'
});
```

**Resultado esperado:** ✅ `data.user` com informações do usuário

### Teste 3: Listar Dados
```javascript
const { data, error } = await supabase
  .from('camara_fria_items')
  .select('*')
  .limit(5);
```

**Resultado esperado:** ✅ Array com itens ou array vazio

### Teste 4: Criar Item
```javascript
const { data, error } = await supabase
  .from('camara_fria_items')
  .insert([{ nome: 'Teste', quantidade: 1, unidade: 'kg' }])
  .select();
```

**Resultado esperado:** ✅ Item criado com sucesso

---

## 🔧 Troubleshooting

### Erro: "Invalid API key"

**Causa:** Chave anon incorreta ou expirada  
**Solução:**
1. Verifique se copiou a chave completa
2. Obtenha nova chave do dashboard
3. Verifique se não há espaços extras

### Erro: "Invalid login credentials"

**Causa:** Email ou senha incorretos  
**Solução:**
1. Verifique se o email está correto
2. Confirme a senha: `cecOYH09118`
3. Verifique se o usuário existe no Supabase

### Erro: "Email not confirmed"

**Causa:** Email do usuário não foi confirmado  
**Solução:**
1. Verifique caixa de entrada do email
2. Confirme o email clicando no link
3. Ou desabilite confirmação de email no Supabase

### Erro: "Row Level Security policy violation"

**Causa:** Políticas RLS bloqueando acesso  
**Solução:**
```bash
npm run db:fix-rls
```

Ou execute o SQL:
```sql
-- Ver arquivo: FIX_RLS_RECURSION.sql
```

### Erro: "Missing Supabase environment variables"

**Causa:** Arquivo .env.local não existe ou está incorreto  
**Solução:**
1. Criar arquivo .env.local na raiz
2. Adicionar as variáveis corretas
3. Reiniciar o servidor

---

## 📊 Checklist de Testes

### Pré-requisitos
- [ ] Acesso ao dashboard do Supabase
- [ ] Chave anon copiada corretamente
- [ ] Email do usuário conhecido
- [ ] Senha confirmada: `cecOYH09118`

### Testes Básicos
- [ ] Criar cliente Supabase
- [ ] Fazer login com sucesso
- [ ] Visualizar dados do usuário
- [ ] Obter token de sessão

### Testes de Banco de Dados
- [ ] Listar itens (SELECT)
- [ ] Criar item (INSERT)
- [ ] Atualizar item (UPDATE)
- [ ] Deletar item (DELETE)

### Testes de Segurança
- [ ] RLS funcionando
- [ ] Isolamento multi-tenant
- [ ] Token expira corretamente
- [ ] Refresh token funciona

---

## 🎯 Resultado Esperado

Após os testes, você deve conseguir:

1. ✅ **Conectar** ao Supabase
2. ✅ **Fazer login** com email e senha
3. ✅ **Acessar** o banco de dados
4. ✅ **Criar/Editar/Deletar** itens
5. ✅ **Navegar** pela aplicação

Se todos os itens acima funcionarem, o sistema está **100% operacional**!

---

## 📞 Comandos Úteis

```bash
# Testar login via terminal
node test-supabase.js

# Abrir teste em HTML
start test-supabase-login.html

# Iniciar servidor de desenvolvimento
npm run dev

# Ver logs do Supabase
npm run db:diagnostico

# Corrigir problemas RLS
npm run db:fix-rls
```

---

## 📚 Recursos Adicionais

### Documentação
- **Supabase JS Client:** https://supabase.com/docs/reference/javascript
- **Authentication:** https://supabase.com/docs/guides/auth
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security

### Arquivos de Referência
- `CONFIGURACAO_SUPABASE.md` - Configuração completa
- `TESTE_RESUMO_SISTEMA.md` - Resumo dos testes
- `_COMECE_AQUI.md` - Guia rápido
- `FIX_RLS_RECURSION.sql` - Correção de RLS

---

## ✅ Status

**Senha fornecida:** ✅ `cecOYH09118`  
**Projeto identificado:** ✅ `uygwwqhjhozyljuxcgkd`  
**Scripts de teste:** ✅ Criados  
**Documentação:** ✅ Completa  

**Próximo passo:** Obter chave anon e testar login! 🚀

---

**Última atualização:** 06 de outubro de 2025  
**Status:** ✅ Pronto para teste


