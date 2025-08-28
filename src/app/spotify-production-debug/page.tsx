'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Alert, Chip, Divider,
  List, ListItem, ListItemIcon, ListItemText, CircularProgress,
  Card, CardContent, Grid
} from '@mui/material';
import {
  CheckCircle, Error, Warning, Refresh, BugReport, Link as LinkIcon
} from '@mui/icons-material';

interface DiagnosisResult {
  timestamp: string;
  status: string;
  currentConfig: any;
  expectedUrls: any;
  diagnosis: any;
  issues: any[];
  spotifyDashboard: any;
}

export default function SpotifyProductionDebugPage() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
    return String(error || 'Error desconocido');
  };

  const runDiagnosis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/spotify/diagnose');
      const data = await response.json();
      setDiagnosis(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnosis();
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔧 Diagnóstico de Spotify en Producción
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Esta página verifica la configuración de Spotify para producción y ayuda a identificar problemas comunes.
      </Typography>

      {/* Información del entorno */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.main', color: 'info.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          🌐 Información del Entorno
        </Typography>
        <Typography variant="body2">
          <strong>Dominio actual:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Cargando...'}
        </Typography>
        <Typography variant="body2">
          <strong>Entorno detectado:</strong> {
            typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
              ? 'Desarrollo (localhost)' 
              : 'Producción'
          }
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          💡 Esta página se adapta automáticamente a tu entorno y muestra la configuración correcta.
        </Typography>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={runDiagnosis}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
        >
          {loading ? 'Ejecutando diagnóstico...' : 'Ejecutar diagnóstico'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al ejecutar diagnóstico: {error}
        </Alert>
      )}

      {diagnosis && (
        <>
          {/* Estado general */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Estado General
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                label={diagnosis.status === 'success' ? 'Configuración OK' : 'Problemas encontrados'}
                color={diagnosis.status === 'success' ? 'success' : 'error'}
                icon={diagnosis.status === 'success' ? <CheckCircle /> : <Error />}
              />
              <Typography variant="body2" color="text.secondary">
                Última verificación: {new Date(diagnosis.timestamp).toLocaleString()}
              </Typography>
            </Box>
          </Paper>

          {/* Configuración actual */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⚙️ Configuración Actual
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        {diagnosis.currentConfig.NEXTAUTH_URL ? <CheckCircle color="success" /> : <Error color="error" />}
                      </ListItemIcon>
                      <ListItemText
                        primary="NEXTAUTH_URL"
                        secondary={diagnosis.currentConfig.NEXTAUTH_URL || 'NO CONFIGURADO'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {diagnosis.currentConfig.SPOTIFY_CLIENT_ID === 'CONFIGURADO' ? <CheckCircle color="success" /> : <Error color="error" />}
                      </ListItemIcon>
                      <ListItemText
                        primary="SPOTIFY_CLIENT_ID"
                        secondary={diagnosis.currentConfig.SPOTIFY_CLIENT_ID}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {diagnosis.currentConfig.SPOTIFY_REDIRECT_URI ? <CheckCircle color="success" /> : <Error color="error" />}
                      </ListItemIcon>
                      <ListItemText
                        primary="SPOTIFY_REDIRECT_URI"
                        secondary={diagnosis.currentConfig.SPOTIFY_REDIRECT_URI || 'NO CONFIGURADO'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🎯 URLs Esperadas
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Redirect URI"
                        secondary={diagnosis.expectedUrls.redirectUri}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Callback URL"
                        secondary={diagnosis.expectedUrls.callbackUrl}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Auth URL"
                        secondary={diagnosis.expectedUrls.authUrl}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Problemas encontrados */}
          {diagnosis.issues.length > 0 && (
            <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'error.main' }}>
              <Typography variant="h6" gutterBottom color="error">
                🚨 Problemas Encontrados
              </Typography>
              <List>
                {diagnosis.issues.map((issue: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Error color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={issue.message}
                      secondary={`Solución: ${issue.solution}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Configuración del Dashboard de Spotify */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎵 Configuración del Dashboard de Spotify
            </Typography>

            <Alert 
              severity={diagnosis.spotifyDashboard.environment === 'producción' ? 'success' : 'info'} 
              sx={{ mb: 2 }}
            >
              <strong>Entorno:</strong> {diagnosis.spotifyDashboard.environment.toUpperCase()}
              <br />
              Ve a tu aplicación en el <a href={diagnosis.spotifyDashboard.dashboardUrl} target="_blank" rel="noopener noreferrer">Dashboard de Spotify</a> y configura:
            </Alert>

            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace' }}>
              Redirect URIs: {diagnosis.spotifyDashboard.requiredRedirectUri}
            </Box>

            <Typography variant="body2" sx={{ mt: 2 }}>
              {diagnosis.spotifyDashboard.instructions}
            </Typography>

            {diagnosis.spotifyDashboard.note && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <strong>Nota:</strong> {diagnosis.spotifyDashboard.note}
              </Alert>
            )}
          </Paper>

          {/* Conectividad */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🌐 Conectividad con Spotify
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={diagnosis.diagnosis.spotifyConnectivity}
                color={diagnosis.diagnosis.spotifyConnectivity === 'CONECTIVIDAD OK' ? 'success' : 'warning'}
                icon={diagnosis.diagnosis.spotifyConnectivity === 'CONECTIVIDAD OK' ? <CheckCircle /> : <Warning />}
              />
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}
