'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, FormControl, Select, MenuItem, Chip } from '@mui/material';
import { EventNote as EventNoteIcon } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
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

const EVENT_COLORS = [
  '#667eea', '#84fab0', '#f093fb', '#ffecd2',
  '#a8edea', '#fa709a', '#667eea', '#ff9a9e',
];

function formatDate(raw: string): string {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function daysUntil(raw: string): number {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

export default function ProgramaFormativoSection() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';
  const [now, setNow] = useState(new Date());

  // Update time every 60s for class progress bar
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Load schools for admin selector
  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/schools')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSchools(data.schools || []);
      })
      .catch(console.error);
  }, [isAdmin]);

  // Set default school
  useEffect(() => {
    if (isAdmin) {
      setSelectedSchoolId(schools[0]?.id ?? null);
    } else {
      setSelectedSchoolId(user?.schoolId ?? null);
    }
  }, [isAdmin, user?.schoolId, schools]);

  // Fetch events
  useEffect(() => {
    if (!selectedSchoolId) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const now = new Date().toISOString();
        const res = await fetch(`/api/schools/${selectedSchoolId}/events?from=${now}`);
        if (res.ok) {
          const data = await res.json();
          setEvents((data.events ?? []).slice(0, 6));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedSchoolId]);

  const selectedSchool = schools.find(s => s.id === selectedSchoolId);

  if (loading) {
    return (
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventNoteIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">Programa Formativo</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, overflow: 'hidden', px: 2 }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={220} height={140} sx={{ borderRadius: 3, flexShrink: 0 }} animation="wave" />
          ))}
        </Box>
      </Box>
    );
  }

  if (!selectedSchoolId) {
    return null;
  }

  // Si no hay eventos futuros, no mostrar nada (salvo admin con selector)
  const hasEvents = events.length > 0;
  if (!hasEvents && !isAdmin) {
    return null;
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <EventNoteIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">Programa Formativo</Typography>
          {selectedSchool && (
            <Chip
              label={selectedSchool.name}
              size="small"
              sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'primary.main', color: 'primary.contrastText' }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Admin school selector - siempre visible para admin */}
          {isAdmin && schools.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value as number)}
                sx={{
                  fontSize: '0.8rem',
                  height: 32,
                  '& .MuiSelect-select': { py: 0.5 },
                }}
              >
                {schools.map(s => (
                  <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.8rem' }}>
                    {s.name}{s.city ? ` — ${s.city}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Link href="/programa" passHref style={{ textDecoration: 'none' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.8rem' }}>
              Ver todo
            </Typography>
          </Link>
        </Box>
      </Box>

      {/* Horizontal scroll cards */}
      {hasEvents && (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            pb: 1,
            scrollSnapType: 'x mandatory',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {events.map((ev, i) => {
            const color = EVENT_COLORS[i % EVENT_COLORS.length];
            const days = daysUntil(ev.date);
            const isToday = days === 0;

            // Class progress (9:30-13:00) for today's events
            const minutes = now.getHours() * 60 + now.getMinutes();
            const start = 9 * 60 + 30;
            const end = 13 * 60;
            const total = end - start;
            const elapsed = Math.max(0, Math.min(total, minutes - start));
            const classPct = total > 0 ? Math.round((elapsed / total) * 100) : 0;

            return (
              <Box
                key={ev.id}
                sx={{
                  flexShrink: 0,
                  width: 220,
                  background: 'background.paper',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 2,
                  scrollSnapAlign: 'start',
                  transition: 'transform 0.15s ease',
                  '&:active': { transform: 'scale(0.97)' },
                }}
              >
                <Box sx={{ width: 32, height: 4, borderRadius: 2, bgcolor: color, mb: 1.5 }} />

                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.title}
                </Typography>

                {ev.location && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.location}
                  </Typography>
                )}

                <Box sx={{ mb: 1.5 }}>
                  {isToday ? (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {minutes < start ? '9:30' : minutes >= end ? '13:00 ✓' : `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`}
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.65rem', color: minutes >= end ? 'success.main' : color }}>
                          {minutes < start ? '—' : minutes >= end ? '100%' : `${classPct}%`}
                        </Typography>
                      </Box>
                      <Box sx={{ height: 4, bgcolor: 'action.hover', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${classPct}%`, bgcolor: minutes >= end ? 'success.main' : color, borderRadius: 2, transition: 'width 1s ease' }} />
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {days === 1 ? 'Mañana' : `En ${days} días`}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {isToday ? 'Hoy' : formatDate(ev.date)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
