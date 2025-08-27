'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Typography, 
  Alert, 
  Box, 
  Button,
  Paper
} from '@mui/material';
import { 
  Security as SecurityIcon,
  Home as HomeIcon 
} from '@mui/icons-material';

export default function UnauthorizedAccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Log del intento de acceso no autorizado
    console.warn('🚨 INTENTO DE ACCESO NO AUTORIZADO detectado');
    console.warn('🚨 Timestamp:', new Date().toISOString());
    console.warn('🚨 User Agent:', navigator.userAgent);
    console.warn('🚨 URL:', window.location.href);
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <SecurityIcon sx={{ fontSize: 120, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h3" gutterBottom color="error.main" fontWeight="bold">
          Acceso Denegado
        </Typography>
        
        <Typography variant="h6" gutterBottom color="text.secondary">
          Esta área está restringida a administradores
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            🚨 Zona de Administración Protegida
          </Typography>
          <Typography variant="body1">
            Las herramientas de debug solo son accesibles desde el panel de administración 
            y requieren permisos de administrador.
          </Typography>
        </Alert>

        <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, color: 'text.primary' }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Este intento de acceso ha sido registrado</strong>
          </Typography>
          <Typography variant="caption" display="block">
            Timestamp: {new Date().toISOString()}
          </Typography>
          <Typography variant="caption" display="block">
            IP: {typeof window !== 'undefined' ? window.location.hostname : 'unknown'}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => router.push('/')}
          size="large"
        >
          Volver al Inicio
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => router.push('/login')}
          size="large"
        >
          Iniciar Sesión
        </Button>
      </Box>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Si eres administrador, accede al panel de administración y usa las herramientas de debug desde ahí.
        </Typography>
      </Box>
    </Container>
  );
}
