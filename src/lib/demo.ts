/**
 * Modo demo: cuenta de ejemplo de solo lectura para que personas externas
 * puedan explorar la app sin registrarse.
 *
 * - Usuario con rol "demo" asociado a un centro ficticio (inactivo: no sale en el registro).
 * - Los eventos del programa se regeneran en cada entrada, relativos a hoy,
 *   para que la demo nunca aparezca vacía.
 * - El middleware bloquea cualquier escritura (POST/PUT/PATCH/DELETE) del rol demo.
 */
import { prisma } from '@/lib/db';

export const DEMO_ROLE = 'demo';
export const DEMO_EMAIL = 'demo@mierasmus.app';
export const DEMO_FRIEND_EMAIL = 'giulia.demo@mierasmus.app';
export const DEMO_SCHOOL_NAME = 'Istituto Demo Mi Erasmus';
export const DEMO_EVENT_UID_PREFIX = 'demo-';

export function isDemoEnabled(): boolean {
  return process.env.DEMO_MODE_ENABLED !== 'false';
}

/** Fecha en hora de Madrid (independiente de la zona horaria del servidor). */
function madridDate(dayOffset: number, hour: number, minute = 0): Date {
  const base = new Date();
  base.setUTCDate(base.getUTCDate() + dayOffset);
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  const d = base.getUTCDate();
  const guess = new Date(Date.UTC(y, m, d, hour, minute));
  // Diferencia entre la hora de Madrid y UTC para ese instante
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(guess);
  const madridHour = Number(parts.find((p) => p.type === 'hour')?.value ?? hour);
  let offset = madridHour - hour;
  if (offset < -12) offset += 24;
  if (offset > 12) offset -= 24;
  return new Date(guess.getTime() - offset * 3_600_000);
}

function isoDay(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

type DemoEvent = {
  day: number; start: [number, number]; end: [number, number];
  title: string; description: string; location: string; who: string; program?: string;
};

const DEMO_EVENTS: DemoEvent[] = [
  { day: 0, start: [9, 30], end: [11, 0], title: 'Bienvenida y presentación del programa', description: 'Reunión de acogida con el equipo de BADEO: normas, horarios y contactos de emergencia.', location: 'BADEO · Aula 1', who: 'Coordinación BADEO', program: 'VET' },
  { day: 0, start: [11, 30], end: [13, 30], title: 'Clase de español · Nivel A2', description: 'Expresiones útiles para el día a día en Sevilla.', location: 'BADEO · Aula 3', who: 'Profesora de español', program: 'VET' },
  { day: 0, start: [17, 0], end: [19, 0], title: 'Paseo por el Barrio de Santa Cruz', description: 'Visita guiada a pie por el casco histórico.', location: 'Punto de encuentro: Puerta de Jerez', who: 'Guía local' },
  { day: 1, start: [8, 30], end: [14, 0], title: 'Prácticas en empresa · Día 1', description: 'Primera jornada en la empresa de acogida. Lleva el DNI y el acuerdo de formación.', location: 'Empresa de acogida', who: 'Tutor de empresa', program: 'VET' },
  { day: 1, start: [16, 30], end: [18, 0], title: 'Taller de cultura andaluza', description: 'Gastronomía, costumbres y vocabulario local.', location: 'BADEO · Aula 2', who: 'Coordinación BADEO' },
  { day: 2, start: [8, 30], end: [14, 0], title: 'Prácticas en empresa · Día 2', description: 'Jornada en la empresa de acogida.', location: 'Empresa de acogida', who: 'Tutor de empresa', program: 'VET' },
  { day: 2, start: [18, 0], end: [20, 0], title: 'Visita al Real Alcázar', description: 'Entrada incluida. Puntualidad, por favor.', location: 'Real Alcázar de Sevilla', who: 'Guía local' },
  { day: 3, start: [8, 30], end: [14, 0], title: 'Prácticas en empresa · Día 3', description: 'Jornada en la empresa de acogida.', location: 'Empresa de acogida', who: 'Tutor de empresa', program: 'VET' },
  { day: 4, start: [10, 0], end: [13, 0], title: 'Plaza de España y Parque de María Luisa', description: 'Actividad cultural y fotos de grupo.', location: 'Plaza de España', who: 'Coordinación BADEO' },
  { day: 5, start: [9, 0], end: [12, 0], title: 'Seguimiento y evaluación intermedia', description: 'Revisión del progreso con el coordinador y entrega del registro de asistencia.', location: 'BADEO · Aula 1', who: 'Coordinación BADEO', program: 'VET' },
  { day: 6, start: [11, 0], end: [13, 0], title: 'Ceremonia de entrega de certificados', description: 'Entrega de certificados Erasmus+ y Europass Mobility.', location: 'BADEO · Salón principal', who: 'Dirección BADEO', program: 'VET' },
];

const DEMO_QUESTIONS = [
  { title: '¿Dónde puedo comprar una tarjeta de autobús?', content: 'Necesito moverme entre la residencia y la empresa. ¿Qué tarjeta me conviene?', answer: 'En los quioscos de Tussam puedes comprar la tarjeta multiviaje. Es mucho más barata que pagar cada viaje.' },
  { title: '¿Algún sitio para cenar barato cerca del centro?', content: 'Somos un grupo de 6 y buscamos tapas a buen precio.', answer: 'Prueba la zona de la Alameda de Hércules, hay muchos bares de tapas con precios para estudiantes.' },
];

const demoUserSelect = {
  id: true, email: true, name: true, firstName: true, lastName: true, role: true,
  age: true, schoolId: true, school: true, avatarUrl: true, arrivalDate: true,
  departureDate: true, country: true, city: true, town: true, residence: true, onboarded: true,
} as const;

/** Crea o actualiza todos los datos de la demo y devuelve el usuario demo. */
export async function ensureDemoData() {
  const bcrypt = await import('bcrypt');
  // Contraseña aleatoria: nadie puede entrar a la cuenta demo por el login normal
  const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);

  const school = await prisma.school.upsert({
    where: { name: DEMO_SCHOOL_NAME },
    update: { isActive: false },
    create: {
      name: DEMO_SCHOOL_NAME, city: 'Bologna', province: 'BO', country: 'Italia',
      type: 'pública', level: 'fp', isActive: false,
      description: 'Centro ficticio usado en el modo demo de la app.',
    },
  });

  const profile = {
    firstName: 'Alex', lastName: 'Demo', name: 'Alex Demo', role: DEMO_ROLE,
    schoolId: school.id, age: 17, country: 'Italia', city: 'Bologna',
    residence: 'AMRO', onboarded: true,
    arrivalDate: isoDay(-1), departureDate: isoDay(13),
  };

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: profile,
    create: { email: DEMO_EMAIL, password: randomPassword, ...profile },
    select: demoUserSelect,
  });

  // Eventos del programa: se regeneran relativos a hoy
  await prisma.schoolEvent.deleteMany({ where: { uid: { startsWith: DEMO_EVENT_UID_PREFIX } } });
  await prisma.schoolEvent.createMany({
    data: DEMO_EVENTS.map((e, i) => ({
      uid: `${DEMO_EVENT_UID_PREFIX}${i}`,
      title: e.title,
      description: e.description,
      date: madridDate(e.day, e.start[0], e.start[1]),
      endDate: madridDate(e.day, e.end[0], e.end[1]),
      location: e.location,
      who: e.who,
      category: e.who,
      program: e.program ?? null,
      schoolId: school.id,
    })),
  });

  // Comunidad: algunas preguntas de ejemplo (solo la primera vez)
  const existingQuestions = await prisma.communityQuestion.count({ where: { schoolId: school.id } });
  if (existingQuestions === 0) {
    const friend = await prisma.user.upsert({
      where: { email: DEMO_FRIEND_EMAIL },
      update: {},
      create: {
        email: DEMO_FRIEND_EMAIL, password: randomPassword, firstName: 'Giulia', lastName: 'R.',
        name: 'Giulia R.', role: DEMO_ROLE, schoolId: school.id, country: 'Italia', onboarded: true,
      },
    });
    for (const q of DEMO_QUESTIONS) {
      await prisma.communityQuestion.create({
        data: {
          title: q.title, content: q.content, userId: friend.id, schoolId: school.id,
          answers: { create: [{ content: q.answer, userId: user.id }] },
        },
      });
    }
  }

  return user;
}
