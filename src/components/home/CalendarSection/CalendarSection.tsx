'use client';

import React, { useState } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { useTranslation } from '@/hooks/useTranslation';
import MaterialCalendar from '@/components/home/MaterialCalendar';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const EVENT_DAYS = [19, 22]; // days with event dots

function buildWeekDays(today: number) {
  const days: number[] = [];
  const start = today - 3;
  for (let i = 0; i < 7; i++) days.push(start + i);
  return days;
}

export default function CalendarSection() {
  const { t } = useTranslation();
  const today = new Date().getDate();
  const [selected, setSelected] = useState(today);
  const [expanded, setExpanded] = useState(false);
  const days = buildWeekDays(today);

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

      {/* 7-day horizontal strip */}
      <Box sx={{ display: 'flex', gap: '4px' }}>
        {days.map((day, i) => {
          const isSel = day === selected;
          const isToday = day === today;
          const hasEvent = EVENT_DAYS.includes(day);
          return (
            <Box
              key={day}
              component="button"
              onClick={() => setSelected(day)}
              sx={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '4px', py: 1, px: '2px',
                borderRadius: '12px', cursor: 'pointer',
                border: 'none', outline: 'none',
                background: isSel
                  ? 'linear-gradient(135deg,#667EEA 0%,#764BA2 100%)'
                  : 'transparent',
                transition: 'background 150ms cubic-bezier(0.2,0,0,1)',
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.65rem', fontWeight: 600, lineHeight: 1,
                  color: isSel ? '#fff' : 'text.secondary',
                }}
              >
                {DAY_LABELS[i]}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem', fontWeight: 700, lineHeight: 1,
                  color: isSel ? '#fff' : isToday ? 'primary.main' : 'text.primary',
                }}
              >
                {day}
              </Typography>
              <Box sx={{
                width: 4, height: 4, borderRadius: '50%',
                background: hasEvent ? (isSel ? '#fff' : 'primary.main') : 'transparent',
                bgcolor: hasEvent ? (isSel ? '#fff' : 'primary.main') : 'transparent',
              }} />
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
