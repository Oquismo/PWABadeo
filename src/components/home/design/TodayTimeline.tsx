'use client';

import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { useSchoolEvents, useNow, formatTime, sameDay } from './useSchoolEvents';

export default function TodayTimeline() {
  const { events, loading } = useSchoolEvents();
  const now = useNow();

  if (!now) return <Box aria-hidden sx={{ height: 120 }} />;
  if (loading) return <Box aria-hidden sx={{ height: 120 }} />;

  const today = events
    .filter((ev) => sameDay(new Date(ev.date), now))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const title = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
        <Typography component="h2" sx={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, m: 0, textTransform: 'capitalize' }}>
          Hoy, {title}
        </Typography>
        <Box
          component={Link}
          href="/programa"
          sx={{ fontSize: '13px', color: 'var(--md-primary-text)', fontWeight: 600, textDecoration: 'none' }}
        >
          Ver programa
        </Box>
      </Box>

      {today.length === 0 ? (
        <Box
          sx={{
            bgcolor: 'var(--md-surface)',
            border: '1px solid var(--md-outline-variant)',
            borderRadius: '22px',
            p: 2,
            color: 'var(--md-on-surface-variant)',
            fontSize: '13px',
          }}
        >
          No hay actividades programadas para hoy.
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {today.map((ev) => {
            const start = new Date(ev.date).getTime();
            const isNext = start >= now.getTime();
            return (
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
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Box component="b" sx={{ display: 'block', fontWeight: 600, fontSize: '14px' }}>
                    {ev.title}
                  </Box>
                  <Typography component="span" sx={{ fontSize: '12.5px', color: 'var(--md-on-surface-variant)' }}>
                    {ev.location || ev.who || 'Sevilla'}
                  </Typography>
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: '11px',
                    fontWeight: 600,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '99px',
                    bgcolor: isNext ? 'var(--md-primary)' : 'var(--md-surface-high)',
                    color: isNext ? 'var(--md-on-primary)' : 'var(--md-on-surface)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isNext ? 'Próxima' : 'Hecha'}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
