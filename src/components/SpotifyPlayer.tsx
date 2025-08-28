'use client';

import React from 'react';
import {
  Box, Card, CardContent, CardActions, Typography, Button,
  IconButton, Slider, Chip, Alert
} from '@mui/material';
import {
  PlayArrow, Pause, SkipNext, SkipPrevious, VolumeUp
} from '@mui/icons-material';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';

interface SpotifyPlayerProps {
  compact?: boolean;
  showControls?: boolean;
}

export default function SpotifyPlayer({ compact = false, showControls = true }: SpotifyPlayerProps) {
  const {
    playerState,
    isReady,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume
  } = useSpotifyPlayer();

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setVolume(newValue);
    }
  };

  if (!isReady) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          🎵 El reproductor web no está activo. Haz clic en "Activar Reproductor Web" para empezar a reproducir música directamente en Badeo.
        </Typography>
      </Alert>
    );
  }

  if (!playerState.currentTrack) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            🎵 No hay música reproduciéndose. Selecciona una playlist para empezar.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { currentTrack } = playerState;

  if (compact) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {currentTrack.album?.images?.[0] && (
              <Box
                component="img"
                src={currentTrack.album.images[0].url}
                alt={currentTrack.album.name}
                sx={{ width: 40, height: 40, borderRadius: 1 }}
              />
            )}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap fontWeight="medium">
                {currentTrack.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {currentTrack.artists.map(artist => artist.name).join(', ')}
              </Typography>
            </Box>

            <Chip
              label={playerState.isPlaying ? '▶️' : '⏸️'}
              size="small"
              color={playerState.isPlaying ? 'success' : 'default'}
            />
          </Box>
        </CardContent>

        {showControls && (
          <CardActions sx={{ pt: 0, justifyContent: 'center' }}>
            <IconButton size="small" onClick={previousTrack}>
              <SkipPrevious />
            </IconButton>

            <IconButton onClick={togglePlayPause} color="primary">
              {playerState.isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>

            <IconButton size="small" onClick={nextTrack}>
              <SkipNext />
            </IconButton>
          </CardActions>
        )}
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {currentTrack.album?.images?.[0] && (
            <Box
              component="img"
              src={currentTrack.album.images[0].url}
              alt={currentTrack.album.name}
              sx={{ width: 80, height: 80, borderRadius: 2 }}
            />
          )}

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" noWrap>
              {currentTrack.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" noWrap>
              {currentTrack.artists.map(artist => artist.name).join(', ')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentTrack.album?.name}
            </Typography>
          </Box>
        </Box>

        {showControls && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
              <IconButton onClick={previousTrack}>
                <SkipPrevious />
              </IconButton>

              <IconButton
                onClick={togglePlayPause}
                color="primary"
                sx={{ mx: 2 }}
              >
                {playerState.isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>

              <IconButton onClick={nextTrack}>
                <SkipNext />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VolumeUp />
              <Slider
                value={playerState.volume}
                onChange={handleVolumeChange}
                min={0}
                max={100}
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" sx={{ minWidth: 35 }}>
                {playerState.volume}%
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
