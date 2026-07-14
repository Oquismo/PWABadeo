'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, List, ListItem, ListItemText, ListItemIcon, Divider, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { Today as TodayIcon, AccessTime as TimeIcon, LocationOn as LocationIcon, Person as PersonIcon, EventNote as EventNoteIcon, Search as SearchIcon } from '@mui/icons-material';
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
            const all = (data.schools ?? []).flatMap((s: any) =>
              (s.events ?? []).map((e: any) => ({ ...e, school: s.school }))
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'default';
    const lower = category.toLowerCase();
    if (lower.includes('visita') || lower.includes('tour')) return 'primary';
    if (lower.includes('taller') || lower.includes('workshop')) return 'secondary';
    if (lower.includes('charla') || lower.includes('conferencia')) return 'info';
    if (lower.includes('evalu') || lower.includes('exam')) return 'warning';
    return 'default';
  };

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

  return (
    <PageTransition>
      <Box sx={{ p: 2, maxWidth: 800, mx: 'auto', pb: 10 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={800} sx={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' }}>
            Programa Formativo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {schoolId ? 'Tu programa de actividades' : 'Todos los programas'}
          </Typography>
        </Box>

        {/* Filters */}
        <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 2 }} variant="fullWidth">
          <Tab label="Próximos" value="upcoming" />
          <Tab label="Todos" value="all" />
          <Tab label="Pasados" value="past" />
        </Tabs>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar evento, lugar, categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : events.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6, border: '1px dashed', borderColor: 'divider' }}>
            <CardContent>
              <EventNoteIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No hay eventos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {search ? 'Prueba con otra búsqueda' : 'No hay eventos para este filtro'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          groupByDate(events).map((group) => (
            <Box key={group.date} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="primary.main" fontWeight="bold" sx={{ mb: 1, textTransform: 'capitalize' }}>
                {formatDate(group.date)}
              </Typography>
              {group.events.map((ev) => (
                <Card key={ev.id} sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {/* Time badge */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 56,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                        }}
                      >
                        {ev.isAllDay ? (
                          <TodayIcon sx={{ fontSize: 20 }} />
                        ) : (
                          <>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                              {formatTime(ev.date)}
                            </Typography>
                          </>
                        )}
                      </Box>

                      {/* Event info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {ev.title}
                        </Typography>
                        {ev.school && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                            {ev.school.name}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.75 }}>
                          {ev.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">{ev.location}</Typography>
                            </Box>
                          )}
                          {ev.who && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">{ev.who}</Typography>
                            </Box>
                          )}
                        </Box>
                        {ev.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, lineHeight: 1.4 }}>
                            {ev.description.substring(0, 150)}{ev.description.length > 150 ? '...' : ''}
                          </Typography>
                        )}
                      </Box>

                      {/* Program & Category */}
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, alignSelf: 'flex-start' }}>
                        {ev.program && (
                          <Chip
                            label={ev.program}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ height: 24, fontSize: '0.65rem', fontWeight: 600 }}
                          />
                        )}
                        {ev.category && (
                          <Chip
                            label={ev.category}
                            size="small"
                            color={getCategoryColor(ev.category) as any}
                            sx={{ height: 24, fontSize: '0.65rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))
        )}
      </Box>
    </PageTransition>
  );
}
