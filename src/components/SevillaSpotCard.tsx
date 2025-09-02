"use client";
import React from "react";
import { Box, Typography, Chip, Card, CardContent, Stack, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';

// Datos de ejemplo
const spot = {
  name: "Plaza de España",
  description:
    "La Plaza de España es uno de los lugares más emblemáticos de Sevilla, famosa por su arquitectura y su ambiente único.",
  distance: "1.2 km",
  time: "10 min",
  activity: "Paseo",
  kcal: "45 kcal",
  level: "Fácil",
};

export default function SevillaSpotCard() {
  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mt: 2 }}>
      <Card
        sx={{
          bgcolor: '#18181c',
          color: '#fff',
          borderRadius: 4,
          boxShadow: 6,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Espacio reservado para la imagen */}
        <Box sx={{ height: 220, width: '100%', bgcolor: '#22223a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {/* Botón atrás */}
          <IconButton sx={{ position: 'absolute', top: 12, left: 12, color: '#fff', bgcolor: 'rgba(40,40,42,0.6)' }}>
            <ArrowBackIcon />
          </IconButton>
          {/* Botón compartir */}
          <IconButton sx={{ position: 'absolute', top: 12, right: 12, color: '#fff', bgcolor: 'rgba(40,40,42,0.6)' }}>
            <ShareIcon />
          </IconButton>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            Imagen aquí
          </Typography>
        </Box>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {spot.name}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
            {spot.description}
          </Typography>
          <Stack direction="row" spacing={1} mt={2}>
            <Chip label={spot.distance} color="primary" variant="filled" sx={{ bgcolor: '#22223a', color: '#fff' }} />
            <Chip label={spot.time} color="secondary" variant="filled" sx={{ bgcolor: '#22223a', color: '#fff' }} />
            <Chip label={spot.activity} color="default" variant="filled" sx={{ bgcolor: '#22223a', color: '#fff' }} />
          </Stack>
          <Stack direction="row" spacing={1} mt={2}>
            <Chip label={spot.kcal} color="warning" variant="filled" sx={{ bgcolor: '#22223a', color: '#fff' }} />
            <Chip label={spot.level} color="info" variant="filled" sx={{ bgcolor: '#22223a', color: '#fff' }} />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
