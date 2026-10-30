'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import { useAuth } from '@/context/AuthContext';
import { useProgression } from '@/hooks/useProgression';
import { spanishLevels } from '@/data/quizzes/spanish-levels';
import { sevillaRestaurants } from '@/data/restaurants';

const label = { fontSize: '11px', letterSpacing: '.09em', textTransform: 'uppercase' as const, color: 'var(--md-on-surface-variant)', fontWeight: 600 };
const tile = {
  bgcolor: 'var(--md-surface)',
  border: '1px solid var(--md-outline-variant)',
  borderRadius: '26px',
  p: 1.9,
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  minWidth: 0,
  textDecoration: 'none',
  color: 'inherit',
} as const;

export default function BentoGrid() {
  const { user } = useAuth();
  const { progress } = useProgression();
  const [checklist, setChecklist] = useState<{ done: number; total: number } | null>(null);
  const [questions, setQuestions] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    try {
      const raw = localStorage.getItem(`arrivalChecklist_${user.email}`);
      if (!raw) return;
      const items = JSON.parse(raw) as Array<{ completed?: boolean }>;
      if (Array.isArray(items)) {
        setChecklist({ done: items.filter((i) => i.completed).length, total: items.length });
      }
    } catch {
      setChecklist(null);
    }
  }, [user?.email]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/community/questions')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('questions'))))
      .then((data) => {
        if (!cancelled) setQuestions(Array.isArray(data.questions) ? data.questions.length : null);
      })
      .catch(() => {
        if (!cancelled) setQuestions(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalLevels = spanishLevels.length;
  const doneLevels = Math.min(progress.completedLevels ?? 0, totalLevels);
  const percent = totalLevels ? Math.round((doneLevels / totalLevels) * 100) : 0;
  const circumference = 2 * Math.PI * 34;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      <Box
        component={Link}
        href="/cursos/espanol"
        sx={{ ...tile, bgcolor: 'var(--md-primary)', color: 'var(--md-on-primary)', borderColor: 'transparent' }}
      >
        <Box component="span" sx={{ ...label, color: 'rgba(26,46,0,.72)' }}>
          Tu progreso
        </Box>
        <Box sx={{ width: 84, height: 84, position: 'relative', alignSelf: 'flex-start' }}>
          <svg viewBox="0 0 84 84" width="84" height="84" aria-hidden>
            <circle cx="42" cy="42" r="34" fill="none" stroke="rgba(26,46,0,.18)" strokeWidth="9" />
            <circle
              cx="42"
              cy="42"
              r="34"
              fill="none"
              stroke="var(--md-on-primary)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 42 42)"
            />
          </svg>
          <Box
            component="span"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '21px',
            }}
          >
            {percent}%
          </Box>
        </Box>
        <Typography component="p" sx={{ m: 0, fontSize: '12.5px', color: 'rgba(26,46,0,.72)' }}>
          {doneLevels} de {totalLevels} niveles
        </Typography>
      </Box>

      <Box component={Link} href="/checklist" sx={tile}>
        <Box component="span" sx={label}>
          Checklist
        </Box>
        <Typography component="h3" sx={{ fontFamily: 'var(--font-display)', fontSize: '34px', lineHeight: 1, fontWeight: 700, m: 0 }}>
          {checklist ? `${checklist.done}/${checklist.total}` : '0/0'}
        </Typography>
        <Typography component="p" sx={{ m: 0, fontSize: '12.5px', color: 'var(--md-on-surface-variant)' }}>
          Tu llegada a Sevilla
        </Typography>
      </Box>

      <Box component={Link} href="/recomendaciones" sx={tile}>
        <Box component="span" sx={label}>
          Recomendaciones
        </Box>
        <Typography component="h3" sx={{ fontFamily: 'var(--font-display)', fontSize: '34px', lineHeight: 1, fontWeight: 700, m: 0 }}>
          {sevillaRestaurants.length}
        </Typography>
        <Typography component="p" sx={{ m: 0, fontSize: '12.5px', color: 'var(--md-on-surface-variant)' }}>
          sitios guardados por tu grupo
        </Typography>
      </Box>

      <Box component={Link} href="/comunidad" sx={tile}>
        <Box component="span" sx={label}>
          Comunidad
        </Box>
        <Typography component="h3" sx={{ fontFamily: 'var(--font-display)', fontSize: '34px', lineHeight: 1, fontWeight: 700, m: 0 }}>
          {questions ?? '—'}
        </Typography>
        <Typography component="p" sx={{ m: 0, fontSize: '12.5px', color: 'var(--md-on-surface-variant)' }}>
          preguntas de la comunidad
        </Typography>
      </Box>

      <Box
        component={Link}
        href="/telefonos"
        sx={{ ...tile, gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'center', gap: '14px', bgcolor: 'var(--md-surface-high)' }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '16px',
            bgcolor: 'var(--md-sun)',
            color: '#2A0F00',
            display: 'grid',
            placeItems: 'center',
            flex: 'none',
          }}
        >
          <CallRoundedIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Box component="strong" sx={{ fontFamily: 'var(--font-display)', fontSize: '18px', display: 'block' }}>
            Teléfonos de ayuda
          </Box>
          <Typography component="p" sx={{ m: 0, fontSize: '12.5px', color: 'var(--md-on-surface-variant)' }}>
            Emergencias 112 · Residencia · BADEO
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
