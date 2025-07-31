'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack } from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';

export default function RoutePlanner() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Construimos la URL dinámicamente basándonos en el estado de los campos
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit`;

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
        {/* --- SOLUCIÓN: Convertimos el botón en un enlace --- */}
        <Button
          variant="contained"
          component="a" // 1. Le decimos a MUI que renderice un <a> en lugar de un <button>
          href={destination ? googleMapsUrl : '#'} // 2. Usamos el href para el enlace
          target="_blank" // 3. Esto abre el enlace en una nueva pestaña (o en la app de mapas)
          rel="noopener noreferrer"
          disabled={!destination} // 4. El botón está desactivado si no hay destino
        >
          Buscar Ruta
        </Button>
      </Stack>
    </Paper>
  );
}
