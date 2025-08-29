'use client';

import SpotifyPlayer from '@/components/spotify/SpotifyPlayer';
import { Box, Typography } from '@mui/material';

export default function TestPlayerPage() {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Prueba del Reproductor de Spotify
      </Typography>
      <SpotifyPlayer />
    </Box>
  );
}
