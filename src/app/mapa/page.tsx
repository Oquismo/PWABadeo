'use client';

import { Box, Container, Typography, CircularProgress, Button } from '@mui/material'; // Importar Button
import dynamic from 'next/dynamic';
import RoutePlanner from '@/components/mapa/RoutePlanner'; 
import Link from 'next/link'; // Importar Link de Next.js
import ListIcon from '@mui/icons-material/List'; // Icono para el botón

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

      {/* Sección del planificador de rutas */}
      <Box sx={{ mt: 4 }}>
        <RoutePlanner />
      </Box>

      {/* Botón para ir a la lista de lugares */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Link href="/lugares" passHref>
          <Button 
            variant="outlined" 
            size="large" 
            startIcon={<ListIcon />}
            sx={{ 
                borderRadius: '12px', 
                py: 1.5, 
                px: 3, 
                fontWeight: 'bold' 
            }}
          >
            Ver Lista de Lugares
          </Button>
        </Link>
      </Box>
    </Container>
  );
}