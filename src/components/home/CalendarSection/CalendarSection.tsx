'use client';

import React, { useState } from 'react';
import { Box, Typography, Collapse, useTheme } from '@mui/material';
import { useTranslation } from '@/hooks/useTranslation';
import MaterialCalendar from '@/components/home/MaterialCalendar';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
// Semana actual de lunes a domingo (usa fechas reales, también al cruzar de mes)
function buildWeekDays(base: Date): Date[] {
  const monday = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function CalendarSection() {
  const theme = useTheme();
  const { t } = useTranslation();
  const todayDate = new Date();
  const today = todayDate.toDateString();
  const [selected, setSelected] = useState(today);
  const [expanded, setExpanded] = useState(false);
  const days = buildWeekDays(todayDate);

  const monthLabel = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const capitalised = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <Box sx={{ py: 1 }}>
      {/* Section header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)',
            color: 'text.primary',
          }}
        >
          {capitalised}
        </Typography>
        <Box
          component="button"
          onClick={() => setExpanded(v => !v)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            fontSize: '0.8rem', fontWeight: 600, color: 'primary.main',
            cursor: 'pointer', background: 'none', border: 'none', p: 0,
          }}
        >
          {expanded ? 'Ocultar' : 'Ver calendario'}
          {expanded ? <ExpandLessRoundedIcon sx={{ fontSize: 16 }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />}
        </Box>
      </Box>

      {/* Tira de 7 días */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px' }}>
        {days.map((date, i) => {
          const key = date.toDateString();
          const isSel = key === selected;
          const isToday = key === today;
          return (
            <Box
              key={key}
              component="button"
              type="button"
              aria-label={date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              aria-pressed={isSel}
              onClick={() => setSelected(key)}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '2px', py: '9px', px: 0, minWidth: 0,
                borderRadius: '18px', cursor: 'pointer',
                border: '1px solid',
                borderColor: isSel ? 'var(--md-on-surface)' : 'var(--md-outline-variant)',
                bgcolor: isSel ? 'var(--md-on-surface)' : 'var(--md-surface)',
                color: isSel ? 'var(--md-background)' : 'var(--md-on-surface)',
                transition: 'background 150ms cubic-bezier(0.2,0,0,1)',
                '&:active': { transform: 'scale(0.96)' },
                '&:focus-visible': { outline: '2px solid var(--md-azul)', outlineOffset: 2 },
              }}
            >
              <Typography component="span" sx={{ fontSize: '0.66rem', fontWeight: 600, lineHeight: 1.3, opacity: isSel ? 0.7 : 1, color: isSel ? 'inherit' : 'text.secondary' }}>
                {DAY_LABELS[i]}
              </Typography>
              <Typography
                component="span"
                sx={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2, color: 'inherit' }}
              >
                {date.getDate()}
              </Typography>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isToday ? 'var(--md-sun)' : 'transparent' }} />
            </Box>
          );
        })}
      </Box>

      {/* Expandable full calendar */}
      <Collapse in={expanded} timeout={250}>
        <Box sx={{ mt: 2 }}>
          <MaterialCalendar />
        </Box>
      </Collapse>
    </Box>
  );
}
