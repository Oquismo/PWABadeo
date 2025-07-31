'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack } from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';

export default function RoutePlanner() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handlePlanRoute = () => {
    if (!destination) {
      alert('Por favor, introduce un destino.');
      return;
    }

    // Si el origen está vacío, Google Maps usará la ubicación actual del usuario
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit`;

    // Abrimos el enlace en una nueva pestaña (o en la app de Google Maps en el móvil)
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <RouteIcon />
        <Typography variant="h6" fontWeight="bold">
          Planificar Ruta en Autobús
        </Typography>
      </Stack>
      <Stack spacing={2}>
        <TextField
          label="Origen (o dejar en blanco para tu ubicación)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          fullWidth
        />
        <TextField
          label="Destino"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          fullWidth
          required
        />
        <Button variant="contained" onClick={handlePlanRoute}>
          Buscar Ruta
        </Button>
      </Stack>
    </Paper>
  );
}