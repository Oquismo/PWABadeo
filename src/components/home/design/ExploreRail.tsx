'use client';

import Link from 'next/link';
import { Box, Typography } from '@mui/material';

const CARDS = [
  {
    key: 'alcazar',
    name: 'Real Alcázar',
    subtitle: 'Palacio y jardines',
    image: encodeURI('/img/alcazar de sevilla.jpg'),
  },
  {
    key: 'giralda',
    name: 'Giralda',
    subtitle: 'Sube a lo alto',
    image: '/img/Giralda.jpg',
  },
  {
    key: 'plaza',
    name: 'Plaza de España',
    subtitle: 'Azulejos y barcas',
    image: encodeURI('/img/plaza de españa.jpg'),
  },
  {
    key: 'santa-cruz',
    name: 'Barrio de Santa Cruz',
    subtitle: 'Calles y tapas',
    gradient: 'linear-gradient(135deg,#E8782F,#FFB347)',
  },
];

export default function ExploreRail() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
        <Typography component="h2" sx={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, m: 0 }}>
          Para explorar
        </Typography>
        <Box component={Link} href="/mapa" sx={{ fontSize: '13px', color: 'var(--md-primary-text)', fontWeight: 600, textDecoration: 'none' }}>
          Mapa
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          mx: -2,
          px: 2,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {CARDS.map((card) => (
          <Box
            key={card.key}
            component={Link}
            href="/mapa"
            sx={{
              flex: 'none',
              width: 168,
              height: 208,
              borderRadius: '24px',
              scrollSnapAlign: 'start',
              position: 'relative',
              overflow: 'hidden',
              color: '#fff',
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              textDecoration: 'none',
              background: card.gradient || `#333 url("${card.image}") center/cover`,
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(8,10,4,.85), transparent 60%)',
              },
              '& > *': { position: 'relative' },
            }}
          >
            <Box component="b" sx={{ fontFamily: 'var(--font-display)', fontSize: '17px', lineHeight: 1.1 }}>
              {card.name}
            </Box>
            <Typography component="span" sx={{ fontSize: '12px', opacity: 0.85 }}>
              {card.subtitle}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
