import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth-tokens';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const authToken = cookieHeader.match(/auth-token=([^;]+)/)?.[1];
    if (!authToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifyAccessToken(authToken);
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }

    const user = await (prisma as any).user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
    }

    const deleted = await (prisma as any).schoolEvent.deleteMany({});

    console.log(`[clear-events] Admin ${user.email} eliminó ${deleted.count} eventos`);

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      message: `Se eliminaron ${deleted.count} eventos del calendario`,
    });
  } catch (error) {
    console.error('[clear-events] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
