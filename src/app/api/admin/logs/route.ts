import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/logs?action=&userId=&q=&page=1&pageSize=20
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || undefined;
    const userId = url.searchParams.get('userId');
    const q = url.searchParams.get('q') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '20'), 100);

    const where: any = {};
    if (action) where.action = action;
    if (userId) where.userId = parseInt(userId);
    if (q) {
      where.OR = [
        { action: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const [items, total] = await Promise.all([
      (prisma as any).log.findMany({
        where,
        include: { user: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      (prisma as any).log.count({ where })
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error obteniendo logs', details: e.message }, { status: 500 });
  }
}
