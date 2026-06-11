import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseICS, extractSchoolName } from '@/lib/ics-parser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ICS_URL = 'https://ics.teamup.com/feed/ksampdkmv21a529vhx/0.ics';

export async function POST(request: Request) {
  try {
    // Auth check
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

    if (user.role !== 'admin' && !user.schoolId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
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
    console.log(`[sync-ics] Parsed ${parsedEvents.length} school events`);

    // Group events by school name
    const eventsBySchool = new Map<string, typeof parsedEvents>();
    for (const event of parsedEvents) {
      if (!eventsBySchool.has(event.rawIcsName)) {
        eventsBySchool.set(event.rawIcsName, []);
      }
      eventsBySchool.get(event.rawIcsName)!.push(event);
    }

    console.log(`[sync-ics] Found ${eventsBySchool.size} unique schools`);

    const results = {
      schoolsCreated: 0,
      schoolsFound: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsSkipped: 0,
      schools: [] as Array<{ name: string; id: number; eventCount: number }>,
    };

    // Process each school
    for (const [schoolName, events] of eventsBySchool) {
      // Find or create school
      let school = await (prisma as any).school.findFirst({
        where: {
          OR: [
            { name: { contains: schoolName, mode: 'insensitive' } },
            { name: { startsWith: schoolName.split(' ')[0], mode: 'insensitive' } },
          ],
        },
      });

      if (!school) {
        // Create school with minimal info
        school = await (prisma as any).school.create({
          data: {
            name: schoolName,
            country: 'Italia',
            type: 'pública',
            level: 'secondaria_secondo',
            description: `Escuela importada desde calendario Teamup (${events.length} eventos)`,
          },
        });
        results.schoolsCreated++;
        console.log(`[sync-ics] Created school: ${schoolName}`);
      } else {
        results.schoolsFound++;
        console.log(`[sync-ics] Found school: ${school.name} (ICS: ${schoolName})`);
      }

      // Process events for this school
      for (const event of events) {
        // Check if event already exists (by UID)
        const existing = await (prisma as any).schoolEvent.findFirst({
          where: { uid: event.uid },
        });

        const eventData = {
          title: event.summary,
          description: event.description,
          date: event.dtStart,
          endDate: event.dtEnd,
          location: event.location,
          category: event.categories.join(', '),
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
              uid: event.uid,
            },
          });
          results.eventsCreated++;
        }
      }

      results.schools.push({
        name: school.name,
        id: school.id,
        eventCount: events.length,
      });
    }

    return NextResponse.json({
      message: 'ICS sync completed',
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
    // Get all school events grouped by school
    const events = await (prisma as any).schoolEvent.findMany({
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
