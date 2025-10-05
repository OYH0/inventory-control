# Arquitetura do Sistema - Inventory Control

## 📐 Visão Geral

Sistema de controle de inventário multi-tenant com foco em rastreamento de validade, seguindo princípios SOLID e arquitetura em camadas.

## 🏗️ Estrutura de Camadas

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  (React Components + UI)                │
├─────────────────────────────────────────┤
│         APPLICATION LAYER               │
│  (Hooks + State Management)             │
├─────────────────────────────────────────┤
│         DOMAIN LAYER                    │
│  (Business Logic + Validation)          │
├─────────────────────────────────────────┤
│         INFRASTRUCTURE LAYER            │
│  (Supabase Client + External APIs)      │
└─────────────────────────────────────────┘
```

## 📁 Estrutura de Diretórios

```
src/
├── components/              # Presentation Layer
│   ├── ui/                 # shadcn/ui components
│   ├── abc-analysis/       # ABC Analysis feature
│   ├── bebidas/            # Beverages management
│   ├── camara-fria/        # Cold storage
│   ├── camara-refrigerada/ # Refrigerated storage
│   ├── descartaveis/       # Disposables
│   ├── estoque-seco/       # Dry stock
│   ├── expiry-alerts/      # Expiry notification system
│   ├── historico/          # History tracking
│   └── qr-scanner/         # QR code scanner
│
├── hooks/                   # Application Layer
│   ├── useAuth.tsx         # Authentication logic
│   ├── useBebidas.tsx      # Beverages data management
│   ├── useCamaraFriaData.tsx
│   ├── useEstoqueSecoData.tsx
│   └── ...                 # Other data hooks
│
├── lib/                     # Domain Layer
│   ├── logger.ts           # Centralized logging
│   ├── validation.ts       # Input validation & sanitization
│   ├── api-response.ts     # Standardized API responses
│   ├── utils.ts            # Utility functions
│   └── __tests__/          # Unit tests
│
├── services/                # Domain Layer
│   ├── ABCAnalysisService.ts
│   ├── ExpiryAlertService.ts
│   └── __tests__/
│
├── integrations/            # Infrastructure Layer
│   └── supabase/
│       ├── client.ts       # Supabase client configuration
│       └── types.ts        # Database type definitions
│
├── pages/                   # Routing
│   ├── Index.tsx
│   └── NotFound.tsx
│
└── test/                    # Test configuration
    └── setup.ts
```

## 🎯 Princípios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
Cada módulo tem uma responsabilidade única:
- **logger.ts**: Apenas logging
- **validation.ts**: Apenas validação
- **api-response.ts**: Apenas formatação de respostas
- **useAuth.tsx**: Apenas autenticação

### 2. Open/Closed Principle (OCP)
Sistema aberto para extensão, fechado para modificação:
- Validações extensíveis via schemas Zod
- Logger pode adicionar novos níveis sem modificar código existente
- API responses podem adicionar novos tipos de erro

### 3. Liskov Substitution Principle (LSP)
Interfaces consistentes:
- Todos os hooks retornam estrutura similar: `{ data, loading, error }`
- Todas as API responses seguem mesmo formato

### 4. Interface Segregation Principle (ISP)
Interfaces específicas e focadas:
- `LogContext` separado de `LogEntry`
- `ApiResponse` com tipos genéricos
- Hooks com interfaces específicas

### 5. Dependency Inversion Principle (DIP)
Dependências de abstrações, não implementações:
- Components dependem de hooks (abstração)
- Hooks dependem de services (abstração)
- Services dependem de client (abstração)

## 🔐 Camada de Segurança

### Input Validation Flow
```
User Input
    ↓
Sanitization (XSS removal)
    ↓
Format Validation (email, password, etc)
    ↓
Schema Validation (Zod)
    ↓
Business Logic Validation
    ↓
Database
```

### Authentication Flow
```
Login Request
    ↓
Rate Limit Check
    ↓
Email Validation
    ↓
Supabase Auth
    ↓
Session Storage
    ↓
Logging
    ↓
Response
```

## 📊 Data Flow

### Create Product Flow
```
Component (Form)
    ↓
Hook (useProductData)
    ↓
Validation (validateProduct)
    ↓
Service (ProductService)
    ↓
Supabase Client
    ↓
Database
    ↓
Response Handler
    ↓
Logger
    ↓
UI Update
```

## 🗄️ Database Architecture

### Multi-Tenant Strategy
- **Tenant Isolation**: Row Level Security (RLS)
- **User Association**: `user_id` em todas as tabelas
- **Audit Trail**: `created_at`, `updated_at`, `deleted_at`

### Key Tables
```sql
-- Users (Supabase Auth)
auth.users

-- Products
products (
  id, name, quantity, unit, 
  expiry_date, category, user_id,
  created_at, updated_at, deleted_at
)

-- History
product_history (
  id, product_id, action, 
  old_value, new_value, user_id,
  created_at
)

-- ABC Analysis
abc_analysis (
  id, product_id, classification,
  revenue, frequency, user_id,
  created_at, updated_at
)

-- Expiry Alerts
expiry_alerts (
  id, product_id, alert_type,
  days_until_expiry, notified,
  created_at
)
```

## 🔄 State Management

### React Query (TanStack Query)
- **Cache Management**: Queries automáticas com cache
- **Optimistic Updates**: UI responsiva
- **Background Refetch**: Dados sempre atualizados
- **Error Retry**: Tentativas automáticas

### Local State (useState)
- **Form State**: Dados temporários de formulários
- **UI State**: Modals, dropdowns, loading states

### Context (React Context)
- **Auth Context**: User session global
- **Theme Context**: Dark/Light mode

## 🎨 UI Architecture

### Component Hierarchy
```
App
├── AuthProvider (Context)
├── QueryClientProvider (React Query)
├── TooltipProvider (UI)
├── Router
    ├── ProtectedRoute
    │   ├── Header
    │   ├── Sidebar
    │   └── Page Components
    │       ├── Dashboard
    │       ├── EstoqueSeco
    │       ├── CamaraFria
    │       └── ...
    └── Login
```

### Component Patterns

#### Container/Presenter Pattern
```typescript
// Container (Logic)
function ProductListContainer() {
  const { data, loading } = useProducts();
  return <ProductList data={data} loading={loading} />;
}

// Presenter (UI)
function ProductList({ data, loading }) {
  if (loading) return <Spinner />;
  return <ul>{data.map(...)}</ul>;
}
```

#### Custom Hooks Pattern
```typescript
// Encapsulate logic in hooks
function useProductForm() {
  const [form, setForm] = useState({});
  const validate = () => validateProduct(form);
  const submit = async () => { /* ... */ };
  return { form, setForm, validate, submit };
}
```

## 🚀 Performance Optimizations

### Implemented
1. **React Query Caching**: Reduce database calls
2. **Debouncing**: Search inputs (300ms delay)
3. **Lazy Loading**: Code splitting por rota
4. **Memoization**: useMemo, useCallback em componentes pesados

### Recommended
1. **Redis Cache**: Cache de queries frequentes
2. **CDN**: Assets estáticos
3. **Image Optimization**: WebP, lazy loading
4. **Database Indexes**: Queries otimizadas
5. **Virtual Scrolling**: Listas grandes

## 📈 Monitoring & Observability

### Logging Levels
- **DEBUG**: Desenvolvimento apenas
- **INFO**: Operações normais (login, CRUD)
- **WARN**: Situações anormais (rate limit)
- **ERROR**: Falhas (exceptions, database errors)

### Metrics to Track
1. **Performance**
   - Page load time
   - API response time
   - Database query time

2. **Business**
   - Products created/updated/deleted
   - Expiry alerts triggered
   - User logins

3. **Errors**
   - Authentication failures
   - Validation errors
   - Database errors

## 🧪 Testing Strategy

### Unit Tests
- **Coverage Target**: 80%
- **Focus**: Business logic, validation, utilities
- **Tools**: Vitest, Testing Library

### Integration Tests
- **Focus**: Hooks + Services + Database
- **Mock**: Supabase client

### E2E Tests (Recommended)
- **Focus**: Critical user flows
- **Tools**: Playwright, Cypress

## 🔧 Configuration Management

### Environment Variables
```env
# Required
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# Optional (Future)
VITE_SENTRY_DSN=
VITE_REDIS_URL=
VITE_CDN_URL=
```

### Feature Flags (Recommended)
```typescript
const features = {
  abcAnalysis: true,
  expiryAlerts: true,
  qrScanner: true,
  multiLanguage: false, // Future
};
```

## 📦 Deployment Architecture

### Current (Development)
```
Vite Dev Server (localhost:5173)
    ↓
Supabase Cloud (Database + Auth)
```

### Recommended (Production)
```
User
  ↓
CDN (Cloudflare/AWS CloudFront)
  ↓
Static Hosting (Vercel/Netlify)
  ↓
Supabase Cloud (Database + Auth + Storage)
  ↓
Redis Cache (Optional)
```

## 🔐 Security Architecture

### Defense Layers
1. **Input Layer**: Sanitization + Validation
2. **Application Layer**: Rate limiting + Auth
3. **Database Layer**: RLS + Prepared statements
4. **Network Layer**: HTTPS + CORS
5. **Monitoring Layer**: Logging + Error tracking

### Authentication Flow
```
Client → Rate Limiter → Input Validation → Supabase Auth → RLS → Database
```

## 📚 Dependencies Architecture

### Core Dependencies
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **TanStack Query**: Data fetching
- **Supabase**: Backend as a Service

### UI Dependencies
- **Radix UI**: Headless components
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **Lucide React**: Icons

### Validation & Forms
- **Zod**: Schema validation
- **React Hook Form**: Form management

### Testing
- **Vitest**: Test runner
- **Testing Library**: Component testing

## 🎯 Design Patterns Used

1. **Singleton**: Logger instance
2. **Factory**: API response creators
3. **Observer**: React Query subscriptions
4. **Strategy**: Validation strategies
5. **Repository**: Data access via hooks
6. **Facade**: Simplified API interfaces

## 🔄 Future Architecture Improvements

1. **Microservices**: Separar serviços críticos
2. **Event-Driven**: Queue para notificações
3. **GraphQL**: Substituir REST
4. **Server-Side Rendering**: Next.js migration
5. **Progressive Web App**: Offline support
6. **Real-time Sync**: WebSockets para updates
