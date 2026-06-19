import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json({ error: 'schoolId requerido' }, { status: 400 });
    }

    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await prisma.schoolEvent.findMany({
      where: {
        schoolId: parseInt(schoolId),
        date: { gte: now, lte: endOfDay },
        isAllDay: false,
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        date: true,
        endDate: true,
        location: true,
        who: true,
      },
    });

    return NextResponse.json({ events, count: events.length });
  } catch (error) {
    console.error('[events/upcoming] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
