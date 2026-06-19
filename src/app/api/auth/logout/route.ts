import { NextRequest, NextResponse } from 'next/server';
import { logActionServer } from '@/lib/logger';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (typeof userId !== 'number') {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    // Revocar refresh tokens del usuario
    try {
      await prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });
    } catch {
      // no crítico
    }

    try {
      await logActionServer({ userId, action: 'logout', meta: {}, updateLastSeen: true });
    } catch (e) {
      console.warn('No se pudo registrar log de logout', e);
    }
    try { await (prisma as any).user.update({ where: { id: userId }, data: { lastSeen: new Date() } }); } catch {}

    const response = NextResponse.json({ ok: true });

    response.cookies.set('auth-token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0 });
    response.cookies.set('refresh-token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth/refresh', maxAge: 0 });

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: 'Error en logout', details: e.message }, { status: 500 });
  }
}
