'use client';

import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import { useTranslation } from '@/hooks/useTranslation';

const display = 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)';

const tileBase = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
  p: 2,
  minWidth: 0,
  borderRadius: '26px',
  textDecoration: 'none',
  color: 'text.primary',
  bgcolor: 'var(--md-surface)',
  border: '1px solid var(--md-outline-variant)',
  transition: 'transform 150ms ease',
  '&:active': { transform: 'scale(0.98)' },
  '&:focus-visible': { outline: '2px solid var(--md-azul)', outlineOffset: 2 },
} as const;

export default function QuickBento() {
  const { t } = useTranslation();

  const tiles = [
    { href: '/checklist', icon: <ChecklistRoundedIcon />, label: 'Checklist', text: 'Qué llevar y qué hacer antes de viajar', lime: true },
    { href: '/comunidad', icon: <QuestionAnswerRoundedIcon />, label: t('nav.community') || 'Comunidad', text: 'Habla con tu grupo y resuelve dudas' },
    { href: '/recomendaciones', icon: <RestaurantRoundedIcon />, label: t('nav.recommendations') || 'Recomendaciones', text: 'Dónde comer y qué visitar' },
    { href: '/album', icon: <PhotoLibraryRoundedIcon />, label: 'Álbum', text: 'Fotos de tu estancia' },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, py: 1 }}>
      {tiles.map((tile) => (
        <Box
          key={tile.href}
          component={Link}
          href={tile.href}
          sx={{
            ...tileBase,
            ...(tile.lime && { bgcolor: 'var(--md-primary)', color: 'var(--md-on-primary)', borderColor: 'transparent' }),
          }}
        >
          <Box sx={{ display: 'flex', '& svg': { fontSize: 26 } }}>{tile.icon}</Box>
          <Typography component="span" sx={{ fontFamily: display, fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.1, mt: 1 }}>
            {tile.label}
          </Typography>
          <Typography component="span" sx={{ fontSize: '0.78rem', lineHeight: 1.35, color: tile.lime ? 'rgba(26,46,0,.75)' : 'text.secondary' }}>
            {tile.text}
          </Typography>
        </Box>
      ))}

      <Box
        component={Link}
        href="/telefonos"
        sx={{ ...tileBase, gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'center', gap: 1.75, bgcolor: 'var(--md-surface-high)' }}
      >
        <Box sx={{ width: 48, height: 48, borderRadius: '16px', display: 'grid', placeItems: 'center', flex: 'none', bgcolor: 'var(--md-sun)', color: '#2A0F00' }}>
          <CallRoundedIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="span" sx={{ display: 'block', fontFamily: display, fontWeight: 700, fontSize: '1.1rem' }}>
            {t('nav.phones') || 'Teléfonos de ayuda'}
          </Typography>
          <Typography component="span" sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>Emergencias 112, residencia y BADEO</Typography>
        </Box>
      </Box>
    </Box>
  );
}
