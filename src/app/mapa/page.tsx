'use client';

import { useState } from 'react';
import { Box, Container, Fab, Drawer, IconButton, Typography, InputBase, useTheme } from '@mui/material';
import { useTranslation } from '@/hooks/useTranslation';
import Material3LoadingPage from '@/components/ui/Material3LoadingPage';
import GeolocalizacionDemo from '@/components/GeolocalizacionDemo';
import dynamic from 'next/dynamic';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';

const RoutePlanner = dynamic(() => import('@/components/mapa/RoutePlanner'), { ssr: false });
const PlacesListSection = dynamic(() => import('@/components/mapa/PlacesListSection'), { ssr: false });
import { Place } from '@/data/places';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

const MAP_FILTERS = ['Todos', 'Transporte', 'Comida', 'Salud', 'Residencia'] as const;
type MapFilter = typeof MAP_FILTERS[number];

export default function MapaPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>();
  const [mapFilter, setMapFilter] = useState<MapFilter>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

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
      {/* Search bar + filter chips */}
      <Box sx={{ pt: 1, pb: 0.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
          <Box sx={{
            flex: 1, height: 44,
            background: theme.palette.background.paper,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '22px',
            display: 'flex', alignItems: 'center', gap: 1.25, px: 2,
          }}>
            <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <InputBase
              placeholder="Buscar en el mapa…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ flex: 1, fontSize: '0.875rem', color: 'text.secondary' }}
            />
          </Box>
          <Box sx={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: theme.palette.secondary.dark,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
            onClick={() => setOpenDrawer(true)}
          >
            <TuneRoundedIcon sx={{ color: theme.palette.secondary.light, fontSize: 20 }} />
          </Box>
        </Box>
        {/* Filter chips */}
        <Box sx={{
          display: 'flex', gap: 1, overflowX: 'auto',
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
          mb: 1,
        }}>
          {MAP_FILTERS.map(chip => {
            const sel = mapFilter === chip;
            return (
              <Box
                key={chip}
                component="button"
                onClick={() => setMapFilter(chip)}
                sx={{
                  flexShrink: 0, height: 32,
                  px: sel ? '10px' : '14px',
                  pl: sel ? '6px' : '14px',
                  borderRadius: '8px',
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  userSelect: 'none', border: 'none', outline: 'none',
                  background: sel ? theme.palette.secondary.dark : 'transparent',
                  color: sel ? theme.palette.secondary.light : 'text.secondary',
                  borderColor: sel ? 'transparent' : 'divider',
                  borderStyle: 'solid', borderWidth: '1px',
                  transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
                }}
              >
                {sel && <CheckRoundedIcon sx={{ fontSize: 16, color: theme.palette.secondary.light }} />}
                {chip}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Global language switch removed from this page; language is chosen on first run and adjustable in Ajustes */}
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
