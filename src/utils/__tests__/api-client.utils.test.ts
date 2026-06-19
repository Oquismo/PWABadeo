import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient, ApiClientError } from '../api-client.utils';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('ApiClient', () => {
  const client = new ApiClient('http://test.local', {
    retry: { maxRetries: 0, retryDelay: 1 },
  });

  describe('GET', () => {
    it('makes a successful GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: 'ok' }),
      });

      const res = await client.get('/test');
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ data: 'ok' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.local/test',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('includes credentials by default', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({}),
      });

      await client.get('/test');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  describe('POST', () => {
    it('makes a successful POST with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ id: 1 }),
      });

      const res = await client.post('/create', { name: 'test' });
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ id: 1 });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.local/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('returns error on HTTP 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ error: 'Bad request' }),
      });

      const res = await client.get('/bad');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Bad request');
    });

    it('returns error on HTTP 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ error: 'No autorizado' }),
      });

      const res = await client.get('/unauthorized');
      expect(res.success).toBe(false);
      expect(res.error).toBe('No autorizado');
    });

    it('returns error on HTTP 403', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ error: 'Prohibido' }),
      });

      const res = await client.get('/forbidden');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Prohibido');
    });

    it('returns error on HTTP 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ error: 'Error interno' }),
      });

      const res = await client.get('/server-error');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Error interno');
    });
  });

  describe('retry logic', () => {
    it('retries on 503 and succeeds', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({ error: 'Service unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({ success: true }),
        });

      const res = await client.get('/retry-test', { retries: 1, retryDelay: 10 });
      expect(res.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('fails after exhausting retries', async () => {
      const errorResponse = {
        ok: false,
        status: 503,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ error: 'Service unavailable' }),
      };

      mockFetch
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse);

      const clientWithRetries = new ApiClient('http://test.local', {
        retry: { maxRetries: 2, retryDelay: 10, backoffMultiplier: 1 },
      });

      const res = await clientWithRetries.get('/fail');
      expect(res.success).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('does not retry on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ error: 'Bad request' }),
      });

      await client.get('/bad-request');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('network errors', () => {
    it('handles fetch abort (timeout)', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const res = await client.get('/timeout', { timeout: 1 });
      expect(res.success).toBe(false);
      expect(res.error).toBe('La petición tardó demasiado tiempo');
    });

    it('handles network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const res = await client.get('/network-fail');
      expect(res.success).toBe(false);
    });
  });

  describe('non-JSON responses', () => {
    it('handles text responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'text/plain' },
        text: () => Promise.resolve('OK'),
      });

      const res = await client.get('/text');
      expect(res.success).toBe(true);
      expect(res.data).toBe('OK');
    });
  });
});
