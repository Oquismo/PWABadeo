'use client';

import { 
  Container, 
  Box, 
  Typography, 
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { 
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  VpnKey as KeyIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

export default function AdminDocsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <AdminIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Documentación de Administrador
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Herramientas de diagnóstico y mantenimiento del sistema
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>⚠️ Información Confidencial:</strong> Esta documentación es solo para administradores autorizados.
      </Alert>

      {/* Herramientas de Diagnóstico */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Herramientas de Diagnóstico de Email
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <SecurityIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Página de Diagnóstico de Email"
              secondary="Acceso restringido con contraseña - /email-config"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <KeyIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Contraseña de Acceso"
              secondary="BadeoTest2025! (cambiar en producción)"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Funcionalidades:</Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• Verificar configuración de variables de entorno" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Revisar estado de tokens de recuperación" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Enviar emails de prueba" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Logs detallados de errores" />
          </ListItem>
        </List>
      </Paper>

      {/* Configuración de Producción */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          🔧 Configuración de Producción
        </Typography>

        <Typography variant="h6" gutterBottom>Variables de Entorno Requeridas en Vercel:</Typography>
        
        <Box component="pre" sx={{ 
          background: '#f5f5f5', 
          p: 2, 
          borderRadius: 1, 
          fontSize: '12px',
          overflow: 'auto'
        }}>
{`EMAIL_PROVIDER=gmail
EMAIL_USER=badeoapp@gmail.com
EMAIL_PASSWORD=fqbp odjq dvwz meoy
EMAIL_FROM=badeoapp@gmail.com
NEXTAUTH_URL=https://pwa-badeo.vercel.app
DATABASE_URL=postgresql://[connection-string]`}
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Importante:</strong> Estas variables deben configurarse en el dashboard de Vercel, 
          no en el código fuente.
        </Alert>
      </Paper>

      {/* Procedimientos de Seguridad */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Procedimientos de Seguridad
        </Typography>

        <List>
          <ListItem>
            <ListItemText 
              primary="1. Acceso Restringido"
              secondary="Solo personal autorizado debe acceder a las herramientas de diagnóstico"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="2. No Compartir Credenciales"
              secondary="La contraseña de diagnóstico no debe compartirse ni almacenarse en lugares no seguros"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="3. Logs Sensibles"
              secondary="No capturar pantallas ni compartir logs que contengan información sensible"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="4. Sesión Temporal"
              secondary="La autenticación se guarda solo en la sesión del navegador"
            />
          </ListItem>
        </List>

        <Alert severity="error" sx={{ mt: 2 }}>
          <strong>⚠️ Advertencia:</strong> El mal uso de estas herramientas puede exponer 
          información sensible del sistema. Usar solo cuando sea necesario.
        </Alert>
      </Paper>
    </Container>
  );
}
