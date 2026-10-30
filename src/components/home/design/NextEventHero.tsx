'use client';

import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import { useSchoolEvents, useNow, eventPhoto, formatTime, relativeToNow } from './useSchoolEvents';

const display = 'var(--font-display)';

export default function NextEventHero() {
  const { events } = useSchoolEvents();
  const now = useNow();

  const upcoming = now
    ? events.find((ev) => new Date(ev.endDate ?? ev.date).getTime() >= now.getTime()) ?? events[0]
    : events[0];

  const pillText = !now
    ? 'Siguiente actividad'
    : upcoming
      ? `Siguiente · ${relativeToNow(upcoming.date, now)}`
      : 'Sin actividades próximas';

  return (
    <Box
      component="article"
      aria-label="Siguiente actividad"
      sx={{
        position: 'relative',
        minHeight: 250,
        borderRadius: '28px',
        overflow: 'hidden',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        p: 2.25,
        background: `#222 url("${eventPhoto(upcoming?.title ?? '')}") center/cover`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(8,10,4,.88) 8%, rgba(8,10,4,.2) 62%, rgba(8,10,4,.05))',
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
          bgcolor: 'rgba(255,255,255,.2)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,.28)',
          borderRadius: '99px',
          px: 1.5,
          py: 0.6,
          fontSize: '0.75rem',
          fontWeight: 600,
          '& b': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'var(--md-primary)',
            boxShadow: '0 0 0 4px rgba(196,242,120,.3)',
          },
        }}
      >
        <b />
        {pillText}
      </Box>

      <Typography
        component="h2"
        sx={{ fontFamily: display, fontSize: '1.9rem', lineHeight: 1.02, fontWeight: 700, letterSpacing: '-0.02em', mt: 1.5, mb: 0.5 }}
      >
        {upcoming?.title ?? 'Tu próxima actividad'}
      </Typography>
      <Typography component="p" sx={{ m: 0, fontSize: '0.84rem', opacity: 0.88 }}>
        {upcoming ? `${upcoming.isAllDay ? 'Todo el día' : formatTime(upcoming.date)}${upcoming.location ? ` · ${upcoming.location}` : ''}` : 'Consulta el programa'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.25, mt: 1.75 }}>
        <Box
          component={Link}
          href="/mapa"
          sx={{
            height: 44,
            borderRadius: '99px',
            px: 2.25,
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            bgcolor: 'var(--md-primary)',
            color: 'var(--md-on-primary)',
          }}
        >
          <NavigationIcon sx={{ fontSize: 18 }} />
          Cómo llegar
        </Box>
        <Box
          component={Link}
          href="/programa"
          sx={{
            height: 44,
            borderRadius: '99px',
            px: 2.25,
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            bgcolor: 'rgba(255,255,255,.18)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,.28)',
          }}
        >
          Detalles
        </Box>
      </Box>
    </Box>
  );
}
