import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/active-users -> usuarios con lastSeen en últimos 5 minutos
export async function GET() {
  try {
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const users = await (prisma as any).user.findMany({
      where: { lastSeen: { gte: since } },
      select: { id: true, email: true, role: true, lastSeen: true }
    });
    return NextResponse.json({ users, windowMinutes: 5 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error obteniendo usuarios activos', details: e.message }, { status: 500 });
  }
}
