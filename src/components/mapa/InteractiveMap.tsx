'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
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

// Fix Leaflet default icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API_KEY = 'Gq2uZmTMhM4Vpv2fhXOR';

const CATEGORY_COLORS: Record<string, string> = {
  Residencia: '#7c4dff', Comida: '#ff6d00', Salud: '#00c853', Transporte: '#00bcd4',
  Metro: '#2979ff', Ocio: '#ff1744', Cultural: '#d500f9', Servicios: '#ff9100',
  Estudio: '#00e676', Personalizado: '#78909c',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Residencia: '🏠', Comida: '🍽️', Salud: '🏥', Transporte: '🚌', Metro: '🚇',
  Ocio: '🎉', Cultural: '🏛️', Servicios: '🔧', Estudio: '📚', Personalizado: '📍',
};

function makeIcon(category: string, selected = false) {
  const color = CATEGORY_COLORS[category] || '#78909c';
  const emoji = CATEGORY_EMOJIS[category] || '📍';
  const size = selected ? 48 : 40;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,${color}dd,${color}88);border:${selected ? 3 : 2}px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 ${selected ? 4 : 2}px ${selected ? 16 : 8}px rgba(0,0,0,.4);font-size:${selected ? 22 : 18}px">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function userIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:36px;height:36px;background:${color};border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 8px ${color}44,0 4px 16px rgba(0,0,0,.5)"><div style="width:12px;height:12px;background:#fff;border-radius:50%"></div></div>`,
    className: '', iconSize: [36, 36], iconAnchor: [18, 18],
  });
}

function GlassPopup({ place }: { place: Place }) {
  const theme = useTheme();
  const color = CATEGORY_COLORS[place.category] || '#78909c';
  const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=transit`;
  return (
    <Box sx={{ minWidth: 220, maxWidth: 280, borderRadius: 3, overflow: 'hidden', bgcolor: muiAlpha(theme.palette.background.paper, 0.95), border: `1px solid ${muiAlpha(theme.palette.common.white, 0.1)}`, boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }}>
      {place.imageUrl && <Box sx={{ height: 120, overflow: 'hidden', background: `linear-gradient(135deg,${color}44,${color}22),url(${place.imageUrl}) center/cover` }} />}
      <Box sx={{ px: 2, pt: place.imageUrl ? 1.5 : 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{CATEGORY_EMOJIS[place.category] || '📍'}</Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>{place.name}</Typography>
        </Box>
        {place.address && <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: muiAlpha(theme.palette.text.primary, 0.6), fontSize: '0.7rem' }}>{place.address}</Typography>}
        <Typography variant="caption" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1, color: muiAlpha(theme.palette.text.primary, 0.7), fontSize: '0.75rem', lineHeight: 1.4 }}>{place.description}</Typography>
        <Stack direction="row" spacing={0.5}>
          {place.link && <Button variant="contained" size="small" href={place.link} target="_blank" startIcon={<LanguageIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', fontSize: 11, py: 0.3, px: 1, borderRadius: 2, minWidth: 0, background: `linear-gradient(135deg,${color},${color}88)` }}>Web</Button>}
          <Button variant="outlined" size="small" href={dirUrl} target="_blank" startIcon={<DirectionsIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', fontSize: 11, py: 0.3, px: 1, borderRadius: 2, minWidth: 0, borderColor: muiAlpha(theme.palette.common.white, 0.12), color: muiAlpha(theme.palette.text.primary, 0.8) }}>Cómo llegar</Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default function InteractiveMap({ selectedPlace, compact = false, height = '100dvh', markersOnly = false }: { selectedPlace?: Place; compact?: boolean; height?: string | number; markersOnly?: boolean }) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const clusterRef = useRef<any>(null);
  const heatRef = useRef<L.Layer | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [userPos, setUserPos] = useState<L.LatLng | null>(null);
  const [customPlaces, setCustomPlaces] = useState<Place[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [showHeat, setShowHeat] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [coordsAdd, setCoordsAdd] = useState<L.LatLng | null>(null);
  const theme = useTheme();

  const filterCats = ['Residencia', 'Cultural', 'Comida', 'Ocio', 'Servicios', 'Estudio', 'Transporte', 'Metro', 'Salud', 'Personalizado'];

  useEffect(() => {
    try { const r = localStorage.getItem('userCustomPlaces'); if (r) setCustomPlaces(JSON.parse(r)); } catch {}
  }, []);

  useEffect(() => { localStorage.setItem('userCustomPlaces', JSON.stringify(customPlaces)); }, [customPlaces]);

  // INIT MAP
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const m = L.map(mapDivRef.current, { center: [37.385, -5.9925], zoom: 14, zoomControl: !compact });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(m);

    mapRef.current = m;

    const timer = setTimeout(() => {
      m.invalidateSize();
      setMapReady(true);
    }, 200);

    return () => { clearTimeout(timer); m.remove(); mapRef.current = null; setMapReady(false); };
  }, [compact]);

  // MARKERS
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach(mk => mk.remove());
    markersRef.current = [];
    if (clusterRef.current) { map.removeLayer(clusterRef.current); clusterRef.current = null; }

    const allPlaces = [...placesData, ...customPlaces];
    const filtered = cats.length === 0
      ? allPlaces
      : allPlaces.filter(p => cats.includes(p.category) || (cats.includes('Personalizado') && customPlaces.includes(p)));

    const markers = filtered.map(place => {
      const mk = L.marker([place.coordinates.lat, place.coordinates.lng], {
        icon: makeIcon(customPlaces.includes(place) ? 'Personalizado' : place.category, activeId === place.id),
      });
      mk.on('click', () => {
        setActiveId(place.id);
        let clicks: Record<string, number> = {};
        try { const r = localStorage.getItem('placeClicks'); if (r) clicks = JSON.parse(r); } catch {}
        clicks[place.id] = (clicks[place.id] || 0) + 1;
        localStorage.setItem('placeClicks', JSON.stringify(clicks));
        updateHeatmap();
      });
      mk.bindPopup('', { maxWidth: 320, closeButton: false });
      mk.on('popupopen', () => {
        const el = mk.getPopup()?.getElement();
        if (el) {
          const root = el.querySelector('.leaflet-popup-content');
          if (root) {
            root.innerHTML = '';
            // We'll use a simpler approach - just set text
          }
        }
      });
      return mk;
    });

    if (!markersOnly && markers.length > 0) {
      const cg = (L as any).markerClusterGroup({ maxClusterRadius: 50, spiderfyOnMaxZoom: true });
      markers.forEach(mk => cg.addLayer(mk));
      cg.addTo(map);
      clusterRef.current = cg;
    } else {
      markers.forEach(mk => mk.addTo(map));
    }

    markersRef.current = markers;
  }, [mapReady, cats, customPlaces, activeId, markersOnly]);

  // SELECTED PLACE
  useEffect(() => {
    if (selectedPlace && mapRef.current) {
      mapRef.current.flyTo([selectedPlace.coordinates.lat, selectedPlace.coordinates.lng], 16, { duration: 0.8 });
      setActiveId(selectedPlace.id);
    }
  }, [selectedPlace]);

  // USER LOCATION MARKER
  useEffect(() => {
    if (!mapRef.current) return;
    const existing = markersRef.current.find(m => (m as any)._isUserMarker);
    if (existing) { existing.remove(); markersRef.current = markersRef.current.filter(m => m !== existing); }
    if (userPos) {
      const mk = L.marker(userPos, { icon: userIcon(theme.palette.primary.main) });
      (mk as any)._isUserMarker = true;
      mk.bindPopup('<div style="text-align:center;font-weight:600">📍 Tu ubicación</div>', { closeButton: false });
      mk.addTo(mapRef.current);
      markersRef.current.push(mk);
    }
  }, [userPos, theme]);

  // HEATMAP
  const updateHeatmap = useCallback(() => {
    if (!mapRef.current) return;
    if (heatRef.current) { mapRef.current.removeLayer(heatRef.current); heatRef.current = null; }
    if (!showHeat) return;

    let clicks: Record<string, number> = {};
    try { const r = localStorage.getItem('placeClicks'); if (r) clicks = JSON.parse(r); } catch {}
    const max = Math.max(1, ...Object.values(clicks));
    const pts = placesData.map(p => [p.coordinates.lat, p.coordinates.lng, (clicks[p.id] || 0) / max || 0.1] as [number, number, number]);

    const heat = (L as any).heatLayer(pts, { radius: 30, blur: 18, maxZoom: 17, gradient: { 0.4: '#7c4dff', 0.65: '#40c4ff', 1: '#ff1744' } });
    heat.addTo(mapRef.current);
    heatRef.current = heat;
  }, [showHeat]);

  useEffect(() => { updateHeatmap(); }, [showHeat, mapReady, updateHeatmap]);

  const getUserLoc = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(p => {
      const ll = new L.LatLng(p.coords.latitude, p.coords.longitude);
      setUserPos(ll);
      mapRef.current!.flyTo(ll, 16, { duration: 1 });
    }, () => {}, { enableHighAccuracy: true, timeout: 10000 });
  };

  const h = compact ? (typeof height === 'number' ? `${height}px` : height) : undefined;

  return (
    <>
      <style>{`
        .leaflet-container { width: 100% !important; height: 100% !important; }
        .leaflet-control-zoom { display: none !important; }
      `}</style>
      <Box sx={{ width: '100%', height: h, position: compact ? 'relative' : 'fixed', top: compact ? undefined : 0, left: compact ? undefined : 0, right: compact ? undefined : 0, bottom: compact ? undefined : 0 }}>
      {!markersOnly && <MaterialFilterChips categories={filterCats} selectedCategories={cats} onCategoriesChange={setCats} />}

      <div ref={mapDivRef} style={{ width: '100%', height: compact ? h : 'calc(100dvh - 48px)', position: 'absolute', top: markersOnly ? 0 : 48, left: 0, right: 0, bottom: 0, zIndex: 0 }} />

      {!markersOnly && <SearchBar map={mapRef.current} apiKey={API_KEY} />}

      {!markersOnly && (
        <>
          <Fab size="small" onClick={() => setShowHeat(v => !v)} sx={{ position: 'absolute', top: showHeat ? 130 : 86, right: 12, zIndex: 1000, bgcolor: showHeat ? '#ff1744' : muiAlpha(theme.palette.background.paper, 0.85), color: showHeat ? 'white' : theme.palette.text.primary, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            <WhatshotIcon sx={{ fontSize: 20 }} />
          </Fab>
          <Fab size="small" onClick={getUserLoc} sx={{ position: 'absolute', bottom: 80, right: 12, zIndex: 1000, bgcolor: muiAlpha(theme.palette.background.paper, 0.85), color: theme.palette.primary.main, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            <MyLocationIcon />
          </Fab>
        </>
      )}

      <AddPlaceModal open={showModal} onClose={() => { setShowModal(false); setCoordsAdd(null); }} onSubmit={np => { setCustomPlaces(p => [...p, np]); setShowModal(false); setCoordsAdd(null); }} coords={coordsAdd} />
    </Box>
    </>
  );
}

function SearchBar({ map, apiKey }: { map: L.Map | null; apiKey: string }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [none, setNone] = useState(false);
  const theme = useTheme();

  const search = useCallback(async () => {
    if (!q.trim() || !map) return;
    setLoading(true); setNone(false);
    const lower = q.toLowerCase();
    const local = placesData.filter(p => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower) || (p.address && p.address.toLowerCase().includes(lower))).map(p => ({ name: `${p.name} (${p.category})`, lat: p.coordinates.lat, lng: p.coordinates.lng }));
    if (local.length) { setResults(local); setShow(true); setLoading(false); return; }
    try {
      const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(q.trim())}.json?key=${apiKey}&bbox=-6.2,37.2,-5.7,37.6&limit=5`);
      const data = await res.json();
      if (data.features?.length) { setResults(data.features.map((f: any) => ({ name: f.place_name || f.text, lat: f.center[1], lng: f.center[0] }))); setShow(true); }
      else setNone(true);
    } catch { setNone(true); }
    setLoading(false);
  }, [q, map, apiKey]);

  const pick = (r: { name: string; lat: number; lng: number }) => { map?.flyTo([r.lat, r.lng], 16, { duration: 1 }); setShow(false); setNone(false); setQ(r.name); };

  return (
    <Box sx={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000 }}>
      <Box sx={{ display: 'flex', gap: 1, bgcolor: muiAlpha(theme.palette.background.paper, 0.92), backdropFilter: 'blur(12px)', borderRadius: 3, border: `1px solid ${muiAlpha(theme.palette.common.white, 0.08)}`, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', p: '6px' }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5 }}>
          <SearchOutlinedIcon sx={{ color: muiAlpha(theme.palette.text.primary, 0.5), fontSize: 20 }} />
          <input value={q} onChange={e => { setQ(e.target.value); setNone(false); }} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Buscar lugar, dirección…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: theme.palette.text.primary, fontSize: '0.9rem', fontFamily: 'inherit' }} />
          {q && <IconButton size="small" onClick={() => { setQ(''); setShow(false); setNone(false); }} sx={{ color: muiAlpha(theme.palette.text.primary, 0.3) }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>}
        </Box>
        <Button onClick={search} disabled={loading || !q.trim()} sx={{ minWidth: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg,#7c4dff,#40c4ff)', color: 'white' }}>
          {loading ? <CircularProgress size={20} color="inherit" /> : <SearchOutlinedIcon sx={{ fontSize: 20 }} />}
        </Button>
      </Box>
      {show && results.length > 0 && (
        <Box sx={{ mt: 0.5, borderRadius: 2, overflow: 'hidden', bgcolor: muiAlpha(theme.palette.background.paper, 0.95), border: `1px solid ${muiAlpha(theme.palette.common.white, 0.08)}`, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          {results.map((r, i) => (<Box key={i} onClick={() => pick(r)} sx={{ px: 2, py: 1.5, cursor: 'pointer', borderBottom: i < results.length - 1 ? `1px solid ${muiAlpha(theme.palette.common.white, 0.05)}` : 'none', '&:hover': { bgcolor: muiAlpha(theme.palette.common.white, 0.05) } }}><Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>{r.name}</Typography></Box>))}
        </Box>
      )}
      {none && <Box sx={{ mt: 0.5, borderRadius: 2, p: 2, textAlign: 'center', bgcolor: muiAlpha(theme.palette.background.paper, 0.95), border: `1px solid ${muiAlpha(theme.palette.common.white, 0.08)}`, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}><Typography variant="body2" sx={{ color: muiAlpha(theme.palette.text.primary, 0.5) }}>No se encontraron resultados</Typography></Box>}
    </Box>
  );
}
