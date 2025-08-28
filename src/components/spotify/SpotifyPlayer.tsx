// @ts-ignore
/// <reference types="spotify-web-playback-sdk" />
import { useEffect, useState, useRef } from 'react';
import { useSpotifyAuth } from '@/context/SpotifyAuthContext';
import { Box, Typography, Slider, IconButton, CircularProgress, Button } from '@mui/material';
import { PlayArrow, Pause, SkipNext, SkipPrevious, VolumeUp } from '@mui/icons-material';

const SpotifyPlayer = () => {
  const { getAccessToken } = useSpotifyAuth();
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<Spotify.PlaybackState | null>(null);
  const [volume, setVolume] = useState(50);

  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);
    scriptLoaded.current = true;

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('🎧 Spotify Web Playback SDK está listo');
      const token = getAccessToken();
      if (!token) {
        console.error('❌ No hay token de acceso para inicializar el reproductor');
        return;
      }

      const spotifyPlayer = new window.Spotify.Player({
        name: 'Badeo PWA Player',
        getOAuthToken: (cb: (token: string) => void) => { cb(token); },
        volume: volume / 100,
      });

      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('✅ Reproductor listo con Device ID:', device_id);
        setIsReady(true);
        setDeviceId(device_id);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('⚠️ Dispositivo se ha desconectado:', device_id);
        setIsReady(false);
      });

      spotifyPlayer.addListener('player_state_changed', (state: Spotify.PlaybackState) => {
        console.log('🎵 Estado del reproductor cambiado:', state);
        setPlayerState(state);
      });

      spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('❌ Error de inicialización:', message);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('❌ Error de autenticación:', message);
      });

      spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
        console.error('❌ Error de cuenta:', message);
      });

      spotifyPlayer.connect().then(success => {
        if (success) {
          console.log('🤝 Conexión con el reproductor exitosa');
        }
      });
    };

    return () => {
      player?.disconnect();
    };
  }, [getAccessToken, volume]);

  const handlePlay = async (playlistUri: string) => {
    if (!deviceId) {
      console.error('❌ No hay Device ID para iniciar la reproducción');
      return;
    }

    const token = getAccessToken();
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ context_uri: playlistUri }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    player?.setVolume(newVolume / 100);
  };

  if (!isReady) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography>Cargando reproductor de Spotify...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h6">Reproductor de Spotify</Typography>
      {playerState ? (
        <Box>
          <Typography>
            {playerState.track_window.current_track.name} - {playerState.track_window.current_track.artists.map((a) => a.name).join(', ')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconButton onClick={() => player?.previousTrack()}><SkipPrevious /></IconButton>
            <IconButton onClick={() => player?.togglePlay()}>
              {playerState.paused ? <PlayArrow /> : <Pause />}
            </IconButton>
            <IconButton onClick={() => player?.nextTrack()}><SkipNext /></IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <VolumeUp />
            <Slider value={volume} onChange={handleVolumeChange} />
          </Box>
        </Box>
      ) : (
        <Typography>Selecciona una playlist para empezar.</Typography>
      )}
      <Button onClick={() => handlePlay('spotify:playlist:37i9dQZF1DXcBWIGoYBM5M')}>
        Reproducir playlist de prueba
      </Button>
    </Box>
  );
};

export default SpotifyPlayer;
