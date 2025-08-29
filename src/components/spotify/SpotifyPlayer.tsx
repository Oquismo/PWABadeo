// // @ts-ignore
// /// <reference types="spotify-web-playback-sdk" />
// import { useEffect, useState, useRef } from 'react';
// import { useSpotifyAuth } from '@/context/SpotifyAuthContext';
// import { Box, Typography, Slider, IconButton, CircularProgress, Button } from '@mui/material';
// import { PlayArrow, Pause, SkipNext, SkipPrevious, VolumeUp } from '@mui/icons-material';

// const SpotifyPlayer = () => {
//   const { getAccessToken } = useSpotifyAuth();
//   const [player, setPlayer] = useState<Spotify.Player | null>(null);
//   const [isReady, setIsReady] = useState(false);
//   const [deviceId, setDeviceId] = useState<string | null>(null);
//   const [playerState, setPlayerState] = useState<Spotify.PlaybackState | null>(null);
//   const [volume, setVolume] = useState(50);

//   const scriptLoaded = useRef(false);

//   useEffect(() => {
//     if (scriptLoaded.current) return;

//     const script = document.createElement('script');
//     script.src = 'https://sdk.scdn.co/spotify-player.js';
//     script.async = true;

//     document.body.appendChild(script);
//     scriptLoaded.current = true;

//     window.onSpotifyWebPlaybackSDKReady = () => {
//       console.log('🎧 Spotify Web Playback SDK está listo');
//       const token = getAccessToken();
//       if (!token) {
//         console.error('❌ No hay token de acceso para inicializar el reproductor');
//         return;
//       }

//       const spotifyPlayer = new window.Spotify.Player({
//         name: 'Badeo PWA Player',
//         getOAuthToken: (cb: (token: string) => void) => { cb(token); },
//         volume: volume / 100,
//       });

//       setPlayer(spotifyPlayer);

//       spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
//         console.log('✅ Reproductor listo con Device ID:', device_id);
//         setIsReady(true);
//         setDeviceId(device_id);
//       });

//       spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
//         console.log('⚠️ Dispositivo se ha desconectado:', device_id);
//         setIsReady(false);
//       });

//       spotifyPlayer.addListener('player_state_changed', (state: Spotify.PlaybackState) => {

//         // UI de Spotify temporalmente deshabilitada para futuras versiones
//         const SpotifyPlayer = () => {
//           return (
//             <div style={{ display: 'none' }}>
//               {/* Spotify UI oculta temporalmente */}
//             </div>
//           );
//         };

//         export default SpotifyPlayer;

