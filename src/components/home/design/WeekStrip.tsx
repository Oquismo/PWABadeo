'use client';

import { useMemo } from 'react';
import { Box } from '@mui/material';
import { useSchoolEvents, useNow, sameDay } from './useSchoolEvents';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function WeekStrip() {
  const { events } = useSchoolEvents();
  const now = useNow();

  const week = useMemo(() => {
    if (!now) return [];

    const monday = new Date(now);
    const offset = (now.getDay() + 6) % 7; // lunes = 0
    monday.setDate(now.getDate() - offset);
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const hasEvent = events.some((ev) => sameDay(new Date(ev.date), day));
      return {
        key: `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`,
        label: DAY_LABELS[i],
        dayNumber: day.getDate(),
        isToday: sameDay(day, now),
        hasEvent,
      };
    });
  }, [now, events]);

  if (!now) {
    return <Box aria-hidden sx={{ height: 66 }} />;
  }

  return (
    <Box
      role="group"
      aria-label="Semana actual"
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}
    >
      {week.map((day) => (
        <Box
          key={day.key}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            py: 1.1,
            borderRadius: '18px',
            bgcolor: day.isToday ? 'var(--md-on-surface)' : 'var(--md-surface)',
            color: day.isToday ? 'var(--md-background)' : 'var(--md-on-surface)',
            border: '1px solid',
            borderColor: day.isToday ? 'var(--md-on-surface)' : 'var(--md-outline-variant)',
            minWidth: 0,
          }}
        >
          <Box component="small" sx={{ fontSize: '10.5px', fontWeight: 600, color: 'inherit', opacity: day.isToday ? 0.7 : 0.75 }}>
            {day.label}
          </Box>
          <Box component="strong" sx={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700 }}>
            {day.dayNumber}
          </Box>
          <Box
            component="em"
            aria-hidden
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              bgcolor: day.hasEvent ? 'var(--md-sun)' : 'transparent',
              mt: '1px',
            }}
          />
        </Box>
      ))}
    </Box>
  );
}
