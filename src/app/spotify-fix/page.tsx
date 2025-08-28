import { Box, Typography, Alert, Button, Paper, Divider } from '@mui/material';
import { Launch, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';

export default function SpotifyFixPage() {
  // Determinar si estamos en desarrollo o producción
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  const baseUrl = isDevelopment ? 'http://localhost:3001' : 'https://pwa-badeo.vercel.app';
  const redirectUri = `${baseUrl}/api/spotify/callback`;
  const debugUrl = `${baseUrl}/api/debug`;
  const homeUrl = baseUrl;
  const testUrl = `${baseUrl}/test`;
  const spotifyDebugUrl = `${baseUrl}/spotify-debug`;
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom color="error">
        🚨 ERROR: INVALID_CLIENT: Invalid redirect URI
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Problema:</strong> El redirect URI configurado en Spotify no coincide con el que está usando tu aplicación.
        </Typography>
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          ✅ SOLUCIÓN PASO A PASO
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary">
            1. Verificar configuración actual
          </Typography>
          <Button
            variant="outlined"
            href={debugUrl}
            target="_blank"
            startIcon={<Launch />}
            sx={{ mt: 1 }}
          >
            Probar endpoint de debug
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary">
            2. Actualizar Spotify Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Ve a tu aplicación en Spotify Developer Dashboard y configura:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li><strong>Redirect URI:</strong> <code>{redirectUri}</code></li>
            <li><strong>IMPORTANTE:</strong> Borra cualquier otro redirect URI</li>
          </Box>
          <Button
            variant="contained"
            href="https://developer.spotify.com/dashboard"
            target="_blank"
            startIcon={<Launch />}
            sx={{ mt: 1 }}
          >
            Ir a Spotify Dashboard
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary">
            3. Verificar variables de entorno
          </Typography>
          <Typography variant="body2">
            Tu archivo <code>{isDevelopment ? '.env.local' : '.env.production'}</code> debe tener:
          </Typography>
          <Box component="pre" sx={{
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            mt: 1,
            fontSize: '0.8rem',
            overflow: 'auto'
          }}>
{`NEXTAUTH_URL=${baseUrl}
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=${redirectUri}`}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary">
            4. Reiniciar servidor
          </Typography>
          <Typography variant="body2">
            Después de hacer cambios, {isDevelopment ? 'reinicia el servidor de desarrollo' : 'redeploya tu aplicación'}:
          </Typography>
          <Box component="pre" sx={{
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            mt: 1,
            fontSize: '0.8rem'
          }}>
{isDevelopment ? `# Detener servidor (Ctrl+C)
# Luego ejecutar:
npx next dev --port 3001` : `# Para Vercel:
vercel --prod

# Para Railway:
railway up

# Para otros proveedores, redeploya desde el dashboard`}
          </Box>
        </Box>
      </Paper>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>¿Sigues teniendo problemas?</strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          1. Abre la consola del navegador (F12) y mira los logs de depuración<br/>
          2. Verifica que el redirect URI en Spotify sea exactamente <code>{redirectUri}</code><br/>
          3. {isDevelopment ? 'Reinicia el servidor' : 'Redeploya la aplicación'} después de cualquier cambio
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          href={homeUrl}
        >
          Ir a la aplicación
        </Button>
        <Button
          variant="outlined"
          href={testUrl}
        >
          Página de pruebas
        </Button>
        <Button
          variant="outlined"
          href={spotifyDebugUrl}
        >
          Debug de Spotify
        </Button>
      </Box>
    </Box>
  );
}
