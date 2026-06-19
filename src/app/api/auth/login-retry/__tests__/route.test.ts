import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFindUnique = vi.hoisted(() => vi.fn());
const mockBcryptCompare = vi.hoisted(() => vi.fn());
const mockRefreshCreate = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: mockFindUnique },
    refreshToken: { create: mockRefreshCreate },
  },
}));

vi.mock('@/lib/logger', () => ({
  logActionServer: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/loggerClient', () => ({
  default: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('bcrypt', () => ({
  default: { compare: (...args: any[]) => mockBcryptCompare(...args) },
  compare: (...args: any[]) => mockBcryptCompare(...args),
}));

import { POST } from '../route';

function buildRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/login-retry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRefreshCreate.mockResolvedValue({ id: 1, token: 'test-refresh', userId: 1 });
});

describe('POST /api/auth/login-retry', () => {
  it('logs in successfully with valid credentials', async () => {
    mockFindUnique.mockResolvedValue({
      id: 1, email: 'student@test.com', name: 'Student',
      password: '$2b$10$hashedpassword', role: 'user', schoolId: 5,
    });
    mockBcryptCompare.mockResolvedValue(true);

    const response = await POST(buildRequest({ email: 'student@test.com', password: 'correct123' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe('student@test.com');
    expect(body.user.password).toBeUndefined();
    expect(body.user.role).toBe('user');
  });

  it('logs in successfully as admin', async () => {
    mockFindUnique.mockResolvedValue({
      id: 2, email: 'admin@test.com', password: '$2b$10$hash', role: 'admin',
    });
    mockBcryptCompare.mockResolvedValue(true);

    const response = await POST(buildRequest({ email: 'admin@test.com', password: 'admin123' }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.user.role).toBe('admin');
  });

  it('returns 401 for unknown email', async () => {
    mockFindUnique.mockResolvedValue(null);
    const response = await POST(buildRequest({ email: 'unknown@test.com', password: 'pass123' }));
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error).toBe('Credenciales inválidas');
  });

  it('returns 401 for wrong password', async () => {
    mockFindUnique.mockResolvedValue({
      id: 1, email: 'user@test.com', password: '$2b$10$realhash', role: 'user',
    });
    mockBcryptCompare.mockResolvedValue(false);
    const response = await POST(buildRequest({ email: 'user@test.com', password: 'wrongpass' }));
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error).toBe('Credenciales inválidas');
  });

  it('returns 400 for missing email', async () => {
    const response = await POST(buildRequest({ email: '', password: 'pass123' }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe('Email y contraseña requeridos');
  });

  it('returns 400 for missing password', async () => {
    const response = await POST(buildRequest({ email: 'test@test.com', password: '' }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe('Email y contraseña requeridos');
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/auth/login-retry', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'not-json',
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('retries on database timeout and succeeds', async () => {
    mockFindUnique
      .mockRejectedValueOnce(new Error('Query timeout'))
      .mockResolvedValueOnce({
        id: 1, email: 'user@test.com', password: '$2b$10$hash', role: 'user',
      });
    mockBcryptCompare.mockResolvedValue(true);

    const response = await POST(buildRequest({ email: 'user@test.com', password: 'pass123' }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.user).toBeDefined();
  });

  it('sets auth cookies on success', async () => {
    mockFindUnique.mockResolvedValue({
      id: 1, email: 'user@test.com', name: 'User',
      password: '$2b$10$hash', role: 'user', schoolId: 3,
    });
    mockBcryptCompare.mockResolvedValue(true);

    const response = await POST(buildRequest({ email: 'user@test.com', password: 'pass123' }));
    const cookies = response.headers.getSetCookie();
    expect(cookies.some((c: string) => c.startsWith('auth-token='))).toBe(true);
    expect(cookies.some((c: string) => c.startsWith('refresh-token='))).toBe(true);
  });
});
