'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Box, Fab, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import NavigationIcon from '@mui/icons-material/Navigation';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { placesData, Place } from '@/data/places';
import MapHeader from './MapHeader';
import { TILE_SERVERS } from './mapTiles';

const CATEGORY_EMOJIS: Record<string, string> = {
  Residencia: '🏠', Comida: '🍽️', Salud: '🏥', Transporte: '🚌', Metro: '🚇',
  Ocio: '🎉', Cultural: '🏛️', Servicios: '🔧', Estudio: '📚',
};

const CATEGORY_COLORS: Record<string, string> = {
  Residencia: '#7c4dff', Comida: '#ff6d00', Salud: '#00c853', Transporte: '#00bcd4',
  Metro: '#2979ff', Ocio: '#ff1744', Cultural: '#d500f9', Servicios: '#ff9100',
  Estudio: '#00e676',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function shortName(name: string): string {
  return name.length > 22 ? `${name.slice(0, 21)}…` : name;
}

function makePinIcon(place: Place, selected: boolean): L.DivIcon {
  const color = CATEGORY_COLORS[place.category] || '#78909c';
  return L.divIcon({
    html: `<div class="map-pin${selected ? ' map-pin--sel' : ''}" style="--pin:${color}"><span>${escapeHtml(shortName(place.name))}</span><i></i></div>`,
    className: 'map-pin-wrap',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -14],
  });
}

function mapsLink(place: Place): string {
  return place.link || `https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`;
}

const ZOOM_STYLES = `
  .leaflet-container { background: #F3F5EC; font-family: var(--font-sans, Inter, sans-serif); }
  .leaflet-tile { filter: saturate(0.82); }
  .leaflet-control-zoom {
    border: 1px solid var(--md-outline-variant) !important;
    border-radius: 9999px !important;
    overflow: hidden;
    box-shadow: var(--md-shadow-card) !important;
  }
  .leaflet-control-zoom a {
    background: var(--md-glass) !important;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: var(--md-on-surface) !important;
    border-bottom: 1px solid var(--md-outline-variant) !important;
    width: 40px !important;
    height: 40px !important;
    line-height: 40px !important;
    font-size: 18px !important;
    transition: background 150ms ease;
  }
  .leaflet-control-zoom a:hover { background: var(--md-surface-high) !important; color: var(--md-primary-text) !important; }
  .leaflet-control-zoom a.leaflet-disabled { color: var(--md-outline-variant) !important; }
  .leaflet-top.leaflet-right { top: calc(env(safe-area-inset-top, 0px) + 300px); right: 6px; }
  .leaflet-popup-content-wrapper {
    background: var(--md-surface) !important;
    border: 1px solid var(--md-outline-variant) !important;
    border-radius: 20px !important;
    box-shadow: var(--md-shadow-card) !important;
    padding: 0 !important;
    overflow: hidden;
  }
  .leaflet-popup-content { margin: 0 !important; }
  .leaflet-popup-tip { background: var(--md-surface) !important; border: 1px solid var(--md-outline-variant) !important; }
  .leaflet-popup-close-button { color: var(--md-on-surface-variant) !important; top: 8px !important; right: 8px !important; font-size: 18px !important; }
  .leaflet-control-attribution {
    background: var(--md-glass) !important;
    color: var(--md-outline) !important;
    font-size: 10px !important;
    padding: 2px 8px !important;
    border-radius: 8px 0 0 0 !important;
  }
  .leaflet-control-attribution a { color: var(--md-on-surface-variant) !important; }
  .map-pin-wrap { background: transparent; border: 0; }
  .map-pin {
    transform: translate(-50%, -100%);
    display: flex; flex-direction: column; align-items: center; width: max-content;
    cursor: pointer; transition: transform 160ms ease;
  }
  .map-pin span {
    background: var(--md-surface); color: var(--md-on-surface);
    border: 1px solid var(--md-outline-variant); border-radius: 9999px;
    padding: 5px 11px; font: 600 11.5px/1.2 var(--font-sans, Inter, sans-serif);
    box-shadow: var(--md-shadow-card); white-space: nowrap;
  }
  .map-pin i {
    width: 12px; height: 12px; margin-top: 3px; border-radius: 50%;
    background: var(--pin); border: 3px solid var(--md-surface);
    box-sizing: content-box;
  }
  .map-pin--sel { transform: translate(-50%, -100%) scale(1.08); z-index: 5; }
  .map-pin--sel span { background: var(--md-primary); color: var(--md-on-primary); border-color: transparent; }
  .map-labels-off .map-pin span { display: none; }
  .map-labels-off .map-pin--sel span { display: block; }
  .map-cluster-icon { background: transparent; border: 0; }
  .map-cluster-count {
    width: 46px; height: 46px; display: grid; place-items: center;
    border: 4px solid rgba(196, 242, 120, 0.24); border-radius: 50%;
    background: #C4F278; color: #1A2E00;
    font: 800 14px/1 var(--font-sans, sans-serif);
    box-shadow: 0 6px 18px rgba(9, 15, 5, 0.36);
  }
  .map-header-card { animation: map-header-in 420ms cubic-bezier(0.2, 0.75, 0.25, 1) both; }
  @keyframes map-header-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .map-header-card { animation: none; } .map-pin { transition: none; } }
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

function ZoomWatcher() {
  const map = useMap();
  useMapEvents({
    zoomend: () => map.getContainer().classList.toggle('map-labels-off', map.getZoom() < 14),
  });
  return null;
}

function makeClusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  return L.divIcon({
    html: `<span class="map-cluster-count">${cluster.getChildCount()}</span>`,
    className: 'map-cluster-icon',
    iconSize: [46, 46],
  });
}

function MapContent({ compact, markersOnly }: { compact: boolean; markersOnly: boolean }) {
  const [center] = useState<[number, number]>([37.385, -5.9925]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todo');
  const [selected, setSelected] = useState<Place | null>(null);

  const categories = useMemo(() => Array.from(new Set(placesData.map((p) => p.category as string))), []);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return placesData.filter(
      (p) => (category === 'Todo' || p.category === category) && (!q || `${p.name} ${p.address ?? ''}`.toLowerCase().includes(q))
    );
  }, [query, category]);

  const renderMarker = (place: Place) => (
    <Marker
      key={place.id}
      position={[place.coordinates.lat, place.coordinates.lng]}
      icon={makePinIcon(place, selected?.id === place.id)}
      eventHandlers={compact ? undefined : { click: () => setSelected(place) }}
    >
      {compact && (
        <Popup>
          <PlacePopupContent place={place} />
        </Popup>
      )}
    </Marker>
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{ZOOM_STYLES}</style>
      <MapContainer
        center={center}
        zoom={14}
        className={compact ? 'leaflet-map-compact' : 'leaflet-map-fullscreen'}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapResizer />
        <ZoomWatcher />
        <TileLayerFallback />
        {!compact && <ZoomControl position="topright" />}
        {markersOnly ? (
          visible.map(renderMarker)
        ) : (
          <MarkerClusterGroup
            key={`${category}|${query}`}
            chunkedLoading
            spiderfyDistanceMultiplier={2}
            maxClusterRadius={50}
            iconCreateFunction={makeClusterIcon}
            polygonOptions={{ fillColor: '#C4F278', color: '#C4F278', weight: 2, opacity: 0.6, fillOpacity: 0.15 }}
          >
            {visible.map(renderMarker)}
          </MarkerClusterGroup>
        )}
        {!markersOnly && <LocateButton lifted={Boolean(selected)} />}
      </MapContainer>

      {!compact && (
        <MapHeader
          query={query}
          onQueryChange={setQuery}
          categories={categories}
          activeCategory={category}
          onCategoryChange={setCategory}
          count={visible.length}
        />
      )}
      {!compact && selected && <PlaceSheet place={selected} onClose={() => setSelected(null)} />}
    </Box>
  );
}

function PlaceSheet({ place, onClose }: { place: Place; onClose: () => void }) {
  const color = CATEGORY_COLORS[place.category] || '#78909c';
  const emoji = CATEGORY_EMOJIS[place.category] || '📍';
  return (
    <Box
      role="dialog"
      aria-label={place.name}
      sx={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 94px)',
        mx: 'auto',
        maxWidth: 400,
        zIndex: 1100,
        display: 'flex',
        gap: 1.75,
        alignItems: 'center',
        p: 2,
        borderRadius: '26px',
        bgcolor: 'var(--md-surface)',
        border: '1px solid var(--md-outline-variant)',
        boxShadow: 'var(--md-shadow-card)',
      }}
    >
      <Box
        sx={{
          width: 76, height: 76, flex: 'none', borderRadius: '20px', display: 'grid', placeItems: 'center', fontSize: 32,
          bgcolor: `${color}26`, border: `1px solid ${color}55`,
          ...(place.imageUrl && { background: `url("${place.imageUrl}") center/cover` }),
        }}
      >
        {!place.imageUrl && emoji}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography component="h2" sx={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.15, pr: 3 }}>
          {place.name}
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.25 }}>{place.category}</Typography>
        {place.address && (
          <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {place.address}
          </Typography>
        )}
        <Box
          component="a"
          href={mapsLink(place)}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            mt: 1, height: 36, px: 1.75, display: 'inline-flex', alignItems: 'center', gap: 0.75, borderRadius: '9999px',
            fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none', bgcolor: 'var(--md-primary)', color: 'var(--md-on-primary)',
          }}
        >
          <NavigationIcon sx={{ fontSize: 16 }} />
          Cómo llegar
        </Box>
      </Box>
      <IconButton aria-label="Cerrar" onClick={onClose} size="small" sx={{ position: 'absolute', top: 10, right: 10, color: 'text.secondary' }}>
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

function PlacePopupContent({ place }: { place: Place }) {
  const color = CATEGORY_COLORS[place.category] || '#78909c';
  const emoji = CATEGORY_EMOJIS[place.category] || '📍';
  return (
    <Box sx={{ minWidth: 200, maxWidth: 260 }}>
      <Box sx={{ height: 4, bgcolor: color }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: `1px solid ${color}44` }}>
            {emoji}
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--md-on-surface)', fontSize: '0.9rem', lineHeight: 1.3 }}>
            {place.name}
          </Typography>
        </Box>
        {place.address && (
          <Typography variant="caption" sx={{ display: 'block', color: 'var(--md-on-surface-variant)', fontSize: '0.7rem', mb: 0.5 }}>
            {place.address}
          </Typography>
        )}
        <Typography variant="caption" sx={{ display: 'block', color: 'var(--md-outline)', fontSize: '0.7rem', lineHeight: 1.4 }}>
          {place.description}
        </Typography>
        <Box component="a" href={mapsLink(place)} target="_blank" rel="noopener noreferrer"
          sx={{ display: 'inline-flex', alignItems: 'center', mt: 1, fontSize: '0.75rem', color: 'var(--md-primary-text)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          Abrir en Google Maps →
        </Box>
      </Box>
    </Box>
  );
}

function LocateButton({ lifted = false }: { lifted?: boolean }) {
  const map = useMap();
  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => { map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1 }); },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  return (
    <Fab
      size="small"
      onClick={handleLocate}
      aria-label="Centrar en mi ubicación"
      title="Centrar en mi ubicación"
      sx={{
        position: 'absolute',
        bottom: lifted ? 'calc(env(safe-area-inset-bottom, 0px) + 214px)' : 'calc(env(safe-area-inset-bottom, 0px) + 94px)',
        right: 16,
        zIndex: 1000,
        bgcolor: 'var(--md-glass)',
        color: 'var(--md-on-surface)',
        border: '1px solid var(--md-outline-variant)',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--md-shadow-card)',
        transition: 'transform 180ms ease, bottom 200ms ease',
        '&:hover': { bgcolor: 'var(--md-surface-high)', transform: 'translateY(-2px)' },
        '&:active': { transform: 'scale(0.96)' },
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
        border: '1px solid var(--md-outline-variant)',
      }
    : { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 };

  if (!mounted) {
    return <Box sx={{ width: '100%', height: '100dvh', bgcolor: 'var(--md-background)' }} />;
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
