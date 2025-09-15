"use client";
import { Box, Typography, Chip, IconButton, Stack } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsIcon from '@mui/icons-material/Directions';
import ShareIcon from '@mui/icons-material/Share';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function BarrioSantaCruzPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  const spot = {
    name: 'Barrio Santa Cruz',
    coordinates: '37.3860,-5.9920',
    description: `El Barrio de Santa Cruz es el corazón del casco histórico de Sevilla: calles estrechas,
    plazas con naranjos y rincones llenos de historia. Ideal para pasear, tomar tapas
    y descubrir la herencia judía y cristiana de la ciudad.`,
    highlights: [
      'Plaza de los Venerables',
      'Patios y plazuelas con bares tradicionales',
      'Iglesia y arquitectura mudéjar'
    ],
    openingHours: 'Abierto todo el día (comercios y bares con horario variable)'
  };

  const openMaps = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.coordinates}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111', color: '#fff', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{
        height: '46vh',
        backgroundImage: 'url("/img/Giralda.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <IconButton onClick={() => router.back()} sx={{ position: 'absolute', top: 16, left: 16, color: '#fff', zIndex: 10 }}>
          <ArrowBackIcon />
        </IconButton>
        <IconButton sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', zIndex: 10 }}>
          <ShareIcon />
        </IconButton>
        <IconButton onClick={openMaps} sx={{ position: 'absolute', top: 16, right: 70, color: '#fff', zIndex: 10 }}>
          <DirectionsIcon />
        </IconButton>
        <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{spot.name}</Typography>
          <Typography variant="body2" sx={{ color: '#ddd' }}>{t('nav.tour') || 'Tour'}</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 3, py: 3 }}>
        <Stack spacing={2}>
          <Typography variant="body1" sx={{ color: '#e0e0e0', lineHeight: 1.6 }}>{spot.description}</Typography>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>Horario</Typography>
            <Typography variant="body2" sx={{ color: '#cfcfcf' }}>{spot.openingHours}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>Qué ver</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {spot.highlights.map(h => (
                <Chip key={h} label={h} size="small" sx={{ bgcolor: '#2b2b2b', color: '#fff' }} />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>Cómo llegar</Typography>
            <Typography variant="body2" sx={{ color: '#cfcfcf', mb: 1 }}>A pie desde la Catedral (5–10 min). También accesible en transporte público y taxi.</Typography>
            <IconButton onClick={openMaps} aria-label="Abrir en Maps">
              <DirectionsIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Link href="/plaza-espana" style={{ textDecoration: 'none' }}>
              <Chip label="Plaza de España" clickable sx={{ bgcolor: '#222', color: '#fff' }} />
            </Link>
            <Link href="/alcazar-sevilla" style={{ textDecoration: 'none' }}>
              <Chip label="Alcázar" clickable sx={{ bgcolor: '#222', color: '#fff' }} />
            </Link>
          </Box>

        </Stack>
      </Box>
    </Box>
  );
}
