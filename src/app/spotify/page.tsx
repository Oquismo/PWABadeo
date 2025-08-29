'use client';

import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Alert, Grid, Card, CardContent,
  CardActions, Chip, Container, Fab
} from '@mui/material';
import {
  MusicNote, Cloud, PlayArrow, Refresh, Launch, CheckCircle
} from '@mui/icons-material';
// import { useSpotifyAuth } from '@/context/SpotifyAuthContext';
// import { useSpotifyRecommendations } from '@/hooks/useSpotifyRecommendations';
// import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
// import SpotifyPlayer from '@/components/SpotifyPlayer';

export default function SpotifyPage() {
  // const { user, login, logout, isAuthenticated, isLoading: authLoading } = useSpotifyAuth();
  // const { recommendations, isLoading: recLoading, error: recError } = useSpotifyRecommendations(0, 20); // Clima soleado, 20°C
  // const { isReady, playPlaylist, activateWebPlayer } = useSpotifyPlayer();

  const [testWeather, setTestWeather] = useState('sunny');

  const weatherOptions = [
    { value: 'sunny', label: 'Soleado', icon: '☀️', code: 0, temp: 25 },
    { value: 'rainy', label: 'Lluvioso', icon: '🌧️', code: 61, temp: 18 },
    { value: 'cloudy', label: 'Nublado', icon: '☁️', code: 3, temp: 20 },
    { value: 'stormy', label: 'Tormentoso', icon: '⛈️', code: 95, temp: 15 },
    { value: 'snowy', label: 'Nevado', icon: '❄️', code: 71, temp: 5 },
  ];

  const handleWeatherChange = (weather: string) => {
    setTestWeather(weather);
    const weatherData = weatherOptions.find(w => w.value === weather);
    if (weatherData) {
      // Aquí se actualizarían las recomendaciones con el nuevo clima
      console.log('Cambiando a clima:', weatherData);
    }
  };

  // const handlePlayPlaylist = async (playlistId: string) => {
  //   try {
  //     // Si el dispositivo no está listo, intentar activarlo automáticamente
  //     if (!isReady) {
  //       console.log('🎵 Activando reproductor web automáticamente...');
  //       const activated = await activateWebPlayer();
  //       if (!activated) {
  //         alert('No se pudo activar el reproductor web. Asegúrate de tener Spotify abierto en otro dispositivo.');
  //         return;
  //       }
  //     }

  //     // Ahora reproducir la playlist
  //     await playPlaylist(playlistId);
  //   } catch (error) {
  //     console.error('Error reproduciendo playlist:', error);
  //     alert('Error al reproducir la playlist. Revisa la consola para más detalles.');
  //   }
  // };

  // const handleActivatePlayer = async () => {
  //   try {
  //     const success = await activateWebPlayer();
  //     if (success) {
  //       alert('¡Reproductor web activado correctamente! Ahora puedes reproducir música directamente en Badeo.');
  //     } else {
  //       alert('No se pudo activar el reproductor web. Asegúrate de tener Spotify abierto en otro dispositivo.');
  //     }
  //   } catch (error) {
  //     console.error('Error activando reproductor:', error);
  //     alert('Error al activar el reproductor. Revisa la consola para más detalles.');
  //   }
  // };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          �️ Información del Clima
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Funcionalidad de música temporalmente deshabilitada
        </Typography>
      </Box>

      {/* Mensaje temporal */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            🔧 En Desarrollo
          </Typography>
          <Typography variant="body1">
            La funcionalidad de música por clima está temporalmente deshabilitada mientras trabajamos en mejoras. 
            ¡Pronto estará disponible con nuevas características!
          </Typography>
        </Alert>
      </Paper>

  {/* Estado de autenticación de Spotify oculto temporalmente */}

  {/* Selector de clima y recomendaciones de Spotify ocultos temporalmente */}

  {/* Reproductor de música de Spotify oculto temporalmente */}

  {/* Playlists recomendadas de Spotify ocultas temporalmente */}

      {/* Información de ayuda */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          💡 Próximamente
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">1. Clima</Typography>
              <Typography variant="body2">
                Detecta automáticamente las condiciones climáticas de tu ubicación.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">2. Recomendaciones</Typography>
              <Typography variant="body2">
                Algoritmos inteligentes sugerirán contenido basado en el clima actual.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">3. Experiencia</Typography>
              <Typography variant="body2">
                Una experiencia personalizada que se adapta a cada momento del día.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

  {/* Botón flotante de acceso a Spotify oculto temporalmente */}
    </Container>
  );
}
