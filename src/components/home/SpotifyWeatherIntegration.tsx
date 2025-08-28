'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Stack, Chip, Tooltip, Fade, Button, Avatar, CircularProgress, Alert } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudIcon from '@mui/icons-material/Cloud';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import GrainIcon from '@mui/icons-material/Grain';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { useSpotifyAuth, SpotifyAuthStatus } from '@/context/SpotifyAuthContext';
import { useSpotifyRecommendations } from '@/hooks/useSpotifyRecommendations';

interface SpotifyWeatherIntegrationProps {
  weatherCode: number;
  temperature: number;
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

// Mapeo de clima a playlists de Spotify (usando IDs de playlists públicas)
const weatherPlaylists: Record<number, { name: string; spotifyId: string; mood: string; color: string }> = {
  // Despejado/Soleado
  0: { name: 'Energía Solar ☀️', spotifyId: '37i9dQZF1DXdPec7aLTmlC', mood: 'energético', color: '#FFD700' },
  1: { name: 'Día Perfecto 🌤️', spotifyId: '37i9dQZF1DX0XUsuxWHRQd', mood: 'relajado', color: '#87CEEB' },

  // Nublado
  2: { name: 'Ambiente Nublado ☁️', spotifyId: '37i9dQZF1DX2pSTOxoPbx9', mood: 'melancólico', color: '#708090' },
  3: { name: 'Día Gris 🌫️', spotifyId: '37i9dQZF1DX3YSRoSdA634', mood: 'reflexivo', color: '#696969' },

  // Lluvia
  51: { name: 'Lluvia Suave 🌧️', spotifyId: '37i9dQZF1DWYxwmBaMqZQZ', mood: 'tranquilo', color: '#4682B4' },
  53: { name: 'Día de Lluvia 💧', spotifyId: '37i9dQZF1DXbvABJXBIyiY', mood: 'nostálgico', color: '#4169E1' },
  55: { name: 'Tormenta Intensa ⛈️', spotifyId: '37i9dQZF1DX4aYNO8X5RpR', mood: 'intenso', color: '#191970' },
  61: { name: 'Gotas de Lluvia 🌦️', spotifyId: '37i9dQZF1DWYxwmBaMqZQZ', mood: 'relajante', color: '#4682B4' },
  63: { name: 'Ambiente Lluvioso 🌧️', spotifyId: '37i9dQZF1DXbvABJXBIyiY', mood: 'cálido', color: '#4169E1' },
  65: { name: 'Diluvio 🎵', spotifyId: '37i9dQZF1DX4aYNO8X5RpR', mood: 'dramático', color: '#191970' },

  // Nieve
  71: { name: 'Nieve Suave ❄️', spotifyId: '37i9dQZF1DX0Yxoavh5qJV', mood: 'mágico', color: '#F0F8FF' },
  73: { name: 'Invierno Blanco 🌨️', spotifyId: '37i9dQZF1DX4JAvHpjipBk', mood: 'acogedor', color: '#E6E6FA' },
  75: { name: 'Tormenta de Nieve 🥶', spotifyId: '37i9dQZF1DX4JAvHpjipBk', mood: 'épico', color: '#B0C4DE' },

  // Niebla
  45: { name: 'Niebla Misteriosa 🌫️', spotifyId: '37i9dQZF1DX2pSTOxoPbx9', mood: 'misterioso', color: '#D3D3D3' },
  48: { name: 'Ambiente Brumoso 👻', spotifyId: '37i9dQZF1DX3YSRoSdA634', mood: 'etéreo', color: '#A9A9A9' },

  // Tormenta
  95: { name: 'Tormenta Eléctrica ⚡', spotifyId: '37i9dQZF1DX4aYNO8X5RpR', mood: 'poderoso', color: '#800080' },
  96: { name: 'Truenos y Relámpagos 🌩️', spotifyId: '37i9dQZF1DX4aYNO8X5RpR', mood: 'intenso', color: '#9932CC' },
  99: { name: 'Apocalipsis Musical 🔥', spotifyId: '37i9dQZF1DX4aYNO8X5RpR', mood: 'apocalíptico', color: '#8B0000' },
};

export default function SpotifyWeatherIntegration({
  weatherCode,
  temperature
}: SpotifyWeatherIntegrationProps) {
  const { playerState, isReady, playPlaylist, togglePlayPause, nextTrack, previousTrack } = useSpotifyPlayer();
  const { isAuthenticated, user, login } = useSpotifyAuth();
  const { recommendations, isLoading: isLoadingRecommendations, error: recommendationsError, refresh } = useSpotifyRecommendations(weatherCode, temperature);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const weatherPlaylist = weatherPlaylists[weatherCode] || weatherPlaylists[0];
  const tempAdjustment = temperature < 15 ? 'frío' : temperature > 25 ? 'calor' : 'templado';

  const handlePlayPause = async (playlistId?: string) => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (!isReady) {
      console.log('🎵 Spotify Player no está listo aún');
      return;
    }

    setIsLoading(true);
    try {
      const targetPlaylistId = playlistId || selectedPlaylist || recommendations?.playlists[0]?.id;

      if (!targetPlaylistId) {
        console.log('🎵 No hay playlist seleccionada');
        return;
      }

      if (playerState.isPlaying) {
        await togglePlayPause();
      } else {
        await playPlaylist(targetPlaylistId);
        setSelectedPlaylist(targetPlaylistId);
      }
    } catch (error) {
      console.error('Error en reproducción:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handlePlaylistSelect = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
    handlePlayPause(playlistId);
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <WbSunnyIcon sx={{ fontSize: 20 }} />;
    if (code === 2 || code === 3) return <CloudIcon sx={{ fontSize: 20 }} />;
    if (code >= 51 && code <= 65) return <GrainIcon sx={{ fontSize: 20 }} />;
    if (code >= 71 && code <= 75) return <AcUnitIcon sx={{ fontSize: 20 }} />;
    return <CloudIcon sx={{ fontSize: 20 }} />;
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ width: '100%' }}>
        {/* Header con autenticación */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MusicNoteIcon sx={{ color: '#1DB954', fontSize: 20 }} />
            <Typography variant="overline" sx={{ letterSpacing: 1.2, opacity: 0.8, fontSize: '0.75rem' }}>
              Música del clima
            </Typography>
            {getWeatherIcon(weatherCode)}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpotifyAuthStatus />
            {!isAuthenticated && (
              <Button
                size="small"
                onClick={login}
                sx={{
                  fontSize: '0.7rem',
                  bgcolor: '#1DB954',
                  color: 'white',
                  '&:hover': { bgcolor: '#1ed760' }
                }}
              >
                Conectar
              </Button>
            )}
          </Box>
        </Box>

        {/* Contenido principal */}
        {!isAuthenticated ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              🎵 Conecta tu cuenta de Spotify para obtener recomendaciones musicales personalizadas basadas en el clima
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                console.log('🎵 Botón "Conectar Spotify" clickeado');
                console.log('🔧 Función login disponible:', typeof login);
                login();
              }}
              sx={{
                borderColor: '#1DB954',
                color: '#1DB954',
                '&:hover': { borderColor: '#1ed760', bgcolor: '#1DB95410' }
              }}
            >
              Conectar Spotify
            </Button>
          </Box>
        ) : (
          <>
            {/* Información del usuario */}
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar
                  src={user.images?.[0]?.url}
                  sx={{ width: 24, height: 24 }}
                >
                  {user.display_name?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  Hola, {user.display_name}
                </Typography>
              </Box>
            )}

            {/* Recomendaciones */}
            {isLoadingRecommendations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  Cargando recomendaciones...
                </Typography>
              </Box>
            ) : recommendationsError ? (
              <Alert severity="error" sx={{ fontSize: '0.75rem' }}>
                {recommendationsError}
              </Alert>
            ) : recommendations?.playlists && recommendations.playlists.length > 0 ? (
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  🎯 Recomendaciones personalizadas para este clima:
                </Typography>

                {recommendations.playlists.slice(0, 2).map((playlist) => (
                  <Box
                    key={playlist.id}
                    onClick={() => handlePlaylistSelect(playlist.id)}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'rgba(29, 185, 84, 0.1)',
                      border: '1px solid rgba(29, 185, 84, 0.2)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.15)' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      component="img"
                      src={playlist.images?.[0]?.url || '/music-placeholder.png'}
                      sx={{ width: 32, height: 32, borderRadius: 1 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>
                        {playlist.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        por {playlist.owner.display_name}
                      </Typography>
                    </Box>
                    <PlayArrowIcon sx={{ fontSize: 16, color: '#1DB954' }} />
                  </Box>
                ))}

                {/* Controles de reproducción */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                  <Tooltip title="Canción anterior">
                    <IconButton size="small" onClick={previousTrack} disabled={!isReady || !playerState.isPlaying}>
                      <SkipPreviousIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={playerState.isPlaying ? "Pausar" : "Reproducir"}>
                    <IconButton
                      onClick={() => handlePlayPause()}
                      disabled={isLoading || !isReady}
                      sx={{
                        bgcolor: '#1DB954',
                        color: 'white',
                        '&:hover': { bgcolor: '#1DB954', opacity: 0.8 },
                        width: 36,
                        height: 36
                      }}
                    >
                      {isLoading ? (
                        <Box sx={{ width: 16, height: 16, border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : playerState.isPlaying ? (
                        <PauseIcon fontSize="small" />
                      ) : (
                        <PlayArrowIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Siguiente canción">
                    <IconButton size="small" onClick={nextTrack} disabled={!isReady || !playerState.isPlaying}>
                      <SkipNextIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Actualizar recomendaciones">
                    <IconButton size="small" onClick={refresh} disabled={isLoadingRecommendations}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Estado de reproducción */}
                {playerState.currentTrack && (
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
                    🎵 {playerState.currentTrack.name} - {playerState.currentTrack.artists[0]?.name}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                No se encontraron recomendaciones para este clima
              </Typography>
            )}
          </>
        )}

        {/* Indicador de volumen */}
        <Box sx={{ position: 'absolute', bottom: 8, right: 16, opacity: 0.3 }}>
          <VolumeUpIcon fontSize="small" />
        </Box>

        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Box>
    </Fade>
  );
}
