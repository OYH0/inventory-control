# 🏢 Inventory Control System

Sistema profissional de controle de inventário multi-tenant com rastreamento de validade, análise ABC e notificações inteligentes.

## ✨ Features Principais

- 📊 **Dashboard Analítico**: Métricas em tempo real e visualizações
- 🏷️ **Análise ABC**: Classificação automática de produtos por importância
- ⏰ **Alertas de Validade**: Notificações automáticas de produtos próximos ao vencimento
- 📱 **QR Code Scanner**: Leitura de códigos para entrada rápida
- 🔐 **Multi-tenant**: Isolamento completo de dados por usuário
- 📈 **Histórico Completo**: Rastreamento de todas as operações
- 🎨 **UI Moderna**: Interface responsiva com shadcn/ui e Tailwind CSS

## 🚀 Quick Start

### Pré-requisitos
```bash
Node.js >= 18.x
npm >= 9.x
```

### Instalação
```bash
# 1. Clonar repositório
git clone <repository-url>
cd inventory-control

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# 4. Executar em desenvolvimento
npm run dev

# 5. Acessar aplicação
# http://localhost:5173
```

## 📋 Comandos Disponíveis

```bash
npm run dev              # Desenvolvimento
npm run build            # Build produção
npm test                 # Executar testes
npm run test:coverage    # Cobertura de testes
npm run lint             # Lint código
```

## 🔐 Segurança Implementada

### ✅ Features de Segurança
- **Validação de Inputs**: Sanitização XSS e validação com Zod
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Logging Estruturado**: Rastreamento completo de operações
- **Autenticação JWT**: Via Supabase Auth com refresh tokens
- **Row Level Security**: Isolamento de dados no banco
- **Variáveis de Ambiente**: Sem credenciais hardcoded

Ver detalhes em: [`SECURITY_IMPLEMENTATION.md`](./SECURITY_IMPLEMENTATION.md)

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS + Radix UI
- **State**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Validação**: Zod
- **Testes**: Vitest + Testing Library

### Estrutura em Camadas
```
Presentation Layer (Components)
    ↓
Application Layer (Hooks)
    ↓
Domain Layer (Services + Validation)
    ↓
Infrastructure Layer (Supabase)
```

Ver detalhes em: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## 📦 Conteúdo do Pacote

Este repositório contém todas as correções e melhorias implementadas no sistema de gestão de estoque.

### 🔧 Arquivos Corrigidos (CRÍTICOS)

#### Componentes
- `src/components/CamaraRefrigerada_FIXED.tsx` - **SUBSTITUI** `src/components/CamaraRefrigerada.tsx`
  - Corrige o problema de duplicação de histórico
  - Implementa operações sequenciais seguras
  - Adiciona tratamento robusto de erros

#### Hooks
- `src/hooks/useCamaraRefrigeradaHistorico_FIXED.tsx` - **SUBSTITUI** `src/hooks/useCamaraRefrigeradaHistorico.tsx`
  - Previne duplicação de registros
  - Melhora cache e performance
  
- `src/hooks/useCamaraFriaHistorico_FIXED.tsx` - **SUBSTITUI** `src/hooks/useCamaraFriaHistorico.tsx`
  - Mesmas melhorias de prevenção de duplicação
  - Logs detalhados para debugging
  
- `src/hooks/useCamaraFriaData_FIXED.tsx` - **SUBSTITUI** `src/hooks/useCamaraFriaData.tsx`
  - Validações robustas
  - Controle de operações pendentes
  - Tratamento de erros melhorado

### ✨ Melhorias de Interface (OPCIONAIS)

#### Componentes Melhorados
- `src/components/camara-fria/CamaraFriaAddDialog_IMPROVED.tsx` - **SUBSTITUI** `src/components/camara-fria/CamaraFriaAddDialog.tsx`
  - Validação em tempo real
  - Interface mais intuitiva
  - Mensagens de erro específicas
  
- `src/components/camara-fria/CamaraFriaItemCard_IMPROVED.tsx` - **SUBSTITUI** `src/components/camara-fria/CamaraFriaItemCard.tsx`
  - Alertas visuais para estoque baixo
  - Indicadores de vencimento
  - Interface mais rica

### 🗄️ Banco de Dados

#### Migrations (OBRIGATÓRIAS)
- `supabase/migrations/20250617000000-fix-critical-issues.sql`
  - Cria tabela camara_fria_items (estava faltando)
  - Corrige tipos de histórico
  - Adiciona triggers para prevenir duplicação
  - Implementa campos de auditoria
  
- `supabase/migrations/20250617000001-advanced-optimizations.sql`
  - Views para relatórios
  - Sistema de auditoria completo
  - Funções para limpeza automática
  - Índices otimizados

### 📚 Documentação

- `relatorio_melhorias.md` / `relatorio_melhorias.pdf` - Relatório completo das melhorias
- `GUIA_IMPLEMENTACAO.md` - Instruções passo a passo para aplicar as correções
- `analise_problemas.md` - Análise detalhada dos problemas encontrados
- `analise_banco.md` - Análise da estrutura do banco de dados

## 🚀 Como Aplicar as Correções

### 1. Backup
```bash
cp -r seu-projeto seu-projeto-backup
```

### 2. Aplicar Migrations
```bash
supabase migration up 20250617000000-fix-critical-issues
supabase migration up 20250617000001-advanced-optimizations
```

### 3. Substituir Arquivos Críticos
```bash
# Fazer backup dos originais
mv src/components/CamaraRefrigerada.tsx src/components/CamaraRefrigerada_ORIGINAL.tsx
mv src/hooks/useCamaraRefrigeradaHistorico.tsx src/hooks/useCamaraRefrigeradaHistorico_ORIGINAL.tsx
mv src/hooks/useCamaraFriaHistorico.tsx src/hooks/useCamaraFriaHistorico_ORIGINAL.tsx
mv src/hooks/useCamaraFriaData.tsx src/hooks/useCamaraFriaData_ORIGINAL.tsx

# Aplicar correções
cp CamaraRefrigerada_FIXED.tsx src/components/CamaraRefrigerada.tsx
cp useCamaraRefrigeradaHistorico_FIXED.tsx src/hooks/useCamaraRefrigeradaHistorico.tsx
cp useCamaraFriaHistorico_FIXED.tsx src/hooks/useCamaraFriaHistorico.tsx
cp useCamaraFriaData_FIXED.tsx src/hooks/useCamaraFriaData.tsx
```

### 4. Testar
1. Mover item da câmara refrigerada para câmara fria
2. Verificar se histórico não está duplicado
3. Testar validações de formulário

## ✅ Resultado Esperado

Após aplicar todas as correções:
- ✅ Duplicação de histórico completamente eliminada
- ✅ Validações robustas funcionando
- ✅ Interface mais intuitiva e informativa
- ✅ Performance melhorada
- ✅ Sistema de auditoria ativo

## 📚 Documentação

- [`README.md`](./README.md) - Este arquivo (visão geral)
- [`SECURITY_IMPLEMENTATION.md`](./SECURITY_IMPLEMENTATION.md) - Guia de segurança completo
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Arquitetura detalhada do sistema
- [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md) - Guia para desenvolvedores
- [`GUIA_IMPLEMENTACAO.md`](./GUIA_IMPLEMENTACAO.md) - Instruções de implementação

## 🧪 Testes

### Executar Testes
```bash
# Todos os testes
npm test

# Com interface visual
npm run test:ui

# Com cobertura
npm run test:coverage
```

### Cobertura Atual
- **Target**: 80% de cobertura
- **Testes**: Validação, sanitização, rate limiting
- **Framework**: Vitest + Testing Library

## 🔧 Configuração

### Variáveis de Ambiente Obrigatórias
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

### Variáveis Opcionais (Futuro)
```env
VITE_SENTRY_DSN=          # Error tracking
VITE_REDIS_URL=           # Cache
VITE_CDN_URL=             # Assets
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### Variáveis de Ambiente no Deploy
Configurar as mesmas variáveis do `.env` no painel do provedor.

## 🤝 Contribuindo

1. Fork o projeto
2. Criar branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m "feat: adiciona nova funcionalidade"`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abrir Pull Request

Ver guia completo em: [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md)

## 📊 Status do Projeto

### ✅ Implementado
- [x] Sistema de autenticação seguro
- [x] CRUD completo de produtos
- [x] Análise ABC
- [x] Alertas de validade
- [x] QR Code Scanner
- [x] Dashboard com métricas
- [x] Histórico de operações
- [x] Multi-tenant com RLS
- [x] Validação e sanitização
- [x] Logging estruturado
- [x] Rate limiting
- [x] Testes unitários

### 🔄 Em Desenvolvimento
- [ ] Internacionalização (i18n)
- [ ] Cache com Redis
- [ ] Notificações push
- [ ] Exportação de relatórios
- [ ] API REST documentada (OpenAPI)

### 🎯 Roadmap
- [ ] Progressive Web App (PWA)
- [ ] Modo offline
- [ ] Integração com ERP
- [ ] Machine Learning para previsão de demanda
- [ ] App mobile nativo (React Native)

## 📞 Suporte

### Documentação
- Consulte [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md) para guia completo
- Veja [`SECURITY_IMPLEMENTATION.md`](./SECURITY_IMPLEMENTATION.md) para segurança
- Leia [`ARCHITECTURE.md`](./ARCHITECTURE.md) para arquitetura

### Issues
Para reportar bugs ou solicitar features, abra uma issue no repositório.

### Contato
- **Email**: suporte@inventorycontrol.com
- **Documentação**: https://docs.inventorycontrol.com

---

## 📄 Licença

Este projeto está sob licença MIT. Ver arquivo `LICENSE` para mais detalhes.

---

**Versão:** 3.0 - Enterprise Grade  
**Última Atualização:** 05 de outubro de 2025  
**Desenvolvido com**: ❤️ seguindo as melhores práticas de desenvolvimento

