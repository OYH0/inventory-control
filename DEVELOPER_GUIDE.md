# Guia do Desenvolvedor - Inventory Control System

## 🚀 Quick Start

### Pré-requisitos
```bash
Node.js >= 18.x
npm >= 9.x
Git
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

# 5. Executar testes
npm test
```

## 📋 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm run build:dev        # Build em modo desenvolvimento
npm run preview          # Preview do build

# Testes
npm test                 # Executar testes
npm run test:ui          # Interface visual de testes
npm run test:coverage    # Cobertura de código

# Qualidade de Código
npm run lint             # Executar ESLint

# Database (Supabase)
npm run db:push          # Push migrations
npm run db:migrations    # Listar migrations
npm run db:setup         # Setup Supabase CLI
```

## 🏗️ Estrutura do Projeto

```
inventory-control/
├── src/
│   ├── components/      # Componentes React
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Bibliotecas e utilitários
│   ├── services/       # Serviços de negócio
│   ├── integrations/   # Integrações externas
│   ├── pages/          # Páginas/Rotas
│   └── test/           # Configuração de testes
├── supabase/
│   └── migrations/     # Database migrations
├── public/             # Assets estáticos
└── docs/               # Documentação adicional
```

## 🎨 Padrões de Código

### Nomenclatura

#### Arquivos
```typescript
// Components: PascalCase
ProductList.tsx
UserManagement.tsx

// Hooks: camelCase com prefixo 'use'
useAuth.tsx
useProducts.tsx

// Utils/Services: camelCase
validation.ts
logger.ts

// Types: PascalCase
types.ts
interfaces.ts
```

#### Variáveis e Funções
```typescript
// camelCase para variáveis e funções
const userName = 'John';
function getUserData() {}

// PascalCase para componentes e classes
function ProductCard() {}
class Logger {}

// UPPER_CASE para constantes
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
```

### Estrutura de Componentes

```typescript
/**
 * Component description
 * @param props - Component props
 */
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logInfo } from '@/lib/logger';

interface ProductCardProps {
  product: Product;
  onUpdate?: (product: Product) => void;
}

export function ProductCard({ product, onUpdate }: ProductCardProps) {
  // 1. Hooks
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // 2. Handlers
  const handleUpdate = async () => {
    try {
      setLoading(true);
      // Logic here
      logInfo('Product updated', { productId: product.id });
      toast({ title: 'Sucesso!' });
    } catch (error) {
      logError('Update failed', error);
      toast({ title: 'Erro', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Render
  return (
    <div>
      {/* JSX here */}
    </div>
  );
}
```

### Custom Hooks Pattern

```typescript
/**
 * Hook for managing products
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logInfo, logError } from '@/lib/logger';
import { validateProduct } from '@/lib/validation';

export function useProducts() {
  const queryClient = useQueryClient();

  // Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation
  const createMutation = useMutation({
    mutationFn: async (product: ProductInput) => {
      // Validate
      const validation = validateProduct(product);
      if (!validation.valid) {
        throw new Error('Validation failed');
      }

      // Insert
      const { data, error } = await supabase
        .from('products')
        .insert(validation.data)
        .select()
        .single();
      
      if (error) throw error;
      
      logInfo('Product created', { productId: data.id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      logError('Failed to create product', error);
    },
  });

  return {
    products: data ?? [],
    loading: isLoading,
    error,
    createProduct: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
```

## 🔐 Segurança

### Validação de Inputs

```typescript
import { sanitizeString, validateProduct } from '@/lib/validation';

// Sempre sanitizar inputs do usuário
const cleanInput = sanitizeString(userInput);

// Validar antes de salvar
const validation = validateProduct(formData);
if (!validation.valid) {
  // Mostrar erros
  return;
}

// Usar dados validados
await saveProduct(validation.data);
```

### Autenticação

```typescript
import { useAuth } from '@/hooks/useAuth';

function ProtectedComponent() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;

  return <div>Protected content</div>;
}
```

### Logging

```typescript
import { logInfo, logError, logWarn } from '@/lib/logger';

// Info: operações normais
logInfo('User logged in', { 
  userId: user.id,
  action: 'login' 
});

// Warning: situações anormais
logWarn('Rate limit approaching', { 
  userId: user.id,
  requests: 8 
});

// Error: falhas
logError('Database query failed', error, {
  action: 'fetch_products',
  query: 'products'
});
```

## 🧪 Testes

### Estrutura de Testes

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    quantity: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should call onUpdate when button clicked', async () => {
    const onUpdate = vi.fn();
    render(<ProductCard product={mockProduct} onUpdate={onUpdate} />);
    
    const button = screen.getByRole('button', { name: /update/i });
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(mockProduct);
    });
  });
});
```

### Testes de Validação

```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeString, isValidEmail } from '@/lib/validation';

describe('Validation', () => {
  it('should remove XSS from string', () => {
    const input = '<script>alert("xss")</script>Hello';
    const result = sanitizeString(input);
    expect(result).not.toContain('<script>');
  });

  it('should validate email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

## 🎯 Boas Práticas

### 1. Sempre Validar Inputs
```typescript
// ❌ Ruim
const saveProduct = async (data: any) => {
  await supabase.from('products').insert(data);
};

// ✅ Bom
const saveProduct = async (data: any) => {
  const validation = validateProduct(data);
  if (!validation.valid) {
    throw new Error('Invalid data');
  }
  await supabase.from('products').insert(validation.data);
};
```

### 2. Sempre Fazer Logging
```typescript
// ❌ Ruim
try {
  await operation();
} catch (error) {
  console.error(error);
}

// ✅ Bom
try {
  await operation();
  logInfo('Operation successful', { action: 'operation' });
} catch (error) {
  logError('Operation failed', error, { action: 'operation' });
  throw error;
}
```

### 3. Sempre Tratar Erros
```typescript
// ❌ Ruim
const { data } = await supabase.from('products').select();
return data;

// ✅ Bom
const { data, error } = await supabase.from('products').select();
if (error) {
  logError('Query failed', error);
  throw error;
}
return data;
```

### 4. Usar TypeScript
```typescript
// ❌ Ruim
function updateProduct(id, data) {
  // ...
}

// ✅ Bom
interface Product {
  id: string;
  name: string;
  quantity: number;
}

function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  // ...
}
```

### 5. Componentes Pequenos
```typescript
// ❌ Ruim - Componente gigante com múltiplas responsabilidades
function ProductPage() {
  // 500 linhas de código
}

// ✅ Bom - Componentes pequenos e focados
function ProductPage() {
  return (
    <div>
      <ProductHeader />
      <ProductFilters />
      <ProductList />
      <ProductPagination />
    </div>
  );
}
```

## 🐛 Debugging

### React Query Devtools
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Logs de Desenvolvimento
```typescript
import { logger } from '@/lib/logger';

// Ver logs recentes
console.log(logger.getRecentLogs(50));

// Exportar logs
const logs = logger.exportLogs();
console.log(logs);
```

### Supabase Logs
```bash
# Ver logs do Supabase
supabase logs --project-ref <project-id>
```

## 📦 Build e Deploy

### Build Local
```bash
# Build de produção
npm run build

# Preview do build
npm run preview
```

### Variáveis de Ambiente
```env
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Deploy (Vercel/Netlify)
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

## 🔧 Troubleshooting

### Erro: "Missing Supabase environment variables"
**Solução**: Verificar se `.env` existe e contém as variáveis corretas.

### Erro: "Rate limit exceeded"
**Solução**: Aguardar tempo de cooldown ou limpar rate limiter:
```typescript
import { rateLimiter } from '@/lib/validation';
rateLimiter.clear();
```

### Erro: "Validation failed"
**Solução**: Verificar logs para detalhes:
```typescript
const validation = validateProduct(data);
if (!validation.valid) {
  console.log(validation.errors);
}
```

### Testes Falhando
**Solução**: Limpar cache e reinstalar:
```bash
rm -rf node_modules
npm install
npm test
```

## 📚 Recursos Adicionais

### Documentação
- [React Query](https://tanstack.com/query/latest)
- [Supabase](https://supabase.com/docs)
- [Zod](https://zod.dev/)
- [Vitest](https://vitest.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

### Arquivos de Referência
- `SECURITY_IMPLEMENTATION.md` - Guia de segurança
- `ARCHITECTURE.md` - Arquitetura do sistema
- `README.md` - Visão geral do projeto

## 🤝 Contribuindo

### Workflow
1. Criar branch: `git checkout -b feature/nova-funcionalidade`
2. Fazer alterações
3. Executar testes: `npm test`
4. Executar lint: `npm run lint`
5. Commit: `git commit -m "feat: adiciona nova funcionalidade"`
6. Push: `git push origin feature/nova-funcionalidade`
7. Criar Pull Request

### Commit Messages
```
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
test: adiciona testes
refactor: refatoração de código
style: formatação
perf: melhoria de performance
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar documentação
2. Verificar logs do sistema
3. Criar issue no repositório
4. Contatar equipe de desenvolvimento
