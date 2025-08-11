import { NextResponse } from 'next/server';
import { logActionServer } from '@/lib/logger';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Espera body: { userId: number }
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (typeof userId !== 'number') {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }
    try {
      await logActionServer({ userId, action: 'logout', meta: {}, updateLastSeen: true });
    } catch (e) {
      console.warn('No se pudo registrar log de logout', e);
    }
    // Actualizar lastSeen inmediato
    try { await (prisma as any).user.update({ where: { id: userId }, data: { lastSeen: new Date() } }); } catch {}
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error en logout', details: e.message }, { status: 500 });
  }
}
