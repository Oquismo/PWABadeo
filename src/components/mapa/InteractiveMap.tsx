'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { Box, Typography } from '@mui/material';

// Arreglo para un bug conocido de Leaflet con los iconos por defecto en React
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// Definimos los puntos de interés (usando coordenadas de Sevilla como ejemplo)
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

export default function InteractiveMap() {
  const defaultPosition: LatLngExpression = [37.3891, -5.9845];

  return (
    <MapContainer center={defaultPosition} zoom={14} style={{ height: '70vh', width: '100%', borderRadius: '16px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
    </MapContainer>
  );
}