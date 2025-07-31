'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLng } from 'leaflet';
import { Box, Typography, Fab, Button } from '@mui/material'; // 1. Importar Button
import MyLocationIcon from '@mui/icons-material/MyLocation';
import DirectionsIcon from '@mui/icons-material/Directions'; // 2. Importar el icono de direcciones

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
            sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}
            aria-label="find my location"
        >
            <MyLocationIcon />
        </Fab>
    );
}

// --- SOLUCIÓN: Componente para forzar la actualización del tamaño del mapa ---
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 400); // 400ms es un poco más que la duración de nuestra animación de página

    return () => {
      clearTimeout(timer);
    };
  }, [map]);
  return null;
}

export default function InteractiveMap() {
  const defaultPosition: LatLngExpression = [37.3891, -5.9845];
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const apiKey = 'Gq2uZmTMhM4Vpv2fhXOR'; // Tu clave API

  return (
    <MapContainer 
      center={defaultPosition} 
      zoom={14} 
      style={{ 
        height: '70vh', 
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
            // Extraemos las coordenadas para crear el enlace
            const [lat, lng] = Array.isArray(loc.position) ? loc.position : [loc.position.lat, loc.position.lng];
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

            return (
              <Marker key={loc.name} position={loc.position}>
                  <Popup>
                      <Box>
                          <Typography variant="subtitle2" component="div" fontWeight="bold">{loc.name}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>{loc.description}</Typography>
                          {/* 3. Botón para abrir las indicaciones */}
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DirectionsIcon />}
                            href={directionsUrl}
                            target="_blank" // Abre en una nueva pestaña (o en la app de mapas)
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
        
        <MapResizer />
    </MapContainer>
  );
}
