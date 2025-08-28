'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert } from '@mui/material';
import { MusicNote } from '@mui/icons-material';

interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
  country: string;
  product: string;
}

interface SpotifyAuthContextType {
  user: SpotifyUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  getAccessToken: () => string | null;
}

const SpotifyAuthContext = createContext<SpotifyAuthContextType | undefined>(undefined);

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext);
  if (context === undefined) {
    throw new Error('useSpotifyAuth must be used within a SpotifyAuthProvider');
  }
  return context;
};

interface SpotifyAuthProviderProps {
  children: React.ReactNode;
}

export const SpotifyAuthProvider: React.FC<SpotifyAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  // Generar un estado aleatorio para prevenir ataques CSRF
  const generateRandomString = (length: number) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  };

  // Generar code challenge para PKCE
  const generateCodeChallenge = async (codeVerifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  // Iniciar sesión con Spotify
  const login = async () => {
    console.log('🎵 Iniciando login con Spotify...');
    console.log('Client ID:', SPOTIFY_CLIENT_ID ? 'Configurado' : 'NO CONFIGURADO');
    console.log('Redirect URI:', SPOTIFY_REDIRECT_URI ? 'Configurado' : 'NO CONFIGURADO');

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
      const errorMsg = 'Configuración de Spotify incompleta. Revisa las variables de entorno.';
      console.error('❌', errorMsg);
      setLoginError(errorMsg);
      return;
    }

    try {
      console.log('🔄 Generando code verifier y challenge...');
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Guardar codeVerifier en sessionStorage
      sessionStorage.setItem('spotify_code_verifier', codeVerifier);
      console.log('💾 Code verifier guardado en sessionStorage');

      const scope = 'user-read-private user-read-email playlist-read-private playlist-modify-public playlist-modify-private';
      const authUrl = new URL("https://accounts.spotify.com/authorize");

      const params = {
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      };

      authUrl.search = new URLSearchParams(params).toString();
      console.log('🔗 URL de autenticación generada:', authUrl.toString());
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('❌ Error iniciando login:', error);
      setLoginError('Error al iniciar sesión con Spotify');
    }
  };

  // Cerrar sesión
  const logout = () => {
    console.log('🚪 Cerrando sesión de Spotify...');
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires');
    localStorage.removeItem('spotify_user');
    console.log('✅ Sesión cerrada');
  };

  // Obtener token de acceso
  const getAccessToken = () => {
    return accessToken;
  };

  // Intercambiar código por token
  const exchangeCodeForToken = async (code: string) => {
    console.log('🔄 Intercambiando código por token...');
    try {
      const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
      console.log('🔑 Code verifier encontrado:', codeVerifier ? 'SÍ' : 'NO');

      if (!codeVerifier) {
        throw new Error('Code verifier no encontrado');
      }

      console.log('📡 Enviando solicitud a /api/spotify/auth...');
      const response = await fetch('/api/spotify/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          code_verifier: codeVerifier,
          redirect_uri: SPOTIFY_REDIRECT_URI,
        }),
      });

      console.log('📥 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);
        throw new Error('Error obteniendo token');
      }

      const tokenData = await response.json();
      console.log('✅ Token recibido:', { access_token: tokenData.access_token ? 'PRESENTE' : 'NO PRESENTE' });

      setAccessToken(tokenData.access_token);
      localStorage.setItem('spotify_access_token', tokenData.access_token);
      localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
      localStorage.setItem('spotify_token_expires', (Date.now() + (tokenData.expires_in * 1000)).toString());

      // Obtener datos del usuario
      console.log('👤 Obteniendo perfil de usuario...');
      await fetchUserProfile(tokenData.access_token);

      // Limpiar code verifier
      sessionStorage.removeItem('spotify_code_verifier');
      console.log('🧹 Code verifier limpiado');

    } catch (error) {
      console.error('❌ Error intercambiando código:', error);
      setLoginError('Error al completar la autenticación');
    }
  };

  // Obtener perfil del usuario
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error obteniendo perfil');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('spotify_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
    }
  };

  // Refrescar token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      if (!refreshToken) return false;

      const response = await fetch('/api/spotify/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) return false;

      const tokenData = await response.json();
      setAccessToken(tokenData.access_token);
      localStorage.setItem('spotify_access_token', tokenData.access_token);
      localStorage.setItem('spotify_token_expires', (Date.now() + (tokenData.expires_in * 1000)).toString());

      return true;
    } catch (error) {
      console.error('Error refrescando token:', error);
      return false;
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔄 Inicializando autenticación de Spotify...');
      console.log('🌐 URL actual:', window.location.href);
      console.log('🔍 Parámetros de búsqueda:', window.location.search);
      setIsLoading(true);

      // Verificar si hay código en la URL (callback de Spotify)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const spotifyCode = urlParams.get('spotify_code');

      console.log('📋 Parámetros de URL detectados:', {
        code: code ? 'PRESENTE' : 'NO PRESENTE',
        spotify_code: spotifyCode ? 'PRESENTE' : 'NO PRESENTE',
        error,
        allParams: Object.fromEntries(urlParams.entries())
      });

      if (code || spotifyCode) {
        const authCode = code || spotifyCode;
        console.log('✅ Código de autorización encontrado:', authCode?.substring(0, 20) + '...');
        console.log('🔄 Iniciando intercambio de código por token...');

        // Limpiar la URL antes de procesar
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('🧹 URL limpiada, procesando código...');

        await exchangeCodeForToken(authCode!);
      } else if (error) {
        console.log('❌ Error en la autenticación:', error);
        setLoginError('Error en la autenticación con Spotify');
      } else {
        console.log('🔍 No se encontró código de auth, verificando tokens guardados...');
        // Verificar si hay tokens guardados
        const savedToken = localStorage.getItem('spotify_access_token');
        const savedUser = localStorage.getItem('spotify_user');
        const tokenExpires = localStorage.getItem('spotify_token_expires');

        if (savedToken && savedUser && tokenExpires) {
          const expiresAt = parseInt(tokenExpires);

          if (Date.now() < expiresAt) {
            console.log('✅ Token válido encontrado, restaurando sesión...');
            setAccessToken(savedToken);
            setUser(JSON.parse(savedUser));
          } else {
            console.log('⏰ Token expirado, intentando refrescar...');
            // Token expirado, intentar refrescar
            const refreshed = await refreshToken();
            if (refreshed && savedUser) {
              setUser(JSON.parse(savedUser));
            }
          }
        } else {
          console.log('ℹ️ No hay tokens guardados');
        }
      }

      setIsLoading(false);
      console.log('🏁 Inicialización de autenticación completada');
      console.log('📊 Estado final:', {
        isAuthenticated: !!user,
        user: user ? user.display_name : 'NO USER',
        hasAccessToken: !!accessToken
      });
    };

    initAuth();
  }, []);

  const value: SpotifyAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getAccessToken,
  };

  return (
    <SpotifyAuthContext.Provider value={value}>
      {children}

      {/* Diálogo de login */}
      <Dialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)}>
        <DialogTitle>Conectar con Spotify</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Para obtener recomendaciones musicales personalizadas basadas en el clima,
            conecta tu cuenta de Spotify.
          </Typography>

          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <MusicNote sx={{ color: 'green.600' }} />
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Beneficios de conectar Spotify:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Listas de reproducción personalizadas por clima
                • Recomendaciones basadas en tus gustos
                • Control total de la reproducción
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              setShowLoginDialog(false);
              login();
            }}
            variant="contained"
            sx={{ bgcolor: '#1DB954', '&:hover': { bgcolor: '#1ed760' } }}
          >
            Conectar Spotify
          </Button>
        </DialogActions>
      </Dialog>
    </SpotifyAuthContext.Provider>
  );
};

// Componente para mostrar estado de autenticación
export const SpotifyAuthStatus: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useSpotifyAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="caption">Conectando...</Typography>
      </Box>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {user.images?.[0] && (
          <Box
            component="img"
            src={user.images[0].url}
            sx={{ width: 24, height: 24, borderRadius: '50%' }}
          />
        )}
        <Typography variant="caption">
          {user.display_name}
        </Typography>
        <Button size="small" onClick={logout} sx={{ fontSize: '0.7rem' }}>
          Desconectar
        </Button>
      </Box>
    );
  }

  return null;
};
