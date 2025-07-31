'use client';

import { Box, Container, Typography, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';
import RoutePlanner from '@/components/mapa/RoutePlanner'; // 1. Importar el nuevo componente

const InteractiveMap = dynamic(
  () => import('@/components/mapa/InteractiveMap'),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    )
  }
);

export default function MapaPage() {
  return (
    <Container>
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Mapa Interactivo
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          Tus lugares importantes en la ciudad.
        </Typography>
      </Box>
      <InteractiveMap />

      {/* 2. Reemplazamos la sección de información por el planificador de rutas */}
      <Box sx={{ mt: 4 }}>
        <RoutePlanner />
      </Box>
    </Container>
  );
}