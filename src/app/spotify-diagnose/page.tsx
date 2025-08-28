'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Alert, Button, Chip, Divider,
  CircularProgress, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  CheckCircle, Error, Warning, Launch, Refresh
} from '@mui/icons-material';

interface DiagnosisResult {
  status: string;
  currentConfig: any;
  expectedUrls: any;
  diagnosis: any;
  issues: Array<{
    type: string;
    message: string;
    solution: string;
  }>;
  spotifyDashboard: any;
}

export default function SpotifyDiagnosePage() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runDiagnosis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/spotify/diagnose');
      const data = await response.json();
      setDiagnosis(data);
    } catch (err) {
      setError('Error al ejecutar diagnóstico');
      console.error('Diagnosis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnosis();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Ejecutando diagnóstico...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={runDiagnosis} startIcon={<Refresh />}>
          Reintentar
        </Button>
      </Box>
    );
  }

  if (!diagnosis) return null;

  const allGood = diagnosis.issues.length === 0;

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔍 Diagnóstico de Spotify
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Esta herramienta verifica que la configuración de Spotify esté correcta.
      </Typography>

      {/* Estado general */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {allGood ? (
            <CheckCircle color="success" sx={{ mr: 1 }} />
          ) : (
            <Error color="error" sx={{ mr: 1 }} />
          )}
          <Typography variant="h6">
            Estado: {allGood ? '✅ Todo configurado correctamente' : '❌ Problemas encontrados'}
          </Typography>
        </Box>

        <Button
          onClick={runDiagnosis}
          startIcon={<Refresh />}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Ejecutar de nuevo
        </Button>
      </Paper>

      {/* Problemas encontrados */}
      {diagnosis.issues.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'error.main' }}>
          <Typography variant="h6" color="error" gutterBottom>
            🚨 Problemas que deben solucionarse:
          </Typography>

          <List>
            {diagnosis.issues.map((issue, index) => (
              <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Error color="error" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">{issue.message}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  <strong>Solución:</strong> {issue.solution}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Configuración actual */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ⚙️ Configuración actual
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2">NEXTAUTH_URL</Typography>
            <Chip
              label={diagnosis.currentConfig.NEXTAUTH_URL || 'NO CONFIGURADO'}
              color={diagnosis.diagnosis.nextAuthConfigured ? 'success' : 'error'}
              size="small"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2">SPOTIFY_REDIRECT_URI</Typography>
            <Chip
              label={diagnosis.currentConfig.SPOTIFY_REDIRECT_URI || 'NO CONFIGURADO'}
              color={diagnosis.diagnosis.redirectUriCorrect ? 'success' : 'error'}
              size="small"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2">SPOTIFY_CLIENT_ID</Typography>
            <Chip
              label={diagnosis.currentConfig.SPOTIFY_CLIENT_ID}
              color={diagnosis.diagnosis.clientIdConfigured ? 'success' : 'error'}
              size="small"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2">Puerto del servidor</Typography>
            <Chip
              label={diagnosis.currentConfig.serverPort}
              color={diagnosis.diagnosis.portConsistent ? 'success' : 'warning'}
              size="small"
            />
          </Box>
        </Box>
      </Paper>

      {/* URLs esperadas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎯 URLs que deberían estar configuradas
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Redirect URI (Spotify Dashboard)</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
              {diagnosis.expectedUrls.redirectUri}
            </Typography>
            <Button
              size="small"
              onClick={() => navigator.clipboard.writeText(diagnosis.expectedUrls.redirectUri)}
            >
              Copiar
            </Button>
          </Box>
        </Box>

        <Alert severity="info">
          <Typography variant="body2">
            <strong>Importante:</strong> Esta URL debe estar configurada exactamente así en Spotify Dashboard.
            Ve a tu app → Edit Settings → Redirect URIs y pega esta URL.
          </Typography>
        </Alert>
      </Paper>

      {/* Instrucciones para Spotify */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎵 Configuración en Spotify Dashboard
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Sigue estos pasos para configurar correctamente tu aplicación en Spotify:
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon><Launch /></ListItemIcon>
            <ListItemText
              primary="Ve a Spotify Developer Dashboard"
              secondary="https://developer.spotify.com/dashboard"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon><CheckCircle /></ListItemIcon>
            <ListItemText
              primary="Selecciona tu aplicación"
              secondary="La que creaste para Badeo PWA"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon><CheckCircle /></ListItemIcon>
            <ListItemText
              primary="Haz clic en 'Edit Settings'"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon><CheckCircle /></ListItemIcon>
            <ListItemText
              primary="En 'Redirect URIs', configura:"
              secondary={diagnosis.expectedUrls.redirectUri}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon><CheckCircle /></ListItemIcon>
            <ListItemText
              primary="Haz clic en 'Save'"
            />
          </ListItem>
        </List>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            href="https://developer.spotify.com/dashboard"
            target="_blank"
            startIcon={<Launch />}
          >
            Ir a Spotify Dashboard
          </Button>
        </Box>
      </Paper>

      {/* Acciones finales */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🚀 Próximos pasos
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={runDiagnosis}
            startIcon={<Refresh />}
          >
            Verificar de nuevo
          </Button>

          <Button
            variant="outlined"
            href="/"
          >
            Probar la aplicación
          </Button>

          <Button
            variant="outlined"
            href="/test"
          >
            Página de pruebas
          </Button>
        </Box>

        {allGood && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ✅ ¡Todo está configurado correctamente! Ahora puedes probar la integración de Spotify.
            </Typography>
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
