/**
 * Cliente API mejorado con tipos, retry logic y manejo de errores centralizado
 */

import { ApiResponse, ApiError, FetchOptions } from '@/types/api.types';
import loggerClient from '@/lib/loggerClient';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  retryOn?: number[]; // Códigos de estado para reintentar
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  retryOn: [408, 429, 500, 502, 503, 504],
};

/**
 * Espera un tiempo específico
 */
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Realiza una petición con reintentos
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryOptions: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<Response> {
  const { maxRetries = 3, retryDelay = 1000, backoffMultiplier = 2, retryOn = [] } = retryOptions;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Si la respuesta es OK o no es retryable, devolver
      if (response.ok || !retryOn.includes(response.status)) {
        return response;
      }

      // Si es un error retryable y no es el último intento, reintentar
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        loggerClient.debug(
          `Reintento ${attempt + 1}/${maxRetries} después de ${delay}ms (status: ${response.status})`
        );
        await wait(delay);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        loggerClient.debug(`Reintento ${attempt + 1}/${maxRetries} después de ${delay}ms (error de red)`);
        await wait(delay);
      }
    }
  }

  throw lastError || new Error('Error de red desconocido');
}

/**
 * Cliente API principal
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;
  private retryOptions: RetryOptions;

  constructor(baseUrl: string = '', options?: { headers?: HeadersInit; retry?: RetryOptions }) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };
    this.retryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...options?.retry,
    };
  }

  /**
   * Método genérico para hacer peticiones
   */
  private async request<T = unknown>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const { method = 'GET', body, headers = {}, timeout = 30000, retries, ...rest } = options;

    try {
      loggerClient.debug(`API Request: ${method} ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const requestOptions: RequestInit = {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        credentials: 'include',
        signal: controller.signal,
        ...rest,
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      const retryOpts = retries !== undefined ? { ...this.retryOptions, maxRetries: retries } : this.retryOptions;
      const response = await fetchWithRetry(url, requestOptions, retryOpts);

      clearTimeout(timeoutId);

      // Parsear respuesta
      let data: T | ApiError;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      // Manejar errores HTTP
      if (!response.ok) {
        const error = data as ApiError;
        throw new ApiClientError(
          error.error || `HTTP Error ${response.status}`,
          response.status,
          error.code,
          error.details
        );
      }

      loggerClient.debug(`API Response: ${method} ${url} - OK`);

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      loggerClient.error(`API Error: ${method} ${url}`, error);

      if (error instanceof ApiClientError) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'La petición tardó demasiado tiempo',
          };
        }

        return {
          success: false,
          error: error.message || 'Error de red',
        };
      }

      return {
        success: false,
        error: 'Error desconocido',
      };
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, options?: Omit<FetchOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Instancia global del cliente API
export const apiClient = new ApiClient();

// Exports para compatibilidad con código existente
export const api = {
  get: <T = unknown>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    apiClient.get<T>(url, options),
  post: <T = unknown>(url: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    apiClient.post<T>(url, body, options),
  put: <T = unknown>(url: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    apiClient.put<T>(url, body, options),
  patch: <T = unknown>(url: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    apiClient.patch<T>(url, body, options),
  delete: <T = unknown>(url: string, options?: Omit<FetchOptions, 'method'>) =>
    apiClient.delete<T>(url, options),
};
