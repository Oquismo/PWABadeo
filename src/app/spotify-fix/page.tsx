import { Box, Typography, Alert, Button, Paper, Divider } from '@mui/material';
import { Launch, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';

export default function SpotifyFixPage() {
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
            href="http://localhost:3001/api/debug"
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
            <li><strong>Redirect URI:</strong> <code>http://localhost:3001/api/spotify/callback</code></li>
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
            Tu archivo <code>.env.local</code> debe tener:
          </Typography>
          <Box component="pre" sx={{
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            mt: 1,
            fontSize: '0.8rem',
            overflow: 'auto'
          }}>
{`NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback`}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary">
            4. Reiniciar servidor
          </Typography>
          <Typography variant="body2">
            Después de hacer cambios, reinicia el servidor:
          </Typography>
          <Box component="pre" sx={{
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            mt: 1,
            fontSize: '0.8rem'
          }}>
{`# Detener servidor (Ctrl+C)
# Luego ejecutar:
npx next dev --port 3001`}
          </Box>
        </Box>
      </Paper>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>¿Sigues teniendo problemas?</strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          1. Abre la consola del navegador (F12) y mira los logs de depuración<br/>
          2. Verifica que el redirect URI en Spotify sea exactamente <code>http://localhost:3001/api/spotify/callback</code><br/>
          3. Reinicia el servidor después de cualquier cambio
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          href="http://localhost:3001"
        >
          Ir a la aplicación
        </Button>
        <Button
          variant="outlined"
          href="http://localhost:3001/test"
        >
          Página de pruebas
        </Button>
        <Button
          variant="outlined"
          href="http://localhost:3001/spotify-debug"
        >
          Debug de Spotify
        </Button>
      </Box>
    </Box>
  );
}
