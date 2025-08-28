'use client';

import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Alert, Grid, Card, CardContent,
  CardActions, Chip, Container, Fab
} from '@mui/material';
import {
  MusicNote, Cloud, PlayArrow, Refresh, Launch, CheckCircle
} from '@mui/icons-material';
import { useSpotifyAuth } from '@/context/SpotifyAuthContext';
import { useSpotifyRecommendations } from '@/hooks/useSpotifyRecommendations';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import SpotifyPlayer from '@/components/SpotifyPlayer';

export default function SpotifyPage() {
  const { user, login, logout, isAuthenticated, isLoading: authLoading } = useSpotifyAuth();
  const { recommendations, isLoading: recLoading, error: recError } = useSpotifyRecommendations(0, 20); // Clima soleado, 20°C
  const { isReady, playPlaylist, activateWebPlayer } = useSpotifyPlayer();

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

  const handlePlayPlaylist = async (playlistId: string) => {
    try {
      // Si el dispositivo no está listo, intentar activarlo automáticamente
      if (!isReady) {
        console.log('🎵 Activando reproductor web automáticamente...');
        const activated = await activateWebPlayer();
        if (!activated) {
          alert('No se pudo activar el reproductor web. Asegúrate de tener Spotify abierto en otro dispositivo.');
          return;
        }
      }

      // Ahora reproducir la playlist
      await playPlaylist(playlistId);
    } catch (error) {
      console.error('Error reproduciendo playlist:', error);
      alert('Error al reproducir la playlist. Revisa la consola para más detalles.');
    }
  };

  const handleActivatePlayer = async () => {
    try {
      const success = await activateWebPlayer();
      if (success) {
        alert('¡Reproductor web activado correctamente! Ahora puedes reproducir música directamente en Badeo.');
      } else {
        alert('No se pudo activar el reproductor web. Asegúrate de tener Spotify abierto en otro dispositivo.');
      }
    } catch (error) {
      console.error('Error activando reproductor:', error);
      alert('Error al activar el reproductor. Revisa la consola para más detalles.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          🎵 Música por Clima
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Descubre playlists perfectas para cada momento del clima
        </Typography>
      </Box>

      {/* Estado de autenticación */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={isAuthenticated ? 'Conectado a Spotify' : 'No conectado'}
              color={isAuthenticated ? 'success' : 'error'}
              icon={isAuthenticated ? <CheckCircle /> : <MusicNote />}
            />

            {user && (
              <Chip
                label={`Hola, ${user.display_name}!`}
                color="info"
                variant="outlined"
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {!isAuthenticated ? (
              <Button
                variant="contained"
                onClick={login}
                disabled={authLoading}
                startIcon={<MusicNote />}
                size="large"
              >
                {authLoading ? 'Conectando...' : 'Conectar Spotify'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={logout}
                disabled={authLoading}
                startIcon={<Refresh />}
              >
                {authLoading ? 'Desconectando...' : 'Desconectar'}
              </Button>
            )}

            <Button
              variant="outlined"
              href="/test"
              startIcon={<Launch />}
            >
              Página de Pruebas
            </Button>
          </Box>
        </Box>

        {!isAuthenticated && (
          <Alert severity="info">
            <Typography variant="body2">
              Conecta tu cuenta de Spotify para obtener recomendaciones musicales personalizadas basadas en el clima.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Selector de clima */}
      {isAuthenticated && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            🌤️ Selecciona el clima actual
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {weatherOptions.map((option) => (
              <Button
                key={option.value}
                variant={testWeather === option.value ? 'contained' : 'outlined'}
                onClick={() => handleWeatherChange(option.value)}
                startIcon={<span>{option.icon}</span>}
                size="large"
              >
                {option.label}
              </Button>
            ))}
          </Box>

          <Typography variant="body2" color="text.secondary">
            Las recomendaciones se actualizarán automáticamente según el clima seleccionado.
          </Typography>
        </Paper>
      )}

      {/* Reproductor de música */}
      {isAuthenticated && (
        <Box sx={{ mb: 3 }}>
          <SpotifyPlayer showControls />
        </Box>
      )}

      {/* Playlists recomendadas */}
      {isAuthenticated && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">
              🎶 Playlists recomendadas para clima {weatherOptions.find(w => w.value === testWeather)?.label}
            </Typography>

            {!isReady && (
              <Button
                variant="contained"
                onClick={handleActivatePlayer}
                startIcon={<PlayArrow />}
              >
                Activar Reproductor
              </Button>
            )}
          </Box>

          {recLoading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Cargando recomendaciones...</Typography>
            </Box>
          )}

          {recError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error al cargar recomendaciones: {recError}
            </Alert>
          )}

          {recommendations && recommendations.playlists && recommendations.playlists.length > 0 && (
            <Grid container spacing={3}>
              {recommendations.playlists.slice(0, 12).map((playlist: any) => (
                <Grid item xs={12} sm={6} md={4} key={playlist.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1 }}>
                      {playlist.images && playlist.images[0] && (
                        <Box
                          component="img"
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mb: 2
                          }}
                        />
                      )}

                      <Typography variant="h6" noWrap gutterBottom>
                        {playlist.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" noWrap>
                        Por: {playlist.owner.display_name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {playlist.tracks.total} canciones
                      </Typography>

                      {playlist.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {playlist.description}
                        </Typography>
                      )}
                    </CardContent>

                    <CardActions>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handlePlayPlaylist(playlist.id)}
                        disabled={!isReady && !isAuthenticated}
                        startIcon={<PlayArrow />}
                      >
                        {!isReady ? 'Activar y Reproducir' : 'Reproducir'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {recommendations && (!recommendations.playlists || recommendations.playlists.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No se encontraron playlists para este clima. Intenta con otro tipo de clima.
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Información de ayuda */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          💡 Cómo funciona
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">1. Conecta</Typography>
              <Typography variant="body2">
                Conecta tu cuenta de Spotify para acceder a tus playlists y recomendaciones.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">2. Selecciona</Typography>
              <Typography variant="body2">
                Elige el clima actual y obtén recomendaciones musicales personalizadas.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">3. Disfruta</Typography>
              <Typography variant="body2">
                La música se reproduce directamente en Badeo sin salir de la aplicación.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Botón flotante para acceder rápidamente */}
      <Fab
        color="primary"
        aria-label="ir a música"
        component="a"
        href="/spotify"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
        }}
      >
        <MusicNote />
      </Fab>
    </Container>
  );
}
