/**
 * Standardized API Response System
 * Implements consistent response format across all API calls
 * Following REST best practices and HTTP status codes
 */

import { logError, logInfo } from './logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  metadata?: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMetadata;
  };
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * Creates a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  metadata?: Partial<ApiResponse['metadata']>
): ApiResponse<T> {
  logInfo('API Success Response', {
    action: 'api_response',
    metadata: { message, hasData: !!data }
  });

  return {
    success: true,
    data,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
}

/**
 * Creates an error API response
 */
export function createErrorResponse(
  errors: ApiError[],
  message?: string,
  metadata?: Partial<ApiResponse['metadata']>
): ApiResponse {
  logError('API Error Response', undefined, {
    action: 'api_response',
    metadata: { message, errors }
  });

  return {
    success: false,
    message: message || 'Ocorreu um erro ao processar sua solicitação',
    errors,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
}

/**
 * Creates a validation error response
 */
export function createValidationErrorResponse(
  validationErrors: Array<{ field: string; message: string }>
): ApiResponse {
  const errors: ApiError[] = validationErrors.map(err => ({
    code: ErrorCode.VALIDATION_ERROR,
    message: err.message,
    field: err.field,
  }));

  return createErrorResponse(
    errors,
    'Erro de validação. Verifique os campos e tente novamente.'
  );
}

/**
 * Creates an authentication error response
 */
export function createAuthenticationErrorResponse(
  message: string = 'Autenticação necessária. Faça login para continuar.'
): ApiResponse {
  return createErrorResponse(
    [{
      code: ErrorCode.AUTHENTICATION_ERROR,
      message,
    }],
    message
  );
}

/**
 * Creates an authorization error response
 */
export function createAuthorizationErrorResponse(
  message: string = 'Você não tem permissão para realizar esta ação.'
): ApiResponse {
  return createErrorResponse(
    [{
      code: ErrorCode.AUTHORIZATION_ERROR,
      message,
    }],
    message
  );
}

/**
 * Creates a not found error response
 */
export function createNotFoundErrorResponse(
  resource: string = 'Recurso'
): ApiResponse {
  return createErrorResponse(
    [{
      code: ErrorCode.NOT_FOUND,
      message: `${resource} não encontrado.`,
    }],
    `${resource} não encontrado.`
  );
}

/**
 * Creates a rate limit error response
 */
export function createRateLimitErrorResponse(
  retryAfter?: number
): ApiResponse {
  const message = retryAfter
    ? `Muitas requisições. Tente novamente em ${retryAfter} segundos.`
    : 'Muitas requisições. Aguarde alguns instantes antes de tentar novamente.';

  return createErrorResponse(
    [{
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message,
      details: { retryAfter },
    }],
    message
  );
}

/**
 * Creates a database error response
 */
export function createDatabaseErrorResponse(
  error?: Error
): ApiResponse {
  const isDevelopment = import.meta.env.DEV;
  
  return createErrorResponse(
    [{
      code: ErrorCode.DATABASE_ERROR,
      message: 'Erro ao acessar o banco de dados.',
      details: isDevelopment ? error?.message : undefined,
    }],
    'Erro ao processar sua solicitação. Tente novamente.'
  );
}

/**
 * Creates a network error response
 */
export function createNetworkErrorResponse(): ApiResponse {
  return createErrorResponse(
    [{
      code: ErrorCode.NETWORK_ERROR,
      message: 'Erro de conexão. Verifique sua internet e tente novamente.',
    }],
    'Erro de conexão. Verifique sua internet e tente novamente.'
  );
}

/**
 * Creates pagination metadata
 */
export function createPaginationMetadata(
  page: number,
  pageSize: number,
  totalItems: number
): PaginationMetadata {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

/**
 * Handles API errors and converts them to standardized responses
 */
export function handleApiError(error: any): ApiResponse {
  // Supabase errors
  if (error?.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return createErrorResponse(
          [{
            code: ErrorCode.DUPLICATE_ENTRY,
            message: 'Este registro já existe.',
            details: error.details,
          }],
          'Este registro já existe.'
        );
      
      case '23503': // Foreign key violation
        return createErrorResponse(
          [{
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Não é possível realizar esta operação devido a dependências.',
            details: error.details,
          }],
          'Não é possível realizar esta operação devido a dependências.'
        );
      
      case 'PGRST116': // No rows returned
        return createNotFoundErrorResponse();
      
      default:
        return createDatabaseErrorResponse(error);
    }
  }
  
  // Network errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return createNetworkErrorResponse();
  }
  
  // Rate limit errors
  if (error?.status === 429 || error?.message?.includes('rate limit')) {
    return createRateLimitErrorResponse();
  }
  
  // Authentication errors
  if (error?.status === 401 || error?.message?.includes('auth')) {
    return createAuthenticationErrorResponse();
  }
  
  // Authorization errors
  if (error?.status === 403) {
    return createAuthorizationErrorResponse();
  }
  
  // Generic error
  logError('Unhandled API error', error);
  
  return createErrorResponse(
    [{
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Erro interno do servidor.',
      details: import.meta.env.DEV ? error?.message : undefined,
    }],
    'Ocorreu um erro inesperado. Tente novamente.'
  );
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return createSuccessResponse(data);
  } catch (error) {
    const response = handleApiError(error);
    if (errorMessage) {
      response.message = errorMessage;
    }
    return response;
  }
}
