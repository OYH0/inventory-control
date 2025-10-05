// =====================================================
// TYPES: Sistema de Análise ABC
// =====================================================

export type ABCCategory = 'A' | 'B' | 'C';
export type ClassificationFrequency = 'daily' | 'weekly' | 'monthly';
export type TrendDirection = 'upgrade' | 'downgrade' | 'new' | 'unchanged';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ============================================
// CONFIGURAÇÕES ABC
// ============================================

export interface ABCConfiguration {
  id: string;
  organization_id: string;
  
  // Thresholds
  category_a_threshold: number;
  category_b_threshold: number;
  
  // Configurações de análise
  analysis_period_months: number;
  auto_classify: boolean;
  classification_frequency: ClassificationFrequency;
  include_zero_demand: boolean;
  
  // Custos padrões
  default_carrying_cost_percentage: number;
  default_ordering_cost: number;
  
  // Safety stock percentages
  safety_stock_a_percentage: number;
  safety_stock_b_percentage: number;
  safety_stock_c_percentage: number;
  
  // Review intervals (dias)
  review_interval_a_days: number;
  review_interval_b_days: number;
  review_interval_c_days: number;
  
  // Auditoria
  created_at: string;
  updated_at: string;
}

export interface ABCConfigurationInput {
  category_a_threshold?: number;
  category_b_threshold?: number;
  analysis_period_months?: number;
  auto_classify?: boolean;
  classification_frequency?: ClassificationFrequency;
  include_zero_demand?: boolean;
  default_carrying_cost_percentage?: number;
  default_ordering_cost?: number;
  safety_stock_a_percentage?: number;
  safety_stock_b_percentage?: number;
  safety_stock_c_percentage?: number;
  review_interval_a_days?: number;
  review_interval_b_days?: number;
  review_interval_c_days?: number;
}

// ============================================
// PRODUTO COM DADOS ABC
// ============================================

export interface ProductABCData {
  id: string;
  nome: string;
  sku?: string;
  
  // Custos e demanda
  unit_cost: number;
  annual_demand: number;
  annual_consumption_value: number;
  
  // Classificação ABC
  abc_category: ABCCategory | null;
  abc_classification_date: string | null;
  
  // Parâmetros de EOQ
  carrying_cost_percentage: number;
  ordering_cost: number;
  lead_time_days: number;
  
  // Cálculos
  eoq: number | null;
  reorder_point: number | null;
  safety_stock: number | null;
  
  // Metadata
  organization_id: string;
  source_table?: string;
}

export interface ProductABCInput {
  unit_cost: number;
  annual_demand: number;
  carrying_cost_percentage?: number;
  ordering_cost?: number;
  lead_time_days?: number;
}

// ============================================
// HISTÓRICO DE ANÁLISES
// ============================================

export interface ABCAnalysisHistory {
  id: string;
  organization_id: string;
  analysis_date: string;
  table_name: string;
  
  // Contagens
  total_products_analyzed: number;
  category_a_count: number;
  category_b_count: number;
  category_c_count: number;
  
  // Valores
  category_a_value: number;
  category_b_value: number;
  category_c_value: number;
  total_inventory_value: number;
  
  // Percentuais calculados
  category_a_percentage: number;
  category_b_percentage: number;
  category_c_percentage: number;
  
  // Eficiência de Pareto
  pareto_efficiency: number | null;
  
  // Performance
  execution_time_ms: number | null;
  products_processed_per_second: number | null;
  
  // Status
  status: AnalysisStatus;
  error_message: string | null;
  
  // Parâmetros
  parameters: Record<string, any>;
  
  created_at: string;
  created_by: string | null;
}

// ============================================
// MUDANÇAS DE CATEGORIA
// ============================================

export interface ProductABCChange {
  id: string;
  organization_id: string;
  
  // Produto
  product_id: string;
  product_table: string;
  product_name: string;
  product_sku: string | null;
  
  // Mudança
  previous_category: ABCCategory | null;
  new_category: ABCCategory;
  
  // Valores
  previous_value: number | null;
  new_value: number;
  value_change_percentage: number | null;
  
  // Análise
  change_reason: string | null;
  trend_direction: TrendDirection;
  
  // Flags
  is_significant: boolean;
  requires_action: boolean;
  
  // Metadata
  analysis_id: string | null;
  changed_at: string;
}

// ============================================
// ANÁLISE E CLASSIFICAÇÃO
// ============================================

export interface ABCClassificationResult {
  product_id: string;
  annual_value: number;
  cumulative_percentage: number;
  abc_category: ABCCategory;
}

export interface EOQCalculation {
  eoq: number;
  orders_per_year: number;
  time_between_orders_days: number;
  total_annual_cost: number;
}

export interface EOQInput {
  annual_demand: number;
  ordering_cost: number;
  unit_cost: number;
  carrying_cost_percentage: number;
}

// ============================================
// RECOMENDAÇÕES ABC
// ============================================

export interface ABCRecommendation {
  category: ABCCategory;
  reorder_frequency: 'weekly' | 'monthly' | 'quarterly';
  safety_stock_level: number; // percentage
  review_interval_days: number;
  monitoring_priority: 'high' | 'medium' | 'low';
  suggested_actions: string[];
  eoq_params: EOQCalculation | null;
}

export interface CategoryRecommendations {
  A: ABCRecommendation;
  B: ABCRecommendation;
  C: ABCRecommendation;
}

// ============================================
// DASHBOARD E REPORTS
// ============================================

export interface ABCDashboardSummary {
  total_products: number;
  category_breakdown: {
    A: {
      count: number;
      percentage: number;
      value: number;
      value_percentage: number;
    };
    B: {
      count: number;
      percentage: number;
      value: number;
      value_percentage: number;
    };
    C: {
      count: number;
      percentage: number;
      value: number;
      value_percentage: number;
    };
  };
  total_inventory_value: number;
  pareto_efficiency: number;
  last_analysis_date: string | null;
}

export interface ABCParetoDataPoint {
  product_name: string;
  product_sku: string | null;
  annual_value: number;
  cumulative_value: number;
  cumulative_percentage: number;
  category: ABCCategory;
}

export interface ABCTrendItem {
  product_id: string;
  product_name: string;
  product_sku: string | null;
  source_table: string;
  previous_category: ABCCategory | null;
  new_category: ABCCategory;
  value_change_percentage: number;
  trend_direction: TrendDirection;
  changed_at: string;
}

export interface ABCCategoryDetails {
  category: ABCCategory;
  products: ProductABCData[];
  total_count: number;
  total_value: number;
  average_value: number;
  recommendations: ABCRecommendation;
}

export interface ABCReport {
  summary: ABCDashboardSummary;
  category_details: {
    A: ABCCategoryDetails;
    B: ABCCategoryDetails;
    C: ABCCategoryDetails;
  };
  trends: {
    upgrades: ABCTrendItem[];
    downgrades: ABCTrendItem[];
    new_entries: ABCTrendItem[];
  };
  recommendations: CategoryRecommendations;
  charts_data: {
    pareto_chart: ABCParetoDataPoint[];
    category_distribution: {
      category: ABCCategory;
      count: number;
      value: number;
      percentage: number;
    }[];
    value_over_time: {
      date: string;
      category_a_value: number;
      category_b_value: number;
      category_c_value: number;
    }[];
  };
  generated_at: string;
}

// ============================================
// API REQUESTS/RESPONSES
// ============================================

export interface ClassifyProductsRequest {
  table_name?: string; // Se vazio, classifica todas
  period_months?: number;
  thresholds?: {
    category_a: number;
    category_b: number;
  };
  dry_run?: boolean;
}

export interface ClassifyProductsResponse {
  success: boolean;
  job_id?: string;
  estimated_time_seconds?: number;
  result?: {
    total_classified: number;
    category_breakdown: Record<ABCCategory, number>;
    changes_detected: number;
  };
  error?: string;
}

export interface ABCAnalysisJobStatus {
  job_id: string;
  status: AnalysisStatus;
  progress: number; // 0-100
  result: ABCAnalysisHistory | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface ProductsListQuery {
  category?: ABCCategory;
  page?: number;
  per_page?: number;
  sort?: 'value' | 'name' | 'category' | 'demand';
  order?: 'asc' | 'desc';
  search?: string;
  table_name?: string;
}

export interface ProductsListResponse {
  data: ProductABCData[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

// ============================================
// MÉTRICAS E KPIs
// ============================================

export interface InventoryMetrics {
  // Giro de estoque
  turnover_ratio: number;
  
  // Cobertura de estoque (dias)
  days_of_supply: number;
  
  // Valor em risco
  value_at_risk: number;
  
  // ROI de estoque
  inventory_roi: number;
  
  // Acurácia da classificação ABC
  abc_accuracy: number;
  
  // Eficiência operacional
  stock_out_rate: number;
  excess_inventory_rate: number;
}

export interface ProductMetrics extends ProductABCData {
  metrics: {
    turnover_ratio: number;
    days_of_supply: number;
    value_at_risk: number;
    stock_out_risk: 'high' | 'medium' | 'low';
  };
}

// ============================================
// EXPORT TYPES
// ============================================

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportRequest {
  format: ExportFormat;
  category?: ABCCategory;
  date_range?: {
    start: string;
    end: string;
  };
  include_charts?: boolean;
  include_recommendations?: boolean;
}

// ============================================
// VALIDAÇÃO E ERROS
// ============================================

export interface ABCValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ABCApiError {
  success: false;
  error: string;
  errors?: ABCValidationError[];
  code: string;
}

export interface ABCApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

export type ABCApiResponse<T = any> = ABCApiSuccess<T> | ABCApiError;

