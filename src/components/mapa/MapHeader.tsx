'use client';

import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import { Box, Typography } from '@mui/material';
import { placesData } from '@/data/places';

export default function MapHeader() {
  return (
    <Box
      component="section"
      aria-label="Mapa de Sevilla"
      sx={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + 76px)',
        left: { xs: 14, sm: 24 },
        right: { xs: 14, sm: 'auto' },
        width: { xs: 'auto', sm: 380 },
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <Box
        className="map-header-card"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: { xs: 1.5, sm: 1.75 },
          border: '1px solid rgba(230, 240, 225, 0.14)',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(31, 36, 34, 0.94), rgba(22, 26, 25, 0.88))',
          boxShadow: '0 18px 48px rgba(6, 10, 8, 0.32), inset 0 1px 0 rgba(255,255,255,0.07)',
          backdropFilter: 'blur(22px) saturate(1.15)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.15)',
        }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            flex: '0 0 auto',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '17px',
            color: '#1A2E00',
            bgcolor: '#C4F278',
            boxShadow: '0 5px 16px rgba(196, 242, 120, 0.18)',
          }}
        >
          <ExploreRoundedIcon sx={{ fontSize: 25 }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="p"
            sx={{
              m: 0,
              color: '#C4F278',
              fontSize: '0.61rem',
              fontWeight: 800,
              letterSpacing: '0.16em',
              lineHeight: 1.4,
            }}
          >
            MI ERASMUS · SEVILLA
          </Typography>
          <Typography
            component="h1"
            sx={{
              m: 0,
              mt: 0.25,
              color: '#F2F1ED',
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              fontWeight: 750,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
            }}
          >
            Descubre Sevilla
          </Typography>
        </Box>

        <Box
          component="span"
          aria-label={`${placesData.length} lugares en el mapa`}
          sx={{
            flex: '0 0 auto',
            minWidth: 54,
            px: 1.25,
            py: 0.75,
            display: 'grid',
            justifyItems: 'center',
            border: '1px solid rgba(196, 242, 120, 0.2)',
            borderRadius: '15px',
            bgcolor: 'rgba(196, 242, 120, 0.08)',
          }}
        >
          <Typography component="span" sx={{ color: '#E6F4D0', fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.1 }}>
            {placesData.length}
          </Typography>
          <Typography component="span" sx={{ color: '#B9C4B0', fontSize: '0.56rem', fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.3 }}>
            LUGARES
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
