import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseICS } from '@/lib/ics-parser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ICS_URL = 'https://ics.teamup.com/feed/ksampdkmv21a529vhx/0.ics';

function findSchoolInDB(schoolName: string, allSchools: any[]): any {
  const target = schoolName.toLowerCase();

  // Only exact match — the ICS parser already normalizes names
  return allSchools.find((s: any) => s.name.toLowerCase() === target) || null;
}

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

    // Group events by school name
    const eventsBySchool = new Map<string, typeof weekEvents>();
    for (const event of weekEvents) {
      if (!eventsBySchool.has(event.schoolName)) {
        eventsBySchool.set(event.schoolName, []);
      }
      eventsBySchool.get(event.schoolName)!.push(event);
    }

    console.log(`[sync-ics] ${eventsBySchool.size} active schools with future events`);

    const results = {
      schoolsCreated: 0,
      schoolsFound: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      eventsObsolete: 0,
      schools: [] as Array<{ name: string; dbId: number | null; eventCount: number }>,
      unmatched: [] as string[],
    };

    // Track all UIDs from current ICS
    const currentUids = new Set(weekEvents.map(e => e.uid));

    // 1. BORRAR eventos pasados y eventos obsoletos (no están en el ICS actual)
    console.log('[sync-ics] Cleaning old and obsolete events...');
    
    // Borrar eventos pasados
    const deletedPast = await (prisma as any).schoolEvent.deleteMany({
      where: { date: { lt: today } },
    });
    results.eventsDeleted = deletedPast.count;
    console.log(`[sync-ics] Deleted ${deletedPast.count} past events`);

    // Borrar eventos futuros que ya no están en el ICS
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

    // 2. Procesar cada escuela del ICS
    for (const [schoolName, events] of eventsBySchool) {
      // Find matching school in DB
      let school = findSchoolInDB(schoolName, allSchools);

      if (!school) {
        // Create school with minimal info
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
        name: schoolName,
        dbId: school.id,
        eventCount: events.length,
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
