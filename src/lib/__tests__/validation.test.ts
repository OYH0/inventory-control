/**
 * Validation System Tests
 * Comprehensive test suite for input validation and sanitization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeString,
  sanitizeHTML,
  sanitizeEmail,
  isValidEmail,
  isValidPassword,
  sanitizeNumber,
  isPositiveNumber,
  isValidDate,
  sanitizeDate,
  isValidURL,
  sanitizeObject,
  validateProduct,
  validateUserRegistration,
  rateLimiter,
} from '../validation';

describe('String Sanitization', () => {
  it('should remove dangerous HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const result = sanitizeString(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  it('should remove javascript: protocol', () => {
    const input = 'javascript:alert("xss")';
    const result = sanitizeString(input);
    expect(result).not.toContain('javascript:');
  });

  it('should remove event handlers', () => {
    const input = 'onclick=alert("xss")';
    const result = sanitizeString(input);
    expect(result).not.toContain('onclick=');
  });

  it('should trim whitespace', () => {
    const input = '  hello  ';
    const result = sanitizeString(input);
    expect(result).toBe('hello');
  });
});

describe('HTML Sanitization', () => {
  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<script>');
  });

  it('should remove iframe tags', () => {
    const input = '<iframe src="evil.com"></iframe>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<iframe');
  });

  it('should remove event handlers', () => {
    const input = '<div onclick="alert()">Click</div>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('onclick');
  });
});

describe('Email Validation', () => {
  it('should validate correct email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('should sanitize email', () => {
    const input = '  TEST@EXAMPLE.COM  ';
    const result = sanitizeEmail(input);
    expect(result).toBe('test@example.com');
  });
});

describe('Password Validation', () => {
  it('should accept strong password', () => {
    const result = isValidPassword('Test1234');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject short password', () => {
    const result = isValidPassword('Test12');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Senha deve ter no mínimo 8 caracteres');
  });

  it('should reject password without uppercase', () => {
    const result = isValidPassword('test1234');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Senha deve conter pelo menos uma letra maiúscula');
  });

  it('should reject password without lowercase', () => {
    const result = isValidPassword('TEST1234');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Senha deve conter pelo menos uma letra minúscula');
  });

  it('should reject password without number', () => {
    const result = isValidPassword('TestTest');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Senha deve conter pelo menos um número');
  });
});

describe('Number Validation', () => {
  it('should sanitize valid number', () => {
    expect(sanitizeNumber('123')).toBe(123);
    expect(sanitizeNumber(456)).toBe(456);
  });

  it('should return null for invalid number', () => {
    expect(sanitizeNumber('abc')).toBeNull();
    expect(sanitizeNumber(NaN)).toBeNull();
    expect(sanitizeNumber(Infinity)).toBeNull();
  });

  it('should validate positive number', () => {
    expect(isPositiveNumber(10)).toBe(true);
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber(-5)).toBe(false);
  });
});

describe('Date Validation', () => {
  it('should validate correct date', () => {
    expect(isValidDate('2025-01-01')).toBe(true);
    expect(isValidDate('2025-12-31T23:59:59')).toBe(true);
  });

  it('should reject invalid date', () => {
    expect(isValidDate('invalid-date')).toBe(false);
    expect(isValidDate('2025-13-01')).toBe(false);
  });

  it('should sanitize date', () => {
    const result = sanitizeDate('2025-01-01');
    expect(result).toBeInstanceOf(Date);
    // Check if the date is valid and close to expected year (accounting for timezone)
    expect(result?.getFullYear()).toBeGreaterThanOrEqual(2024);
    expect(result?.getFullYear()).toBeLessThanOrEqual(2025);
  });
});

describe('URL Validation', () => {
  it('should validate correct URL', () => {
    expect(isValidURL('https://example.com')).toBe(true);
    expect(isValidURL('http://localhost:3000')).toBe(true);
  });

  it('should reject invalid URL', () => {
    expect(isValidURL('not-a-url')).toBe(false);
    expect(isValidURL('javascript:alert()')).toBe(false);
  });
});

describe('Object Sanitization', () => {
  it('should sanitize object values', () => {
    const input = {
      name: '<script>alert()</script>John',
      email: '  TEST@EXAMPLE.COM  ',
    };
    const result = sanitizeObject(input);
    expect(result.name).not.toContain('<script>');
    expect(result.email).toBe('test@example.com');
  });

  it('should sanitize nested objects', () => {
    const input = {
      user: {
        name: '<script>alert()</script>John',
      },
    };
    const result = sanitizeObject(input);
    expect(result.user.name).not.toContain('<script>');
  });

  it('should sanitize arrays', () => {
    const input = {
      tags: ['<script>tag1</script>', 'tag2'],
    };
    const result = sanitizeObject(input);
    expect(result.tags[0]).not.toContain('<script>');
  });
});

describe('Product Validation', () => {
  it('should validate correct product', () => {
    const product = {
      name: 'Test Product',
      quantity: 10,
      unit: 'kg',
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should reject product without name', () => {
    const product = {
      name: '',
      quantity: 10,
      unit: 'kg',
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
  });

  it('should reject product with negative quantity', () => {
    const product = {
      name: 'Test Product',
      quantity: -5,
      unit: 'kg',
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
  });
});

describe('User Registration Validation', () => {
  it('should validate correct registration', () => {
    const data = {
      email: 'test@example.com',
      password: 'Test1234',
      fullName: 'John Doe',
    };
    const result = validateUserRegistration(data);
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should reject invalid email', () => {
    const data = {
      email: 'invalid-email',
      password: 'Test1234',
      fullName: 'John Doe',
    };
    const result = validateUserRegistration(data);
    expect(result.valid).toBe(false);
  });

  it('should reject weak password', () => {
    const data = {
      email: 'test@example.com',
      password: 'weak',
      fullName: 'John Doe',
    };
    const result = validateUserRegistration(data);
    expect(result.valid).toBe(false);
  });
});

describe('Rate Limiter', () => {
  beforeEach(() => {
    rateLimiter.clear();
  });

  it('should allow requests within limit', () => {
    expect(rateLimiter.isAllowed('test-key', 3, 1000)).toBe(true);
    expect(rateLimiter.isAllowed('test-key', 3, 1000)).toBe(true);
    expect(rateLimiter.isAllowed('test-key', 3, 1000)).toBe(true);
  });

  it('should block requests exceeding limit', () => {
    rateLimiter.isAllowed('test-key', 2, 1000);
    rateLimiter.isAllowed('test-key', 2, 1000);
    expect(rateLimiter.isAllowed('test-key', 2, 1000)).toBe(false);
  });

  it('should reset after time window', async () => {
    rateLimiter.isAllowed('test-key', 1, 100);
    expect(rateLimiter.isAllowed('test-key', 1, 100)).toBe(false);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(rateLimiter.isAllowed('test-key', 1, 100)).toBe(true);
  });

  it('should handle different keys independently', () => {
    rateLimiter.isAllowed('key1', 1, 1000);
    expect(rateLimiter.isAllowed('key1', 1, 1000)).toBe(false);
    expect(rateLimiter.isAllowed('key2', 1, 1000)).toBe(true);
  });
});
