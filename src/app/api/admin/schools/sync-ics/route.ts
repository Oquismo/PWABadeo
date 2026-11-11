import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { syncTeamupEvents, SyncError } from '@/lib/teamup-sync';
import { verifyAccessToken } from '@/lib/auth-tokens';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

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

    const results = await syncTeamupEvents((m) => console.log(m));

    return NextResponse.json({
      message: 'ICS sync completed - mirror mode',
      results,
    });
  } catch (error) {
    console.error('[sync-ics] Error:', error);
    if (error instanceof SyncError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await (prisma as any).schoolEvent.findMany({
      where: {
        date: { gte: today },
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by school
    const bySchool = new Map<number, any>();
    for (const event of events) {
      const schoolId = event.school.id;
      if (!bySchool.has(schoolId)) {
        bySchool.set(schoolId, {
          school: event.school,
          events: [],
        });
      }
      bySchool.get(schoolId)!.events.push(event);
    }

    return NextResponse.json({
      schools: Array.from(bySchool.values()),
      total: events.length,
    });
  } catch (error) {
    console.error('[sync-ics] GET Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
