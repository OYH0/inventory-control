// =====================================================
// SERVICE: Análise ABC de Inventário
// Implementação completa do sistema ABC baseado no
// Princípio de Pareto (80/20)
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  ABCCategory,
  ABCConfiguration,
  ABCConfigurationInput,
  ABCClassificationResult,
  EOQCalculation,
  EOQInput,
  ABCRecommendation,
  CategoryRecommendations,
  ABCDashboardSummary,
  ABCReport,
  ProductABCData,
  ABCTrendItem,
  ClassifyProductsRequest,
  ClassifyProductsResponse,
  ProductABCChange,
  InventoryMetrics,
  ProductMetrics,
  ABCParetoDataPoint,
  TrendDirection
} from '@/types/abc-analysis';

const TABLES_TO_ANALYZE = [
  'camara_fria_items',
  'camara_refrigerada_items',
  'estoque_seco_items',
  'bebidas_items',
  'descartaveis_items'
] as const;

type AnalysisTable = typeof TABLES_TO_ANALYZE[number];

export class ABCAnalysisService {
  
  // ============================================
  // CONFIGURAÇÕES
  // ============================================
  
  /**
   * Obtém configuração ABC da organização
   */
  static async getConfiguration(): Promise<ABCConfiguration> {
    const { data, error } = await supabase
      .from('abc_configurations')
      .select('*')
      .single();
    
    if (error) {
      // Se não existir, criar configuração padrão
      if (error.code === 'PGRST116') {
        return this.createDefaultConfiguration();
      }
      throw new Error(`Erro ao buscar configuração ABC: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Cria configuração padrão
   */
  private static async createDefaultConfiguration(): Promise<ABCConfiguration> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuário não autenticado');
    }
    
    // Buscar organization_id do usuário
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userData.user.id)
      .single();
    
    if (!memberData) {
      throw new Error('Organização não encontrada');
    }
    
    const { data, error } = await supabase
      .from('abc_configurations')
      .insert({
        organization_id: memberData.organization_id,
        category_a_threshold: 80.00,
        category_b_threshold: 95.00,
        analysis_period_months: 12,
        auto_classify: true,
        classification_frequency: 'monthly'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao criar configuração ABC: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Atualiza configuração ABC
   */
  static async updateConfiguration(input: ABCConfigurationInput): Promise<ABCConfiguration> {
    const config = await this.getConfiguration();
    
    const { data, error } = await supabase
      .from('abc_configurations')
      .update(input)
      .eq('id', config.id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao atualizar configuração ABC: ${error.message}`);
    }
    
    return data;
  }
  
  // ============================================
  // CÁLCULOS DE EOQ
  // ============================================
  
  /**
   * Calcula EOQ (Economic Order Quantity)
   * Fórmula: EOQ = √((2 × D × S) / H)
   * D = annual demand, S = ordering cost, H = holding cost per unit
   */
  static calculateEOQ(input: EOQInput): EOQCalculation {
    const { annual_demand, ordering_cost, unit_cost, carrying_cost_percentage } = input;
    
    // Validações
    if (annual_demand <= 0 || ordering_cost <= 0 || unit_cost <= 0 || carrying_cost_percentage <= 0) {
      return {
        eoq: 0,
        orders_per_year: 0,
        time_between_orders_days: 0,
        total_annual_cost: 0
      };
    }
    
    // Custo de manutenção anual por unidade
    const carrying_cost = unit_cost * (carrying_cost_percentage / 100);
    
    // Calcular EOQ
    const eoq = Math.sqrt((2 * annual_demand * ordering_cost) / carrying_cost);
    const orders_per_year = annual_demand / eoq;
    const time_between_orders_days = Math.round(365 / orders_per_year);
    
    // Custo total anual
    const ordering_total_cost = orders_per_year * ordering_cost;
    const holding_total_cost = (eoq / 2) * carrying_cost;
    const total_annual_cost = ordering_total_cost + holding_total_cost;
    
    return {
      eoq: Math.round(eoq * 100) / 100,
      orders_per_year: Math.round(orders_per_year * 100) / 100,
      time_between_orders_days,
      total_annual_cost: Math.round(total_annual_cost * 100) / 100
    };
  }
  
  /**
   * Calcula ponto de reordenamento
   * ROP = (Daily Demand × Lead Time) + Safety Stock
   */
  static calculateReorderPoint(
    annual_demand: number,
    lead_time_days: number,
    safety_stock: number
  ): number {
    const daily_demand = annual_demand / 365;
    const rop = (daily_demand * lead_time_days) + safety_stock;
    return Math.round(rop * 100) / 100;
  }
  
  /**
   * Calcula safety stock baseado na categoria
   */
  static calculateSafetyStock(
    annual_demand: number,
    lead_time_days: number,
    category: ABCCategory,
    config: ABCConfiguration
  ): number {
    const daily_demand = annual_demand / 365;
    
    let percentage: number;
    switch (category) {
      case 'A':
        percentage = config.safety_stock_a_percentage;
        break;
      case 'B':
        percentage = config.safety_stock_b_percentage;
        break;
      case 'C':
        percentage = config.safety_stock_c_percentage;
        break;
    }
    
    const safety_stock = daily_demand * lead_time_days * (percentage / 100);
    return Math.round(safety_stock * 100) / 100;
  }
  
  // ============================================
  // CLASSIFICAÇÃO ABC
  // ============================================
  
  /**
   * Atualiza valor de consumo anual para todos os produtos
   */
  static async updateAnnualConsumptionValues(
    table_name: AnalysisTable
  ): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_annual_consumption_value', {
      p_table_name: table_name,
      p_organization_id: await this.getOrganizationId(),
      p_period_months: (await this.getConfiguration()).analysis_period_months
    });
    
    if (error) {
      console.error(`Erro ao calcular valores de consumo para ${table_name}:`, error);
      throw error;
    }
    
    // Atualizar registros existentes
    if (data && data.length > 0) {
      // Atualizar cada produto individualmente (update, não upsert)
      for (const item of data) {
        const { error: updateError } = await supabase
          .from(table_name)
          .update({
            annual_demand: item.annual_demand,
            annual_consumption_value: item.annual_value
          })
          .eq('id', item.product_id);
        
        if (updateError) {
          console.error(`Erro ao atualizar produto ${item.product_id}:`, updateError);
        }
      }
    }
    
    return data?.length || 0;
  }
  
  /**
   * Executa classificação ABC em uma tabela
   */
  static async classifyProducts(
    table_name: AnalysisTable,
    config?: Partial<ABCConfiguration>
  ): Promise<ABCClassificationResult[]> {
    const fullConfig = config || await this.getConfiguration();
    const org_id = await this.getOrganizationId();
    
    // Chamar função SQL de classificação
    const { data, error } = await supabase.rpc('classify_products_abc', {
      p_table_name: table_name,
      p_organization_id: org_id,
      p_threshold_a: fullConfig.category_a_threshold || 80,
      p_threshold_b: fullConfig.category_b_threshold || 95
    });
    
    if (error) {
      console.error(`Erro ao classificar produtos em ${table_name}:`, error);
      throw error;
    }
    
    return data || [];
  }
  
  /**
   * Aplica classificação ABC e atualiza produtos
   */
  static async performFullClassification(
    request: ClassifyProductsRequest = {}
  ): Promise<ClassifyProductsResponse> {
    const start_time = Date.now();
    
    try {
      const config = await this.getConfiguration();
      const tables = request.table_name 
        ? [request.table_name as AnalysisTable]
        : TABLES_TO_ANALYZE;
      
      let total_classified = 0;
      const category_breakdown: Record<ABCCategory, number> = { A: 0, B: 0, C: 0 };
      let changes_detected = 0;
      
      for (const table of tables) {
        // 1. Atualizar valores de consumo
        await this.updateAnnualConsumptionValues(table);
        
        // 2. Classificar produtos
        const classifications = await this.classifyProducts(table, config);
        
        // 3. Detectar mudanças e atualizar
        for (const classification of classifications) {
          // Buscar categoria anterior
          const { data: product } = await supabase
            .from(table)
            .select('abc_category, annual_consumption_value, nome')
            .eq('id', classification.product_id)
            .single();
          
          if (product) {
            const previous_category = product.abc_category;
            const new_category = classification.abc_category;
            
            // Se não estiver em dry run, atualizar
            if (!request.dry_run) {
              const { error: updateError } = await supabase
                .from(table)
                .update({
                  abc_category: new_category,
                  abc_classification_date: new Date().toISOString()
                })
                .eq('id', classification.product_id);
              
              if (updateError) {
                console.error(`Erro ao atualizar produto ${classification.product_id}:`, updateError);
              }
            }
            
            // Detectar mudanças
            if (previous_category !== new_category) {
              changes_detected++;
              
              if (!request.dry_run) {
                await this.recordCategoryChange({
                  product_id: classification.product_id,
                  product_table: table,
                  product_name: product.nome,
                  previous_category,
                  new_category,
                  previous_value: product.annual_consumption_value,
                  new_value: classification.annual_value
                });
              }
            }
            
            // Contabilizar
            category_breakdown[new_category]++;
            total_classified++;
          }
        }
      }
      
      const execution_time_ms = Date.now() - start_time;
      
      // Salvar histórico
      if (!request.dry_run) {
        await this.saveAnalysisHistory({
          table_name: request.table_name || 'all',
          total_classified,
          category_breakdown,
          execution_time_ms,
          parameters: request
        });
      }
      
      return {
        success: true,
        result: {
          total_classified,
          category_breakdown,
          changes_detected
        }
      };
      
    } catch (error) {
      console.error('Erro na classificação ABC:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Registra mudança de categoria
   */
  private static async recordCategoryChange(change: {
    product_id: string;
    product_table: string;
    product_name: string;
    previous_category: ABCCategory | null;
    new_category: ABCCategory;
    previous_value: number | null;
    new_value: number;
  }): Promise<void> {
    const org_id = await this.getOrganizationId();
    
    // Calcular percentual de mudança
    let value_change_percentage: number | null = null;
    if (change.previous_value && change.previous_value > 0) {
      value_change_percentage = ((change.new_value - change.previous_value) / change.previous_value) * 100;
    }
    
    // Determinar tendência
    let trend_direction: string;
    if (!change.previous_category) {
      trend_direction = 'new';
    } else if (change.previous_category === change.new_category) {
      trend_direction = 'unchanged';
    } else if (
      (change.previous_category === 'C' && change.new_category === 'B') ||
      (change.previous_category === 'C' && change.new_category === 'A') ||
      (change.previous_category === 'B' && change.new_category === 'A')
    ) {
      trend_direction = 'upgrade';
    } else {
      trend_direction = 'downgrade';
    }
    
    const { error } = await supabase
      .from('product_abc_changes')
      .insert({
        organization_id: org_id,
        product_id: change.product_id,
        product_table: change.product_table,
        product_name: change.product_name,
        previous_category: change.previous_category,
        new_category: change.new_category,
        previous_value: change.previous_value,
        new_value: change.new_value,
        value_change_percentage,
        trend_direction,
        is_significant: value_change_percentage ? Math.abs(value_change_percentage) > 20 : false,
        requires_action: trend_direction === 'downgrade'
      });
    
    if (error) {
      console.error('Erro ao registrar mudança de categoria:', error);
    }
  }
  
  /**
   * Salva histórico de análise
   */
  private static async saveAnalysisHistory(params: {
    table_name: string;
    total_classified: number;
    category_breakdown: Record<ABCCategory, number>;
    execution_time_ms: number;
    parameters: any;
  }): Promise<void> {
    const org_id = await this.getOrganizationId();
    
    // Calcular valores por categoria
    const values_by_category = await this.getValuesByCategory(params.table_name);
    
    // Calcular eficiência de Pareto
    const pareto_efficiency = this.calculateParetoEfficiency(
      values_by_category.A,
      values_by_category.total
    );
    
    const { error } = await supabase
      .from('abc_analysis_history')
      .insert({
        organization_id: org_id,
        table_name: params.table_name,
        total_products_analyzed: params.total_classified,
        category_a_count: params.category_breakdown.A,
        category_b_count: params.category_breakdown.B,
        category_c_count: params.category_breakdown.C,
        category_a_value: values_by_category.A,
        category_b_value: values_by_category.B,
        category_c_value: values_by_category.C,
        total_inventory_value: values_by_category.total,
        pareto_efficiency,
        execution_time_ms: params.execution_time_ms,
        products_processed_per_second: (params.total_classified / params.execution_time_ms) * 1000,
        parameters: params.parameters,
        status: 'completed'
      });
    
    if (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }
  
  /**
   * Calcula eficiência de Pareto (quão próximo do 80/20 ideal)
   */
  private static calculateParetoEfficiency(category_a_value: number, total_value: number): number {
    if (total_value === 0) return 0;
    
    const actual_percentage = (category_a_value / total_value) * 100;
    const ideal_percentage = 80;
    
    // Quanto mais próximo de 80%, maior a eficiência
    const difference = Math.abs(actual_percentage - ideal_percentage);
    const efficiency = Math.max(0, 100 - (difference * 2)); // 2% de diferença = 4 pontos perdidos
    
    return Math.round(efficiency * 100) / 100;
  }
  
  // ============================================
  // RECOMENDAÇÕES
  // ============================================
  
  /**
   * Gera recomendações por categoria
   */
  static async generateRecommendations(category: ABCCategory): Promise<ABCRecommendation> {
    const config = await this.getConfiguration();
    
    const recommendations: Record<ABCCategory, ABCRecommendation> = {
      A: {
        category: 'A',
        reorder_frequency: 'weekly',
        safety_stock_level: config.safety_stock_a_percentage,
        review_interval_days: config.review_interval_a_days,
        monitoring_priority: 'high',
        suggested_actions: [
          'Revisar estoque semanalmente',
          'Negociar melhores preços com fornecedores principais',
          'Implementar controle rigoroso de inventário',
          'Monitorar ruptura de estoque com alertas críticos',
          'Manter relacionamento próximo com fornecedores',
          'Considerar contratos de longo prazo',
          'Análise de demanda com previsão avançada'
        ],
        eoq_params: null
      },
      B: {
        category: 'B',
        reorder_frequency: 'monthly',
        safety_stock_level: config.safety_stock_b_percentage,
        review_interval_days: config.review_interval_b_days,
        monitoring_priority: 'medium',
        suggested_actions: [
          'Revisar estoque mensalmente',
          'Considerar consolidação de fornecedores',
          'Implementar controle moderado de inventário',
          'Usar sistema de reordenamento automático',
          'Monitorar tendências de demanda',
          'Balancear custos de pedido vs. estoque'
        ],
        eoq_params: null
      },
      C: {
        category: 'C',
        reorder_frequency: 'quarterly',
        safety_stock_level: config.safety_stock_c_percentage,
        review_interval_days: config.review_interval_c_days,
        monitoring_priority: 'low',
        suggested_actions: [
          'Revisar estoque trimestralmente',
          'Minimizar estoque de segurança (5-10%)',
          'Agrupar pedidos para reduzir custos de transação',
          'Considerar dropshipping para itens de baixíssimo giro',
          'Simplificar controle de inventário',
          'Avaliar descontinuação de itens obsoletos'
        ],
        eoq_params: null
      }
    };
    
    return recommendations[category];
  }
  
  /**
   * Gera recomendações para todas as categorias
   */
  static async generateAllRecommendations(): Promise<CategoryRecommendations> {
    const [A, B, C] = await Promise.all([
      this.generateRecommendations('A'),
      this.generateRecommendations('B'),
      this.generateRecommendations('C')
    ]);
    
    return { A, B, C };
  }
  
  // ============================================
  // DASHBOARD E RELATÓRIOS
  // ============================================
  
  /**
   * Obtém resumo do dashboard
   */
  static async getDashboardSummary(): Promise<ABCDashboardSummary> {
    const org_id = await this.getOrganizationId();
    
    // Buscar dados consolidados
    const { data: products, error } = await supabase
      .from('abc_analysis_consolidated')
      .select('*')
      .eq('organization_id', org_id);
    
    if (error) {
      throw new Error(`Erro ao buscar dados do dashboard: ${error.message}`);
    }
    
    // Calcular estatísticas
    const total_products = products?.length || 0;
    const total_value = products?.reduce((sum, p) => sum + (p.annual_consumption_value || 0), 0) || 0;
    
    const category_a = products?.filter(p => p.abc_category === 'A') || [];
    const category_b = products?.filter(p => p.abc_category === 'B') || [];
    const category_c = products?.filter(p => p.abc_category === 'C') || [];
    
    const value_a = category_a.reduce((sum, p) => sum + (p.annual_consumption_value || 0), 0);
    const value_b = category_b.reduce((sum, p) => sum + (p.annual_consumption_value || 0), 0);
    const value_c = category_c.reduce((sum, p) => sum + (p.annual_consumption_value || 0), 0);
    
    // Buscar última análise
    const { data: lastAnalysis } = await supabase
      .from('abc_analysis_history')
      .select('analysis_date, pareto_efficiency')
      .eq('organization_id', org_id)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();
    
    return {
      total_products,
      category_breakdown: {
        A: {
          count: category_a.length,
          percentage: total_products > 0 ? (category_a.length / total_products) * 100 : 0,
          value: value_a,
          value_percentage: total_value > 0 ? (value_a / total_value) * 100 : 0
        },
        B: {
          count: category_b.length,
          percentage: total_products > 0 ? (category_b.length / total_products) * 100 : 0,
          value: value_b,
          value_percentage: total_value > 0 ? (value_b / total_value) * 100 : 0
        },
        C: {
          count: category_c.length,
          percentage: total_products > 0 ? (category_c.length / total_products) * 100 : 0,
          value: value_c,
          value_percentage: total_value > 0 ? (value_c / total_value) * 100 : 0
        }
      },
      total_inventory_value: total_value,
      pareto_efficiency: lastAnalysis?.pareto_efficiency || 0,
      last_analysis_date: lastAnalysis?.analysis_date || null
    };
  }
  
  /**
   * Obtém dados para gráfico de Pareto
   */
  static async getParetoChartData(): Promise<ABCParetoDataPoint[]> {
    const org_id = await this.getOrganizationId();
    
    const { data: products, error } = await supabase
      .from('abc_analysis_consolidated')
      .select('*')
      .eq('organization_id', org_id)
      .order('annual_consumption_value', { ascending: false });
    
    if (error || !products) {
      throw new Error(`Erro ao buscar dados de Pareto: ${error?.message}`);
    }
    
    const total_value = products.reduce((sum, p) => sum + (p.annual_consumption_value || 0), 0);
    let cumulative_value = 0;
    
    return products.map((p: any) => {
      cumulative_value += p.annual_consumption_value || 0;
      const cumulative_percentage = total_value > 0 ? (cumulative_value / total_value) * 100 : 0;
      
      return {
        product_name: p.product_name || p.nome || 'Sem nome',
        product_sku: p.product_sku || p.sku || null,
        annual_value: p.annual_consumption_value || 0,
        cumulative_value,
        cumulative_percentage: Math.round(cumulative_percentage * 100) / 100,
        category: p.abc_category || 'C'
      };
    });
  }
  
  /**
   * Obtém tendências de mudanças
   */
  static async getTrends(period: 'month' | 'quarter' | 'year' = 'month'): Promise<{
    upgrades: ABCTrendItem[];
    downgrades: ABCTrendItem[];
    new_entries: ABCTrendItem[];
  }> {
    const org_id = await this.getOrganizationId();
    
    // Calcular data inicial baseado no período
    const now = new Date();
    const start_date = new Date();
    switch (period) {
      case 'month':
        start_date.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start_date.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start_date.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const { data: changes, error } = await supabase
      .from('product_abc_changes')
      .select('*')
      .eq('organization_id', org_id)
      .gte('changed_at', start_date.toISOString())
      .order('changed_at', { ascending: false });
    
    if (error) {
      throw new Error(`Erro ao buscar tendências: ${error.message}`);
    }
    
    const mapToTrendItem = (item: any): ABCTrendItem => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku || null,
      source_table: item.product_table || 'unknown',
      previous_category: item.previous_category,
      new_category: item.new_category,
      value_change_percentage: item.value_change_percentage || 0,
      trend_direction: item.trend_direction as TrendDirection,
      changed_at: item.changed_at
    });

    return {
      upgrades: (changes?.filter(c => c.trend_direction === 'upgrade') || []).map(mapToTrendItem),
      downgrades: (changes?.filter(c => c.trend_direction === 'downgrade') || []).map(mapToTrendItem),
      new_entries: (changes?.filter(c => c.trend_direction === 'new') || []).map(mapToTrendItem)
    };
  }
  
  // ============================================
  // UTILITÁRIOS
  // ============================================
  
  /**
   * Obtém organization_id do usuário atual
   */
  private static async getOrganizationId(): Promise<string> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuário não autenticado');
    }
    
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userData.user.id)
      .eq('is_active', true)
      .single();
    
    if (!memberData) {
      throw new Error('Organização não encontrada');
    }
    
    return memberData.organization_id;
  }
  
  /**
   * Obtém valores por categoria
   */
  private static async getValuesByCategory(table_name: string): Promise<{
    A: number;
    B: number;
    C: number;
    total: number;
  }> {
    const org_id = await this.getOrganizationId();
    
    if (table_name === 'all') {
      // Buscar de todas as tabelas
      const { data } = await supabase
        .from('abc_analysis_consolidated')
        .select('abc_category, annual_consumption_value')
        .eq('organization_id', org_id);
      
      const values = { A: 0, B: 0, C: 0, total: 0 };
      
      data?.forEach(item => {
        const value = item.annual_consumption_value || 0;
        if (item.abc_category) {
          values[item.abc_category] += value;
        }
        values.total += value;
      });
      
      return values;
    } else {
      // Buscar de uma tabela específica - usar any para evitar erro de tipo
      const tableName = table_name as any;
      const { data } = await supabase
        .from(tableName)
        .select('abc_category, annual_consumption_value')
        .eq('organization_id', org_id);
      
      const values = { A: 0, B: 0, C: 0, total: 0 };
      
      (data as any[])?.forEach(item => {
        const value = item.annual_consumption_value || 0;
        if (item.abc_category) {
          values[item.abc_category as ABCCategory] += value;
        }
        values.total += value;
      });
      
      return values;
    }
  }
}

export default ABCAnalysisService;

