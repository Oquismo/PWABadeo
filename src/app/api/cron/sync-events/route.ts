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

  const exact = allSchools.find((s: any) => s.name.toLowerCase() === target);
  if (exact) return exact;

  const contains = allSchools.find((s: any) => {
    const dbName = s.name.toLowerCase();
    return target.includes(dbName) || dbName.includes(target);
  });
  if (contains) return contains;

  const targetWords = target.split(/\s+/).filter(w => w.length > 2);
  if (targetWords.length > 0) {
    const byWord = allSchools.find((s: any) => {
      const dbName = s.name.toLowerCase();
      return dbName.includes(targetWords[0]);
    });
    if (byWord) return byWord;
  }

  return null;
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

    // SOLO eventos futuros o de hoy - pasados no importan
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureEvents = parsedEvents.filter(ev => {
      const eventDate = new Date(ev.dtStart);
      return eventDate >= today;
    });
    
    console.log(`[cron-sync] Filtered to ${futureEvents.length} future events (today onwards)`);

    const allSchools = await (prisma as any).school.findMany();
    const eventsBySchool = new Map<string, typeof futureEvents>();
    
    for (const event of futureEvents) {
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
      totalEvents: 0,
    };

    for (const [schoolName, events] of eventsBySchool) {
      let school = findSchoolInDB(schoolName, allSchools);

      if (!school) {
        // Solo crear escuela si tiene eventos futuros
        school = await (prisma as any).school.create({
          data: {
            name: schoolName,
            country: 'Italia',
            type: 'pública',
            level: 'secondaria_secondo',
            description: `Escuela activa en Teamup`,
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

    // Borrar TODOS los eventos pasados (de antes de hoy)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const deleted = await (prisma as any).schoolEvent.deleteMany({
      where: {
        date: { lt: today },
      },
    });
    results.eventsDeleted = deleted.count;

    results.totalEvents = futureEvents.length;

    console.log('[cron-sync] Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      method: auth.method,
      results,
    });
  } catch (error) {
    console.error('[cron-sync] Error:', error);
    return NextResponse.json({ error: 'Error interno', details: String(error) }, { status: 500 });
  }
}
