'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { Box, Typography, Skeleton, FormControl, Select, MenuItem } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import { useAuth } from '@/context/AuthContext';
import { ErrorMessage, EmptyState } from '@/components/ui/DataStates';
import Link from 'next/link';

interface School {
  id: number;
  name: string;
  city: string | null;
}

interface SchoolEvent {
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

function formatTime(raw: string): string {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDateShort(raw: string): string {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function getDayStart(raw: string): number {
  const d = new Date(raw);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function getTodayStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function daysUntil(raw: string): number {
  try {
    const eventStart = getDayStart(raw);
    const todayStart = getTodayStart();
    return Math.max(0, Math.round((eventStart - todayStart) / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

function photoFor(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes('alcázar') || t.includes('alcazar')) return encodeURI('/img/alcazar de sevilla.jpg');
  if (t.includes('giralda') || t.includes('catedral')) return '/img/Giralda.jpg';
  if (t.includes('plaza de españa') || t.includes('plaza espana')) return encodeURI('/img/plaza de españa.jpg');
  return null;
}

function duration(ev: SchoolEvent): string {
  const mins = Math.round((new Date(ev.endDate).getTime() - new Date(ev.date).getTime()) / 60000);
  if (!isFinite(mins) || mins <= 0) return '';
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h} h${m ? ` ${m}` : ''}` : `${m} min`;
}

export default function ProgramaFormativoSection() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/schools')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSchools(data.schools || []);
      })
      .catch(() => setError('No se pudieron cargar las escuelas'));
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      setSelectedSchoolId(schools[0]?.id ?? null);
    } else {
      setSelectedSchoolId(user?.schoolId ?? null);
    }
  }, [isAdmin, user?.schoolId, schools]);

  useEffect(() => {
    if (!selectedSchoolId) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const from = today.toISOString();
        const res = await fetch(`/api/schools/${selectedSchoolId}/events?from=${from}`);
        if (res.ok) {
          const data = await res.json();
          setEvents((data.events ?? []).slice(0, 6));
        } else {
          setError('Error al cargar los eventos');
        }
      } catch {
        setError('Error de conexión al cargar el programa');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedSchoolId]);

  const header = (title: string, right?: React.ReactNode) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.25, gap: 1, flexWrap: 'wrap' }}>
      <Typography
        component="h2"
        sx={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.02em' }}
      >
        {title}
      </Typography>
      {right}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ py: 1.5 }}>
        <Skeleton variant="rounded" height={250} sx={{ borderRadius: '28px' }} animation="wave" />
        <Skeleton variant="rounded" height={64} sx={{ borderRadius: '22px', mt: 1.5 }} animation="wave" />
      </Box>
    );
  }

  if (!selectedSchoolId) {
    return (
      <Box sx={{ py: 1.5 }}>
        {header('Programa formativo')}
        <EmptyState message="Selecciona una escuela para ver tu programa formativo" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 1.5 }}>
        {header('Programa formativo')}
        <ErrorMessage message={error} />
      </Box>
    );
  }

  const hasEvents = events.length > 0;
  if (!hasEvents && !isAdmin) {
    return (
      <Box sx={{ py: 1.5 }}>
        {header('Programa formativo')}
        <EmptyState message="No hay eventos programados para hoy" />
      </Box>
    );
  }

  const adminSelect = isAdmin && schools.length > 0 && (
    <FormControl size="small" sx={{ minWidth: 160, mb: 1.5 }}>
      <Select
        value={selectedSchoolId}
        onChange={(e) => setSelectedSchoolId(e.target.value as number)}
        sx={{ fontSize: '0.8rem', height: 36, borderRadius: '99px' }}
      >
        {schools.map(s => (
          <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.8rem' }}>
            {s.name}{s.city ? ` — ${s.city}` : ''}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const nowMs = now.getTime();
  const statusOf = (ev: SchoolEvent): 'done' | 'live' | 'upcoming' => {
    const start = new Date(ev.date).getTime();
    const end = new Date(ev.endDate).getTime();
    if (end <= nowMs) return 'done';
    if (start <= nowMs) return 'live';
    return 'upcoming';
  };

  const heroEvent = events.find(ev => statusOf(ev) !== 'done') ?? null;
  const todayEvents = events.filter(ev => daysUntil(ev.date) === 0);
  const listEvents = (todayEvents.length > 0 ? todayEvents : events.filter(ev => ev !== heroEvent)).slice(0, 5);
  const listTitle = todayEvents.length > 0 ? 'Hoy' : 'Próximos';

  let heroPill = '';
  if (heroEvent) {
    const st = statusOf(heroEvent);
    if (st === 'live') heroPill = 'En curso ahora';
    else {
      const mins = Math.round((new Date(heroEvent.date).getTime() - nowMs) / 60000);
      const d = daysUntil(heroEvent.date);
      if (d === 0) heroPill = mins < 60 ? `Siguiente · en ${Math.max(mins, 1)} min` : `Siguiente · en ${Math.floor(mins / 60)} h ${mins % 60 ? `${mins % 60} min` : ''}`.trim();
      else heroPill = d === 1 ? 'Mañana' : `En ${d} días`;
    }
  }
  const heroPhoto = heroEvent ? photoFor(`${heroEvent.title} ${heroEvent.location ?? ''}`) : null;

  const tagStyles = {
    done: { label: 'Hecha', bg: 'var(--md-surface-high)', fg: 'var(--md-on-surface-variant)' },
    live: { label: 'En curso', bg: 'var(--md-primary)', fg: 'var(--md-on-primary)' },
    upcoming: { label: 'Próxima', bg: 'var(--md-surface-high)', fg: 'var(--md-on-surface)' },
  } as const;

  return (
    <Box sx={{ py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      {adminSelect}

      {heroEvent && (
        <Box
          component="article"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: 250,
            borderRadius: '28px',
            p: 2.25,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            boxShadow: 'var(--md-shadow-card)',
            background: heroPhoto
              ? `#222 url("${heroPhoto}") center/cover`
              : 'linear-gradient(135deg, #2F4A00, #5B7F1A 55%, #C4F278)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(8,10,4,.88) 8%, rgba(8,10,4,.2) 62%, rgba(8,10,4,.05))',
            },
            '& > *': { position: 'relative' },
          }}
        >
          <Box
            component="span"
            sx={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              px: 1.5,
              py: 0.6,
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '99px',
              bgcolor: 'rgba(255,255,255,.2)',
              border: '1px solid rgba(255,255,255,.28)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <Box component="b" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--md-primary)', boxShadow: '0 0 0 4px rgba(196,242,120,.3)' }} />
            {heroPill}
          </Box>
          <Typography
            component="h3"
            sx={{
              mt: 1.5,
              mb: 0.75,
              fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)',
              fontWeight: 800,
              fontSize: '1.9rem',
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {heroEvent.title}
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', opacity: 0.9 }}>
            {formatTime(heroEvent.date)}{heroEvent.endDate ? ` – ${formatTime(heroEvent.endDate)}` : ''}
            {heroEvent.location ? ` · ${heroEvent.location}` : ''}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.25, mt: 1.75 }}>
            <Box
              component={Link}
              href="/mapa"
              sx={{
                height: 44, px: 2.25, display: 'inline-flex', alignItems: 'center', gap: 1,
                borderRadius: '99px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
                bgcolor: 'var(--md-primary)', color: 'var(--md-on-primary)',
              }}
            >
              <NavigationIcon sx={{ fontSize: 18 }} />
              Cómo llegar
            </Box>
            <Box
              component={Link}
              href="/programa"
              sx={{
                height: 44, px: 2.25, display: 'inline-flex', alignItems: 'center',
                borderRadius: '99px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', color: '#fff',
                bgcolor: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.28)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              Detalles
            </Box>
          </Box>
        </Box>
      )}

      {listEvents.length > 0 && (
        <Box>
          {header(
            listTitle,
            <Link href="/programa" style={{ textDecoration: 'none' }}>
              <Typography sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.8rem' }}>Ver programa</Typography>
            </Link>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {listEvents.map(ev => {
              const st = statusOf(ev);
              const tag = tagStyles[st];
              const d = daysUntil(ev.date);
              return (
                <Box
                  key={ev.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '54px minmax(0,1fr) auto',
                    gap: 1.5,
                    alignItems: 'center',
                    p: '13px 14px',
                    borderRadius: '22px',
                    bgcolor: 'var(--md-surface)',
                    border: '1px solid var(--md-outline-variant)',
                    opacity: st === 'done' ? 0.65 : 1,
                  }}
                >
                  <Box sx={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)', fontWeight: 700, fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>
                    {ev.isAllDay ? 'Todo' : formatTime(ev.date)}
                    <Box component="small" sx={{ display: 'block', fontFamily: 'var(--font-inter, Inter, sans-serif)', fontWeight: 500, fontSize: '0.68rem', color: 'text.secondary' }}>
                      {d === 0 ? duration(ev) : formatDateShort(ev.date)}
                    </Box>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.92rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.title}
                    </Typography>
                    {ev.location && (
                      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.location}
                      </Typography>
                    )}
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.68rem', fontWeight: 600, px: 1.25, py: 0.5, borderRadius: '99px', bgcolor: tag.bg, color: tag.fg }}>
                    {d === 0 || st !== 'upcoming' ? tag.label : d === 1 ? 'Mañana' : `En ${d} d`}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
