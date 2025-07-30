'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLng } from 'leaflet';
import { Box, Typography, Fab } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// Arreglo para un bug conocido de Leaflet con los iconos por defecto en React
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// Definimos los puntos de interés
const locations = [
  {
    position: [37.3891, -5.9845] as LatLngExpression,
    name: 'Tu Alojamiento',
    description: 'Calle Falsa, 123'
  },
  {
    position: [37.3828, -5.9732] as LatLngExpression,
    name: 'Oficina Barrio de Oportunidades',
    description: 'Plaza de España'
  },
  {
    position: [37.4023, -5.9965] as LatLngExpression,
    name: 'Tu Empresa / Universidad',
    description: 'Isla de la Cartuja'
  },
];

// Componente para el botón de geolocalización
function LocationButton({ setUserPosition }: { setUserPosition: (pos: LatLng) => void }) {
    const map = useMap(); // Hook para acceder a la instancia del mapa

    const handleClick = () => {
        map.locate().on('locationfound', function (e) {
            setUserPosition(e.latlng);
            map.flyTo(e.latlng, 15); // Anima el mapa hasta la ubicación del usuario
        }).on('locationerror', function(e){
            alert(e.message); // Muestra un error si no se pudo obtener la ubicación
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

export default function InteractiveMap() {
  const defaultPosition: LatLngExpression = [37.3891, -5.9845];
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);

  return (
    <MapContainer center={defaultPosition} zoom={14} style={{ height: '70vh', width: '100%', borderRadius: '16px', position: 'relative' }}>
        {/* 1. Nuevo estilo de mapa (tema oscuro) */}
        <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Marcadores de los puntos de interés */}
        {locations.map((loc) => (
            <Marker key={loc.name} position={loc.position}>
                <Popup>
                    <Box>
                        <Typography variant="subtitle2" component="div" fontWeight="bold">{loc.name}</Typography>
                        <Typography variant="caption">{loc.description}</Typography>
                    </Box>
                </Popup>
            </Marker>
        ))}

        {/* 2. Marcador para la ubicación del usuario (si existe) */}
        {userPosition && (
            <Marker position={userPosition}>
                <Popup>Estás aquí</Popup>
            </Marker>
        )}

        {/* 3. Botón para activar la geolocalización */}
        <LocationButton setUserPosition={setUserPosition} />
    </MapContainer>
  );
}