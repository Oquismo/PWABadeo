'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Fab, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { placesData, Place } from '@/data/places';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORY_EMOJIS: Record<string, string> = {
  Residencia: '🏠', Comida: '🍽️', Salud: '🏥', Transporte: '🚌', Metro: '🚇',
  Ocio: '🎉', Cultural: '🏛️', Servicios: '🔧', Estudio: '📚',
};

const CATEGORY_COLORS: Record<string, string> = {
  Residencia: '#7c4dff', Comida: '#ff6d00', Salud: '#00c853', Transporte: '#00bcd4',
  Metro: '#2979ff', Ocio: '#ff1744', Cultural: '#d500f9', Servicios: '#ff9100',
  Estudio: '#00e676',
};

function makeIcon(category: string) {
  const color = CATEGORY_COLORS[category] || '#78909c';
  const emoji = CATEGORY_EMOJIS[category] || '📍';
  return L.divIcon({
    html: `<div style="width:36px;height:36px;background:${color};border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.3);font-size:16px">${emoji}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

export default function InteractiveMap({
  selectedPlace,
  compact = false,
  height = '100dvh',
  markersOnly = false,
}: {
  selectedPlace?: Place;
  compact?: boolean;
  height?: string | number;
  markersOnly?: boolean;
}) {
  const [center] = useState<[number, number]>([37.385, -5.9925]);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const containerStyle = compact
    ? { width: '100%', height: typeof height === 'number' ? `${height}px` : height }
    : { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 };

  const handleLocate = () => {
    if (!mapInstance) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstance.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Box sx={containerStyle}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={!compact}
        ref={setMapInstance}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {placesData.map((place) => (
          <Marker
            key={place.id}
            position={[place.coordinates.lat, place.coordinates.lng]}
            icon={makeIcon(place.category)}
          >
            <Popup>
              <Box sx={{ minWidth: 180 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{place.name}</Typography>
                {place.address && (
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                    {place.address}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {!markersOnly && (
        <Fab
          size="small"
          onClick={handleLocate}
          sx={{
            position: 'absolute',
            bottom: 24,
            right: 16,
            zIndex: 1000,
            bgcolor: 'rgba(30,30,30,0.85)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            '&:hover': { bgcolor: 'rgba(50,50,50,0.9)' },
          }}
        >
          <MyLocationIcon />
        </Fab>
      )}
    </Box>
  );
}
