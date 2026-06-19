'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import loggerClient from '@/lib/loggerClient';

interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  endDate: string;
  location: string | null;
  who: string | null;
}

const REMINDER_MINUTES = [30, 5];

export function useEventReminders() {
  const { user, isAuthenticated } = useAuth();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const schoolId = user?.schoolId;
    if (!isAuthenticated || !schoolId) return;

    let cancelled = false;
    let selfRegistrationRef: ServiceWorkerRegistration | null = null;

    async function fetchAndSchedule() {
      try {
        const res = await fetch(`/api/events/upcoming?schoolId=${schoolId}`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.events || cancelled) return;

        const now = Date.now();

        for (const event of data.events as UpcomingEvent[]) {
          const eventTime = new Date(event.date).getTime();
          const msUntil = eventTime - now;

          if (msUntil <= 0) continue;

          for (const minsBefore of REMINDER_MINUTES) {
            const remindAt = msUntil - minsBefore * 60 * 1000;
            if (remindAt <= 0 || remindAt > 2 * 60 * 60 * 1000) continue;

            const timer = setTimeout(() => {
              if (!selfRegistrationRef || Notification.permission !== 'granted') return;

              const timeStr = new Date(event.date).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const body = event.location
                ? `${timeStr} · ${event.location}${event.who ? ` · ${event.who}` : ''}`
                : `${timeStr}${event.who ? ` · ${event.who}` : ''}`;

              selfRegistrationRef.showNotification(
                `⌛ ${minsBefore === 5 ? '¡Ya casi!' : `En ${minsBefore} min`} — ${event.title}`,
                {
                  body,
                  icon: '/icons/icon_192x192.png',
                  badge: '/icons/icon_192x192.png',
                  tag: 'event-reminder',
                  requireInteraction: false,
                  data: { url: '/calendario' },
                } as any
              );
            }, remindAt);

            timers.current.push(timer);
          }
        }
      } catch (err) {
        loggerClient.error('useEventReminders error:', err);
      }
    }

    navigator.serviceWorker?.ready.then((reg) => {
      selfRegistrationRef = reg;
      fetchAndSchedule();
    });

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [isAuthenticated, user?.schoolId]);
}
