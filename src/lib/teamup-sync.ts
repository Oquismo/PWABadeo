// Sincronización Teamup → SchoolEvent (modo espejo).
// La usan el cron diario (/api/cron/sync-events) y el botón de admin (/api/admin/schools/sync-ics).

import { prisma } from '@/lib/db';
import { parseICS, type ParsedEvent } from '@/lib/ics-parser';

export const TEAMUP_ICS_URL = 'https://ics.teamup.com/feed/ksampdkmv21a529vhx/0.ics';

/** Solo se muestra la semana: de hoy a 7 días. Lo anterior y lo posterior no se guarda. */
export const SYNC_DAYS = 7;

const PROGRAM_SUFFIXES = ['VET', 'ADU', 'PCTO', 'Job Shadowing', 'Short'];

type School = { id: number; name: string };

export interface SyncResults {
  schoolsCreated: number;
  schoolsFound: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsUnchanged: number;
  /** Eventos ya terminados (antes de hoy) eliminados. */
  eventsDeleted: number;
  /** Eventos que ya no están en Teamup o quedan fuera de los 7 días, eliminados. */
  eventsObsolete: number;
  totalEvents: number;
  window: { from: string; to: string };
  schools: Array<{ name: string; dbId: number; eventCount: number }>;
}

function findSchoolInDB(schoolName: string, allSchools: School[]): School | null {
  const target = schoolName.toLowerCase();
  const match = allSchools.find((s) => s.name.toLowerCase() === target);
  if (match) return match;
  for (const suffix of PROGRAM_SUFFIXES) {
    const suffixed = `${schoolName} ${suffix}`.toLowerCase();
    const m = allSchools.find((s) => s.name.toLowerCase() === suffixed);
    if (m) return m;
  }
  return null;
}

function eventData(event: ParsedEvent, schoolId: number) {
  return {
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
    schoolId,
  };
}

type EventData = ReturnType<typeof eventData>;

function sameEvent(db: Record<string, unknown>, next: EventData): boolean {
  return (Object.keys(next) as Array<keyof EventData>).every((k) => {
    const a = db[k];
    const b = next[k];
    if (a instanceof Date || b instanceof Date) {
      return new Date(a as Date).getTime() === new Date(b as Date).getTime();
    }
    return (a ?? null) === (b ?? null);
  });
}

export async function syncTeamupEvents(log: (msg: string) => void = console.log): Promise<SyncResults> {
  const res = await fetch(TEAMUP_ICS_URL, { cache: 'no-store' });
  if (!res.ok) throw new SyncError(`Error descargando el ICS de Teamup: ${res.status}`, 502);

  const icsContent = await res.text();
  if (!icsContent.includes('BEGIN:VCALENDAR')) {
    throw new SyncError('Teamup no devolvió un calendario válido; no se toca nada', 502);
  }
  const parsedEvents = parseICS(icsContent);
  log(`[teamup-sync] ${parsedEvents.length} eventos de escuelas en el feed`);
  // Un feed sin ningún evento (Teamup caído o vacío) borraría todo: mejor no tocar nada.
  // Una semana sin eventos (vacaciones) sí es válida y deja el calendario vacío.
  if (parsedEvents.length === 0) {
    throw new SyncError('El feed de Teamup no tiene eventos; no se toca nada', 502);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const windowStart = today;
  const windowEnd = new Date(today.getTime() + SYNC_DAYS * 86_400_000);

  // Incluye eventos de varios días que empezaron antes de hoy pero siguen en curso.
  // (DTEND de un evento de día entero es exclusivo: el de ayer termina hoy a las 00:00 y no cuenta.)
  const windowEvents = parsedEvents.filter((ev) => ev.dtEnd > windowStart && ev.dtStart < windowEnd);
  log(`[teamup-sync] ${windowEvents.length} eventos entre ${windowStart.toISOString()} y ${windowEnd.toISOString()}`);



  const allSchools: School[] = await prisma.school.findMany({ select: { id: true, name: true } });
  const existing = await prisma.schoolEvent.findMany({ where: { endDate: { gt: windowStart } } });
  const existingByUid = new Map(existing.map((e) => [e.uid, e]));

  const results: SyncResults = {
    schoolsCreated: 0,
    schoolsFound: 0,
    eventsCreated: 0,
    eventsUpdated: 0,
    eventsUnchanged: 0,
    eventsDeleted: 0,
    eventsObsolete: 0,
    totalEvents: windowEvents.length,
    window: { from: windowStart.toISOString(), to: windowEnd.toISOString() },
    schools: [],
  };

  const currentUids = new Set<string>();
  const toCreate: Array<EventData & { uid: string }> = [];
  const schoolEventCounts = new Map<number, number>();

  for (const event of windowEvents) {
    if (!event.uid) continue; // sin UID no se puede reconciliar
    for (const schoolName of event.schoolNames) {
      let school = findSchoolInDB(schoolName, allSchools);
      if (!school) {
        school = await prisma.school.create({
          data: {
            name: schoolName,
            country: 'Italia',
            type: 'pública',
            level: 'secondaria_secondo',
            description: 'Escuela activa en Teamup',
          },
          select: { id: true, name: true },
        });
        allSchools.push(school);
        results.schoolsCreated++;
        log(`[teamup-sync] Escuela creada: ${schoolName}`);
      } else {
        results.schoolsFound++;
      }

      const uid = `${event.uid}::${school.id}`;
      if (currentUids.has(uid)) continue;
      currentUids.add(uid);
      schoolEventCounts.set(school.id, (schoolEventCounts.get(school.id) || 0) + 1);

      const data = eventData(event, school.id);
      const prev = existingByUid.get(uid);
      if (!prev) {
        toCreate.push({ ...data, uid });
      } else if (sameEvent(prev as unknown as Record<string, unknown>, data)) {
        results.eventsUnchanged++;
      } else {
        await prisma.schoolEvent.update({ where: { id: prev.id }, data });
        results.eventsUpdated++;
      }
    }
  }

  if (toCreate.length) {
    // skipDuplicates: un evento creado fuera de la ventana con el mismo uid no rompe la sincronización
    const created = await prisma.schoolEvent.createMany({ data: toCreate, skipDuplicates: true });
    results.eventsCreated = created.count;
  }

  // Espejo: lo que está en la ventana y ya no existe en Teamup se elimina.
  const obsoleteIds = existing.filter((e) => !currentUids.has(e.uid)).map((e) => e.id);
  if (obsoleteIds.length) {
    const del = await prisma.schoolEvent.deleteMany({ where: { id: { in: obsoleteIds } } });
    results.eventsObsolete = del.count;
  }

  // Lo que ya terminó sale de la base de datos.
  const old = await prisma.schoolEvent.deleteMany({ where: { endDate: { lte: windowStart } } });
  results.eventsDeleted = old.count;

  for (const [schoolId, count] of schoolEventCounts) {
    const school = allSchools.find((s) => s.id === schoolId);
    results.schools.push({ name: school?.name || '', dbId: schoolId, eventCount: count });
  }

  log(`[teamup-sync] Resultado: ${JSON.stringify({ ...results, schools: results.schools.length })}`);
  return results;
}

export class SyncError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}
