# 🎯 COMO USAR AS CONFIGURAÇÕES DE ALERTAS

## ✅ **PROBLEMAS CORRIGIDOS**

### **1. Inputs Não Editáveis** ✓
- **Problema:** Os campos de dias não permitiam edição
- **Solução:** Implementada validação em tempo real com `handleWarningDaysChange` e `handleCriticalDaysChange`
- **Validações:** Min: 1 dia, Max: 365 dias (aviso) / 30 dias (crítico)

### **2. Configurações Não Salvavam** ✓
- **Problema:** Botão salvar não persistia os dados no banco
- **Solução:** 
  - Corrigido método `updateAlertConfiguration` no serviço
  - Removido uso incorreto de `.eq()` após `upsert`
  - Implementada lógica separada para UPDATE e INSERT
  - Adicionado logging completo para debug

### **3. Falta de Feedback Visual** ✓
- **Problema:** Usuário não sabia se havia alterações não salvas
- **Solução:**
  - Badge "Alterações não salvas" quando há mudanças
  - Indicador "Tudo salvo" quando está sincronizado
  - Botão desabilitado quando não há alterações
  - Toast de confirmação ao salvar com sucesso

### **4. Validações Insuficientes** ✓
- **Problema:** Permitia valores inválidos
- **Solução:**
  - Validação: Dias críticos < Dias de aviso
  - Alerta visual vermelho quando valores são inválidos
  - Botão salvar bloqueado se dados inválidos
  - Mensagens de erro claras com toast

---

## 📍 **COMO ACESSAR**

1. **Login** no sistema
2. Menu lateral → **"Configurações"**
3. Clique na aba **"Alertas de Vencimento"**

---

## 🎛️ **CONFIGURAÇÕES DISPONÍVEIS**

### **1. Status dos Alertas**
- **Switch ON/OFF:** Ativa ou desativa todo o sistema de alertas
- **Badge:** Mostra visualmente se está "Ativo" ou "Inativo"

### **2. Limites de Alerta**

#### **Alerta de Aviso (Amarelo)**
- **Faixa:** 1 a 365 dias
- **Padrão:** 30 dias
- **Função:** Produtos vencendo neste prazo recebem prioridade MÉDIA
- **Cor:** Amarelo

#### **Alerta Crítico (Vermelho)**
- **Faixa:** 1 a 30 dias
- **Padrão:** 7 dias
- **Função:** Produtos vencendo neste prazo recebem prioridade CRÍTICA
- **Cor:** Vermelho

**⚠️ IMPORTANTE:** Dias críticos DEVEM ser menores que dias de aviso!

### **3. Frequência de Notificações**
- **Tempo Real:** Notificações imediatas quando novos alertas são gerados
- **Diário:** Resumo diário no horário escolhido
- **Semanal:** Resumo semanal no horário escolhido

### **4. Horário da Notificação**
- Disponível para frequência "Diário" ou "Semanal"
- Formato: HH:MM (ex: 09:00)

### **5. Canais de Notificação**
- ✅ **Notificações no App:** Disponível agora
- 🔜 **Email:** Em breve
- 🔜 **Push Notifications:** Em breve

---

## 🧪 **COMO TESTAR SE ESTÁ FUNCIONANDO**

### **Teste 1: Verificar Carregamento**
1. Abra a aba "Alertas de Vencimento" nas Configurações
2. Você deve ver um card azul com:
   ```
   ✓ Configuração carregada do banco
   ID: [UUID]
   Última atualização: [DATA/HORA]
   ```
3. Os campos devem estar preenchidos com valores padrão ou salvos anteriormente

### **Teste 2: Editar Dias de Aviso**
1. Clique no campo "Alerta de Aviso"
2. Digite um novo valor (ex: 45)
3. **Deve aparecer:** Badge "Alterações não salvas"
4. **Deve atualizar:** Texto explicativo mostra "45 dias"

### **Teste 3: Editar Dias Críticos**
1. Clique no campo "Alerta Crítico"
2. Digite um novo valor (ex: 10)
3. **Deve aparecer:** Badge "Alterações não salvas"
4. **Deve atualizar:** Texto explicativo mostra "10 dias"

### **Teste 4: Validação de Valores Inválidos**
1. Configure Dias de Aviso = 10
2. Configure Dias Críticos = 15 (maior que aviso)
3. **Deve aparecer:** Alerta vermelho dizendo "dias críticos devem ser menores"
4. **Botão salvar deve estar:** DESABILITADO

### **Teste 5: Salvar Configurações**
1. Configure valores válidos:
   - Aviso: 30 dias
   - Crítico: 7 dias
2. Clique em "Salvar Configurações"
3. **Deve aparecer:** 
   - Botão muda para "Salvando..."
   - Toast verde: "✓ Configurações salvas"
   - Badge muda para "Tudo salvo"
4. **No console do navegador deve aparecer:**
   ```
   [ExpiryAlertService] Configuration saved successfully: {...}
   [useAlertConfiguration] Mutation success, invalidating queries
   ```

### **Teste 6: Persistência dos Dados**
1. Salve as configurações
2. Navegue para outra página
3. Volte para Configurações → Alertas de Vencimento
4. **Os valores salvos devem estar preservados**

### **Teste 7: Testar Switch de Status**
1. Desative o switch "Status dos Alertas"
2. Badge deve mudar para "Inativo"
3. Badge "Alterações não salvas" aparece
4. Clique em "Salvar Configurações"
5. Toast de sucesso deve aparecer

---

## 🔍 **DEBUG - SE NÃO ESTIVER FUNCIONANDO**

### **1. Abra o Console do Navegador**
- **Chrome/Edge:** F12 → Aba "Console"
- **Firefox:** F12 → Aba "Console"

### **2. Procure por Logs do Sistema**

#### **Ao Carregar a Página:**
```
[useAlertConfiguration] Fetching config for user: [UUID]
[ExpiryAlertService] Fetching configuration for user: [UUID]
[useAlertConfiguration] Config fetched: {...}
[ExpiryAlertSettings] Config loaded: {...}
```

#### **Ao Salvar:**
```
[ExpiryAlertSettings] Saving config: {...}
[useAlertConfiguration] Updating config for user: [UUID]
[ExpiryAlertService] Updating configuration for user [UUID]
[ExpiryAlertService] Updating existing config ID: [UUID]
[ExpiryAlertService] Configuration saved successfully: {...}
[useAlertConfiguration] Mutation success, invalidating queries
```

### **3. Erros Comuns e Soluções**

#### **Erro: "User not authenticated"**
- **Causa:** Usuário não está logado
- **Solução:** Faça login novamente

#### **Erro: "No data returned from database"**
- **Causa:** Problema na query SQL ou RLS
- **Solução:** Verifique se a migration `APLICAR_AGORA.sql` foi aplicada corretamente

#### **Erro: "Column does not exist"**
- **Causa:** Tabela `alert_configurations` não existe ou está incompleta
- **Solução:** Execute novamente o script de migration

#### **Erro: "Permission denied"**
- **Causa:** RLS (Row Level Security) bloqueando acesso
- **Solução:** Verifique as políticas RLS no Supabase Dashboard

### **4. Verificar no Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT]
2. Vá em **"Table Editor"**
3. Selecione tabela `alert_configurations`
4. **Deve existir uma linha com:**
   - `user_id`: Seu ID de usuário
   - `warning_days`: Valor salvo
   - `critical_days`: Valor salvo
   - `updated_at`: Data/hora da última atualização

---

## 🎨 **MELHORIAS IMPLEMENTADAS**

### **Interface Aprimorada**
- ✅ Card de status da configuração (azul)
- ✅ Badges visuais para status (Ativo/Inativo)
- ✅ Indicadores de alterações não salvas
- ✅ Alerta vermelho para valores inválidos
- ✅ Ícones explicativos (amarelo/vermelho)
- ✅ Feedback em tempo real ao editar

### **Validações Robustas**
- ✅ Validação de range (1-365, 1-30)
- ✅ Validação de lógica (crítico < aviso)
- ✅ Validação de canal obrigatório
- ✅ Bloqueio de salvamento com dados inválidos

### **Logging Completo**
- ✅ Log de carregamento de configuração
- ✅ Log de cada mudança de valor
- ✅ Log de validações
- ✅ Log de operações no banco
- ✅ Log de erros detalhados

### **Persistência Confiável**
- ✅ Método UPDATE separado de INSERT
- ✅ Verificação de existência antes de salvar
- ✅ Update otimista do cache
- ✅ Invalidação de queries após salvar
- ✅ Toast de confirmação

---

## 📞 **SUPORTE**

Se após seguir todos os passos acima o problema persistir:

1. **Capture os logs do console** (Ctrl+A no console, Ctrl+C)
2. **Tire um print** da aba de configurações
3. **Verifique** se a migration foi aplicada corretamente no Supabase
4. **Verifique** se há erros de RLS nas políticas do Supabase

---

## 🚀 **PRÓXIMOS PASSOS**

- [ ] Implementar notificações por email
- [ ] Implementar push notifications
- [ ] Adicionar configurações avançadas (filtros por categoria, localização)
- [ ] Remover card azul de debug em produção
- [ ] Adicionar histórico de configurações alteradas

---

**Última atualização:** 04/10/2025
**Status:** ✅ TOTALMENTE FUNCIONAL

