'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Box, Typography, Fab, Stack, Button, CircularProgress, IconButton, alpha as muiAlpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import DirectionsIcon from '@mui/icons-material/Directions';
import LanguageIcon from '@mui/icons-material/Language';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';
import { placesData, Place } from '@/data/places';
import AddPlaceModal from './AddPlaceModal';
import MaterialFilterChips from '@/components/ui/MaterialFilterChips';
import loggerClient from '@/lib/loggerClient';

const API_KEY = 'Gq2uZmTMhM4Vpv2fhXOR';

const CATEGORY_COLORS: Record<string, string> = {
  Residencia: '#7c4dff',
  Comida: '#ff6d00',
  Salud: '#00c853',
  Transporte: '#00bcd4',
  Metro: '#2979ff',
  Ocio: '#ff1744',
  Cultural: '#d500f9',
  Servicios: '#ff9100',
  Estudio: '#00e676',
  Personalizado: '#78909c',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Residencia: '🏠', Comida: '🍽️', Salud: '🏥', Transporte: '🚌', Metro: '🚇',
  Ocio: '🎉', Cultural: '🏛️', Servicios: '🔧', Estudio: '📚', Personalizado: '📍',
};

function createCategoryIcon(category: string, isSelected = false) {
  const color = CATEGORY_COLORS[category] || '#78909c';
  const emoji = CATEGORY_EMOJIS[category] || '📍';
  const size = isSelected ? 48 : 40;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,${color}dd,${color}88);border:${isSelected ? 3 : 2}px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 ${isSelected ? 4 : 2}px ${isSelected ? 16 : 8}px rgba(0,0,0,.4);font-size:${isSelected ? 22 : 18}px">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createUserLocationIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:36px;height:36px;background:${color};border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 8px ${color}44,0 4px 16px rgba(0,0,0,.5)"><div style="width:12px;height:12px;background:#fff;border-radius:50%"></div></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function GlassPopup({ place }: { place: Place }) {
  const theme = useTheme();
  const color = CATEGORY_COLORS[place.category] || '#78909c';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=transit`;

  return (
    <Box sx={{ minWidth: 220, maxWidth: 280, borderRadius: 3, overflow: 'hidden', bgcolor: muiAlpha(theme.palette.background.paper, 0.92), backdropFilter: 'blur(16px)', border: `1px solid ${muiAlpha(theme.palette.common.white, 0.08)}`, boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }}>
      {place.imageUrl && <Box sx={{ height: 120, overflow: 'hidden', background: `linear-gradient(135deg,${color}44,${color}22),url(${place.imageUrl}) center/cover` }} />}
      <Box sx={{ px: 2, pt: place.imageUrl ? 1.5 : 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{CATEGORY_EMOJIS[place.category] || '📍'}</Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>{place.name}</Typography>
        </Box>
        {place.address && <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: muiAlpha(theme.palette.text.primary, 0.6), fontSize: '0.7rem' }}>{place.address}</Typography>}
        <Typography variant="caption" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1, color: muiAlpha(theme.palette.text.primary, 0.7), fontSize: '0.75rem', lineHeight: 1.4 }}>{place.description}</Typography>
        <Stack direction="row" spacing={0.5}>
          {place.link && <Button variant="contained" size="small" href={place.link} target="_blank" rel="noopener noreferrer" startIcon={<LanguageIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', fontSize: 11, py: 0.3, px: 1, borderRadius: 2, minWidth: 0, background: `linear-gradient(135deg,${color},${color}88)` }}>Web</Button>}
          <Button variant="outlined" size="small" href={directionsUrl} target="_blank" rel="noopener noreferrer" startIcon={<DirectionsIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', fontSize: 11, py: 0.3, px: 1, borderRadius: 2, minWidth: 0, borderColor: muiAlpha(theme.palette.common.white, 0.12), color: muiAlpha(theme.palette.text.primary, 0.8) }}>Cómo llegar</Button>
        </Stack>
      </Box>
    </Box>
  );
}

function MapInit({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (!done.current) {
      done.current = true;
      const timer = setTimeout(() => {
        map.invalidateSize();
        onReady(map);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [map, onReady]);

  return null;
}

function HeatmapLayer({ points, visible }: { points: [number, number, number?][]; visible: boolean }) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!visible) {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
      return;
    }
    const heat = (L as any).heatLayer(points, { radius: 30, blur: 18, maxZoom: 17, gradient: { 0.4: '#7c4dff', 0.65: '#40c4ff', 1: '#ff1744' } });
    heat.addTo(map);
    layerRef.current = heat;
    return () => { if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; } };
  }, [map, points, visible]);

  return null;
}

function SearchBar({ map, apiKey }: { map: L.Map | null; apiKey: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const theme = useTheme();

  const searchLocal = (q: string) => {
    const lower = q.toLowerCase();
    return placesData.filter(p => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower) || (p.address && p.address.toLowerCase().includes(lower))).map(p => ({ name: `${p.name} (${p.category})`, lat: p.coordinates.lat, lng: p.coordinates.lng }));
  };

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !map) return;
    setSearching(true);
    setNoResults(false);
    const local = searchLocal(query.trim());
    if (local.length > 0) { setResults(local); setShowResults(true); setSearching(false); return; }
    try {
      const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query.trim())}.json?key=${apiKey}&bbox=-6.2,37.2,-5.7,37.6&limit=5`);
      const data = await res.json();
      if (data.features?.length) { setResults(data.features.map((f: any) => ({ name: f.place_name || f.text, lat: f.center[1], lng: f.center[0] }))); setShowResults(true); }
      else { setNoResults(true); }
    } catch (e) { loggerClient.error('Search error:', e); setNoResults(true); }
    setSearching(false);
  }, [query, map, apiKey]);

  const select = (r: { name: string; lat: number; lng: number }) => { map?.flyTo([r.lat, r.lng], 16, { duration: 1 }); setShowResults(false); setNoResults(false); setQuery(r.name); };

  return (
    <Box sx={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000 }}>
      <Box sx={{ display: 'flex', gap: 1, bgcolor: muiAlpha(theme.palette.background.paper, 0.92), backdropFilter: 'blur(12px)', borderRadius: 3, border: `1px solid ${muiAlpha(theme.palette.common.white, 0.08)}`, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', p: '6px' }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5 }}>
          <SearchOutlinedIcon sx={{ color: muiAlpha(theme.palette.text.primary, 0.5), fontSize: 20 }} />
          <input value={query} onChange={e => { setQuery(e.target.value); setNoResults(false); }} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Buscar lugar, dirección…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: theme.palette.text.primary, fontSize: '0.9rem', fontFamily: 'inherit' }} />
          {query && <IconButton size="small" onClick={() => { setQuery(''); setShowResults(false); setNoResults(false); }} sx={{ color: muiAlpha(theme.palette.text.primary, 0.3) }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>}
        </Box>
        <Button onClick={handleSearch} disabled={searching || !query.trim()} sx={{ minWidth: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg,#7c4dff,#40c4ff)', color: 'white', '&:hover': { opacity: 0.9 } }}>
          {searching ? <CircularProgress size={20} color="inherit" /> : <SearchOutlinedIcon sx={{ fontSize: 20 }} />}
        </Button>
      </Box>
      {showResults && results.length > 0 && (
        <Box sx={{ mt: 0.5, borderRadius: 2, overflow: 'hidden', bgcolor: muiAlpha(theme.palette.background.paper, 0.95), backdropFilter: 'blur(12px)', border: `1px solid ${muiAlpha(theme.palette.common.white, 0.08)}`, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          {results.map((r, i) => (<Box key={i} onClick={() => select(r)} sx={{ px: 2, py: 1.5, cursor: 'pointer', borderBottom: i < results.length - 1 ? `1px solid ${muiAlpha(theme.palette.common.white, 0.05)}` : 'none', '&:hover': { bgcolor: muiAlpha(theme.palette.common.white, 0.05) } }}><Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>{r.name}</Typography></Box>))}
        </Box>
      )}
      {noResults && (
        <Box sx={{ mt: 0.5, borderRadius: 2, p: 2, textAlign: 'center', bgcolor: muiAlpha(theme.palette.background.paper, 0.95), backdropFilter: 'blur(12px)', border: `1px solid ${muiAlpha(theme.palette.common.white, 0.08)}`, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <Typography variant="body2" sx={{ color: muiAlpha(theme.palette.text.primary, 0.5) }}>No se encontraron resultados</Typography>
        </Box>
      )}
    </Box>
  );
}

export default function InteractiveMap({ selectedPlace, compact = false, height = '100dvh', markersOnly = false }: { selectedPlace?: Place; compact?: boolean; height?: string | number; markersOnly?: boolean }) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [userPosition, setUserPosition] = useState<L.LatLng | null>(null);
  const [customPlaces, setCustomPlaces] = useState<Place[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapVersion, setHeatmapVersion] = useState(0);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [coordsToAdd, setCoordsToAdd] = useState<L.LatLng | null>(null);
  const [activePopup, setActivePopup] = useState<Place | null>(null);
  const theme = useTheme();

  const filterCategories = ['Residencia', 'Cultural', 'Comida', 'Ocio', 'Servicios', 'Estudio', 'Transporte', 'Metro', 'Salud', 'Personalizado'];

  useEffect(() => { try { const raw = localStorage.getItem('userCustomPlaces'); if (raw) setCustomPlaces(JSON.parse(raw)); } catch {} }, []);
  useEffect(() => { localStorage.setItem('userCustomPlaces', JSON.stringify(customPlaces)); }, [customPlaces]);

  useEffect(() => {
    if (selectedPlace && map) {
      map.flyTo([selectedPlace.coordinates.lat, selectedPlace.coordinates.lng], 16, { duration: 0.8 });
      setActivePopup(selectedPlace);
      let clickMap: Record<string, number> = {};
      try { const raw = localStorage.getItem('placeClicks'); if (raw) clickMap = JSON.parse(raw); } catch {}
      clickMap[selectedPlace.id] = (clickMap[selectedPlace.id] || 0) + 1;
      localStorage.setItem('placeClicks', JSON.stringify(clickMap));
      setHeatmapVersion(v => v + 1);
    }
  }, [selectedPlace, map]);

  const handleMarkerClick = (place: Place) => {
    setActivePopup(place);
    let clickMap: Record<string, number> = {};
    try { const raw = localStorage.getItem('placeClicks'); if (raw) clickMap = JSON.parse(raw); } catch {}
    clickMap[place.id] = (clickMap[place.id] || 0) + 1;
    localStorage.setItem('placeClicks', JSON.stringify(clickMap));
    setHeatmapVersion(v => v + 1);
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => { setUserPosition(new L.LatLng(pos.coords.latitude, pos.coords.longitude)); map?.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1 }); }, () => {}, { enableHighAccuracy: true, timeout: 10000 });
  };

  const handleMapReady = useCallback((m: L.Map) => { setMap(m); }, []);

  const filteredPlaces = placesData.filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category));
  const filteredCustom = customPlaces.filter(p => selectedCategories.length === 0 || selectedCategories.includes('Personalizado') || selectedCategories.includes(p.category));
  const heatmapPoints = (() => {
    let clickMap: Record<string, number> = {};
    try { const raw = localStorage.getItem('placeClicks'); if (raw) clickMap = JSON.parse(raw); } catch {}
    const maxClicks = Math.max(1, ...Object.values(clickMap));
    return placesData.map(p => [p.coordinates.lat, p.coordinates.lng, (clickMap[p.id] || 0) / maxClicks || 0.1] as [number, number, number?]);
  })();

  const mapHeight = compact ? (typeof height === 'number' ? `${height}px` : height) : '100dvh';

  return (
    <Box sx={{ width: '100%', position: compact ? 'relative' : undefined }}>
      {!markersOnly && <MaterialFilterChips categories={filterCategories} selectedCategories={selectedCategories} onCategoriesChange={setSelectedCategories} />}

      <Box sx={{ position: 'relative', width: '100%', height: mapHeight, borderRadius: compact ? 3 : 0, overflow: 'hidden' }}>
        <MapContainer
          center={[37.385, -5.9925]}
          zoom={14}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="© OpenStreetMap © CARTO"
          />

          {!markersOnly && (
            <MarkerClusterGroup chunkedLoading maxClusterRadius={50} spiderfyOnMaxZoom>
              {filteredPlaces.map(place => (
                <Marker key={place.id} position={place.coordinates} icon={createCategoryIcon(place.category, activePopup?.id === place.id)} eventHandlers={{ click: () => handleMarkerClick(place) }}>
                  <Popup maxWidth={320} closeButton={false}><GlassPopup place={place} /></Popup>
                </Marker>
              ))}
              {filteredCustom.map(place => (
                <Marker key={`custom-${place.id}`} position={place.coordinates} icon={createCategoryIcon('Personalizado')} eventHandlers={{ click: () => handleMarkerClick(place) }}>
                  <Popup maxWidth={320} closeButton={false}><GlassPopup place={place} /></Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}

          {userPosition && (
            <Marker position={userPosition} icon={createUserLocationIcon(theme.palette.primary.main)}>
              <Popup closeButton={false}><Box sx={{ textAlign: 'center', px: 1, py: 0.5 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>📍 Tu ubicación</Typography></Box></Popup>
            </Marker>
          )}

          {!markersOnly && <HeatmapLayer points={heatmapPoints} visible={showHeatmap} key={heatmapVersion} />}
          <MapInit onReady={handleMapReady} />
        </MapContainer>

        {!markersOnly && <SearchBar map={map} apiKey={API_KEY} />}

        {!markersOnly && (
          <>
            <Fab size="small" onClick={() => setShowHeatmap(v => !v)} sx={{ position: 'absolute', top: showHeatmap ? 130 : 86, right: 12, zIndex: 1000, bgcolor: showHeatmap ? '#ff1744' : muiAlpha(theme.palette.background.paper, 0.85), color: showHeatmap ? 'white' : theme.palette.text.primary, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
              <WhatshotIcon sx={{ fontSize: 20 }} />
            </Fab>
            <Fab size="small" onClick={getUserLocation} sx={{ position: 'absolute', bottom: 80, right: 12, zIndex: 1000, bgcolor: muiAlpha(theme.palette.background.paper, 0.85), color: theme.palette.primary.main, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
              <MyLocationIcon />
            </Fab>
          </>
        )}
      </Box>

      <AddPlaceModal open={showAddPlaceModal} onClose={() => { setShowAddPlaceModal(false); setCoordsToAdd(null); }} onSubmit={(newPlace) => { setCustomPlaces(prev => [...prev, newPlace]); setShowAddPlaceModal(false); setCoordsToAdd(null); }} coords={coordsToAdd} />
    </Box>
  );
}
