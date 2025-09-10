'use client';

import { useState } from 'react';
import { Box, Container, Fab, Drawer, IconButton } from '@mui/material';
import GlobalLanguageSwitch from '@/components/GlobalLanguageSwitch';
import { useTranslation } from '@/hooks/useTranslation';
import Material3LoadingPage from '@/components/ui/Material3LoadingPage';
import GeolocalizacionDemo from '@/components/GeolocalizacionDemo';
import dynamic from 'next/dynamic';
import RoutePlanner from '@/components/mapa/RoutePlanner';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import PlacesListSection from '@/components/mapa/PlacesListSection';
import { Place } from '@/data/places';

export default function MapaPage() {
  const { t } = useTranslation();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>();

  const InteractiveMap = dynamic(
    () => import('@/components/mapa/InteractiveMap'),
    {
      ssr: false,
      loading: () => (
        <Material3LoadingPage
          text={t('map.loading')}
          subtitle={t('map.preparingPlaces')}
          size="large"
        />
      )
    }
  );

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setOpenDrawer(false);
    setTimeout(() => {
      setSelectedPlace(undefined);
    }, 3000);
  };

  return (
    <Container>
      <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <GlobalLanguageSwitch />
      </Box>
      <GeolocalizacionDemo />
      <InteractiveMap selectedPlace={selectedPlace} />
      <Box sx={{ mt: 4 }}>
        <RoutePlanner />
      </Box>
      <Fab
        color="secondary"
        aria-label={t('map.showPlacesList')}
        onClick={() => setOpenDrawer(true)}
        sx={{
          position: 'fixed',
          bottom: (theme) => `calc(64px + ${theme.spacing(2)})`,
          right: (theme) => theme.spacing(2),
        }}
      >
        <ListIcon />
      </Fab>
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
