'use client';

import { useState } from 'react';
import { Box, Container, Typography, CircularProgress, Fab, Drawer, IconButton } from '@mui/material';
import Material3LoadingPage from '@/components/ui/Material3LoadingPage';
import GeolocalizacionDemo from '@/components/GeolocalizacionDemo';
import dynamic from 'next/dynamic';
import RoutePlanner from '@/components/mapa/RoutePlanner'; 
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import PlacesListSection from '@/components/mapa/PlacesListSection'; 
import { Place } from '@/data/places';

const InteractiveMap = dynamic(
  () => import('@/components/mapa/InteractiveMap'),
  { 
    ssr: false,
    loading: () => (
      <Material3LoadingPage 
        text="Cargando mapa..."
        subtitle="Preparando los lugares de interés en Sevilla"
        size="large"
      />
    )
  }
);

export default function MapaPage() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>();

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setOpenDrawer(false); // Cerrar el drawer cuando se selecciona un lugar
    
    // Reset selectedPlace después de un tiempo para no interferir con futuras navegaciones
    setTimeout(() => {
      setSelectedPlace(undefined);
    }, 3000);
  };

  return (
    <Container>
  {/* Permiso y explicación de geolocalización */}
  <GeolocalizacionDemo />
  <InteractiveMap selectedPlace={selectedPlace} />

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
        <PlacesListSection onPlaceSelect={handlePlaceSelect} />
      </Drawer>
    </Container>
  );
}
