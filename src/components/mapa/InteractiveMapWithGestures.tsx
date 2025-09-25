/**
 * Versión mejorada del InteractiveMap con gestos avanzados integrados
 * Incluye pinch-to-zoom, long press menus, edge swipe y 3D touch
 */

import React, { useRef } from 'react';
import { Box, Typography, Fab, IconButton, Stack, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import DirectionsIcon from '@mui/icons-material/Directions';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import InfoIcon from '@mui/icons-material/Info';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';

import { GestureWrapper, GestureWrapperRef } from '@/components/gestures';
import { ContextMenuItem, ContextMenuPresets } from '@/hooks/useLongPressMenu';
import { EdgeSwipePresets } from '@/hooks/useEdgeSwipeNavigation';
import { PressureLevelPresets } from '@/hooks/use3DTouchSimulation';
import { Place } from '@/data/places';

interface InteractiveMapWithGesturesProps {
  // Props originales del mapa
  selectedPlace?: Place;
  compact?: boolean;
  height?: string | number;
  markersOnly?: boolean;
  
  // Props para gestos
  enableMapGestures?: boolean;
  showGestureHelp?: boolean;
  onPlaceAction?: (place: Place, action: string) => void;
  
  // Render prop para el mapa original
  children?: React.ReactNode;
}

const InteractiveMapWithGestures: React.FC<InteractiveMapWithGesturesProps> = ({
  selectedPlace,
  compact = false,
  height = '85vh',
  markersOnly = false,
  enableMapGestures = true,
  showGestureHelp = false,
  onPlaceAction,
  children
}) => {
  const mapRef = useRef<GestureWrapperRef>(null);

  // Menús contextuales para diferentes elementos del mapa
  const getPlaceContextMenu = (place: Place): ContextMenuItem[] => [
    {
      id: 'info',
      label: 'Ver información',
      icon: <InfoIcon fontSize="small" />,
      action: () => onPlaceAction?.(place, 'info')
    },
    {
      id: 'directions',
      label: 'Cómo llegar',
      icon: <DirectionsIcon fontSize="small" />,
      action: () => {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=transit`;
        window.open(directionsUrl, '_blank');
      }
    },
    {
      id: 'bookmark',
      label: 'Guardar lugar',
      icon: <BookmarkIcon fontSize="small" />,
      action: () => {
        // Guardar en localStorage o backend
        const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
        if (!savedPlaces.find((p: Place) => p.id === place.id)) {
          savedPlaces.push(place);
          localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
          onPlaceAction?.(place, 'bookmark');
        }
      }
    },
    {
      id: 'share',
      label: 'Compartir',
      icon: <ShareIcon fontSize="small" />,
      action: async () => {
        const shareData = {
          title: place.name,
          text: `Mira este lugar: ${place.name} - ${place.description}`,
          url: `${window.location.origin}/mapa?place=${place.id}`
        };
        
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareData.url);
          onPlaceAction?.(place, 'share');
        }
      }
    }
  ];

  // Acciones de edge swipe para navegación rápida
  const edgeActions = {
    left: EdgeSwipePresets.studentNavigation(),
    right: [
      {
        id: 'search',
        label: 'Buscar lugares',
        icon: '🔍',
        action: () => console.log('Open search'),
        color: '#4CAF50'
      }
    ],
    bottom: [
      {
        id: 'layers',
        label: 'Capas del mapa',
        icon: '🗺️',
        action: () => console.log('Toggle map layers'),
        color: '#FF9800'
      }
    ]
  };

  // 3D Touch levels para diferentes acciones según la presión
  const get3DTouchLevels = (place?: Place) => {
    if (!place) return [];
    
    return PressureLevelPresets.mapInteraction(
      () => onPlaceAction?.(place, 'peek'), // Nivel 1: Vista previa
      () => {
        // Nivel 2: Navegación rápida
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=transit`;
        window.open(directionsUrl, '_blank');
      },
      () => {
        // Nivel 3: Guardar lugar
        const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
        if (!savedPlaces.find((p: Place) => p.id === place.id)) {
          savedPlaces.push(place);
          localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
          onPlaceAction?.(place, 'force-bookmark');
        }
      }
    );
  };

  // Ayuda visual para gestos
  const GestureHelpOverlay = () => {
    if (!showGestureHelp) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Gestos del Mapa
        </Typography>
        
        <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              🤏 Pinch to Zoom
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              Pellizca para hacer zoom en el mapa
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              👆 Long Press
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              Mantén presionado para ver opciones
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              ↔️ Edge Swipe
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              Desliza desde los bordes para acciones rápidas
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              💪 3D Touch
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              Presiona fuerte para acciones avanzadas
            </Typography>
          </Box>
        </Stack>
        
        <Typography variant="caption" sx={{ mt: 3, opacity: 0.6 }}>
          Esta ayuda desaparecerá automáticamente
        </Typography>
      </motion.div>
    );
  };

  // Controles flotantes con gestos
  const FloatingControls = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {/* Botón de ubicación con 3D Touch */}
      <GestureWrapper
        force3DEnabled
        pressureLevels={PressureLevelPresets.quickPreview(
          () => console.log('Location preview'),
          () => console.log('Get precise location')
        )}
      >
        <Fab
          size="small"
          color="primary"
          sx={{
            background: 'rgba(18, 18, 27, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <MyLocationIcon />
        </Fab>
      </GestureWrapper>

      {/* Indicador de categorías con long press */}
      <GestureWrapper
        longPressEnabled
        longPressItems={() => [
          {
            id: 'restaurants',
            label: 'Restaurantes',
            icon: <RestaurantIcon fontSize="small" />,
            action: () => console.log('Filter restaurants')
          },
          {
            id: 'hospitals',
            label: 'Hospitales',
            icon: <LocalHospitalIcon fontSize="small" />,
            action: () => console.log('Filter hospitals')
          },
          {
            id: 'schools',
            label: 'Escuelas',
            icon: <SchoolIcon fontSize="small" />,
            action: () => console.log('Filter schools')
          }
        ]}
      >
        <Fab
          size="small"
          sx={{
            background: 'rgba(18, 18, 27, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
          }}
        >
          <span style={{ fontSize: '16px' }}>🏷️</span>
        </Fab>
      </GestureWrapper>
    </Box>
  );

  // Card de lugar seleccionado con gestos
  const SelectedPlaceCard = () => {
    if (!selectedPlace) return null;

    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <GestureWrapper
          longPressEnabled
          longPressItems={getPlaceContextMenu(selectedPlace)}
          force3DEnabled
          pressureLevels={get3DTouchLevels(selectedPlace)}
          gesturePreset="scrollableContent"
        >
          <Card
            elevation={8}
            sx={{
              background: 'rgba(18, 18, 27, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {selectedPlace.name}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mb: 1 }}>
                {selectedPlace.description}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.6)">
                Mantén presionado para más opciones
              </Typography>
            </CardContent>
          </Card>
        </GestureWrapper>
      </motion.div>
    );
  };

  return (
    <Box sx={{ position: 'relative', height, width: '100%' }}>
      <GestureWrapper
        ref={mapRef}
        gesturePreset="interactiveMap"
        edgeSwipeEnabled={enableMapGestures}
        edgeActions={edgeActions}
        pinchZoomEnabled={!compact} // Solo zoom en vista completa
        className="interactive-map-container"
        style={{
          height: '100%',
          width: '100%',
          borderRadius: compact ? '16px' : '0px',
          overflow: 'hidden'
        }}
        onGestureStart={(gestureType) => console.log(`Gesture started: ${gestureType}`)}
        onGestureEnd={(gestureType) => console.log(`Gesture ended: ${gestureType}`)}
      >
        {/* Contenido del mapa original */}
        {children}
        
        {/* Controles flotantes */}
        <FloatingControls />
        
        {/* Card de lugar seleccionado */}
        <SelectedPlaceCard />
        
        {/* Overlay de ayuda */}
        <GestureHelpOverlay />
      </GestureWrapper>
    </Box>
  );
};

export default InteractiveMapWithGestures;