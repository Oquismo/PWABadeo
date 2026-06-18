import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseICS } from '@/lib/ics-parser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ICS_URL = 'https://ics.teamup.com/feed/ksampdkmv21a529vhx/0.ics';

// Token secreto para cron jobs
const CRON_SECRET = process.env.CRON_SECRET || process.env.ICS_SYNC_TOKEN;

function findSchoolInDB(schoolName: string, allSchools: any[]): any {
  const target = schoolName.toLowerCase();

  // Only exact match — the ICS parser already normalizes names
  return allSchools.find((s: any) => s.name.toLowerCase() === target) || null;
}

function isAuthorized(request: Request): { authorized: boolean; method: string } {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.replace('Bearer ', '');
  const vercelSignature = request.headers.get('x-vercel-signature');
  const userData = request.headers.get('cookie')?.match(/user=([^;]+)/)?.[1];

  // 1. Vercel Cron sends x-vercel-signature header
  if (vercelSignature) {
    return { authorized: true, method: 'vercel-cron' };
  }

  // 2. Admin via cookie
  if (userData) {
    try {
      const user = JSON.parse(decodeURIComponent(userData));
      if (user.role === 'admin') {
        return { authorized: true, method: 'admin' };
      }
    } catch {
      // Invalid cookie
    }
  }

  // 3. Token in Authorization header or query param
  if (CRON_SECRET) {
    if (headerToken === CRON_SECRET || token === CRON_SECRET) {
      return { authorized: true, method: 'token' };
    }
  }

  return { authorized: false, method: 'none' };
}

export async function GET(request: Request) {
  try {
    const auth = isAuthorized(request);
    
    if (!auth.authorized) {
      return NextResponse.json({ 
        error: 'No autorizado',
        hint: 'Configura CRON_SECRET como variable de entorno para Vercel Cron'
      }, { status: 401 });
    }

    console.log(`[cron-sync] Authorized via ${auth.method}`);

    // Fetch ICS
    console.log('[cron-sync] Fetching ICS from Teamup...');
    const res = await fetch(ICS_URL, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: `Error fetching ICS: ${res.status}` }, { status: 502 });
    }

    const icsContent = await res.text();
    const parsedEvents = parseICS(icsContent);
    console.log(`[cron-sync] Parsed ${parsedEvents.length} raw events`);

    // SOLO eventos de la próxima semana (7 días)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const weekEvents = parsedEvents.filter(ev => {
      const eventDate = new Date(ev.dtStart);
      return eventDate >= today && eventDate < weekEnd;
    });
    
    console.log(`[cron-sync] Filtered to ${weekEvents.length} events in next 7 days`);

    const allSchools = await (prisma as any).school.findMany();
    const eventsBySchool = new Map<string, typeof weekEvents>();
    
    for (const event of weekEvents) {
      if (!eventsBySchool.has(event.schoolName)) {
        eventsBySchool.set(event.schoolName, []);
      }
      eventsBySchool.get(event.schoolName)!.push(event);
    }

    const results = {
      schoolsCreated: 0,
      schoolsFound: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      eventsObsolete: 0,
      totalEvents: 0,
    };

    // Track all UIDs from current ICS
    const currentUids = new Set(weekEvents.map(e => e.uid));

    // 1. BORRAR eventos pasados y obsoletos
    console.log('[cron-sync] Cleaning old and obsolete events...');
    
    const deletedPast = await (prisma as any).schoolEvent.deleteMany({
      where: { date: { lt: today } },
    });
    results.eventsDeleted = deletedPast.count;
    console.log(`[cron-sync] Deleted ${deletedPast.count} past events`);

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
    console.log(`[cron-sync] Deleted ${results.eventsObsolete} obsolete events`);

    // 2. Procesar cada escuela
    for (const [schoolName, events] of eventsBySchool) {
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
      } else {
        results.schoolsFound++;
      }

      for (const event of events) {
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
            data: { ...eventData, uid: event.uid },
          });
          results.eventsCreated++;
        }
      }
    }

    results.totalEvents = weekEvents.length;

    console.log('[cron-sync] Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Sync completed - mirror mode',
      method: auth.method,
      results,
    });
  } catch (error) {
    console.error('[cron-sync] Error:', error);
    return NextResponse.json({ error: 'Error interno', details: String(error) }, { status: 500 });
  }
}
