'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { EventNote as EventNoteIcon, Search as SearchIcon } from '@mui/icons-material';
import PageTransition from '@/components/layout/PageTransition';

interface SchoolEvent {
  id: number;
  title: string;
  description: string | null;
  date: string;
  endDate: string;
  location: string | null;
  category: string | null;
  program: string | null;
  who: string | null;
  isAllDay: boolean;
  school?: {
    id: number;
    name: string;
  } | null;
}

export default function ProgramaPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [allEvents, setAllEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [search, setSearch] = useState('');

  const schoolId = user?.role === 'admin' ? null : (user?.schoolId ?? null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        if (schoolId) {
          const res = await fetch(`/api/schools/${schoolId}/events`);
          if (res.ok) {
            const data = await res.json();
            setAllEvents(data.events ?? []);
          }
        } else {
          const res = await fetch('/api/admin/schools/sync-ics');
          if (res.ok) {
            const data = await res.json();
            type AdminSchool = { school?: SchoolEvent['school']; events?: SchoolEvent[] };
            const schools = (data.schools ?? []) as AdminSchool[];
            const all = schools.flatMap((s) =>
              (s.events ?? []).map((e) => ({ ...e, school: s.school }))
            );
            setAllEvents(all);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [schoolId]);

  useEffect(() => {
    const now = new Date();
    let filtered = [...allEvents];

    if (filter === 'upcoming') {
      filtered = filtered.filter(e => new Date(e.date) >= now);
    } else if (filter === 'past') {
      filtered = filtered.filter(e => new Date(e.date) < now);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.school?.name.toLowerCase().includes(q)
      );
    }

    if (filter === 'upcoming') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    setEvents(filtered);
  }, [allEvents, filter, search]);

  const formatDate = (d: string) => {
    const label = new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const groupByDate = (events: SchoolEvent[]) => {
    const groups: { date: string; events: SchoolEvent[] }[] = [];
    const map = new Map<string, SchoolEvent[]>();

    events.forEach(ev => {
      const dateKey = ev.date.split('T')[0];
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(ev);
    });

    map.forEach((evts, date) => {
      groups.push({ date, events: evts });
    });

    return groups;
  };

  const total = allEvents.length;
  const done = allEvents.filter((e) => new Date(e.endDate ?? e.date) < new Date()).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <PageTransition>
      <Box sx={{ p: 2, maxWidth: 800, mx: 'auto', pb: 10, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        <Box
          sx={{
            borderRadius: '28px',
            bgcolor: 'var(--md-primary)',
            color: 'var(--md-on-primary)',
            p: 2.25,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box component="span" sx={{ fontSize: '11px', letterSpacing: '.09em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(26,46,0,.7)' }}>
            {schoolId ? 'Tu programa' : 'Todos los programas'}
          </Box>
          <Typography component="h1" sx={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', lineHeight: 1.05, fontWeight: 700, m: 0, letterSpacing: '-0.02em' }}>
            Tu programa Erasmus+
          </Typography>
          <Box sx={{ height: 12, borderRadius: '9px', bgcolor: 'rgba(26,46,0,.18)', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${percent}%`, bgcolor: 'var(--md-on-primary)', borderRadius: '9px' }} />
          </Box>
          <Typography component="p" sx={{ m: 0, fontSize: '13px' }}>
            {done} de {total} actividades completadas
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['upcoming', 'all', 'past'] as const).map((value) => (
            <Box
              key={value}
              component="button"
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              sx={{
                flex: 1,
                height: 38,
                borderRadius: '999px',
                cursor: 'pointer',
                font: 'inherit',
                fontWeight: 600,
                fontSize: '13px',
                border: '1px solid',
                borderColor: filter === value ? 'var(--md-on-surface)' : 'var(--md-outline-variant)',
                bgcolor: filter === value ? 'var(--md-on-surface)' : 'var(--md-surface)',
                color: filter === value ? 'var(--md-background)' : 'var(--md-on-surface)',
              }}
            >
              {value === 'upcoming' ? 'Próximos' : value === 'all' ? 'Todos' : 'Pasados'}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            height: 50,
            px: 2,
            borderRadius: '999px',
            bgcolor: 'var(--md-surface)',
            border: '1px solid var(--md-outline-variant)',
            color: 'text.secondary',
            '&:focus-within': { borderColor: 'var(--md-azul)' },
          }}
        >
          <SearchIcon sx={{ fontSize: 20 }} />
          <Box
            component="input"
            type="search"
            placeholder="Buscar evento, lugar, categoría..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 0, border: 0, outline: 0, bgcolor: 'transparent', color: 'text.primary', font: 'inherit', fontSize: '0.95rem' }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : events.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, border: '1px dashed', borderColor: 'var(--md-outline-variant)', borderRadius: '22px', color: 'text.secondary' }}>
            <EventNoteIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
            <Typography component="h2" sx={{ fontSize: '1rem', fontWeight: 700 }}>
              No hay eventos
            </Typography>
            <Typography component="p" sx={{ fontSize: '0.85rem', m: 0 }}>
              {search ? 'Prueba con otra búsqueda' : 'No hay eventos para este filtro'}
            </Typography>
          </Box>
        ) : (
          groupByDate(events).map((group) => (
            <Box key={group.date} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography component="h2" sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'text.secondary', mt: 1 }}>
                {formatDate(group.date)}
              </Typography>
              {group.events.map((ev) => (
                <Box
                  key={ev.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '54px 1fr auto',
                    gap: 1.5,
                    alignItems: 'center',
                    bgcolor: 'var(--md-surface)',
                    border: '1px solid var(--md-outline-variant)',
                    borderRadius: '22px',
                    px: 1.75,
                    py: 1.6,
                  }}
                >
                  <Box component="time" sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px' }}>
                    {ev.isAllDay ? 'Todo' : formatTime(ev.date)}
                    {ev.endDate && !ev.isAllDay && (
                      <Box component="small" sx={{ display: 'block', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '11px', color: 'text.secondary' }}>
                        {formatTime(ev.endDate)}
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Box component="b" sx={{ display: 'block', fontWeight: 600, fontSize: '14px' }}>
                      {ev.title}
                    </Box>
                    <Typography component="span" sx={{ fontSize: '12.5px', color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {[ev.location, ev.who, ev.school?.name].filter(Boolean).join(' · ') || 'Sevilla'}
                    </Typography>
                    {ev.description && (
                      <Typography component="span" sx={{ fontSize: '12px', color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                        {ev.description.substring(0, 120)}{ev.description.length > 120 ? '...' : ''}
                      </Typography>
                    )}
                  </Box>

                  {ev.category && (
                    <Box
                      component="span"
                      sx={{
                        fontSize: '11px',
                        fontWeight: 600,
                        px: 1.25,
                        py: 0.5,
                        borderRadius: '99px',
                        bgcolor: 'var(--md-surface-high)',
                        color: 'var(--md-on-surface)',
                        whiteSpace: 'nowrap',
                        maxWidth: 96,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ev.category}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ))
        )}
      </Box>
    </PageTransition>
  );
}
