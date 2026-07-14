import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseICS } from '@/lib/ics-parser';
import { verifyAccessToken } from '@/lib/auth-tokens';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ICS_URL = 'https://ics.teamup.com/feed/ksampdkmv21a529vhx/0.ics';

const PROGRAM_SUFFIXES = ['VET', 'ADU', 'PCTO', 'Job Shadowing', 'Short'];

function findSchoolInDB(schoolName: string, allSchools: any[]): any {
  const target = schoolName.toLowerCase();

  let match = allSchools.find((s: any) => s.name.toLowerCase() === target);
  if (match) return match;

  for (const suffix of PROGRAM_SUFFIXES) {
    const suffixed = `${schoolName} ${suffix}`.toLowerCase();
    match = allSchools.find((s: any) => s.name.toLowerCase() === suffixed);
    if (match) return match;
  }

  return null;
}

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

    // Fetch ICS
    console.log('[sync-ics] Fetching ICS from Teamup...');
    const res = await fetch(ICS_URL, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Error fetching ICS: ${res.status}` },
        { status: 502 }
      );
    }

    const icsContent = await res.text();
    console.log('[sync-ics] ICS fetched, parsing...');

    // Parse events
    const parsedEvents = parseICS(icsContent);
    console.log(`[sync-ics] Parsed ${parsedEvents.length} raw events`);

    // SOLO eventos de la próxima semana (7 días)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const weekEvents = parsedEvents.filter(ev => {
      const eventDate = new Date(ev.dtStart);
      return eventDate >= today && eventDate < weekEnd;
    });
    
    console.log(`[sync-ics] Filtered to ${weekEvents.length} events in next 7 days`);

    // Get all existing schools
    const allSchools = await (prisma as any).school.findMany();
    console.log(`[sync-ics] Found ${allSchools.length} schools in DB`);

    const results = {
      schoolsCreated: 0,
      schoolsFound: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      eventsObsolete: 0,
      schools: [] as Array<{ name: string; dbId: number | null; eventCount: number }>,
    };

    const schoolEventCounts = new Map<number, number>();

    const currentUids = new Set<string>();

    console.log('[sync-ics] Cleaning old events...');

    const deletedPast = await (prisma as any).schoolEvent.deleteMany({
      where: { date: { lt: today } },
    });
    results.eventsDeleted = deletedPast.count;
    console.log(`[sync-ics] Deleted ${deletedPast.count} past events`);

    for (const event of weekEvents) {
      for (const schoolName of event.schoolNames) {
        let school = findSchoolInDB(schoolName, allSchools);

        if (!school) {
          school = await (prisma as any).school.create({
            data: {
              name: schoolName,
              country: 'Italia',
              type: 'pública',
              level: 'secondaria_secondo',
              description: 'Escuela activa en Teamup',
            },
          });
          allSchools.push(school);
          results.schoolsCreated++;
          console.log(`[sync-ics] Created school: ${schoolName}`);
        } else {
          results.schoolsFound++;
          console.log(`[sync-ics] Matched "${schoolName}" -> DB: "${school.name}"`);
        }

        const perSchoolUid = `${event.uid}::${school.id}`;
        currentUids.add(perSchoolUid);

        const existing = await (prisma as any).schoolEvent.findFirst({
          where: { uid: perSchoolUid },
        });

        const eventData = {
          title: event.summary,
          description: event.description,
          date: event.dtStart,
          endDate: event.dtEnd,
          location: event.location,
          category: event.categories.join(', '),
          program: event.program || null,
          who: event.who,
          isAllDay: event.isAllDay,
          rawSummary: event.summary,
          schoolId: school.id,
        };

        if (existing) {
          await (prisma as any).schoolEvent.update({
            where: { id: existing.id },
            data: eventData,
          });
          results.eventsUpdated++;
        } else {
          await (prisma as any).schoolEvent.create({
            data: {
              ...eventData,
              uid: perSchoolUid,
            },
          });
          results.eventsCreated++;
        }

        schoolEventCounts.set(school.id, (schoolEventCounts.get(school.id) || 0) + 1);
      }
    }

    const dbFutureEvents = await (prisma as any).schoolEvent.findMany({
      where: { date: { gte: today } },
    });

    for (const dbEvent of dbFutureEvents) {
      if (!currentUids.has(dbEvent.uid)) {
        await (prisma as any).schoolEvent.delete({
          where: { id: dbEvent.id },
        });
        results.eventsObsolete++;
      }
    }
    console.log(`[sync-ics] Deleted ${results.eventsObsolete} obsolete events (removed from ICS)`);

    for (const [schoolId, count] of schoolEventCounts) {
      const school = allSchools.find((s: any) => s.id === schoolId);
      results.schools.push({
        name: school?.name || '',
        dbId: schoolId,
        eventCount: count,
      });
    }

    return NextResponse.json({
      message: 'ICS sync completed - mirror mode',
      results,
    });
  } catch (error) {
    console.error('[sync-ics] Error:', error);
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
