'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface SchoolEvent {
  id: number;
  title: string;
  description: string | null;
  date: string;
  endDate: string;
  location: string | null;
  category: string | null;
  who: string | null;
  isAllDay: boolean;
}

export function useSchoolEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const schoolId = user?.schoolId;
    if (!schoolId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let cancelled = false;
    setLoading(true);

    fetch(`/api/schools/${schoolId}/events?from=${today.toISOString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('events'))))
      .then((data) => {
        if (!cancelled) setEvents((data.events ?? []) as SchoolEvent[]);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.schoolId]);

  return { events, loading };
}

/** Hora local solo tras montar, para no romper la hidratación del HTML estático. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

export function formatTime(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function eventPhoto(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('alcázar') || t.includes('alcazar')) return encodeURI('/img/alcazar de sevilla.jpg');
  if (t.includes('giralda') || t.includes('catedral')) return '/img/Giralda.jpg';
  if (t.includes('plaza de españa') || t.includes('plaza espana')) return encodeURI('/img/plaza de españa.jpg');
  return encodeURI('/img/alcazar de sevilla.jpg');
}

export function relativeToNow(start: string, now: Date): string {
  const target = new Date(start);
  const diffMs = target.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin <= 0) return 'Ahora';
  if (diffMin < 60) return `en ${diffMin} min`;

  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (hours < 24) return mins ? `en ${hours} h ${mins} min` : `en ${hours} h`;

  const days = Math.round(hours / 24);
  return days === 1 ? 'mañana' : `en ${days} días`;
}
