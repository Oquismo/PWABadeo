'use client';

import { useState, useRef } from 'react';
import { Box, Fab, Drawer, IconButton, Typography, useTheme, alpha } from '@mui/material';
import { useTranslation } from '@/hooks/useTranslation';
import Material3LoadingPage from '@/components/ui/Material3LoadingPage';
import dynamic from 'next/dynamic';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import { Place } from '@/data/places';

const InteractiveMap = dynamic(
  () => import('@/components/mapa/InteractiveMap'),
  { ssr: false, loading: () => <Material3LoadingPage text="Cargando mapa" subtitle="Preparando lugares..." size="large" /> }
);

const PlacesListSection = dynamic(() => import('@/components/mapa/PlacesListSection'), { ssr: false });

export default function MapaPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>();
  const clearTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePlaceSelect = (place: Place) => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    setSelectedPlace(place);
    setOpenDrawer(false);
    clearTimer.current = setTimeout(() => setSelectedPlace(undefined), 4000);
  };

  return (
    <Box sx={{ height: '100dvh', width: '100%', overflow: 'hidden' }}>
      <InteractiveMap selectedPlace={selectedPlace} />

      <Fab color="secondary" aria-label={t('map.showPlacesList')} onClick={() => setOpenDrawer(true)}
        sx={{ position: 'fixed', bottom: theme => `calc(64px + ${theme.spacing(2)})`, right: theme => theme.spacing(2), background: 'linear-gradient(135deg,#7c4dff,#40c4ff)', boxShadow: '0 8px 24px rgba(124,77,255,0.4)' }}>
        <ListIcon />
      </Fab>

      <Drawer anchor="bottom" open={openDrawer} onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '88vh', bgcolor: theme.palette.background.default, backgroundImage: 'none' } }}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1.5, pb: 0.5, bgcolor: theme.palette.background.default, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.06)}` }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Lugares</Typography>
            <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.45) }}>{t('map.placesCount') || 'Encuentra todo lo que necesitas'}</Typography>
          </Box>
          <IconButton onClick={() => setOpenDrawer(false)} sx={{ color: alpha(theme.palette.text.primary, 0.5) }}><CloseIcon /></IconButton>
        </Box>
        <PlacesListSection onPlaceSelect={handlePlaceSelect} />
      </Drawer>
    </Box>
  );
}
