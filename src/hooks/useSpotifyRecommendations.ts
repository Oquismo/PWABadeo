'use client';

import { useState, useEffect } from 'react';
import { useSpotifyAuth } from '@/context/SpotifyAuthContext';

interface SpotifyRecommendation {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
    href: string;
  };
  owner: {
    display_name: string;
  };
  external_urls: {
    spotify: string;
  };
}

interface WeatherBasedRecommendations {
  playlists: SpotifyRecommendation[];
  genres: string[];
  artists: string[];
  tracks: string[];
}

export const useSpotifyRecommendations = (weatherCode: number, temperature: number) => {
  const { getAccessToken, isAuthenticated } = useSpotifyAuth();
  const [recommendations, setRecommendations] = useState<WeatherBasedRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapeo de clima a características musicales
  const getWeatherMusicProfile = (code: number, temp: number) => {
    const tempCategory = temp < 15 ? 'cold' : temp > 25 ? 'hot' : 'mild';

    const weatherProfiles: Record<number, any> = {
      // Despejado/Soleado
      0: {
        genres: ['pop', 'electronic', 'indie-pop', 'summer'],
        mood: 'energetic',
        tempo: 'fast',
        energy: 0.8,
        valence: 0.8
      },
      1: {
        genres: ['pop', 'rock', 'indie'],
        mood: 'upbeat',
        tempo: 'medium',
        energy: 0.7,
        valence: 0.7
      },

      // Nublado
      2: {
        genres: ['indie', 'folk', 'alternative'],
        mood: 'melancholic',
        tempo: 'medium',
        energy: 0.5,
        valence: 0.4
      },
      3: {
        genres: ['ambient', 'electronic', 'lo-fi'],
        mood: 'introspective',
        tempo: 'slow',
        energy: 0.3,
        valence: 0.3
      },

      // Lluvia
      51: {
        genres: ['jazz', 'blues', 'soul', 'r-n-b'],
        mood: 'cozy',
        tempo: 'medium-slow',
        energy: 0.4,
        valence: 0.5
      },
      53: {
        genres: ['folk', 'singer-songwriter', 'acoustic'],
        mood: 'nostalgic',
        tempo: 'slow',
        energy: 0.3,
        valence: 0.4
      },
      55: {
        genres: ['classical', 'ambient', 'soundtrack'],
        mood: 'dramatic',
        tempo: 'variable',
        energy: 0.6,
        valence: 0.3
      },

      // Nieve
      71: {
        genres: ['classical', 'instrumental', 'ambient'],
        mood: 'peaceful',
        tempo: 'slow',
        energy: 0.2,
        valence: 0.6
      },
      73: {
        genres: ['folk', 'country', 'bluegrass'],
        mood: 'warm',
        tempo: 'medium',
        energy: 0.5,
        valence: 0.7
      },

      // Tormenta
      95: {
        genres: ['rock', 'metal', 'electronic'],
        mood: 'intense',
        tempo: 'fast',
        energy: 0.9,
        valence: 0.2
      }
    };

    return weatherProfiles[code] || weatherProfiles[0];
  };

  // Obtener recomendaciones basadas en gustos del usuario
  const getPersonalizedRecommendations = async () => {
    if (!isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const weatherProfile = getWeatherMusicProfile(weatherCode, temperature);

      // 1. Obtener top artistas del usuario
      const topArtistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=5&time_range=medium_term', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let userArtists: string[] = [];
      if (topArtistsResponse.ok) {
        const topArtistsData = await topArtistsResponse.json();
        userArtists = topArtistsData.items.map((artist: any) => artist.id);
      }

      // 2. Obtener top géneros del usuario
      const topTracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let userGenres: string[] = [];
      if (topTracksResponse.ok) {
        const topTracksData = await topTracksResponse.json();
        // Extraer géneros de las canciones top
        const genres = new Set<string>();
        topTracksData.items.forEach((track: any) => {
          track.artists.forEach((artist: any) => {
            if (artist.genres) {
              artist.genres.forEach((genre: string) => genres.add(genre));
            }
          });
        });
        userGenres = Array.from(genres).slice(0, 3);
      }

      // 3. Combinar gustos del usuario con perfil del clima
      const combinedGenres = [...new Set([...userGenres, ...weatherProfile.genres])];

      // 4. Buscar playlists que combinen ambos
      const searchQuery = `(${combinedGenres.join(' OR ')}) ${weatherProfile.mood}`;
      const playlistsResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=10`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      let playlists: SpotifyRecommendation[] = [];
      if (playlistsResponse.ok) {
        const playlistsData = await playlistsResponse.json();
        playlists = playlistsData.playlists.items.filter((playlist: any) =>
          playlist && playlist.name && playlist.owner
        ).slice(0, 5);
      }

      // 5. Si no hay suficientes playlists, buscar por géneros del clima
      if (playlists.length < 3) {
        const fallbackQuery = weatherProfile.genres.slice(0, 2).join(' ');
        const fallbackResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(fallbackQuery)}&type=playlist&limit=5`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const fallbackPlaylists = fallbackData.playlists.items.filter((playlist: any) =>
            playlist && playlist.name && playlist.owner
          );
          playlists = [...playlists, ...fallbackPlaylists].slice(0, 5);
        }
      }

      setRecommendations({
        playlists,
        genres: combinedGenres,
        artists: userArtists,
        tracks: []
      });

    } catch (error) {
      console.error('Error obteniendo recomendaciones:', error);
      setError('Error al cargar recomendaciones musicales');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener recomendaciones cuando cambie el clima o se autentique
  useEffect(() => {
    if (isAuthenticated && weatherCode !== undefined && temperature !== undefined) {
      getPersonalizedRecommendations();
    }
  }, [weatherCode, temperature, isAuthenticated]);

  return {
    recommendations,
    isLoading,
    error,
    refresh: getPersonalizedRecommendations
  };
};

// Hook para obtener información detallada de una playlist
export const usePlaylistDetails = (playlistId: string) => {
  const { getAccessToken, isAuthenticated } = useSpotifyAuth();
  const [playlist, setPlaylist] = useState<SpotifyRecommendation | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !playlistId) return;

    const fetchPlaylistDetails = async () => {
      const token = getAccessToken();
      if (!token) return;

      setIsLoading(true);
      try {
        const [playlistResponse, tracksResponse] = await Promise.all([
          fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();
          setPlaylist(playlistData);
        }

        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          setTracks(tracksData.items);
        }
      } catch (error) {
        console.error('Error obteniendo detalles de playlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [playlistId, isAuthenticated]);

  return { playlist, tracks, isLoading };
};
