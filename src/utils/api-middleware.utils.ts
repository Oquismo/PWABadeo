/**
 * Middleware y utilidades para rutas API de Next.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiError, ApiResponse } from '@/types/api.types';
import loggerClient from '@/lib/loggerClient';

export type ApiHandler<T = unknown> = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<ApiResponse<T> | NextResponse>;

/**
 * Wrapper para manejar errores de forma consistente en todas las APIs
 */
export function withErrorHandling<T = unknown>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (request: NextRequest, context?: { params: Record<string, string> }) => {
    try {
      return await handler(request, context);
    } catch (error) {
      loggerClient.error('API Error:', error);

      const apiError: ApiError = {
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        details: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(apiError, { status: 500 });
    }
  };
}

/**
 * Valida que el request tenga un body válido
 */
export async function validateRequestBody<T = unknown>(
  request: NextRequest,
  requiredFields?: string[]
): Promise<{ data: T | null; error: NextResponse | null }> {
  try {
    const body = await request.json();

    if (requiredFields) {
      const missingFields = requiredFields.filter((field) => !(field in body));

      if (missingFields.length > 0) {
        return {
          data: null,
          error: NextResponse.json(
            {
              error: 'Campos requeridos faltantes',
              details: `Faltan los siguientes campos: ${missingFields.join(', ')}`,
            } as ApiError,
            { status: 400 }
          ),
        };
      }
    }

    return { data: body as T, error: null };
  } catch (error) {
    return {
      data: null,
      error: NextResponse.json(
        {
          error: 'JSON inválido en el cuerpo de la petición',
          details: error instanceof Error ? error.message : undefined,
        } as ApiError,
        { status: 400 }
      ),
    };
  }
}

/**
 * Crea una respuesta de éxito consistente
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  return NextResponse.json(response, { status });
}

/**
 * Crea una respuesta de error consistente
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  details?: string,
  code?: string
): NextResponse {
  const apiError: ApiError = {
    error,
    details,
    code,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(apiError, { status });
}

/**
 * Valida parámetros de query
 */
export function getQueryParams<T extends Record<string, string>>(
  request: NextRequest,
  expectedParams: string[]
): { data: Partial<T>; missing: string[] } {
  const { searchParams } = new URL(request.url);
  const data: Partial<T> = {};
  const missing: string[] = [];

  expectedParams.forEach((param) => {
    const value = searchParams.get(param);
    if (value) {
      data[param as keyof T] = value as T[keyof T];
    } else {
      missing.push(param);
    }
  });

  return { data, missing };
}

/**
 * Parsea y valida un ID numérico
 */
export function parseNumericId(id: string | undefined, fieldName: string = 'id'): {
  id: number | null;
  error: NextResponse | null;
} {
  if (!id) {
    return {
      id: null,
      error: createErrorResponse(`${fieldName} es requerido`, 400),
    };
  }

  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return {
      id: null,
      error: createErrorResponse(`${fieldName} debe ser un número válido`, 400),
    };
  }

  return { id: numericId, error: null };
}

/**
 * Rate limiting simple (puede mejorarse con Redis)
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || record.resetAt < now) {
    requestCounts.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  record.count++;

  if (record.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Limpia registros antiguos de rate limiting
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (record.resetAt < now) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Limpiar cada minuto

/**
 * Extrae IP del cliente
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Middleware para logging de requests
 */
export function withLogging<T = unknown>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (request: NextRequest, context?: { params: Record<string, string> }) => {
    const start = Date.now();
    const method = request.method;
    const url = request.url;

    loggerClient.info(`→ ${method} ${url}`);

    const response = await handler(request, context);

    const duration = Date.now() - start;
    const status = response instanceof NextResponse ? response.status : 200;

    loggerClient.info(`← ${method} ${url} - ${status} (${duration}ms)`);

    return response;
  };
}

/**
 * Compone múltiples middlewares
 */
export function composeMiddleware<T = unknown>(...middlewares: Array<(handler: ApiHandler<T>) => ApiHandler<T>>) {
  return (handler: ApiHandler<T>): ApiHandler<T> => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

/**
 * Middleware común para todas las APIs
 */
export const withApiMiddleware = composeMiddleware(withErrorHandling, withLogging);
