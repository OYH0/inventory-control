# 🔴 SOLUÇÃO: auth.uid() retorna NULL

## 🔍 PROBLEMA IDENTIFICADO

O erro ocorre porque `auth.uid()` retorna `NULL` quando você executa SQL direto no SQL Editor do Supabase Dashboard. Isso é **normal e esperado** porque você não está autenticado como um usuário da aplicação.

```
ERROR: null value in column "user_id" violates not-null constraint
```

---

## ✅ SOLUÇÃO RÁPIDA (3 PASSOS)

### **Passo 1: Descubra seu User ID**

No **SQL Editor do Supabase**, execute:

```sql
SELECT id, email, full_name, user_type 
FROM profiles 
ORDER BY created_at DESC;
```

**Resultado esperado:**
```
id                                      | email              | full_name
----------------------------------------|--------------------|-----------
abc-123-def-456-ghi                    | seu@email.com      | Seu Nome
```

📋 **Copie o `id` da sua conta** (o UUID grande)

---

### **Passo 2: Use seu ID para criar a configuração**

Cole seu ID no lugar de `'SEU-USER-ID-AQUI'` e execute:

```sql
INSERT INTO alert_configurations (
    user_id,
    warning_days,
    critical_days,
    notification_frequency,
    notification_time,
    notification_channels,
    is_active,
    created_at,
    updated_at
) VALUES (
    'abc-123-def-456-ghi'::uuid,  -- ⚠️ Cole seu ID aqui!
    30,
    7,
    'daily',
    '09:00',
    to_jsonb(ARRAY['in_app']::text[]),
    true,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
    warning_days = 30,
    critical_days = 7,
    updated_at = NOW();
```

---

### **Passo 3: Verificar se funcionou**

```sql
SELECT * FROM alert_configurations WHERE user_id = 'abc-123-def-456-ghi'::uuid;
```

Se mostrar uma linha com seus dados, **funcionou!** ✅

---

## 🚀 SOLUÇÃO AUTOMÁTICA (Opção Alternativa)

Se você tem vários usuários e quer criar configuração para **TODOS**, execute:

```sql
-- Criar configuração padrão para todos os usuários que ainda não têm
INSERT INTO alert_configurations (
    user_id,
    warning_days,
    critical_days,
    notification_frequency,
    notification_time,
    notification_channels,
    is_active,
    created_at,
    updated_at
)
SELECT 
    id,
    30,
    7,
    'daily',
    '09:00',
    to_jsonb(ARRAY['in_app']::text[]),
    true,
    NOW(),
    NOW()
FROM profiles
WHERE id NOT IN (SELECT user_id FROM alert_configurations);

-- Ver quantos foram criados
SELECT COUNT(*) as total_criados FROM alert_configurations;
```

---

## 📱 COMO USAR auth.uid() NA APLICAÇÃO

Quando você usa a aplicação web (não o SQL Editor), `auth.uid()` **funciona automaticamente** porque:

1. Você faz login no app
2. O Supabase cria uma sessão autenticada
3. Todas as queries rodam no contexto do usuário logado
4. `auth.uid()` retorna o ID do usuário atual

**Por isso, o código do frontend funciona perfeitamente!** ✅

O problema só acontece no SQL Editor porque ele roda em contexto administrativo, sem autenticação de usuário.

---

## 🔍 ENTENDENDO O ERRO DETALHADO

```
Failing row contains (c039ea49-baa3-456d-8476-193fc6c80654, null, 30, 7, ...)
                       ↑ ID da configuração            ↑ user_id = NULL (ERRO!)
```

O PostgreSQL gerou um ID para a configuração, mas não conseguiu preencher o `user_id` porque `auth.uid()` retornou `NULL`.

---

## 💡 DICAS IMPORTANTES

### **✅ FAÇA:**
- Use seu user_id real ao executar SQL no Dashboard
- Copie o ID completo (UUID com hífens)
- Use `::uuid` para fazer o cast correto
- Execute o script `CRIAR_CONFIG_COM_SEU_ID.sql` para facilitar

### **❌ NÃO FAÇA:**
- Não tente remover a restrição `NOT NULL` do `user_id`
- Não use IDs inventados ou aleatórios
- Não execute `auth.uid()` esperando que funcione no SQL Editor

---

## 🎯 TESTE FINAL

Depois de criar a configuração:

1. **Vá para a aplicação web**
2. **Faça login** com o usuário que você configurou
3. **Acesse:** Menu → Configurações → Aba "Alertas de Vencimento"
4. **Veja o card azul** com suas informações
5. **Edite os valores** e clique em "Salvar"
6. **Recarregue a página** e confirme que salvou

**Se tudo funcionar, está 100% pronto!** 🎉

---

## 📂 ARQUIVOS ÚTEIS

- `CRIAR_CONFIG_COM_SEU_ID.sql` - Script completo com todas as opções
- `VERIFICAR_TABELA_CONFIGS.sql` - Verificação de estrutura
- `DIAGNOSTICO_CONFIGURACOES.md` - Guia de diagnóstico completo

---

## ❓ FAQ

**P: Por que auth.uid() funciona no app mas não no SQL Editor?**  
R: No app, você está autenticado. No SQL Editor, você é admin sem contexto de usuário.

**P: Posso usar auth.uid() em triggers e functions?**  
R: Sim! Em triggers/functions executadas pela aplicação, auth.uid() funciona perfeitamente.

**P: Preciso criar configuração para cada usuário novo?**  
R: Não! O código do `ExpiryAlertService.ts` cria automaticamente quando um usuário acessa pela primeira vez.

**P: E se eu deletar a configuração?**  
R: Ela será recriada automaticamente na próxima vez que o usuário acessar a aba de alertas.

---

**Problema resolvido! Agora é só executar o script com seu ID real.** ✨

