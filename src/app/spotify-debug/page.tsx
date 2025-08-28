'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Alert, Chip, Divider,
  List, ListItem, ListItemIcon, ListItemText, CircularProgress
} from '@mui/material';
import {
  CheckCircle, Error, Warning, Refresh, BugReport, PlayArrow
} from '@mui/icons-material';
import { useSpotifyAuth } from '@/context/SpotifyAuthContext';

export default function SpotifyDebugPage() {
  const { user, login, logout, isAuthenticated, isLoading, getAccessToken } = useSpotifyAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<Record<string, {
    status: 'loading' | 'success' | 'error';
    response?: { status: number; data: any };
    error?: string;
  }>>({});

  // Determinar si estamos en desarrollo o producción
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  const baseUrl = isDevelopment ? 'http://localhost:3001' : 'https://pwa-badeo.vercel.app';
  const redirectUri = `${baseUrl}/api/spotify/callback`;

  const updateDebugInfo = () => {
    const info = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      urlParams: Object.fromEntries(new URLSearchParams(window.location.search)),
      localStorage: {
        accessToken: localStorage.getItem('spotify_access_token') ? 'PRESENTE' : 'NO PRESENTE',
        refreshToken: localStorage.getItem('spotify_refresh_token') ? 'PRESENTE' : 'NO PRESENTE',
        user: localStorage.getItem('spotify_user') ? 'PRESENTE' : 'NO PRESENTE',
        tokenExpires: localStorage.getItem('spotify_token_expires'),
      },
      sessionStorage: {
        codeVerifier: sessionStorage.getItem('spotify_code_verifier') ? 'PRESENTE' : 'NO PRESENTE',
      },
      authState: {
        isAuthenticated,
        isLoading,
        user: user ? { display_name: user.display_name, id: user.id } : null,
        hasAccessToken: !!getAccessToken(),
      }
    };
    setDebugInfo(info);
  };

  useEffect(() => {
    updateDebugInfo();
    // Actualizar cada 2 segundos
    const interval = setInterval(updateDebugInfo, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, user]);

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
    return String(error || 'Unknown error');
  };

  const testEndpoint = async (endpoint: string, description: string) => {
    setTestResults(prev => ({ ...prev, [endpoint]: { status: 'loading' } }));

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 'success',
          response: {
            status: response.status,
            data
          }
        }
      }));
    } catch (error: unknown) {
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 'error',
          error: getErrorMessage(error)
        }
      }));
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_user');
    localStorage.removeItem('spotify_token_expires');
    sessionStorage.removeItem('spotify_code_verifier');
    updateDebugInfo();
    alert('Datos limpiados. Recarga la página.');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        � Debug de Spotify
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Esta página te ayuda a diagnosticar problemas con la autenticación de Spotify.
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
            icon={isAuthenticated ? <CheckCircle /> : <Error />}
          />

          {user && (
            <Chip
              label={`Usuario: ${user.display_name}`}
              color="info"
              variant="outlined"
            />
          )}

          {isLoading && <CircularProgress size={20} />}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {!isAuthenticated ? (
            <Button
              variant="contained"
              onClick={login}
              disabled={isLoading}
              startIcon={<PlayArrow />}
            >
              {isLoading ? 'Conectando...' : 'Conectar Spotify'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={logout}
              startIcon={<Refresh />}
            >
              Desconectar
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={updateDebugInfo}
            startIcon={<Refresh />}
          >
            Actualizar Info
          </Button>

          <Button
            variant="outlined"
            onClick={clearAllData}
            color="error"
            startIcon={<BugReport />}
          >
            Limpiar Datos
          </Button>
        </Box>
      </Paper>

      {/* Información de debug */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Información de Debug
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2">URL Actual</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {debugInfo.url}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Parámetros de URL</Typography>
            <Typography variant="body2">
              {Object.keys(debugInfo.urlParams || {}).length > 0
                ? JSON.stringify(debugInfo.urlParams, null, 2)
                : 'Ninguno'
              }
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">LocalStorage</Typography>
            <List dense>
              {Object.entries(debugInfo.localStorage || {}).map(([key, value]) => (
                <ListItem key={key} sx={{ px: 0 }}>
                  <ListItemText
                    primary={`${key}: ${value}`}
                    primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box>
            <Typography variant="subtitle2">SessionStorage</Typography>
            <List dense>
              {Object.entries(debugInfo.sessionStorage || {}).map(([key, value]) => (
                <ListItem key={key} sx={{ px: 0 }}>
                  <ListItemText
                    primary={`${key}: ${value}`}
                    primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Paper>

      {/* Pruebas de endpoints */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🧪 Pruebas de Endpoints
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Prueba los endpoints de la API para verificar que estén funcionando.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => testEndpoint('/api/spotify/status', 'Estado de Spotify')}
            startIcon={<PlayArrow />}
          >
            Test Status
          </Button>

          <Button
            variant="outlined"
            onClick={() => testEndpoint('/api/spotify/diagnose', 'Diagnóstico')}
            startIcon={<PlayArrow />}
          >
            Test Diagnose
          </Button>
        </Box>

        {Object.entries(testResults).map(([endpoint, result]: [string, any]) => (
          <Box key={endpoint} sx={{ mb: 2 }}>
            <Typography variant="subtitle2">{endpoint}</Typography>
            {result.status === 'loading' && <CircularProgress size={16} />}
            {result.status === 'success' && (
              <Alert severity="success" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Status: {result.response.status}<br/>
                  <pre style={{ fontSize: '0.7rem', marginTop: '8px' }}>
                    {JSON.stringify(result.response.data, null, 2)}
                  </pre>
                </Typography>
              </Alert>
            )}
            {result.status === 'error' && (
              <Alert severity="error" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Error: {result.error}
                </Typography>
              </Alert>
            )}
          </Box>
        ))}
      </Paper>

      {/* Instrucciones de troubleshooting */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔧 Solución de Problemas
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
            <ListItemText
              primary={`Verifica que la app esté corriendo en ${isDevelopment ? 'puerto 3001' : 'producción'}`}
              secondary={`La app debe estar corriendo en ${baseUrl}`}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
            <ListItemText
              primary="Configura el Redirect URI en Spotify Dashboard"
              secondary={`Debe ser exactamente: ${redirectUri}`}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
            <ListItemText
              primary="Revisa la consola del navegador (F12)"
              secondary="Busca mensajes de error en la pestaña Console"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
            <ListItemText
              primary="Limpia los datos y vuelve a intentar"
              secondary="Usa el botón 'Limpiar Datos' si hay problemas persistentes"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Si el problema persiste:</strong> Ve a la página de diagnóstico en
            <code style={{ margin: '0 4px' }}>/spotify-diagnose</code> para verificar la configuración completa.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
}
