'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Box, Fab, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { placesData, Place } from '@/data/places';

const CATEGORY_EMOJIS: Record<string, string> = {
  Residencia: '🏠', Comida: '🍽️', Salud: '🏥', Transporte: '🚌', Metro: '🚇',
  Ocio: '🎉', Cultural: '🏛️', Servicios: '🔧', Estudio: '📚',
};

const CATEGORY_COLORS: Record<string, string> = {
  Residencia: '#7c4dff', Comida: '#ff6d00', Salud: '#00c853', Transporte: '#00bcd4',
  Metro: '#2979ff', Ocio: '#ff1744', Cultural: '#d500f9', Servicios: '#ff9100',
  Estudio: '#00e676',
};

function makeSvgIcon(category: string): L.DivIcon {
  const color = CATEGORY_COLORS[category] || '#78909c';
  const emoji = CATEGORY_EMOJIS[category] || '📍';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <defs>
      <filter id="shadow-${category.replace(/\s/g, '')}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.35"/>
      </filter>
    </defs>
    <path d="M18 2C10.82 2 5 7.82 5 15c0 9.75 13 27 13 27s13-17.25 13-27C31 7.82 25.18 2 18 2z" fill="${color}" filter="url(#shadow-${category.replace(/\s/g, '')})" stroke="#fff" stroke-width="1.5"/>
    <circle cx="18" cy="16" r="9" fill="#fff" opacity="0.95"/>
    <text x="18" y="19" text-anchor="middle" font-size="11">${emoji}</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 42],
    popupAnchor: [0, -44],
  });
}

const ZOOM_STYLES = `
  .leaflet-control-zoom {
    border: 1px solid #49454F !important;
    border-radius: 12px !important;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
  }
  .leaflet-control-zoom a {
    background: #2B2930 !important;
    color: #E6E0E9 !important;
    border-bottom: 1px solid #49454F !important;
    width: 36px !important;
    height: 36px !important;
    line-height: 36px !important;
    font-size: 18px !important;
    transition: background 150ms ease;
  }
  .leaflet-control-zoom a:hover {
    background: #36343B !important;
    color: #C4F278 !important;
  }
  .leaflet-control-zoom a.leaflet-disabled {
    color: #49454F !important;
    background: #1D1B20 !important;
  }
  .leaflet-popup-content-wrapper {
    background: #211F26 !important;
    border: 1px solid #49454F !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
    padding: 0 !important;
  }
  .leaflet-popup-tip {
    background: #211F26 !important;
    border: 1px solid #49454F !important;
  }
  .leaflet-popup-close-button {
    color: #CAC4D0 !important;
    top: 8px !important;
    right: 8px !important;
    font-size: 18px !important;
  }
  .leaflet-popup-close-button:hover {
    color: #E6E0E9 !important;
  }
  .leaflet-control-attribution {
    background: rgba(20,18,24,0.8) !important;
    color: #938F99 !important;
    font-size: 10px !important;
    padding: 2px 8px !important;
    border-radius: 8px 0 0 0 !important;
  }
  .leaflet-control-attribution a {
    color: #CAC4D0 !important;
  }
`;

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const timers = [400, 900, 2000].map(delay =>
      setTimeout(() => { map.invalidateSize(); }, delay)
    );
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
}

const TILE_SERVERS = [
  {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  },
  {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
];

function TileLayerFallback() {
  const [serverIndex, setServerIndex] = useState(0);
  const server = TILE_SERVERS[serverIndex];

  const handleError = useCallback(() => {
    const next = (serverIndex + 1) % TILE_SERVERS.length;
    if (next !== 0) {
      setServerIndex(next);
    }
  }, [serverIndex]);

  return (
    <TileLayer
      key={serverIndex}
      url={server.url}
      attribution={server.attribution}
      maxZoom={server.maxZoom}
      eventHandlers={{ tileerror: handleError }}
    />
  );
}

function MapContent({
  compact,
  markersOnly,
}: {
  compact: boolean;
  markersOnly: boolean;
}) {
  const [center] = useState<[number, number]>([37.385, -5.9925]);

  return (
    <>
      <style>{ZOOM_STYLES}</style>
      <MapContainer
        center={center}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={!compact}
      >
        <MapResizer />
        <TileLayerFallback />
        {markersOnly ? (
          placesData.map((place) => (
            <Marker
              key={place.id}
              position={[place.coordinates.lat, place.coordinates.lng]}
              icon={makeSvgIcon(place.category)}
            >
              <Popup>
                <PlacePopupContent place={place} />
              </Popup>
            </Marker>
          ))
        ) : (
          <MarkerClusterGroup
            chunkedLoading
            spiderfyDistanceMultiplier={2}
            maxClusterRadius={50}
            polygonOptions={{
              fillColor: '#C4F278',
              color: '#C4F278',
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0.15,
            }}
          >
            {placesData.map((place) => (
              <Marker
                key={place.id}
                position={[place.coordinates.lat, place.coordinates.lng]}
                icon={makeSvgIcon(place.category)}
              >
                <Popup>
                  <PlacePopupContent place={place} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
        {!markersOnly && <LocateButton />}
      </MapContainer>
    </>
  );
}

function PlacePopupContent({ place }: { place: Place }) {
  const color = CATEGORY_COLORS[place.category] || '#78909c';
  const emoji = CATEGORY_EMOJIS[place.category] || '📍';

  return (
    <Box sx={{ minWidth: 200, maxWidth: 260 }}>
      <Box
        sx={{
          height: 4,
          bgcolor: color,
          borderRadius: '12px 12px 0 0',
        }}
      />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: `${color}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              flexShrink: 0,
              border: `1px solid ${color}44`,
            }}
          >
            {emoji}
          </Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: '#E6E0E9',
              fontSize: '0.9rem',
              lineHeight: 1.3,
            }}
          >
            {place.name}
          </Typography>
        </Box>
        {place.address && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: '#CAC4D0',
              fontSize: '0.7rem',
              mb: 0.5,
            }}
          >
            {place.address}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: '#938F99',
            fontSize: '0.7rem',
            lineHeight: 1.4,
          }}
        >
          {place.description}
        </Typography>
        {place.link && (
          <Box
            component="a"
            href={place.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              mt: 1,
              fontSize: '0.75rem',
              color: '#C4F278',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Abrir en Google Maps →
          </Box>
        )}
      </Box>
    </Box>
  );
}

function LocateButton() {
  const map = useMap();

  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Fab
      size="small"
      onClick={handleLocate}
      sx={{
        position: 'absolute',
        bottom: 24,
        right: 16,
        zIndex: 1000,
        bgcolor: '#2B2930',
        color: '#E6E0E9',
        border: '1px solid #49454F',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        '&:hover': { bgcolor: '#36343B' },
      }}
    >
      <MyLocationIcon />
    </Fab>
  );
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerStyle = compact
    ? {
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'relative' as const,
        borderRadius: 2,
        overflow: 'hidden' as const,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        border: '1px solid #49454F',
      }
    : { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 };

  if (!mounted) {
    return <Box sx={{ width: '100%', height: '100dvh', bgcolor: '#141218' }} />;
  }

  const mapEl = (
    <Box sx={containerStyle}>
      <MapContent
        compact={compact}
        markersOnly={markersOnly}
      />
    </Box>
  );

  if (!compact) {
    return createPortal(mapEl, document.body);
  }

  return mapEl;
}
