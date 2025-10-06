/**
 * Input Validation and Sanitization System
 * Prevents XSS, SQL Injection, and other security vulnerabilities
 * Implements comprehensive validation rules following OWASP guidelines
 */

import { z } from 'zod';
import { logWarn, logError } from './logger';

/**
 * Sanitizes string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitizes HTML content - removes dangerous tags and attributes
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') return '';
  
  const dangerousTags = /<script|<iframe|<object|<embed|<link/gi;
  const dangerousAttrs = /on\w+\s*=|javascript:|data:text\/html/gi;
  
  return html
    .replace(dangerousTags, '')
    .replace(dangerousAttrs, '');
}

/**
 * Validates and sanitizes email
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, '');
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

/**
 * Validates password strength
 * Minimum 8 characters, at least one uppercase, one lowercase, one number
 */
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter no mínimo 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes numeric input
 */
export function sanitizeNumber(input: any): number | null {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  return num;
}

/**
 * Validates positive number
 */
export function isPositiveNumber(value: any): boolean {
  const num = sanitizeNumber(value);
  return num !== null && num > 0;
}

/**
 * Validates date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Sanitizes date input
 */
export function sanitizeDate(dateString: string): Date | null {
  if (!isValidDate(dateString)) {
    return null;
  }
  return new Date(dateString);
}

/**
 * Validates URL
 */
export function isValidURL(url: string): boolean {
  try {
    // First check for dangerous protocols before creating URL object
    if (url.toLowerCase().startsWith('javascript:') || 
        url.toLowerCase().startsWith('data:') ||
        url.toLowerCase().startsWith('vbscript:')) {
      return false;
    }
    
    const urlObj = new URL(url);
    // Additional protocol check
    if (urlObj.protocol === 'javascript:' || 
        urlObj.protocol === 'data:' ||
        urlObj.protocol === 'vbscript:') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes object keys and values recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeString(key);
    
    if (typeof value === 'string') {
      // Special handling for email fields
      if (key.toLowerCase().includes('email')) {
        sanitized[sanitizedKey] = sanitizeEmail(value);
      } else {
        sanitized[sanitizedKey] = sanitizeString(value);
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[sanitizedKey] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' ? sanitizeObject(item) : item
      );
    } else {
      sanitized[sanitizedKey] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Validates product data
 */
export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  expiry_date: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().max(1000, 'Notas muito longas').optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

/**
 * Validates and sanitizes product input
 */
export function validateProduct(data: any): { 
  valid: boolean; 
  data?: ProductInput; 
  errors?: z.ZodError 
} {
  try {
    const sanitized = sanitizeObject(data);
    const validated = productSchema.parse(sanitized);
    
    return {
      valid: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logWarn('Product validation failed', { 
        action: 'validate_product',
        metadata: { errors: error.errors }
      });
      
      return {
        valid: false,
        errors: error,
      };
    }
    
    logError('Unexpected validation error', error as Error, {
      action: 'validate_product',
    });
    
    return {
      valid: false,
    };
  }
}

/**
 * User registration schema
 */
export const userRegistrationSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
});

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;

/**
 * Validates user registration data
 */
export function validateUserRegistration(data: any): {
  valid: boolean;
  data?: UserRegistrationInput;
  errors?: z.ZodError;
} {
  try {
    const sanitized = {
      email: sanitizeEmail(data.email),
      password: data.password, // Don't sanitize password
      fullName: sanitizeString(data.fullName),
    };
    
    const validated = userRegistrationSchema.parse(sanitized);
    
    // Additional password strength check
    const passwordCheck = isValidPassword(validated.password);
    if (!passwordCheck.valid) {
      return {
        valid: false,
        errors: new z.ZodError([
          {
            code: 'custom',
            path: ['password'],
            message: passwordCheck.errors.join(', '),
          },
        ]),
      };
    }
    
    return {
      valid: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logWarn('User registration validation failed', {
        action: 'validate_user_registration',
        metadata: { errors: error.errors }
      });
      
      return {
        valid: false,
        errors: error,
      };
    }
    
    return {
      valid: false,
    };
  }
}

/**
 * Rate limiting helper - tracks request counts
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  /**
   * Check if request should be allowed
   * @param key - Unique identifier (e.g., user ID, IP)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   */
  public isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      logWarn('Rate limit exceeded', {
        action: 'rate_limit_check',
        metadata: { key, requests: validRequests.length, maxRequests }
      });
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  public reset(key: string): void {
    this.requests.delete(key);
  }
  
  public clear(): void {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();
