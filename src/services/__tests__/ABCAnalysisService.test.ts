// =====================================================
// TESTS: ABCAnalysisService - Testes unitários do serviço ABC
// =====================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import ABCAnalysisService from '../ABCAnalysisService';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    },
    rpc: vi.fn()
  }
}));

describe('ABCAnalysisService', () => {
  describe('calculateEOQ', () => {
    it('should calculate EOQ correctly with valid inputs', () => {
      const result = ABCAnalysisService.calculateEOQ({
        annual_demand: 1200,
        ordering_cost: 100,
        unit_cost: 25,
        carrying_cost_percentage: 25
      });
      
      expect(result.eoq).toBeGreaterThan(0);
      expect(result.orders_per_year).toBeGreaterThan(0);
      expect(result.time_between_orders_days).toBeGreaterThan(0);
      expect(result.total_annual_cost).toBeGreaterThan(0);
    });
    
    it('should return zeros when annual_demand is zero', () => {
      const result = ABCAnalysisService.calculateEOQ({
        annual_demand: 0,
        ordering_cost: 100,
        unit_cost: 25,
        carrying_cost_percentage: 25
      });
      
      expect(result.eoq).toBe(0);
      expect(result.orders_per_year).toBe(0);
    });
    
    it('should calculate EOQ correctly for high volume', () => {
      const result = ABCAnalysisService.calculateEOQ({
        annual_demand: 12000,
        ordering_cost: 200,
        unit_cost: 50,
        carrying_cost_percentage: 20
      });
      
      expect(result.eoq).toBeGreaterThan(100);
      expect(result.orders_per_year).toBeGreaterThan(1);
    });
    
    it('should handle decimal values correctly', () => {
      const result = ABCAnalysisService.calculateEOQ({
        annual_demand: 1234.56,
        ordering_cost: 99.99,
        unit_cost: 24.95,
        carrying_cost_percentage: 24.5
      });
      
      expect(result.eoq).toBeGreaterThan(0);
      expect(typeof result.eoq).toBe('number');
    });
  });
  
  describe('calculateReorderPoint', () => {
    it('should calculate ROP correctly', () => {
      const result = ABCAnalysisService.calculateReorderPoint(
        1200, // annual_demand
        7,    // lead_time_days
        50    // safety_stock
      );
      
      const dailyDemand = 1200 / 365;
      const expectedROP = (dailyDemand * 7) + 50;
      
      expect(result).toBeCloseTo(expectedROP, 2);
    });
    
    it('should handle zero safety stock', () => {
      const result = ABCAnalysisService.calculateReorderPoint(
        1200,
        7,
        0
      );
      
      const dailyDemand = 1200 / 365;
      const expectedROP = dailyDemand * 7;
      
      expect(result).toBeCloseTo(expectedROP, 2);
    });
    
    it('should handle zero lead time', () => {
      const result = ABCAnalysisService.calculateReorderPoint(
        1200,
        0,
        50
      );
      
      expect(result).toBe(50);
    });
  });
  
  describe('calculateSafetyStock', () => {
    const mockConfig = {
      id: '123',
      organization_id: '456',
      category_a_threshold: 80,
      category_b_threshold: 95,
      analysis_period_months: 12,
      auto_classify: true,
      classification_frequency: 'monthly' as const,
      include_zero_demand: false,
      default_carrying_cost_percentage: 25,
      default_ordering_cost: 100,
      safety_stock_a_percentage: 25,
      safety_stock_b_percentage: 15,
      safety_stock_c_percentage: 5,
      review_interval_a_days: 7,
      review_interval_b_days: 30,
      review_interval_c_days: 90,
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    };
    
    it('should calculate safety stock for category A', () => {
      const result = ABCAnalysisService.calculateSafetyStock(
        1200, // annual_demand
        7,    // lead_time_days
        'A',
        mockConfig
      );
      
      const dailyDemand = 1200 / 365;
      const expected = dailyDemand * 7 * 0.25;
      
      expect(result).toBeCloseTo(expected, 2);
    });
    
    it('should calculate safety stock for category B', () => {
      const result = ABCAnalysisService.calculateSafetyStock(
        1200,
        7,
        'B',
        mockConfig
      );
      
      const dailyDemand = 1200 / 365;
      const expected = dailyDemand * 7 * 0.15;
      
      expect(result).toBeCloseTo(expected, 2);
    });
    
    it('should calculate safety stock for category C', () => {
      const result = ABCAnalysisService.calculateSafetyStock(
        1200,
        7,
        'C',
        mockConfig
      );
      
      const dailyDemand = 1200 / 365;
      const expected = dailyDemand * 7 * 0.05;
      
      expect(result).toBeCloseTo(expected, 2);
    });
  });
  
  describe('Pareto Principle Validation', () => {
    it('should follow 80/20 rule approximately', () => {
      // Simular distribuição de produtos
      const products = [
        { value: 8000, category: 'A' },  // 80% do valor
        { value: 1500, category: 'B' },  // 15% do valor
        { value: 500, category: 'C' }    // 5% do valor
      ];
      
      const totalValue = products.reduce((sum, p) => sum + p.value, 0);
      
      const categoryA = products.filter(p => p.category === 'A');
      const categoryAValue = categoryA.reduce((sum, p) => sum + p.value, 0);
      const categoryAPercentage = (categoryAValue / totalValue) * 100;
      
      // Categoria A deve representar aproximadamente 80% do valor
      expect(categoryAPercentage).toBeGreaterThanOrEqual(75);
      expect(categoryAPercentage).toBeLessThanOrEqual(85);
    });
  });
  
  describe('EOQ Formula Validation', () => {
    it('should match manual calculation', () => {
      // Dados de entrada
      const D = 1200;  // annual demand
      const S = 100;   // ordering cost
      const H = 6.25;  // carrying cost per unit (25 * 0.25)
      
      // Cálculo manual: EOQ = √((2 × D × S) / H)
      const manualEOQ = Math.sqrt((2 * D * S) / H);
      
      const result = ABCAnalysisService.calculateEOQ({
        annual_demand: D,
        ordering_cost: S,
        unit_cost: 25,
        carrying_cost_percentage: 25
      });
      
      expect(result.eoq).toBeCloseTo(manualEOQ, 2);
    });
    
    it('should minimize total cost', () => {
      const demand = 1200;
      const orderingCost = 100;
      const unitCost = 25;
      const carryingCostPercentage = 25;
      
      const result = ABCAnalysisService.calculateEOQ({
        annual_demand: demand,
        ordering_cost: orderingCost,
        unit_cost: unitCost,
        carrying_cost_percentage: carryingCostPercentage
      });
      
      // Com EOQ, custo de pedido deve ser aproximadamente igual ao custo de manutenção
      const ordersPerYear = demand / result.eoq;
      const totalOrderingCost = ordersPerYear * orderingCost;
      const avgInventory = result.eoq / 2;
      const holdingCostPerUnit = unitCost * (carryingCostPercentage / 100);
      const totalHoldingCost = avgInventory * holdingCostPerUnit;
      
      // Custos devem ser aproximadamente iguais (característica do EOQ)
      expect(totalOrderingCost).toBeCloseTo(totalHoldingCost, -1);
    });
  });
});

describe('Performance Tests', () => {
  it('should calculate EOQ in under 1ms', () => {
    const start = performance.now();
    
    ABCAnalysisService.calculateEOQ({
      annual_demand: 1200,
      ordering_cost: 100,
      unit_cost: 25,
      carrying_cost_percentage: 25
    });
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(1);
  });
  
  it('should calculate ROP in under 1ms', () => {
    const start = performance.now();
    
    ABCAnalysisService.calculateReorderPoint(1200, 7, 50);
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(1);
  });
});

describe('Edge Cases', () => {
  it('should handle very large values', () => {
    const result = ABCAnalysisService.calculateEOQ({
      annual_demand: 1000000,
      ordering_cost: 10000,
      unit_cost: 1000,
      carrying_cost_percentage: 30
    });
    
    expect(result.eoq).toBeGreaterThan(0);
    expect(Number.isFinite(result.eoq)).toBe(true);
  });
  
  it('should handle very small values', () => {
    const result = ABCAnalysisService.calculateEOQ({
      annual_demand: 10,
      ordering_cost: 1,
      unit_cost: 0.5,
      carrying_cost_percentage: 10
    });
    
    expect(result.eoq).toBeGreaterThan(0);
    expect(Number.isFinite(result.eoq)).toBe(true);
  });
  
  it('should handle negative values gracefully', () => {
    const result = ABCAnalysisService.calculateEOQ({
      annual_demand: -1200,
      ordering_cost: 100,
      unit_cost: 25,
      carrying_cost_percentage: 25
    });
    
    // Deve retornar zeros para valores inválidos
    expect(result.eoq).toBe(0);
  });
});

