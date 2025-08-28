'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Button, Paper, Chip, Link } from '@mui/material';
import { CheckCircle, Error, Info } from '@mui/icons-material';

interface CredentialsStatus {
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  redirectUriConfigured: boolean;
  clientId: string | null;
  redirectUri: string | null;
}

export default function SpotifyCredentialsChecker() {
  const [status, setStatus] = useState<CredentialsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkCredentials();
  }, []);

  const checkCredentials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/spotify/test-credentials');
      const data = await response.json();
      setStatus(data.details);
    } catch (err) {
      setError('Error al verificar credenciales');
      console.error('Error checking credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, m: 2 }}>
        <Typography variant="h6">Verificando credenciales de Spotify...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const allConfigured = status?.clientIdConfigured && status?.clientSecretConfigured && status?.redirectUriConfigured;

  return (
    <Paper sx={{ p: 3, m: 2, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        🔧 Estado de Credenciales de Spotify
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {status?.clientIdConfigured ? (
            <CheckCircle color="success" sx={{ mr: 1 }} />
          ) : (
            <Error color="error" sx={{ mr: 1 }} />
          )}
          <Typography>Client ID: </Typography>
          <Chip
            label={status?.clientId || 'No configurado'}
            color={status?.clientIdConfigured ? 'success' : 'error'}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {status?.clientSecretConfigured ? (
            <CheckCircle color="success" sx={{ mr: 1 }} />
          ) : (
            <Error color="error" sx={{ mr: 1 }} />
          )}
          <Typography>Client Secret: </Typography>
          <Chip
            label={status?.clientSecretConfigured ? 'Configurado' : 'No configurado'}
            color={status?.clientSecretConfigured ? 'success' : 'error'}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {status?.redirectUriConfigured ? (
            <CheckCircle color="success" sx={{ mr: 1 }} />
          ) : (
            <Error color="error" sx={{ mr: 1 }} />
          )}
          <Typography>Redirect URI: </Typography>
          <Chip
            label={status?.redirectUri || 'No configurado'}
            color={status?.redirectUriConfigured ? 'success' : 'error'}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
      </Box>

      {allConfigured ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ ¡Todo configurado! Puedes probar la integración de Spotify.
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ Necesitas configurar las credenciales de Spotify para que funcione la integración.
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 Pasos para configurar:
        </Typography>

        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          1. Ve a <Link href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">
            Spotify Developer Dashboard
          </Link>
        </Typography>

        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          2. Crea una nueva aplicación con estos datos:
          <Box component="ul" sx={{ pl: 3, mt: 1 }}>
            <li><strong>App name:</strong> Badeo PWA</li>
            <li><strong>App description:</strong> Recomendaciones musicales basadas en clima</li>
            <li><strong>Redirect URI:</strong> <code>http://localhost:3000/api/spotify/callback</code></li>
          </Box>
        </Typography>

        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          3. Copia el <strong>Client ID</strong> y <strong>Client Secret</strong> al archivo <code>.env.local</code>
        </Typography>

        <Typography variant="body2" component="div" sx={{ mb: 3 }}>
          4. Reinicia el servidor y prueba la conexión
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={checkCredentials}
            startIcon={<Info />}
          >
            Verificar de nuevo
          </Button>

          <Button
            variant="contained"
            href="https://developer.spotify.com/dashboard"
            target="_blank"
            rel="noopener"
          >
            Ir a Spotify Dashboard
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
