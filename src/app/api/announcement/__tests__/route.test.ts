import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFindUnique = vi.hoisted(() => vi.fn());
const mockFindFirst = vi.hoisted(() => vi.fn());
const mockCreate = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());
const mockFindManyPush = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  prisma: {
    announcement: {
      findFirst: mockFindFirst,
      create: mockCreate,
      delete: mockDelete,
    },
    user: { findUnique: mockFindUnique },
    pushSubscription: { findMany: mockFindManyPush },
  },
}));

import { GET, POST, DELETE } from '../route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/announcement', () => {
  it('returns the latest announcement', async () => {
    mockFindFirst.mockResolvedValue({
      id: 1,
      message: 'Bienvenidos al nuevo curso',
      createdAt: new Date('2025-09-01').toISOString(),
      user: { name: 'Admin' },
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe('Bienvenidos al nuevo curso');
    expect(body.id).toBe(1);
    expect(body.createdBy).toBe('Admin');
  });

  it('returns null message when no announcements exist', async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBeNull();
  });

  it('returns 500 on database error', async () => {
    mockFindFirst.mockRejectedValue(new Error('DB down'));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBeDefined();
  });
});

describe('POST /api/announcement', () => {
  function buildRequest(body: unknown): Request {
    return new Request('http://localhost/api/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('creates an announcement as admin', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, role: 'admin' });
    mockCreate.mockResolvedValue({ id: 10, message: 'Nuevo anuncio', createdBy: 1 });
    mockFindManyPush.mockResolvedValue([]);

    const res = await POST(buildRequest({ message: 'Nuevo anuncio', userId: 1 }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.announcement.message).toBe('Nuevo anuncio');
  });

  it('rejects non-admin users', async () => {
    mockFindUnique.mockResolvedValue({ id: 2, role: 'user' });

    const res = await POST(buildRequest({ message: 'Hack the planet', userId: 2 }));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toContain('Solo administradores');
  });

  it('rejects empty message', async () => {
    const res = await POST(buildRequest({ message: '   ', userId: 1 }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('mensaje');
  });

  it('rejects missing message field', async () => {
    const res = await POST(buildRequest({ userId: 1 }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('mensaje');
  });

  it('rejects missing userId', async () => {
    const res = await POST(buildRequest({ message: 'Hello' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('userId');
  });

  it('returns 500 on database error', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, role: 'admin' });
    mockCreate.mockRejectedValue(new Error('DB error'));

    const res = await POST(buildRequest({ message: 'Mensaje', userId: 1 }));
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/announcement', () => {
  function buildRequest(body: unknown): Request {
    return new Request('http://localhost/api/announcement', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('deletes the latest announcement as admin', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, role: 'admin' });
    mockFindFirst.mockResolvedValue({ id: 5, message: 'To delete' });

    const res = await DELETE(buildRequest({ userId: 1 }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 5 } });
  });

  it('rejects non-admin users', async () => {
    mockFindUnique.mockResolvedValue({ id: 2, role: 'user' });

    const res = await DELETE(buildRequest({ userId: 2 }));
    expect(res.status).toBe(403);
  });

  it('rejects missing userId', async () => {
    const res = await DELETE(buildRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('userId');
  });

  it('returns 404 when no announcement exists', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, role: 'admin' });
    mockFindFirst.mockResolvedValue(null);

    const res = await DELETE(buildRequest({ userId: 1 }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toContain('No hay anuncio');
  });
});
