'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, FormControl, Select, MenuItem, Chip } from '@mui/material';
import { EventNote as EventNoteIcon, LocationOn as LocationIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
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

const EVENT_COLORS = [
  '#4f6ef7', '#e8596f', '#20c997', '#f59f00',
  '#748ffc', '#fab005', '#7950f2', '#12b886',
];

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

function getProgress(ev: SchoolEvent, now: Date): { pct: number; elapsed: number; total: number } {
  try {
    const start = new Date(ev.date).getTime();
    const end = new Date(ev.endDate).getTime();
    const current = now.getTime();
    const total = end - start;
    if (total <= 0) return { pct: 0, elapsed: 0, total: 0 };
    const elapsed = Math.max(0, Math.min(total, current - start));
    return { pct: Math.round((elapsed / total) * 100), elapsed, total };
  } catch {
    return { pct: 0, elapsed: 0, total: 0 };
  }
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
            <Skeleton key={i} variant="rectangular" width={240} height={160} sx={{ borderRadius: 3, flexShrink: 0 }} animation="wave" />
          ))}
        </Box>
      </Box>
    );
  }

  if (!selectedSchoolId) {
    return (
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 2 }}>
          <EventNoteIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">Programa Formativo</Typography>
        </Box>
        <EmptyState message="Selecciona una escuela para ver tu programa formativo" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 2 }}>
          <EventNoteIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">Programa Formativo</Typography>
        </Box>
        <ErrorMessage message={error} />
      </Box>
    );
  }

  const hasEvents = events.length > 0;
  if (!hasEvents && !isAdmin) return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 2 }}>
        <EventNoteIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="bold">Programa Formativo</Typography>
      </Box>
      <EmptyState message="No hay eventos programados para hoy" />
    </Box>
  );

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <EventNoteIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">Programa Formativo</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAdmin && schools.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value as number)}
                sx={{ fontSize: '0.8rem', height: 32, '& .MuiSelect-select': { py: 0.5 } }}
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

      {hasEvents && (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            pb: 1,
            px: 2,
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
            const progress = getProgress(ev, now);
            const isFinished = progress.pct >= 100;
            const isInProgress = progress.pct > 0 && progress.pct < 100;
            const eventStart = formatTime(ev.date);
            const eventEnd = formatTime(ev.endDate);

            return (
              <Box
                key={ev.id}
                sx={{
                  flexShrink: 0,
                  width: 240,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  scrollSnapAlign: 'start',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                  '&:active': { transform: 'scale(0.97)' },
                }}
              >
                {/* Time header */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    bgcolor: color,
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <ScheduleIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" fontWeight={700}>
                      {eventStart} — {eventEnd}
                    </Typography>
                  </Box>
                  <Chip
                    label={isToday ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} d`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(255,255,255,0.25)',
                      color: '#fff',
                      backdropFilter: 'blur(4px)',
                    }}
                  />
                </Box>

                {/* Content */}
                <Box sx={{ p: 1.5 }}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                      lineHeight: 1.3,
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {ev.title}
                  </Typography>

                  {ev.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.location}
                      </Typography>
                    </Box>
                  )}

                  {/* Progress bar for today */}
                  {isToday && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 600, color: isFinished ? 'success.main' : isInProgress ? 'warning.main' : 'text.secondary' }}>
                          {isFinished ? 'Completado' : isInProgress ? 'En curso' : 'Programado'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 700, color: isFinished ? 'success.main' : color }}>
                          {progress.pct}%
                        </Typography>
                      </Box>
                      <Box sx={{ height: 3, bgcolor: 'action.hover', borderRadius: 2, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: `${progress.pct}%`,
                            bgcolor: isFinished ? 'success.main' : color,
                            borderRadius: 2,
                            transition: 'width 1s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Future event date */}
                  {!isToday && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {formatDateShort(ev.date)}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
