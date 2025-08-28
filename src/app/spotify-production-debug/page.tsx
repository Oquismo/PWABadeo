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
  environment: {
    isDevelopment: boolean;
    detectedBaseUrl: string;
    usingDynamicDetection: boolean;
  };
  currentConfig: any;
  calculatedUrls: any;
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
        {diagnosis && (
          <>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>URL detectada dinámicamente:</strong> {diagnosis.environment.detectedBaseUrl}
            </Typography>
            <Typography variant="body2">
              <strong>Detección dinámica:</strong> {diagnosis.environment.usingDynamicDetection ? 'ACTIVADA' : 'DESACTIVADA'}
            </Typography>
          </>
        )}
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
                        {diagnosis.currentConfig.SPOTIFY_CLIENT_SECRET === 'CONFIGURADO' ? <CheckCircle color="success" /> : <Error color="error" />}
                      </ListItemIcon>
                      <ListItemText
                        primary="SPOTIFY_CLIENT_SECRET"
                        secondary={diagnosis.currentConfig.SPOTIFY_CLIENT_SECRET}
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
                    🎯 URLs Calculadas Dinámicamente
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Redirect URI"
                        secondary={diagnosis.calculatedUrls.redirectUri}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Callback URL"
                        secondary={diagnosis.calculatedUrls.callbackUrl}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Auth URL"
                        secondary={diagnosis.calculatedUrls.authUrl}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Diagnose URL"
                        secondary={diagnosis.calculatedUrls.diagnoseUrl}
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
                    📋 URLs de Variables de Entorno
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Redirect URI (NEXTAUTH_URL)"
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

            {diagnosis.spotifyDashboard.troubleshooting && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🔧 Pasos de Verificación
                </Typography>
                <List dense>
                  {diagnosis.spotifyDashboard.troubleshooting.verificationSteps.map((step: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemText primary={step} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  ⚠️ Problemas Comunes
                </Typography>
                <List dense>
                  {diagnosis.spotifyDashboard.troubleshooting.commonIssues.map((issue: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={issue} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>

          {/* Conectividad */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              🧪 Prueba del Flujo de Autenticación
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Esta sección te permite probar cada paso del flujo de autenticación de Spotify para identificar exactamente dónde está fallando.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => {
                  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${diagnosis.currentConfig.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&scope=user-read-private%20user-read-email%20playlist-read-private%20playlist-modify-public%20playlist-modify-private&code_challenge_method=S256&code_challenge=test&redirect_uri=${encodeURIComponent(diagnosis.calculatedUrls.redirectUri)}`;
                  window.open(authUrl, '_blank');
                }}
                disabled={!diagnosis || diagnosis.currentConfig.SPOTIFY_CLIENT_ID !== 'CONFIGURADO'}
              >
                1. Probar URL de Autorización (se abrirá en nueva pestaña)
              </Button>

              <Button
                variant="outlined"
                startIcon={<BugReport />}
                onClick={async () => {
                  try {
                    const response = await fetch(diagnosis.calculatedUrls.callbackUrl);
                    alert(`Callback endpoint responde: ${response.status} ${response.statusText}`);
                  } catch (error) {
                    alert(`Error al acceder al callback endpoint: ${error}`);
                  }
                }}
              >
                2. Verificar que el Callback Endpoint responde
              </Button>

              <Button
                variant="outlined"
                startIcon={<BugReport />}
                onClick={async () => {
                  try {
                    const response = await fetch(diagnosis.calculatedUrls.authUrl);
                    alert(`Auth endpoint responde: ${response.status} ${response.statusText}`);
                  } catch (error) {
                    alert(`Error al acceder al auth endpoint: ${error}`);
                  }
                }}
              >
                3. Verificar que el Auth Endpoint responde
              </Button>

              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>Instrucciones de prueba:</strong>
                <br />
                1. Haz clic en "Probar URL de Autorización" - debería abrir Spotify
                <br />
                2. Si Spotify te pide credenciales, la configuración básica está bien
                <br />
                3. Si te redirige de vuelta con un código, el callback funciona
                <br />
                4. Si el código se intercambia por tokens, todo el flujo está funcionando
              </Alert>
            </Box>
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
