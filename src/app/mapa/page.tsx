'use client';

import { useState } from 'react';
import { Box, Container, Typography, CircularProgress, Fab, Drawer, IconButton } from '@mui/material';
import GeolocalizacionDemo from '@/components/GeolocalizacionDemo';
import dynamic from 'next/dynamic';
import RoutePlanner from '@/components/mapa/RoutePlanner'; 
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import PlacesListSection from '@/components/mapa/PlacesListSection'; 

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
  const [openDrawer, setOpenDrawer] = useState(false);

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

  {/* Permiso y explicación de geolocalización */}
  <GeolocalizacionDemo />
  <InteractiveMap />

      {/* Sección del planificador de rutas */}
      <Box sx={{ mt: 4 }}>
        <RoutePlanner />
      </Box>

      {/* Botón flotante que abre el panel */}
      <Fab
        color="secondary" 
        aria-label="ver lista de lugares"
        onClick={() => setOpenDrawer(true)} 
        sx={{
          position: 'fixed',
          bottom: (theme) => `calc(64px + ${theme.spacing(2)})`, 
          right: (theme) => theme.spacing(2),
        }}
      >
        <ListIcon />
      </Fab>

      {/* El panel deslizable (Drawer) */}
      <Drawer
        anchor="bottom" 
        open={openDrawer} 
        onClose={() => setOpenDrawer(false)} 
        PaperProps={{
          sx: {
            borderTopLeftRadius: '16px', 
            borderTopRightRadius: '16px',
            maxHeight: '85vh',
          },
        }}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setOpenDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <PlacesListSection />
      </Drawer>
    </Container>
  );
}
