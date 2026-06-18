import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const userData = request.headers.get('cookie')?.match(/user=([^;]+)/)?.[1];
    if (!userData) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let user;
    try {
      user = JSON.parse(decodeURIComponent(userData));
    } catch {
      return NextResponse.json({ error: 'Datos de usuario inválidos' }, { status: 401 });
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
