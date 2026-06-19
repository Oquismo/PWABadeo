import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CRON_SECRET = process.env.CRON_SECRET || process.env.ICS_SYNC_TOKEN;

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@badeo.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

function isAuthorized(request: Request): boolean {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.replace('Bearer ', '');
  const vercelSignature = request.headers.get('x-vercel-signature');
  const userData = request.headers.get('cookie')?.match(/user=([^;]+)/)?.[1];

  if (vercelSignature) return true;

  if (userData) {
    try {
      const user = JSON.parse(decodeURIComponent(userData));
      if (user.role === 'admin') return true;
    } catch {}
  }

  if (CRON_SECRET && (headerToken === CRON_SECRET || token === CRON_SECRET)) {
    return true;
  }

  return false;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function minutesUntil(date: Date): number {
  return Math.round((date.getTime() - Date.now()) / 60000);
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    const now = new Date();
    const windowEnd = new Date(now.getTime() + 60 * 60 * 1000);

    const usersWithPush = await prisma.pushSubscription.findMany({
      include: {
        user: {
          select: { id: true, schoolId: true, email: true },
        },
      },
    });

    const results = { checked: 0, notified: 0, skipped: 0, errors: 0, details: [] as any[] };

    for (const sub of usersWithPush) {
      const user = sub.user;
      if (!user.schoolId) {
        results.skipped++;
        continue;
      }

      results.checked++;

      const upcomingEvents = await prisma.schoolEvent.findMany({
        where: {
          schoolId: user.schoolId,
          date: { gte: now, lte: windowEnd },
          isAllDay: false,
        },
        orderBy: { date: 'asc' },
      });

      for (const event of upcomingEvents) {
        const existing = await prisma.eventReminder.findUnique({
          where: {
            eventId_userId: { eventId: event.id, userId: user.id },
          },
        });

        if (existing) continue;

        const mins = minutesUntil(event.date);
        if (mins < 0) continue;

        const timeStr = formatTime(event.date);
        const title = `⌛ ${mins <= 5 ? '¡Ahora!' : `En ${mins} min`} — ${event.title}`;
        const body = event.location
          ? `${timeStr} · ${event.location}${event.who ? ` · ${event.who}` : ''}`
          : `${timeStr}${event.who ? ` · ${event.who}` : ''}`;

        const payload = JSON.stringify({
          title,
          body,
          url: '/calendario',
          tag: 'event-reminder',
          eventId: event.id,
          timestamp: Date.now(),
        });

        const subscriptionObj =
          typeof sub.subscription === 'string'
            ? JSON.parse(sub.subscription)
            : sub.subscription;

        try {
          await webpush.sendNotification(subscriptionObj, payload);
          await prisma.eventReminder.create({
            data: { eventId: event.id, userId: user.id },
          });
          results.notified++;
          results.details.push({ userId: user.id, eventId: event.id, title: event.title });
        } catch (pushError: any) {
          if (pushError.statusCode === 410 || pushError.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          }
          results.errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Recordatorios procesados',
      window: { from: now.toISOString(), to: windowEnd.toISOString() },
      results,
    });
  } catch (error) {
    console.error('[event-reminders] Error:', error);
    return NextResponse.json({ error: 'Error interno', details: String(error) }, { status: 500 });
  }
}
