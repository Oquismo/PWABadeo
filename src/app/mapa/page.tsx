'use client';

import { Box, Container, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

export default function MapaPage() {
  const InteractiveMap = useMemo(() => dynamic(
    () => import('@/components/mapa/InteractiveMap'),
    { ssr: false } // Desactivamos el renderizado en servidor para este componente
  ), []);

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
    </Container>
  );
}