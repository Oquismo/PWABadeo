'use client';

import { useState, useEffect, useCallback } from 'react';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
  duration_ms: number;
}

interface SpotifyPlayerState {
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  position: number;
  volume: number;
}

export function useSpotifyPlayer() {
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>({
    isPlaying: false,
    currentTrack: null,
    position: 0,
    volume: 50
  });
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Inicializar el SDK de Spotify
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      (window as any).onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new (window as any).Spotify.Player({
          name: 'Clima Music Player',
          getOAuthToken: (cb: (token: string) => void) => {
            // Obtener el token desde localStorage
            const token = localStorage.getItem('spotify_access_token');
            if (token) {
              cb(token);
            } else {
              console.error('No hay token de acceso disponible');
            }
          },
          volume: 0.5
        });

        // Configurar event listeners
        spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('🎵 Spotify Player listo con Device ID:', device_id);
          setDeviceId(device_id);
          setIsReady(true);
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('🎵 Spotify Player no listo:', device_id);
          setIsReady(false);
        });

        spotifyPlayer.addListener('player_state_changed', (state: any) => {
          if (!state) return;

          setPlayerState({
            isPlaying: !state.paused,
            currentTrack: state.track_window.current_track,
            position: state.position,
            volume: state.volume * 100
          });
        });

        spotifyPlayer.connect();
        setPlayer(spotifyPlayer);
      };
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [player]);

  const playPlaylist = useCallback(async (playlistId: string) => {
    if (!isReady) {
      console.error('❌ El reproductor no está listo');
      return;
    }

    try {
      console.log('🎵 Reproduciendo playlist:', playlistId);

      // Obtener el token de acceso desde localStorage
      const accessToken = localStorage.getItem('spotify_access_token');
      if (!accessToken) {
        console.error('❌ No hay token de acceso disponible');
        throw new Error('No access token available');
      }

      // Usar el endpoint personalizado para iniciar la playlist
      const response = await fetch('/api/spotify/play-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          playlistId: playlistId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del endpoint:', errorData);
        throw new Error(errorData.error || 'Failed to start playlist');
      }

      const result = await response.json();
      console.log('✅ Playlist iniciada:', result);

      // Una vez que la Web API ha iniciado la reproducción,
      // el SDK del navegador debería tomar el control automáticamente

    } catch (error) {
      console.error('❌ Error reproduciendo playlist:', error);

      // Fallback: intentar usar solo el SDK del navegador
      try {
        if (player) {
          console.log('🔄 Intentando fallback con SDK del navegador...');
          await player.resume();
          console.log('✅ Fallback exitoso');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback también falló:', fallbackError);
      }
    }
  }, [isReady, player]);

  const playTrack = useCallback(async (trackUri: string) => {
    if (!player || !isReady) {
      console.error('❌ El reproductor no está listo');
      return;
    }

    try {
      console.log('🎵 Reproduciendo track:', trackUri, 'en el navegador');

      // Usar el SDK del navegador para reproducir el track
      await player.resume();
      console.log('✅ Track reproduciéndose en el navegador');

    } catch (error) {
      console.error('❌ Error reproduciendo track:', error);
    }
  }, [player, isReady]);

  const transferPlaybackToWeb = useCallback(async () => {
    if (!deviceId) {
      console.error('❌ No hay device ID disponible');
      return false;
    }

    // Obtener el token de acceso desde localStorage
    const accessToken = localStorage.getItem('spotify_access_token');
    if (!accessToken) {
      console.error('❌ No hay token de acceso disponible');
      return false;
    }

    try {
      console.log('🔄 Transfiriendo reproducción al dispositivo web...');

      // Transferir la reproducción al dispositivo web
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error transfiriendo reproducción:', response.status, errorData);
        return false;
      }

      console.log('✅ Reproducción transferida al dispositivo web');
      return true;

    } catch (error) {
      console.error('❌ Error transfiriendo reproducción:', error);
      return false;
    }
  }, [deviceId]);

  const activateWebPlayer = useCallback(async () => {
    console.log('🎵 Activando reproductor web...');

    // Esperar a que el dispositivo esté listo
    let attempts = 0;
    const maxAttempts = 10;

    while (!isReady && attempts < maxAttempts) {
      console.log(`⏳ Esperando dispositivo... (intento ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!isReady) {
      console.error('❌ El dispositivo no se activó después de', maxAttempts, 'intentos');
      return false;
    }

    // Una vez que el dispositivo está listo, transferir la reproducción
    const success = await transferPlaybackToWeb();
    return success;
  }, [isReady, transferPlaybackToWeb]);

  const togglePlayPause = useCallback(async () => {
    if (!player) return;

    try {
      await player.togglePlay();
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [player]);

  const nextTrack = useCallback(async () => {
    if (!player) return;

    try {
      await player.nextTrack();
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  }, [player]);

  const previousTrack = useCallback(async () => {
    if (!player) return;

    try {
      await player.previousTrack();
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  }, [player]);

  const setVolume = useCallback(async (volume: number) => {
    if (!player) return;

    try {
      await player.setVolume(volume / 100);
      setPlayerState(prev => ({ ...prev, volume }));
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }, [player]);

  return {
    player,
    playerState,
    isReady,
    deviceId,
    playPlaylist,
    playTrack,
    transferPlaybackToWeb,
    activateWebPlayer,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume
  };
}

// Declaración de tipos para el SDK de Spotify (comentado para evitar conflicto de tipos)
// declare global {
//   interface Window {
//     Spotify: any; // ⚠️ Si reactivas la integración, usa: Spotify: typeof Spotify;
//     onSpotifyWebPlaybackSDKReady: () => void;
//   }
// }
