'use client';

import { Box, Container, Typography, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';

// --- SOLUCIÓN: Definimos el mapa dinámico FUERA del componente ---
// Esto crea una referencia estable que no cambia en cada renderizado.
const InteractiveMap = dynamic(
  () => import('@/components/mapa/InteractiveMap'),
  { 
    ssr: false, // Es crucial para que el mapa funcione
    // Mostramos un spinner de carga mientras el mapa se prepara
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
    </Container>
  );
}
