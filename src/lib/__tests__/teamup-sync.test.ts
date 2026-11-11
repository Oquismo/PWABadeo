import { describe, it, expect, vi, beforeEach } from 'vitest';

const db = vi.hoisted(() => ({
  schools: [] as Array<{ id: number; name: string }>,
  events: [] as Array<Record<string, unknown>>,
  nextId: 1000,
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    school: {
      findMany: vi.fn(async () => db.schools),
      create: vi.fn(async ({ data }: { data: { name: string } }) => {
        const s = { id: db.schools.length + 100, name: data.name };
        db.schools.push(s);
        return s;
      }),
    },
    schoolEvent: {
      findMany: vi.fn(async ({ where }: { where: { endDate: { gte: Date } } }) =>
        db.events.filter((e) => (e.endDate as Date) >= where.endDate.gte)),
      update: vi.fn(async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
        const e = db.events.find((x) => x.id === where.id)!;
        Object.assign(e, data);
        return e;
      }),
      createMany: vi.fn(async ({ data }: { data: Array<Record<string, unknown>> }) => {
        data.forEach((d) => db.events.push({ ...d, id: db.nextId++ }));
        return { count: data.length };
      }),
      deleteMany: vi.fn(async ({ where }: { where: { id?: { in: number[] }; endDate?: { lt: Date } } }) => {
        const before = db.events.length;
        db.events = db.events.filter((e) =>
          where.id ? !where.id.in.includes(e.id as number) : !((e.endDate as Date) < where.endDate!.lt));
        return { count: before - db.events.length };
      }),
    },
  },
}));

import { syncTeamupEvents } from '../teamup-sync';

const day = (offset: number) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
};

function feed(events: Array<{ uid: string; summary: string; start: string; end: string }>) {
  const body = events.map((e) =>
    `BEGIN:VEVENT\r\nUID:${e.uid}\r\nSUMMARY:${e.summary}\r\nDTSTART;VALUE=DATE:${e.start}\r\nDTEND;VALUE=DATE:${e.end}\r\nX-MICROSOFT-CDO-ALLDAYEVENT:TRUE\r\nEND:VEVENT\r\n`).join('');
  return `BEGIN:VCALENDAR\r\n${body}END:VCALENDAR\r\n`;
}

function mockFeed(ics: string) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(ics, { status: 200 })));
}

describe('syncTeamupEvents', () => {
  beforeEach(() => {
    db.schools = [{ id: 1, name: 'Minzoni' }];
    db.events = [];
  });

  it('importa pasado reciente, futuro lejano y eventos de varios días en curso', async () => {
    mockFeed(feed([
      { uid: 'past', summary: 'Minzoni - clase', start: day(-30), end: day(-29) },
      { uid: 'future', summary: 'Minzoni - clase', start: day(90), end: day(91) },
      { uid: 'ongoing', summary: 'Minzoni - movilidad', start: day(-3), end: day(4) },
      { uid: 'tooold', summary: 'Minzoni - clase', start: day(-200), end: day(-199) },
    ]));
    const r = await syncTeamupEvents(() => {});
    expect(db.events.map((e) => e.uid).sort()).toEqual(['future::1', 'ongoing::1', 'past::1']);
    expect(r.eventsCreated).toBe(3);
  });

  it('no reescribe lo que no ha cambiado, actualiza lo cambiado y borra lo que desaparece', async () => {
    mockFeed(feed([
      { uid: 'a', summary: 'Minzoni - clase', start: day(1), end: day(2) },
      { uid: 'b', summary: 'Minzoni - otra', start: day(2), end: day(3) },
    ]));
    await syncTeamupEvents(() => {});

    mockFeed(feed([
      { uid: 'a', summary: 'Minzoni - clase', start: day(1), end: day(2) },
      { uid: 'c', summary: 'Minzoni - cambio', start: day(5), end: day(6) },
    ]));
    const r = await syncTeamupEvents(() => {});
    expect(r).toMatchObject({ eventsUnchanged: 1, eventsCreated: 1, eventsObsolete: 1 });
    expect(db.events.map((e) => e.uid).sort()).toEqual(['a::1', 'c::1']);
  });

  it('no borra nada si Teamup devuelve un feed vacío', async () => {
    mockFeed(feed([{ uid: 'a', summary: 'Minzoni - clase', start: day(1), end: day(2) }]));
    await syncTeamupEvents(() => {});
    mockFeed(feed([]));
    await expect(syncTeamupEvents(() => {})).rejects.toThrow();
    expect(db.events).toHaveLength(1);
  });
});
