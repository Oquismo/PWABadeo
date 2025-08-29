import React from 'react';
import { Box, Typography } from '@mui/material';

const SpotifyPlayer = () => {
  // UI de Spotify temporalmente deshabilitada para futuras versiones
  return (
    <Box sx={{ display: 'none' }}>
      {/* Spotify UI oculta temporalmente */}
      <Typography variant="body2" color="text.secondary">
        Reproductor de Spotify - Próximamente
      </Typography>
    </Box>
  );
};

export default SpotifyPlayer;

