'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLng } from 'leaflet';
import { Box, Typography, Fab } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

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

export default function InteractiveMap() {
  const defaultPosition: LatLngExpression = [37.3891, -5.9845];
  // CORRECCIÓN: Se ha eliminado un '=' extra en esta línea
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);

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
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
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

        {userPosition && (
            <Marker position={userPosition}>
                <Popup>Estás aquí</Popup>
            </Marker>
        )}

        <LocationButton setUserPosition={setUserPosition} />
    </MapContainer>
  );
}