import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

interface RetryState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
}

export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  options: UseRetryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 1.5
  } = options;

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    retryCount: 0
  });

  const executeWithRetry = useCallback(async (): Promise<T> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await asyncFunction();
        setState({
          isLoading: false,
          error: null,
          retryCount: attempt
        });
        return result;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        
        if (isLastAttempt) {
          setState({
            isLoading: false,
            error: error as Error,
            retryCount: attempt
          });
          throw error;
        }

        // Calcular delay con backoff exponencial
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error);
        
        setState(prev => ({ 
          ...prev, 
          retryCount: attempt + 1,
          error: error as Error 
        }));

        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }, [asyncFunction, maxRetries, retryDelay, backoffMultiplier]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      retryCount: 0
    });
  }, []);

  return {
    ...state,
    execute: executeWithRetry,
    reset
  };
}

// Hook específico para APIs que pueden sufrir cold starts
export function useApiWithRetry(url: string, options?: RequestInit) {
  return useRetry(
    async () => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    {
      maxRetries: 3,
      retryDelay: 2000, // 2 segundos inicial para cold starts
      backoffMultiplier: 1.5
    }
  );
}
