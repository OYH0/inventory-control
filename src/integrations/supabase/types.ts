export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      abc_analysis_history: {
        Row: {
          analysis_date: string
          category_a_count: number
          category_a_percentage: number | null
          category_a_value: number
          category_b_count: number
          category_b_percentage: number | null
          category_b_value: number
          category_c_count: number
          category_c_percentage: number | null
          category_c_value: number
          created_at: string
          created_by: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          organization_id: string | null
          parameters: Json
          pareto_efficiency: number | null
          products_processed_per_second: number | null
          status: string | null
          table_name: string
          total_inventory_value: number
          total_products_analyzed: number
        }
        Insert: {
          analysis_date?: string
          category_a_count: number
          category_a_percentage?: number | null
          category_a_value: number
          category_b_count: number
          category_b_percentage?: number | null
          category_b_value: number
          category_c_count: number
          category_c_percentage?: number | null
          category_c_value: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          organization_id?: string | null
          parameters: Json
          pareto_efficiency?: number | null
          products_processed_per_second?: number | null
          status?: string | null
          table_name: string
          total_inventory_value: number
          total_products_analyzed: number
        }
        Update: {
          analysis_date?: string
          category_a_count?: number
          category_a_percentage?: number | null
          category_a_value?: number
          category_b_count?: number
          category_b_percentage?: number | null
          category_b_value?: number
          category_c_count?: number
          category_c_percentage?: number | null
          category_c_value?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          organization_id?: string | null
          parameters?: Json
          pareto_efficiency?: number | null
          products_processed_per_second?: number | null
          status?: string | null
          table_name?: string
          total_inventory_value?: number
          total_products_analyzed?: number
        }
        Relationships: [
          {
            foreignKeyName: "abc_analysis_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abc_analysis_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abc_analysis_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "abc_analysis_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      abc_configurations: {
        Row: {
          analysis_period_months: number | null
          auto_classify: boolean
          category_a_threshold: number | null
          category_b_threshold: number | null
          classification_frequency: Database["public"]["Enums"]["classification_frequency_enum"]
          created_at: string
          default_carrying_cost_percentage: number | null
          default_ordering_cost: number | null
          id: string
          include_zero_demand: boolean
          organization_id: string | null
          review_interval_a_days: number | null
          review_interval_b_days: number | null
          review_interval_c_days: number | null
          safety_stock_a_percentage: number | null
          safety_stock_b_percentage: number | null
          safety_stock_c_percentage: number | null
          updated_at: string
        }
        Insert: {
          analysis_period_months?: number | null
          auto_classify?: boolean
          category_a_threshold?: number | null
          category_b_threshold?: number | null
          classification_frequency?: Database["public"]["Enums"]["classification_frequency_enum"]
          created_at?: string
          default_carrying_cost_percentage?: number | null
          default_ordering_cost?: number | null
          id?: string
          include_zero_demand?: boolean
          organization_id?: string | null
          review_interval_a_days?: number | null
          review_interval_b_days?: number | null
          review_interval_c_days?: number | null
          safety_stock_a_percentage?: number | null
          safety_stock_b_percentage?: number | null
          safety_stock_c_percentage?: number | null
          updated_at?: string
        }
        Update: {
          analysis_period_months?: number | null
          auto_classify?: boolean
          category_a_threshold?: number | null
          category_b_threshold?: number | null
          classification_frequency?: Database["public"]["Enums"]["classification_frequency_enum"]
          created_at?: string
          default_carrying_cost_percentage?: number | null
          default_ordering_cost?: number | null
          id?: string
          include_zero_demand?: boolean
          organization_id?: string | null
          review_interval_a_days?: number | null
          review_interval_b_days?: number | null
          review_interval_c_days?: number | null
          safety_stock_a_percentage?: number | null
          safety_stock_b_percentage?: number | null
          safety_stock_c_percentage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "abc_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abc_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abc_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "abc_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_configurations: {
        Row: {
          alert_categories: string[] | null
          alert_for_all_locations: boolean | null
          created_at: string | null
          critical_days: number | null
          id: string
          is_active: boolean | null
          min_value_threshold: number | null
          notification_channels: Json | null
          notification_frequency:
            | Database["public"]["Enums"]["notification_frequency"]
            | null
          notification_time: string | null
          organization_id: string | null
          specific_locations: Database["public"]["Enums"]["unidade"][] | null
          updated_at: string | null
          user_id: string
          warning_days: number | null
        }
        Insert: {
          alert_categories?: string[] | null
          alert_for_all_locations?: boolean | null
          created_at?: string | null
          critical_days?: number | null
          id?: string
          is_active?: boolean | null
          min_value_threshold?: number | null
          notification_channels?: Json | null
          notification_frequency?:
            | Database["public"]["Enums"]["notification_frequency"]
            | null
          notification_time?: string | null
          organization_id?: string | null
          specific_locations?: Database["public"]["Enums"]["unidade"][] | null
          updated_at?: string | null
          user_id: string
          warning_days?: number | null
        }
        Update: {
          alert_categories?: string[] | null
          alert_for_all_locations?: boolean | null
          created_at?: string | null
          critical_days?: number | null
          id?: string
          is_active?: boolean | null
          min_value_threshold?: number | null
          notification_channels?: Json | null
          notification_frequency?:
            | Database["public"]["Enums"]["notification_frequency"]
            | null
          notification_time?: string | null
          organization_id?: string | null
          specific_locations?: Database["public"]["Enums"]["unidade"][] | null
          updated_at?: string | null
          user_id?: string
          warning_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "alert_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_configurations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_all_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_configurations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_history: {
        Row: {
          alert_id: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string | null
          status_change: Database["public"]["Enums"]["alert_status"]
        }
        Insert: {
          alert_id?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          status_change: Database["public"]["Enums"]["alert_status"]
        }
        Update: {
          alert_id?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          status_change?: Database["public"]["Enums"]["alert_status"]
        }
        Relationships: [
          {
            foreignKeyName: "alert_history_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "expiry_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "admin_all_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "alert_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bebidas_historico: {
        Row: {
          categoria: string
          data_operacao: string
          id: string
          item_nome: string
          observacoes: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Insert: {
          categoria: string
          data_operacao?: string
          id?: string
          item_nome: string
          observacoes?: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Update: {
          categoria?: string
          data_operacao?: string
          id?: string
          item_nome?: string
          observacoes?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
          user_id?: string
        }
        Relationships: []
      }
      bebidas_items: {
        Row: {
          abc_category: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date: string | null
          alert_threshold_days: number | null
          annual_consumption_value: number | null
          annual_demand: number | null
          batch_number: string | null
          carrying_cost_percentage: number | null
          categoria: string
          created_at: string
          data_entrada: string
          data_validade: string | null
          eoq: number | null
          fornecedor: string | null
          id: string
          is_perishable: boolean | null
          lead_time_days: number | null
          manufacturing_date: string | null
          minimo: number | null
          nome: string
          observacoes: string | null
          ordering_cost: number | null
          organization_id: string | null
          preco_unitario: number | null
          quantidade: number
          reorder_point: number | null
          safety_stock: number | null
          temperatura: number | null
          temperatura_ideal: number | null
          unidade: string
          unidade_item: string | null
          unit_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abc_category?: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date?: string | null
          alert_threshold_days?: number | null
          annual_consumption_value?: number | null
          annual_demand?: number | null
          batch_number?: string | null
          carrying_cost_percentage?: number | null
          categoria: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          eoq?: number | null
          fornecedor?: string | null
          id?: string
          is_perishable?: boolean | null
          lead_time_days?: number | null
          manufacturing_date?: string | null
          minimo?: number | null
          nome: string
          observacoes?: string | null
          ordering_cost?: number | null
          organization_id?: string | null
          preco_unitario?: number | null
          quantidade?: number
          reorder_point?: number | null
          safety_stock?: number | null
          temperatura?: number | null
          temperatura_ideal?: number | null
          unidade?: string
          unidade_item?: string | null
          unit_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abc_category?: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date?: string | null
          alert_threshold_days?: number | null
          annual_consumption_value?: number | null
          annual_demand?: number | null
          batch_number?: string | null
          carrying_cost_percentage?: number | null
          categoria?: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          eoq?: number | null
          fornecedor?: string | null
          id?: string
          is_perishable?: boolean | null
          lead_time_days?: number | null
          manufacturing_date?: string | null
          minimo?: number | null
          nome?: string
          observacoes?: string | null
          ordering_cost?: number | null
          organization_id?: string | null
          preco_unitario?: number | null
          quantidade?: number
          reorder_point?: number | null
          safety_stock?: number | null
          temperatura?: number | null
          temperatura_ideal?: number | null
          unidade?: string
          unidade_item?: string | null
          unit_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bebidas_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bebidas_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bebidas_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "bebidas_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      camara_fria_historico: {
        Row: {
          categoria: string
          data_operacao: string
          id: string
          item_nome: string
          observacoes: string | null
          organization_id: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Insert: {
          categoria: string
          data_operacao?: string
          id?: string
          item_nome: string
          observacoes?: string | null
          organization_id?: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Update: {
          categoria?: string
          data_operacao?: string
          id?: string
          item_nome?: string
          observacoes?: string | null
          organization_id?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camara_fria_historico_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camara_fria_historico_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camara_fria_historico_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "camara_fria_historico_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      camara_fria_items: {
        Row: {
          abc_category: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date: string | null
          alert_threshold_days: number | null
          annual_consumption_value: number | null
          annual_demand: number | null
          batch_number: string | null
          carrying_cost_percentage: number | null
          categoria: string
          created_at: string
          data_entrada: string
          data_validade: string | null
          eoq: number | null
          fornecedor: string | null
          id: string
          is_perishable: boolean | null
          lead_time_days: number | null
          manufacturing_date: string | null
          minimo: number | null
          nome: string
          observacoes: string | null
          ordering_cost: number | null
          organization_id: string | null
          preco_unitario: number | null
          quantidade: number
          reorder_point: number | null
          safety_stock: number | null
          temperatura_ideal: number | null
          unidade: string
          unit_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abc_category?: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date?: string | null
          alert_threshold_days?: number | null
          annual_consumption_value?: number | null
          annual_demand?: number | null
          batch_number?: string | null
          carrying_cost_percentage?: number | null
          categoria: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          eoq?: number | null
          fornecedor?: string | null
          id?: string
          is_perishable?: boolean | null
          lead_time_days?: number | null
          manufacturing_date?: string | null
          minimo?: number | null
          nome: string
          observacoes?: string | null
          ordering_cost?: number | null
          organization_id?: string | null
          preco_unitario?: number | null
          quantidade?: number
          reorder_point?: number | null
          safety_stock?: number | null
          temperatura_ideal?: number | null
          unidade?: string
          unit_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abc_category?: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date?: string | null
          alert_threshold_days?: number | null
          annual_consumption_value?: number | null
          annual_demand?: number | null
          batch_number?: string | null
          carrying_cost_percentage?: number | null
          categoria?: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          eoq?: number | null
          fornecedor?: string | null
          id?: string
          is_perishable?: boolean | null
          lead_time_days?: number | null
          manufacturing_date?: string | null
          minimo?: number | null
          nome?: string
          observacoes?: string | null
          ordering_cost?: number | null
          organization_id?: string | null
          preco_unitario?: number | null
          quantidade?: number
          reorder_point?: number | null
          safety_stock?: number | null
          temperatura_ideal?: number | null
          unidade?: string
          unit_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camara_fria_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camara_fria_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camara_fria_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "camara_fria_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      camara_refrigerada_historico: {
        Row: {
          categoria: string
          data_operacao: string
          id: string
          item_nome: string
          observacoes: string | null
          organization_id: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Insert: {
          categoria: string
          data_operacao?: string
          id?: string
          item_nome: string
          observacoes?: string | null
          organization_id?: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Update: {
          categoria?: string
          data_operacao?: string
          id?: string
          item_nome?: string
          observacoes?: string | null
          organization_id?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camara_refrigerada_historico_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camara_refrigerada_historico_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camara_refrigerada_historico_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "camara_refrigerada_historico_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      camara_refrigerada_items: {
        Row: {
          abc_category: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date: string | null
          alert_threshold_days: number | null
          annual_consumption_value: number | null
          annual_demand: number | null
          batch_number: string | null
          carrying_cost_percentage: number | null
          categoria: string
          created_at: string
          data_entrada: string
          data_validade: string | null
          eoq: number | null
          fornecedor: string | null
          id: string
          is_perishable: boolean | null
          lead_time_days: number | null
          manufacturing_date: string | null
          nome: string
          observacoes: string | null
          ordering_cost: number | null
          organization_id: string | null
          preco_unitario: number | null
          quantidade: number
          reorder_point: number | null
          safety_stock: number | null
          status: string
          temperatura_ideal: number | null
          unidade: string
          unit_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abc_category?: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date?: string | null
          alert_threshold_days?: number | null
          annual_consumption_value?: number | null
          annual_demand?: number | null
          batch_number?: string | null
          carrying_cost_percentage?: number | null
          categoria: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          eoq?: number | null
          fornecedor?: string | null
          id?: string
          is_perishable?: boolean | null
          lead_time_days?: number | null
          manufacturing_date?: string | null
          nome: string
          observacoes?: string | null
          ordering_cost?: number | null
          organization_id?: string | null
          preco_unitario?: number | null
          quantidade?: number
          reorder_point?: number | null
          safety_stock?: number | null
          status?: string
          temperatura_ideal?: number | null
          unidade?: string
          unit_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abc_category?: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date?: string | null
          alert_threshold_days?: number | null
          annual_consumption_value?: number | null
          annual_demand?: number | null
          batch_number?: string | null
          carrying_cost_percentage?: number | null
          categoria?: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          eoq?: number | null
          fornecedor?: string | null
          id?: string
          is_perishable?: boolean | null
          lead_time_days?: number | null
          manufacturing_date?: string | null
          nome?: string
          observacoes?: string | null
          ordering_cost?: number | null
          organization_id?: string | null
          preco_unitario?: number | null
          quantidade?: number
          reorder_point?: number | null
          safety_stock?: number | null
          status?: string
          temperatura_ideal?: number | null
          unidade?: string
          unit_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camara_refrigerada_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camara_refrigerada_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camara_refrigerada_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "camara_refrigerada_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      descartaveis_historico: {
        Row: {
          categoria: string
          data_operacao: string
          id: string
          item_nome: string
          observacoes: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Insert: {
          categoria: string
          data_operacao?: string
          id?: string
          item_nome: string
          observacoes?: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Update: {
          categoria?: string
          data_operacao?: string
          id?: string
          item_nome?: string
          observacoes?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
          user_id?: string
        }
        Relationships: []
      }
      descartaveis_items: {
        Row: {
          abc_category: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date: string | null
          alert_threshold_days: number | null
          annual_consumption_value: number | null
          annual_demand: number | null
          batch_number: string | null
          carrying_cost_percentage: number | null
          categoria: string
          created_at: string
          data_entrada: string
          eoq: number | null
          fornecedor: string | null
          id: string
          is_perishable: boolean | null
          lead_time_days: number | null
          manufacturing_date: string | null
          minimo: number | null
          nome: string
          observacoes: string | null
          ordering_cost: number | null
          organization_id: string | null
          preco_unitario: number | null
          quantidade: number
          reorder_point: number | null
          safety_stock: number | null
          unidade: string
          unit_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abc_category?: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date?: string | null
          alert_threshold_days?: number | null
          annual_consumption_value?: number | null
          annual_demand?: number | null
          batch_number?: string | null
          carrying_cost_percentage?: number | null
          categoria: string
          created_at?: string
          data_entrada?: string
          eoq?: number | null
          fornecedor?: string | null
          id?: string
          is_perishable?: boolean | null
          lead_time_days?: number | null
          manufacturing_date?: string | null
          minimo?: number | null
          nome: string
          observacoes?: string | null
          ordering_cost?: number | null
          organization_id?: string | null
          preco_unitario?: number | null
          quantidade?: number
          reorder_point?: number | null
          safety_stock?: number | null
          unidade?: string
          unit_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abc_category?: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date?: string | null
          alert_threshold_days?: number | null
          annual_consumption_value?: number | null
          annual_demand?: number | null
          batch_number?: string | null
          carrying_cost_percentage?: number | null
          categoria?: string
          created_at?: string
          data_entrada?: string
          eoq?: number | null
          fornecedor?: string | null
          id?: string
          is_perishable?: boolean | null
          lead_time_days?: number | null
          manufacturing_date?: string | null
          minimo?: number | null
          nome?: string
          observacoes?: string | null
          ordering_cost?: number | null
          organization_id?: string | null
          preco_unitario?: number | null
          quantidade?: number
          reorder_point?: number | null
          safety_stock?: number | null
          unidade?: string
          unit_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "descartaveis_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "descartaveis_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "descartaveis_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "descartaveis_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_seco_historico: {
        Row: {
          categoria: string
          data_operacao: string
          id: string
          item_nome: string
          observacoes: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Insert: {
          categoria: string
          data_operacao?: string
          id?: string
          item_nome: string
          observacoes?: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Update: {
          categoria?: string
          data_operacao?: string
          id?: string
          item_nome?: string
          observacoes?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
          user_id?: string
        }
        Relationships: []
      }
      estoque_seco_items: {
        Row: {
          abc_category: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date: string | null
          alert_threshold_days: number | null
          annual_consumption_value: number | null
          annual_demand: number | null
          batch_number: string | null
          carrying_cost_percentage: number | null
          categoria: string
          created_at: string
          data_entrada: string
          data_validade: string | null
          eoq: number | null
          fornecedor: string | null
          id: string
          is_perishable: boolean | null
          lead_time_days: number | null
          manufacturing_date: string | null
          minimo: number | null
          nome: string
          observacoes: string | null
          ordering_cost: number | null
          organization_id: string | null
          preco_unitario: number | null
          quantidade: number
          reorder_point: number | null
          safety_stock: number | null
          unidade: string
          unit_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abc_category?: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date?: string | null
          alert_threshold_days?: number | null
          annual_consumption_value?: number | null
          annual_demand?: number | null
          batch_number?: string | null
          carrying_cost_percentage?: number | null
          categoria: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          eoq?: number | null
          fornecedor?: string | null
          id?: string
          is_perishable?: boolean | null
          lead_time_days?: number | null
          manufacturing_date?: string | null
          minimo?: number | null
          nome: string
          observacoes?: string | null
          ordering_cost?: number | null
          organization_id?: string | null
          preco_unitario?: number | null
          quantidade?: number
          reorder_point?: number | null
          safety_stock?: number | null
          unidade?: string
          unit_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abc_category?: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date?: string | null
          alert_threshold_days?: number | null
          annual_consumption_value?: number | null
          annual_demand?: number | null
          batch_number?: string | null
          carrying_cost_percentage?: number | null
          categoria?: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          eoq?: number | null
          fornecedor?: string | null
          id?: string
          is_perishable?: boolean | null
          lead_time_days?: number | null
          manufacturing_date?: string | null
          minimo?: number | null
          nome?: string
          observacoes?: string | null
          ordering_cost?: number | null
          organization_id?: string | null
          preco_unitario?: number | null
          quantidade?: number
          reorder_point?: number | null
          safety_stock?: number | null
          unidade?: string
          unit_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_seco_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_seco_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_seco_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "estoque_seco_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expiry_alerts: {
        Row: {
          action_taken: string | null
          alert_sent_at: string | null
          alert_type: Database["public"]["Enums"]["alert_type"]
          batch_number: string | null
          created_at: string | null
          days_until_expiry: number
          dismissal_reason: string | null
          dismissed_at: string | null
          dismissed_by: string | null
          estimated_value: number | null
          expiry_date: string
          id: string
          item_category: string | null
          item_id: string
          item_name: string
          item_table: string
          location: Database["public"]["Enums"]["unidade"] | null
          metadata: Json | null
          notification_method: Database["public"]["Enums"]["notification_method"]
          organization_id: string | null
          priority: Database["public"]["Enums"]["alert_priority"]
          quantity: number
          read_at: string | null
          recipient_user_id: string | null
          status: Database["public"]["Enums"]["alert_status"]
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          alert_sent_at?: string | null
          alert_type: Database["public"]["Enums"]["alert_type"]
          batch_number?: string | null
          created_at?: string | null
          days_until_expiry: number
          dismissal_reason?: string | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          estimated_value?: number | null
          expiry_date: string
          id?: string
          item_category?: string | null
          item_id: string
          item_name: string
          item_table: string
          location?: Database["public"]["Enums"]["unidade"] | null
          metadata?: Json | null
          notification_method?: Database["public"]["Enums"]["notification_method"]
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["alert_priority"]
          quantity: number
          read_at?: string | null
          recipient_user_id?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          alert_sent_at?: string | null
          alert_type?: Database["public"]["Enums"]["alert_type"]
          batch_number?: string | null
          created_at?: string | null
          days_until_expiry?: number
          dismissal_reason?: string | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          estimated_value?: number | null
          expiry_date?: string
          id?: string
          item_category?: string | null
          item_id?: string
          item_name?: string
          item_table?: string
          location?: Database["public"]["Enums"]["unidade"] | null
          metadata?: Json | null
          notification_method?: Database["public"]["Enums"]["notification_method"]
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["alert_priority"]
          quantity?: number
          read_at?: string | null
          recipient_user_id?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expiry_alerts_dismissed_by_fkey"
            columns: ["dismissed_by"]
            isOneToOne: false
            referencedRelation: "admin_all_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expiry_alerts_dismissed_by_fkey"
            columns: ["dismissed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expiry_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expiry_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expiry_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "expiry_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expiry_alerts_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "admin_all_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expiry_alerts_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          discount_percentage: number | null
          id: string
          item_id: string
          item_name: string
          item_sku: string | null
          item_table: string
          line_total: number
          notes: string | null
          order_id: string
          quantity: number
          quantity_received: number | null
          quantity_returned: number | null
          tax_percentage: number | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percentage?: number | null
          id?: string
          item_id: string
          item_name: string
          item_sku?: string | null
          item_table: string
          line_total: number
          notes?: string | null
          order_id: string
          quantity: number
          quantity_received?: number | null
          quantity_returned?: number | null
          tax_percentage?: number | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number | null
          id?: string
          item_id?: string
          item_name?: string
          item_sku?: string | null
          item_table?: string
          line_total?: number
          notes?: string | null
          order_id?: string
          quantity?: number
          quantity_received?: number | null
          quantity_returned?: number | null
          tax_percentage?: number | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["order_status"]
          notes: string | null
          order_id: string
          previous_status: Database["public"]["Enums"]["order_status"] | null
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["order_status"]
          notes?: string | null
          order_id: string
          previous_status?: Database["public"]["Enums"]["order_status"] | null
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["order_status"]
          notes?: string | null
          order_id?: string
          previous_status?: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          approved_at: string | null
          approved_by: string | null
          billing_address: Json | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          carrier: string | null
          created_at: string
          deleted_at: string | null
          discount_amount: number | null
          expected_delivery_date: string | null
          from_location: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_date: string
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          order_type: Database["public"]["Enums"]["order_type"]
          organization_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipping_address: Json | null
          shipping_cost: number | null
          subtotal: number
          supplier_customer_email: string | null
          supplier_customer_name: string | null
          supplier_customer_phone: string | null
          tax_amount: number | null
          to_location: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_delivery_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          billing_address?: Json | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          carrier?: string | null
          created_at?: string
          deleted_at?: string | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          from_location?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_date?: string
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status"]
          order_type: Database["public"]["Enums"]["order_type"]
          organization_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address?: Json | null
          shipping_cost?: number | null
          subtotal?: number
          supplier_customer_email?: string | null
          supplier_customer_name?: string | null
          supplier_customer_phone?: string | null
          tax_amount?: number | null
          to_location?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_delivery_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          billing_address?: Json | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          carrier?: string | null
          created_at?: string
          deleted_at?: string | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          from_location?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_date?: string
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          order_type?: Database["public"]["Enums"]["order_type"]
          organization_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address?: Json | null
          shipping_cost?: number | null
          subtotal?: number
          supplier_customer_email?: string | null
          supplier_customer_name?: string | null
          supplier_customer_phone?: string | null
          tax_amount?: number | null
          to_location?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          joined_at: string | null
          organization_id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["organization_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string | null
          organization_id: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["organization_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["organization_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          max_users: number | null
          name: string
          owner_id: string
          primary_color: string | null
          settings: Json | null
          slug: string
          subscription_expires_at: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_users?: number | null
          name: string
          owner_id: string
          primary_color?: string | null
          settings?: Json | null
          slug: string
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_users?: number | null
          name?: string
          owner_id?: string
          primary_color?: string | null
          settings?: Json | null
          slug?: string
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_abc_changes: {
        Row: {
          analysis_id: string | null
          change_reason: string | null
          changed_at: string
          id: string
          is_significant: boolean | null
          new_category: Database["public"]["Enums"]["abc_category_enum"]
          new_value: number
          organization_id: string | null
          previous_category:
            | Database["public"]["Enums"]["abc_category_enum"]
            | null
          previous_value: number | null
          product_id: string
          product_name: string
          product_sku: string | null
          product_table: string
          requires_action: boolean | null
          trend_direction: string | null
          value_change_percentage: number | null
        }
        Insert: {
          analysis_id?: string | null
          change_reason?: string | null
          changed_at?: string
          id?: string
          is_significant?: boolean | null
          new_category: Database["public"]["Enums"]["abc_category_enum"]
          new_value: number
          organization_id?: string | null
          previous_category?:
            | Database["public"]["Enums"]["abc_category_enum"]
            | null
          previous_value?: number | null
          product_id: string
          product_name: string
          product_sku?: string | null
          product_table: string
          requires_action?: boolean | null
          trend_direction?: string | null
          value_change_percentage?: number | null
        }
        Update: {
          analysis_id?: string | null
          change_reason?: string | null
          changed_at?: string
          id?: string
          is_significant?: boolean | null
          new_category?: Database["public"]["Enums"]["abc_category_enum"]
          new_value?: number
          organization_id?: string | null
          previous_category?:
            | Database["public"]["Enums"]["abc_category_enum"]
            | null
          previous_value?: number | null
          product_id?: string
          product_name?: string
          product_sku?: string | null
          product_table?: string
          requires_action?: boolean | null
          trend_direction?: string | null
          value_change_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_abc_changes_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "abc_analysis_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_abc_changes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_abc_changes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_abc_changes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "product_abc_changes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          unidade_responsavel: Database["public"]["Enums"]["unidade"] | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          unidade_responsavel?: Database["public"]["Enums"]["unidade"] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          unidade_responsavel?: Database["public"]["Enums"]["unidade"] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      user_unit_permissions: {
        Row: {
          can_modify: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          unidade: Database["public"]["Enums"]["unidade"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_modify?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          unidade: Database["public"]["Enums"]["unidade"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_modify?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          unidade?: Database["public"]["Enums"]["unidade"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_unit_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_all_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_unit_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      abc_analysis_consolidated: {
        Row: {
          abc_category: Database["public"]["Enums"]["abc_category_enum"] | null
          abc_classification_date: string | null
          annual_consumption_value: number | null
          annual_demand: number | null
          carrying_cost_percentage: number | null
          eoq: number | null
          id: string | null
          lead_time_days: number | null
          ordering_cost: number | null
          organization_id: string | null
          product_name: string | null
          reorder_point: number | null
          safety_stock: number | null
          source_table: string | null
          unit_cost: number | null
        }
        Relationships: []
      }
      admin_all_members: {
        Row: {
          created_at: string | null
          id: string | null
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          org_name: string | null
          org_slug: string | null
          organization_id: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["organization_role"] | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_all_organizations: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          is_active: boolean | null
          logo_url: string | null
          max_users: number | null
          member_count: number | null
          name: string | null
          owner_email: string | null
          owner_id: string | null
          owner_name: string | null
          primary_color: string | null
          settings: Json | null
          slug: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          total_items: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      admin_all_users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          org_count: number | null
          organizations: string[] | null
          unidade_responsavel: Database["public"]["Enums"]["unidade"] | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          org_count?: never
          organizations?: never
          unidade_responsavel?: Database["public"]["Enums"]["unidade"] | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          org_count?: never
          organizations?: never
          unidade_responsavel?: Database["public"]["Enums"]["unidade"] | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      admin_global_stats: {
        Row: {
          active_orgs: number | null
          active_users: number | null
          bebidas_count: number | null
          camara_fria_count: number | null
          camara_refrigerada_count: number | null
          descartaveis_count: number | null
          estoque_seco_count: number | null
          total_orders: number | null
          total_orgs: number | null
          total_users: number | null
        }
        Relationships: []
      }
      expiry_alerts_dashboard: {
        Row: {
          alerts_today: number | null
          critical_alerts: number | null
          critical_value_at_risk: number | null
          expired_items: number | null
          high_alerts: number | null
          pending_notifications: number | null
          total_active_alerts: number | null
          total_value_at_risk: number | null
        }
        Relationships: []
      }
      my_organizations: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          is_active: boolean | null
          logo_url: string | null
          max_users: number | null
          member_count: number | null
          my_permissions: Json | null
          my_role: Database["public"]["Enums"]["organization_role"] | null
          name: string | null
          owner_id: string | null
          primary_color: string | null
          settings: Json | null
          slug: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      orders_dashboard: {
        Row: {
          organization_id: string | null
          pending_orders: number | null
          processing_orders: number | null
          shipped_orders: number | null
          today_orders: number | null
          today_revenue: number | null
          total_revenue: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "admin_all_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "my_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_stats: {
        Row: {
          bebidas_count: number | null
          camara_fria_count: number | null
          camara_refrigerada_count: number | null
          descartaveis_count: number | null
          estoque_seco_count: number | null
          name: string | null
          organization_id: string | null
          pending_alerts: number | null
          total_members: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_abc_columns_to_table: {
        Args: { table_name: string }
        Returns: undefined
      }
      add_user_to_organization_by_email: {
        Args: {
          p_can_delete?: boolean
          p_can_write?: boolean
          p_email: string
          p_role?: Database["public"]["Enums"]["organization_role"]
        }
        Returns: string
      }
      calculate_annual_consumption_value: {
        Args: {
          p_organization_id: string
          p_period_months?: number
          p_table_name: string
        }
        Returns: {
          annual_demand: number
          annual_value: number
          product_id: string
        }[]
      }
      calculate_days_until_expiry: {
        Args: { expiry_date: string }
        Returns: number
      }
      calculate_eoq: {
        Args: {
          p_annual_demand: number
          p_carrying_cost_percentage: number
          p_ordering_cost: number
          p_unit_cost: number
        }
        Returns: {
          eoq: number
          orders_per_year: number
          time_between_orders_days: number
          total_annual_cost: number
        }[]
      }
      calculate_reorder_point: {
        Args: {
          p_annual_demand: number
          p_lead_time_days: number
          p_safety_stock: number
        }
        Returns: number
      }
      can_modify: { Args: never; Returns: boolean }
      classify_products_abc: {
        Args: {
          p_organization_id: string
          p_table_name: string
          p_threshold_a?: number
          p_threshold_b?: number
        }
        Returns: {
          abc_category: Database["public"]["Enums"]["abc_category_enum"]
          annual_value: number
          cumulative_percentage: number
          product_id: string
        }[]
      }
      cleanup_old_alerts: { Args: { days_to_keep?: number }; Returns: number }
      determine_alert_priority: {
        Args: { days_until_expiry: number }
        Returns: Database["public"]["Enums"]["alert_priority"]
      }
      determine_alert_type: {
        Args: { days_until_expiry: number }
        Returns: Database["public"]["Enums"]["alert_type"]
      }
      generate_expiry_alerts: {
        Args: never
        Returns: {
          alerts_generated: number
          critical_count: number
          expired_count: number
        }[]
      }
      generate_order_number: { Args: never; Returns: string }
      get_user_accessible_units: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["unidade"][]
      }
      get_user_organization_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_gerente: { Args: never; Returns: boolean }
      is_master_admin: { Args: { user_id_param: string }; Returns: boolean }
      migrate_existing_data_to_organization: {
        Args: { p_organization_id: string; p_user_id: string }
        Returns: string
      }
      user_belongs_to_organization: {
        Args: { p_org_id: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { p_action: string; p_module: string; p_org_id: string }
        Returns: boolean
      }
      user_has_role: {
        Args: {
          p_org_id: string
          p_required_role: Database["public"]["Enums"]["organization_role"]
        }
        Returns: boolean
      }
      user_has_unit_access: {
        Args: {
          p_unidade: Database["public"]["Enums"]["unidade"]
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      abc_category_enum: "A" | "B" | "C"
      alert_priority: "low" | "medium" | "high" | "critical"
      alert_status: "pending" | "sent" | "read" | "dismissed"
      alert_type: "near_expiry" | "expired" | "critical"
      classification_frequency_enum: "daily" | "weekly" | "monthly"
      notification_frequency: "realtime" | "daily" | "weekly"
      notification_method: "email" | "sms" | "push" | "in_app"
      order_status:
        | "draft"
        | "pending"
        | "approved"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "returned"
      order_type: "purchase" | "sale" | "transfer" | "adjustment"
      organization_role: "owner" | "admin" | "manager" | "member" | "viewer"
      payment_status: "unpaid" | "partial" | "paid" | "refunded"
      unidade: "juazeiro_norte" | "fortaleza"
      user_type: "admin" | "viewer" | "gerente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      abc_category_enum: ["A", "B", "C"],
      alert_priority: ["low", "medium", "high", "critical"],
      alert_status: ["pending", "sent", "read", "dismissed"],
      alert_type: ["near_expiry", "expired", "critical"],
      classification_frequency_enum: ["daily", "weekly", "monthly"],
      notification_frequency: ["realtime", "daily", "weekly"],
      notification_method: ["email", "sms", "push", "in_app"],
      order_status: [
        "draft",
        "pending",
        "approved",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      order_type: ["purchase", "sale", "transfer", "adjustment"],
      organization_role: ["owner", "admin", "manager", "member", "viewer"],
      payment_status: ["unpaid", "partial", "paid", "refunded"],
      unidade: ["juazeiro_norte", "fortaleza"],
      user_type: ["admin", "viewer", "gerente"],
    },
  },
} as const
