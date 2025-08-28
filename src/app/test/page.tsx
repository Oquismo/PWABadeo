'use client';

import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Alert, Chip, Divider,
  Card, CardContent, CardActions, Grid
} from '@mui/material';
import {
  MusicNote, Cloud, PlayArrow, Refresh, Launch, CheckCircle
} from '@mui/icons-material';
import { useSpotifyAuth } from '@/context/SpotifyAuthContext';
import { useSpotifyRecommendations } from '@/hooks/useSpotifyRecommendations';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';

export default function TestPage() {
  const { user, login, logout, isAuthenticated, isLoading: authLoading } = useSpotifyAuth();
  const { recommendations, isLoading: recLoading, error: recError } = useSpotifyRecommendations(0, 20); // Clima soleado, 20°C
  const { player, playerState, isReady, deviceId, playPlaylist, playTrack, transferPlaybackToWeb, activateWebPlayer, togglePlayPause } = useSpotifyPlayer();

  const [testWeather, setTestWeather] = useState('sunny');

  const weatherOptions = [
    { value: 'sunny', label: 'Soleado', icon: '☀️' },
    { value: 'rainy', label: 'Lluvioso', icon: '🌧️' },
    { value: 'cloudy', label: 'Nublado', icon: '☁️' },
    { value: 'stormy', label: 'Tormentoso', icon: '⛈️' },
    { value: 'snowy', label: 'Nevado', icon: '❄️' },
  ];

  const handleTestRecommendations = async () => {
    if (!isAuthenticated) {
      alert('Primero debes conectarte a Spotify');
      return;
    }
    // Las recomendaciones se cargan automáticamente con el hook
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

  const handlePlayTrack = async (trackUri: string) => {
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

      // Ahora reproducir el track
      await playTrack(trackUri);
    } catch (error) {
      console.error('Error reproduciendo track:', error);
      alert('Error al reproducir el track. Revisa la consola para más detalles.');
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
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Página de Pruebas - Spotify Integration
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Esta página te permite probar todas las funcionalidades de la integración de Spotify.
      </Typography>

      {/* Estado de autenticación */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔐 Estado de Autenticación
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            label={isAuthenticated ? 'Conectado' : 'No conectado'}
            color={isAuthenticated ? 'success' : 'error'}
            icon={isAuthenticated ? <CheckCircle /> : <MusicNote />}
          />

          {user && (
            <Chip
              label={`Usuario: ${user.display_name}`}
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
            href="/spotify-diagnose"
            startIcon={<Launch />}
          >
            Ver diagnóstico
          </Button>
        </Box>
      </Paper>

      {/* Prueba de recomendaciones */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎵 Prueba de Recomendaciones por Clima
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Selecciona un tipo de clima y obtén recomendaciones musicales personalizadas.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Selecciona el clima:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {weatherOptions.map((option) => (
              <Button
                key={option.value}
                variant={testWeather === option.value ? 'contained' : 'outlined'}
                onClick={() => setTestWeather(option.value)}
                startIcon={<span>{option.icon}</span>}
                size="small"
              >
                {option.label}
              </Button>
            ))}
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={handleTestRecommendations}
          disabled={!isAuthenticated || recLoading}
          startIcon={<Cloud />}
          sx={{ mb: 2 }}
        >
          {recLoading ? 'Obteniendo recomendaciones...' : 'Obtener recomendaciones'}
        </Button>

        {recError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al obtener recomendaciones: {recError}
          </Alert>
        )}

        {recommendations && recommendations.playlists && recommendations.playlists.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              🎶 Playlists recomendadas:
            </Typography>

            <Grid container spacing={2}>
              {recommendations.playlists.slice(0, 6).map((playlist: any) => (
                <Grid item xs={12} sm={6} md={4} key={playlist.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {playlist.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Por: {playlist.owner.display_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {playlist.tracks.total} canciones
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => handlePlayPlaylist(playlist.id)}
                        disabled={!isReady}
                        startIcon={<PlayArrow />}
                      >
                        {!isReady ? 'Reproductor no listo' : 'Reproducir'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Reproductor de Música */}
      {isReady && playerState.currentTrack && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            🎵 Reproductor Actual
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {playerState.currentTrack.album?.images?.[0] && (
              <Box
                component="img"
                src={playerState.currentTrack.album.images[0].url}
                alt={playerState.currentTrack.album.name}
                sx={{ width: 60, height: 60, borderRadius: 1 }}
              />
            )}

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" noWrap>
                {playerState.currentTrack.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {playerState.currentTrack.artists.map(artist => artist.name).join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {playerState.currentTrack.album?.name}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {/* previousTrack */}}
              disabled={!isReady}
            >
              ⏮️
            </Button>

            <Button
              variant="contained"
              onClick={togglePlayPause}
              disabled={!isReady}
              startIcon={<span>{playerState.isPlaying ? '⏸️' : '▶️'}</span>}
            >
              {playerState.isPlaying ? 'Pausar' : 'Reproducir'}
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => {/* nextTrack */}}
              disabled={!isReady}
            >
              ⏭️
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Estado: {playerState.isPlaying ? 'Reproduciendo' : 'Pausado'} • Volumen: {playerState.volume}%
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Estado del dispositivo */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎵 Estado del Dispositivo
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            label={isReady ? 'Listo' : 'No listo'}
            color={isReady ? 'success' : 'warning'}
            icon={<CheckCircle />}
          />

          <Chip
            label={deviceId ? `Device: ${deviceId.substring(0, 8)}...` : 'Sin device ID'}
            color={deviceId ? 'info' : 'error'}
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleActivatePlayer}
            disabled={!deviceId}
            startIcon={<PlayArrow />}
          >
            Activar Reproductor Web
          </Button>

          <Button
            variant="outlined"
            onClick={togglePlayPause}
            disabled={!isReady}
          >
            {playerState.isPlaying ? 'Pausar' : 'Reproducir'}
          </Button>
        </Box>

        {!isReady && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>🎵 Reproducción integrada:</strong> La música se reproduce directamente en Badeo sin salir de la app.
              Haz clic en "Activar Reproductor Web" para comenzar, o simplemente intenta reproducir una playlist y se activará automáticamente.
            </Typography>
          </Alert>
        )}

        {isReady && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>✅ Reproductor listo:</strong> ¡Ya puedes reproducir música directamente en Badeo!
              Haz clic en cualquier playlist para empezar.
            </Typography>
          </Alert>
        )}
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🐛 Información de Debug
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2">Usuario autenticado:</Typography>
            <Typography variant="body2">{isAuthenticated ? 'Sí' : 'No'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Nombre de usuario:</Typography>
            <Typography variant="body2">{user?.display_name || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">ID de usuario:</Typography>
            <Typography variant="body2">{user?.id || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Reproductor listo:</Typography>
            <Typography variant="body2">{isReady ? 'Sí' : 'No'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Device ID:</Typography>
            <Typography variant="body2">{deviceId || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Playlists encontradas:</Typography>
            <Typography variant="body2">{recommendations?.playlists?.length || 0}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Alert severity="info">
          <Typography variant="body2">
            <strong>Consejo:</strong> Si algo no funciona, revisa la consola del navegador (F12)
            para ver los mensajes de error detallados.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
}
