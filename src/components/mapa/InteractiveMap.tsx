'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLng } from 'leaflet';
import { Box, Typography, Fab, TextField, IconButton, InputAdornment, Button } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';


// Arreglo para los iconos por defecto
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationPoint {
  position: LatLngExpression;
  name: string;
  description: string;
}

const locations: LocationPoint[] = [
  {
    position: [37.3891, -5.9845],
    name: 'Tu Alojamiento',
    description: 'Calle Falsa, 123'
  },
  {
    position: [37.3828, -5.9732],
    name: 'Oficina Barrio de Oportunidades',
    description: 'Plaza de España'
  },
  {
    position: [37.4023, -5.9965],
    name: 'Tu Empresa / Universidad',
    description: 'Isla de la Cartuja'
  },
];

// Componente que nos da acceso a la instancia del mapa
function MapController({ setMap }: { setMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  return null;
}

// Componente para el botón de geolocalización
function LocationButton({ setUserPosition }: { setUserPosition: (pos: LatLng) => void }) {
    const map = useMap();

    const handleClick = () => {
        map.locate().on('locationfound', function (e) {
            setUserPosition(e.latlng);
            map.flyTo(e.latlng, 15);
        }).on('locationerror', function(e){
            alert(e.message);
        });
    };

    return (
        <Fab 
            color="primary" 
            size="small"
            onClick={handleClick}
            sx={{ position: 'absolute', top: 85, right: 10, zIndex: 1000 }}
            aria-label="find my location"
        >
            <MyLocationIcon />
        </Fab>
    );
}

export default function InteractiveMap() {
  const defaultPosition: LatLngExpression = [37.3891, -5.9845];
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState<L.Map | null>(null);
  const apiKey = 'Gq2uZmTMhM4Vpv2fhXOR';

  const handleSearch = async () => {
    if (!searchQuery || !map) return;
    
    // --- BÚSQUEDA HIPERPRECISA CON BBOX ---
    // Definimos una "valla" geográfica alrededor de Sevilla y su área metropolitana
    const bbox = "-6.1,37.3,-5.8,37.5"; // [minLon, minLat, maxLon, maxLat]
    
    try {
      // Usamos el parámetro 'bbox' para forzar los resultados dentro de esta área
      const response = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${apiKey}&bbox=${bbox}`);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].center;
        const newPosition = new LatLng(lat, lon);
        map.flyTo(newPosition, 15);
      } else {
        alert('No se encontraron resultados para tu búsqueda en el área de Sevilla.');
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      alert('Ocurrió un error al realizar la búsqueda.');
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar un lugar en Sevilla..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSearch} edge="end">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <MapContainer 
        center={defaultPosition} 
        zoom={14} 
        style={{ 
          height: '65vh',
          width: '100%', 
          borderRadius: '16px', 
          position: 'relative', 
          zIndex: 0 
        }}
      >
        <TileLayer
            url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${apiKey}`}
            attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
        />
        
        {locations.map((loc) => {
            const [lat, lng] = Array.isArray(loc.position) ? loc.position : [loc.position.lat, loc.position.lng];
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            
            return (
              <Marker key={loc.name} position={loc.position}>
                  <Popup>
                      <Box>
                          <Typography variant="subtitle2" component="div" fontWeight="bold">{loc.name}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>{loc.description}</Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DirectionsIcon />}
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Cómo llegar
                          </Button>
                      </Box>
                  </Popup>
              </Marker>
            );
        })}

        {userPosition && (
            <Marker position={userPosition}>
                <Popup>Estás aquí</Popup>
            </Marker>
        )}

        <LocationButton setUserPosition={setUserPosition} />
        <MapController setMap={setMap} />
      </MapContainer>
    </Box>
  );
}
